"""
Chat service with Gemini AI and Bhashini translation
Handles multilingual chat with automatic translation
"""

import os
import requests
import logging
from google import genai
from google.genai import types

logging.basicConfig(level=logging.INFO)

# Bhashini Configuration
AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w"
MT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"
API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

SUPPORTED_LANGUAGES = {
    "en", "hi", "bn", "ta", "te", "ml", "kn", "gu", "mr", "or", "pa", "as", "ur", "sa",
    "ne", "sd", "ks", "brx", "doi", "gom", "mai", "mni", "sat"
}

# Gemini Client
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyCD2SuTy_QLg-XtKO46ltcUespFeu8Hauw")
gemini_client = None

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        logging.error("GEMINI_API_KEY not set")
except Exception as e:
    logging.error(f"Error initializing Gemini: {e}")


def translate_text_bhashini(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text using Bhashini API"""
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
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected API response format: {e}")


def chat_with_ai(prompt: str, context: str = "") -> str:
    """Generate AI response using Gemini with travel context"""
    if not gemini_client:
        return "Error: Gemini client not initialized."
    
    # Add system context for travel assistant
    system_prompt = """You are Bhashani Sarthi, a multilingual travel companion and language learning assistant. 
You help users explore Indian cities, learn languages, and discover cultural experiences. 
When users ask about places or travel, provide helpful, concise recommendations about places to visit, 
local cuisine, cultural tips, and language learning advice. Keep responses friendly and conversational."""
    
    full_prompt = f"{system_prompt}\n\n{context}\n\nUser: {prompt}\nAssistant:"
    
    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=full_prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=1800
            )
        )
        return response.text.strip()
    except Exception as e:
        logging.error(f"Gemini API call failed: {e}")
        return f"AI Chat Model Failed: {str(e)}"


def process_chat(user_language: str, message: str, user_context: dict = None) -> dict:
    """Main chat processing function with user context"""
    user_lang = user_language.lower()
    
    # Build context from user data if provided
    context = ""
    if user_context:
        chapters = user_context.get("chapters", [])
        if chapters:
            cities = [ch.get("city", "") for ch in chapters if ch.get("city")]
            context = f"User is planning trips to: {', '.join(cities)}. "
    
    # Translate to English if not English
    english_text = message
    if user_lang != "en":
        try:
            english_text = translate_text_bhashini(message, user_lang, "en")
        except Exception as e:
            return {"error": f"Translation {user_lang}→en failed: {str(e)}"}

    # Get AI response in English with context
    ai_response_en = chat_with_ai(english_text, context)

    # Translate back to user language if needed
    ai_response_user_lang = ai_response_en
    if user_lang != "en":
        try:
            ai_response_user_lang = translate_text_bhashini(ai_response_en, "en", user_lang)
        except Exception as e:
            return {"error": f"Translation en→{user_lang} failed: {str(e)}"}

    return {
        "user_language": user_lang,
        "user_message": message,
        "ai_response": ai_response_user_lang
    }


if __name__ == "__main__":
    import sys
    import json
    
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python chat_service.py <language> <message> [context_json]"}))
        sys.exit(1)
    
    lang = sys.argv[1]
    msg = " ".join(sys.argv[2:])
    
    # Try to parse context from last argument if it's JSON
    user_ctx = None
    if len(sys.argv) > 3:
        try:
            user_ctx = json.loads(sys.argv[-1])
            # Remove context from message
            msg = " ".join(sys.argv[2:-1])
        except:
            pass
    
    result = process_chat(lang, msg, user_ctx)
    print(json.dumps(result))
