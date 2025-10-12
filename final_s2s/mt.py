"""
MT Module - Machine Translation using Bhashini API
Translates text from source language to target language.
"""

import requests

# 🔹 Bhashini API Auth token
AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w"

# Bhashini Translation Service ID
MT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"

# Supported language codes
SUPPORTED_LANGUAGES = {
    "en", "as", "bn", "brx", "doi", "gom", "gu", "hi", "kn", "ks",
    "mai", "ml", "mni", "mr", "ne", "or", "pa", "sa", "sat", "sd",
    "ta", "te", "ur"
}

# Optional: map codes to full names
LANG_CODE_TO_NAME = {
    "en": "English",
    "hi": "Hindi",
    "bn": "Bengali",
    "te": "Telugu",
    "ta": "Tamil",
    "ml": "Malayalam",
    "kn": "Kannada",
    "gu": "Gujarati",
    "mr": "Marathi",
    "or": "Odia",
    "pa": "Punjabi",
    "as": "Assamese",
    "ur": "Urdu",
    "sa": "Sanskrit",
    "ne": "Nepali",
    "sd": "Sindhi",
    "ks": "Kashmiri",
    "brx": "Bodo",
    "doi": "Dogri",
    "gom": "Konkani",
    "mai": "Maithili",
    "mni": "Manipuri",
    "sat": "Santali",
}

API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source language to target language using Bhashini MT API.

    Args:
        text: Text to translate
        source_lang: Source language code ('hi', 'en', 'te', etc.)
        target_lang: Target language code ('en', 'hi', 'ta', etc.)

    Returns:
        Translated text as a string
    """
    if not text.strip():
        raise ValueError("Text cannot be empty")
    
    if source_lang not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported source language: {source_lang}. Supported: {sorted(SUPPORTED_LANGUAGES)}")
    
    if target_lang not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported target language: {target_lang}. Supported: {sorted(SUPPORTED_LANGUAGES)}")
    
    if source_lang == target_lang:
        raise ValueError("Source and target languages must be different")

    payload = {
        "pipelineTasks": [
            {
                "taskType": "translation",
                "config": {
                    "language": {
                        "sourceLanguage": source_lang,
                        "targetLanguage": target_lang
                    },
                    "serviceId": MT_SERVICE_ID,
                    "numTranslation": "True"
                }
            }
        ],
        "inputData": {
            "input": [{"source": text}],
            "audio": [{"audioContent": None}]
        }
    }

    headers = {
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
    except requests.exceptions.Timeout:
        raise RuntimeError("MT request timed out after 30 seconds")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"MT request failed: {e}")

    if response.status_code != 200:
        raise RuntimeError(f"MT request failed [{response.status_code}]: {response.text}")

    result = response.json()
    try:
        translated_text = result["pipelineResponse"][0]["output"][0]["target"]
        return translated_text
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"No translation found in MT response: {result}")


if __name__ == "__main__":
    # Example usage
    try:
        translation = translate_text("मेरा नाम विहिर है और मैं भाषिनी यूज कर रहा हूँ", "hi", "en")
        print(f"✅ Translation: {translation}")
    except Exception as e:
        print(f"❌ Error: {e}")
