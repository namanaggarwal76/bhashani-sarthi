"""
ASR Module - Speech to Text using Bhashini API
Takes a WAV audio file and returns transcribed text.
"""

import requests
import base64
import os
import traceback

# Local ASR fallback (faster-whisper)
try:
    from faster_whisper import WhisperModel
except Exception:
    WhisperModel = None

# 🔹 Bhashini API Auth token
AUTH_TOKEN = os.environ.get("BHASHINI_AUTH_TOKEN", "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w")

# Map language code to Bhashini serviceId
LANG_SERVICE_MAP = {
    # Indo-Aryan
    "bn": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "gu": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "mr": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "or": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "pa": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "sa": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "ur": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    # English
    "en": "ai4bharat/whisper-medium-en-gpu--t4",
    # Hindi
    "hi": "ai4bharat/conformer-hi-gpu--t4",
    # Dravidian
    "kn": "ai4bharat/conformer-multilingual-dravidian-gpu--t4",
    "ml": "ai4bharat/conformer-multilingual-dravidian-gpu--t4",
    "ta": "ai4bharat/conformer-multilingual-dravidian-gpu--t4",
    "te": "ai4bharat/conformer-multilingual-dravidian-gpu--t4",
}

API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

def asr_inference(audio_path: str, source_lang: str) -> str:
    """
    Convert WAV audio to text using Bhashini ASR API.

    Args:
        audio_path: Path to WAV audio
        source_lang: Language code ('hi', 'en', 'te', etc.)

    Returns:
        Recognized text as a string
    """
    if source_lang not in LANG_SERVICE_MAP:
        raise ValueError(f"Unsupported language: {source_lang}")

    service_id = LANG_SERVICE_MAP[source_lang]

    # Read audio file and encode in base64
    with open(audio_path, "rb") as f:
        audio_bytes = f.read()
    audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

    payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": source_lang},
                    "serviceId": service_id,
                    "audioFormat": "wav",
                    "samplingRate": 16000
                }
            }
        ],
        "inputData": {
            "audio": [{"audioContent": audio_b64}]
        }
    }

    headers = {
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json"
    }

    # Optional: force local ASR (skip remote) with env var
    if os.environ.get("FORCE_LOCAL_ASR", "0") == "1":
        print("FORCE_LOCAL_ASR=1 set — using local ASR fallback only")
        return local_asr_inference(audio_path, source_lang)

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            try:
                recognized_text = result["pipelineResponse"][0]["output"][0]["source"]
                return recognized_text
            except (KeyError, IndexError, TypeError):
                raise RuntimeError(f"No transcription found in ASR response: {result}")
        else:
            # Non-200 from remote ASR - log and fall back
            print(f"Warning: Remote ASR failed [{response.status_code}]: {response.text}")
            print("ServiceId used:", service_id)
            print("Payload sent (truncated):", str(payload)[:1000])
    except Exception as e:
        print("Warning: Remote ASR request raised an exception:", e)
        traceback.print_exc()

    # Fallback: attempt local ASR using faster-whisper if available
    print("Attempting local ASR fallback (faster-whisper)...")
    try:
        return local_asr_inference(audio_path, source_lang)
    except Exception as e:
        print("Local ASR fallback failed:", e)
        traceback.print_exc()
        raise RuntimeError("ASR failed (remote and local fallback)")


_LOCAL_ASR_MODEL = None

def local_asr_inference(audio_path: str, source_lang: str) -> str:
    """Run a local ASR using faster-whisper as a fallback.

    Note: this requires `faster-whisper` installed and the model weights available.
    Set environment variable `WHISPER_MODEL` to choose model name (default: small).
    Set `WHISPER_DEVICE` to `cpu` or `cuda`.
    """
    global _LOCAL_ASR_MODEL
    if WhisperModel is None:
        raise RuntimeError("faster-whisper is not installed; cannot run local ASR fallback")

    model_name = os.environ.get("WHISPER_MODEL", "small")
    device = os.environ.get("WHISPER_DEVICE", "cpu")

    if _LOCAL_ASR_MODEL is None:
        # Initialize model once
        print(f"Loading local ASR model: {model_name} on {device} (this may take a while)")
        _LOCAL_ASR_MODEL = WhisperModel(model_name, device=device)

    # faster-whisper returns segments + info
    segments, info = _LOCAL_ASR_MODEL.transcribe(audio_path, language=source_lang, beam_size=5)
    text = "".join([s.text for s in segments])
    return text


if __name__ == "_main_":
    # Example usage
    try:
        text = asr_inference("sample.wav", "hi")
        print(f"✅ Recognized Text: {text}")
    except Exception as e:
        print(f"❌ Error: {e}")