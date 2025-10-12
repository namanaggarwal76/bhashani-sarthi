from fastapi import FastAPI
from pydantic import BaseModel
import requests
import os
from google import genai
from fastapi.middleware.cors import CORSMiddleware
from google.genai import types
import logging

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
# AnuvaadHub MT Translation
# -------------------------
HI_TO_EN_MT_URL = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316384a"
HI_TO_EN_MT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTVmYjJiOTNlM2JlYzkwMWZkOGJmIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.f9HiMK1fDz8Bg6o3f6RMcllzPk1DB71lVGXUYmP3QXY"

EN_TO_HI_MT_URL = "https://canvas.iiit.ac.in/sandboxbeprod/check_model_status_and_infer/67b86729b5cc0eb92316383c"
EN_TO_HI_MT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjhlYTVmYjJiOTNlM2JlYzkwMWZkOGJmIiwicm9sZSI6Im1lZ2F0aG9uX3N0dWRlbnQifQ.f9HiMK1fDz8Bg6o3f6RMcllzPk1DB71lVGXUYmP3QXY"

def translate_text_anuvaadh(text: str, url: str, token: str) -> str:
    headers = {"access-token": token, "Content-Type": "application/json"}
    payload = {"input_text": text}
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()["data"]["output_text"]

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
                max_output_tokens=30000
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
    I WANT AN OUTPUT OF ATMOST 6-8 RECOMMENDATIONS AND ATMOST 300-400 WORDS.
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
    if user_lang == "hi":
        try:
            english_text = translate_text_anuvaadh(user_text, HI_TO_EN_MT_URL, HI_TO_EN_MT_TOKEN)
        except Exception as e:
            return {"error": f"Translation HI→EN failed: {str(e)}"}
    else:
        english_text = user_text

    # Check if user is asking for travel recommendations
    travel_keywords = ["recommend", "suggest", "plan", "places", "trip", "travel"]
    if any(word in english_text.lower() for word in travel_keywords) and req.location and req.interests and req.preferences:
        prompt = build_travel_prompt(req.location, req.interests, req.preferences)
    else:
        prompt = english_text

    # Generate AI response
    ai_response_en = chat_with_ai(prompt)

    # Translate back to Hindi if needed
    if user_lang == "hi":
        try:
            ai_response_user_lang = translate_text_anuvaadh(ai_response_en, EN_TO_HI_MT_URL, EN_TO_HI_MT_TOKEN)
        except Exception as e:
            return {"error": f"Translation EN→HI failed: {str(e)}"}
    else:
        ai_response_user_lang = ai_response_en

    return {
        "user_language": user_lang,
        "user_message": user_text,
        "ai_response": ai_response_user_lang
    }
