"""
TTS Module - Text to Speech using Bhashini API
Returns WAV file from Base64 response
"""

import requests
import base64

# 🔹 Bhashini API Auth token
AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w"

# Map language code to serviceId as per new documentation
LANG_SERVICE_MAP = {
    # Indo-Aryan
    "as": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "bn": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "gu": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "hi": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "mr": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "or": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "pa": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "raj": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    # Misc
    "bodo": "ai4bharat/indic-tts-coqui-misc-gpu--t4",
    "en": "ai4bharat/indic-tts-coqui-misc-gpu--t4",
    "man": "ai4bharat/indic-tts-coqui-misc-gpu--t4",
    # Dravidian
    "te": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
    "ta": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
    "ml": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
    "kn": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
}

# Optional: map codes to full names
LANG_CODE_TO_NAME = {
    "hi": "Hindi",
    "en": "English",
    "te": "Telugu",
    "ta": "Tamil",
    "ml": "Malayalam",
    "kn": "Kannada",
    "gu": "Gujarati",
    "bn": "Bengali",
    "mr": "Marathi",
    "or": "Odia",
    "pa": "Punjabi",
    "as": "Assamese",
    "bodo": "Bodo",
    "raj": "Rajasthani",
    "man": "Manipuri",
}

API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

def tts_inference(text: str, source_lang: str, output_path="output.wav", gender="female", speed=1.0) -> str:
    """
    Convert text to speech using Bhashini TTS API.

    Args:
        text: Text to convert (max 30 words)
        source_lang: Language code ('hi', 'en', 'te', etc.)
        output_path: Where to save WAV file
        gender: 'male' or 'female'
        speed: Speech speed 0.1 - 1.99

    Returns:
        Path to saved WAV file
    """
    if not text.strip():
        raise ValueError("Text cannot be empty")
    if len(text.split()) > 30:
        raise ValueError("Text exceeds 30-word limit")
    if gender not in ["male", "female"]:
        raise ValueError("Gender must be 'male' or 'female'")
    if not (0.1 <= speed <= 1.99):
        raise ValueError("Speed must be between 0.1 and 1.99")

    # Get serviceId
    service_id = LANG_SERVICE_MAP.get(source_lang)
    if not service_id:
        raise ValueError(f"Unsupported language: {source_lang}")

    payload = {
        "pipelineTasks": [
            {
                "taskType": "tts",
                "config": {
                    "language": {"sourceLanguage": source_lang},
                    "serviceId": service_id,
                    "gender": gender,
                    "speed": speed,
                    "samplingRate": 48000
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
        raise RuntimeError("TTS request timed out after 30 seconds")
    except requests.exceptions.RequestException as e:
        raise RuntimeError(f"TTS request failed: {e}")
    
    if response.status_code != 200:
        raise RuntimeError(f"TTS request failed [{response.status_code}]: {response.text}")

    result = response.json()
    
    # Try multiple response formats
    audio_b64 = None
    
    # Format 1: pipelineResponse[0].audio[0].audioContent
    try:
        audio_b64 = result["pipelineResponse"][0]["audio"][0]["audioContent"]
    except (KeyError, IndexError, TypeError):
        pass
    
    # Format 2: audio[0].audioContent
    if not audio_b64:
        try:
            audio_b64 = result["audio"][0]["audioContent"]
        except (KeyError, IndexError, TypeError):
            pass
    
    # Format 3: data (direct base64)
    if not audio_b64:
        try:
            audio_b64 = result["data"]
        except (KeyError, TypeError):
            pass
    
    if not audio_b64:
        raise RuntimeError(f"No audio returned in TTS response: {result}")

    audio_bytes = base64.b64decode(audio_b64)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)

    return output_path


if __name__ == "__main__":
    # Example usage
    try:
        path = tts_inference("नमस्ते, आप कैसे हैं?", "hi", gender="female")
        print(f"✅ TTS saved at: {path}")
    except Exception as e:
        print(f"❌ Error: {e}")