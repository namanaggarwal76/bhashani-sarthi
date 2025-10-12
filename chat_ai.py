from fastapi import FastAPI
from pydantic import BaseModel
import requests
import logging
from google import genai
from fastapi.middleware.cors import CORSMiddleware
from google.genai import types

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Hindi ↔ English Travel & AI Chatbot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Request Model
# -------------------------
class ChatRequest(BaseModel):
    user_language: str  # "hi" or "en"
    message: str
    location: str = None
    interests: str = None
    preferences: dict = None  # {"travel_style": "...", "budget": "..."}

# -------------------------
# Bhashini MT Integration
# -------------------------
AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w"
MT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"
API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

SUPPORTED_LANGUAGES = {
    "en", "hi", "bn", "ta", "te", "ml", "kn", "gu", "mr", "or", "pa", "as", "ur", "sa",
    "ne", "sd", "ks", "brx", "doi", "gom", "mai", "mni", "sat"
}

def translate_text_bhashini(text: str, source_lang: str, target_lang: str) -> str:
    if not text.strip():
        raise ValueError("Text cannot be empty")
    if source_lang not in SUPPORTED_LANGUAGES or target_lang not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language. Supported: {sorted(SUPPORTED_LANGUAGES)}")
    if source_lang == target_lang:
        return text

    payload = {
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {"sourceLanguage": source_lang, "targetLanguage": target_lang},
                    "serviceId": MT_SERVICE_ID,
                    "numTranslation": "True"
                }
            }
        ],
        "inputData": {"input": [{"source": text}], "audio": [{"audioContent": None}]}
    }

    headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}

    response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    result = response.json()

    try:
        return result["pipelineResponse"][0]["output"][0]["target"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"No translation found in MT response: {result}")

# -------------------------
# Gemini Client Initialization
# -------------------------
GEMINI_API_KEY = "AIzaSyBAGb3eiHdAfZo_EGX8piTtxv8OOt-fHOQ"
gemini_client = None
try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        logging.error("GEMINI_API_KEY not set")
except Exception as e:
    logging.error(f"Error initializing Gemini: {e}")

def chat_with_ai(prompt: str) -> str:
    if not gemini_client:
        return "Error: Gemini client not initialized."
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1800
            )
        )
        return response.text.strip()
    except Exception as e:
        logging.error(f"Gemini API call failed: {e}")
        return f"AI Chat Model Failed: {str(e)}"

# -------------------------
# Travel Recommendation Prompt
# -------------------------
def build_travel_prompt(location, interests, preferences):
    return f"""
You are a world-class travel expert and personal trip advisor.

Your role:
- Help users explore or learn about their current or desired travel location.
- Answer in a calm, friendly, and professional tone, as if you are a local guide and concierge in one.
- Adapt your responses based on what the user says — whether they want recommendations, help with a situation, or general travel questions.

When the user explicitly asks for recommendations or you detect intent to 'plan', 'recommend', or 'suggest places':
Generate 8–12 personalized travel recommendations for the user's target location.

User Profile:
- Location: {location}
- Interests: {interests}
- Travel Style: {preferences.get('travel_style', 'moderate')}
- Budget: {preferences.get('budget', 'medium')}

Guidelines:
1. Recommend real, popular places in {location}.
2. Match recommendations to user's interests: {interests}.
3. Consider travel style and budget.
4. Assign XP points (20–200) based on popularity.
5. Ensure diversity: Attraction, Food, Museum, Nature, Culture, Shopping, Entertainment.
6. Include descriptions and estimated visit durations.
7. Use realistic ratings (3.8–5.0).
I WANT AN OUTPUT OF ATMOST 6-8 RECOMMENDATIONS AND ATMOST 300-400 WORDS. PLEASE DONT EXCEED THIS WORDS LIMIT!!!

Response Format - Return ONLY valid JSON:

{{
  "tasks": [
    {{
      "place_id": "{location.lower()}_001",
      "name": "Place Name",
      "type": "Attraction",
      "rating": 4.5,
      "xp": 120,
      "description": "Why visit this place.",
      "estimated_duration": "2 hours"
    }}
  ]
}}
"""

# -------------------------
# Chat Endpoint
# -------------------------
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    user_lang = req.user_language.lower()
    user_text = req.message

    # Translate to English if Hindi
    english_text = user_text
    if user_lang == "hi":
        try:
            english_text = translate_text_bhashini(user_text, "hi", "en")
        except Exception as e:
            return {"error": f"Translation HI→EN failed: {str(e)}"}

    # Check for travel recommendation intent
    travel_keywords = ["recommend", "suggest", "plan", "places", "trip", "travel"]
    if any(word in english_text.lower() for word in travel_keywords) and req.location and req.interests and req.preferences:
        prompt = build_travel_prompt(req.location, req.interests, req.preferences)
    else:
        prompt = english_text

    # AI response
    ai_response_en = chat_with_ai(prompt)

    # Translate back to Hindi if needed
    ai_response_user_lang = ai_response_en
    if user_lang == "hi":
        try:
            ai_response_user_lang = translate_text_bhashini(ai_response_en, "en", "hi")
        except Exception as e:
            return {"error": f"Translation EN→HI failed: {str(e)}"}

    return {
        "user_language": user_lang,
        "user_message": user_text,
        "ai_response": ai_response_user_lang
    }