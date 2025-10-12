import requests
import json
import os
import shutil
import uuid
import logging
import time
from fastapi import FastAPI, File, UploadFile, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from google.genai import types
from IndicPhotoOCR.ocr import OCR

# ---------------- CONFIG ----------------
os.environ['GEMINI_API_KEY'] = 'AIzaSyCukxYVbX0sY6SYmVxVuhJlTu_SMmQzOP4'
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

AUTH_TOKEN = "DveTyi8IJRxMNJdbUI0EhiE1X0yQYmoIiNLafiNLYbr4K0JCmDxFasFbOQQgkz7w"
MT_SERVICE_ID = "ai4bharat/indictrans-v2-all-gpu--t4"
API_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

SUPPORTED_LANGUAGES = {
    "en", "as", "bn", "brx", "doi", "gom", "gu", "hi", "kn", "ks",
    "mai", "ml", "mni", "mr", "ne", "or", "pa", "sa", "sat", "sd",
    "ta", "te", "ur"
}

LANG_CODE_TO_NAME = {
    "en": "English", "as": "Assamese", "bn": "Bengali", "brx": "Bodo", "doi": "Dogri",
    "gom": "Konkani", "gu": "Gujarati", "hi": "Hindi", "kn": "Kannada", "ks": "Kashmiri",
    "mai": "Maithili", "ml": "Malayalam", "mni": "Manipuri", "mr": "Marathi", "ne": "Nepali",
    "or": "Odia", "pa": "Punjabi", "sa": "Sanskrit", "sat": "Santali", "sd": "Sindhi",
    "ta": "Tamil", "te": "Telugu", "ur": "Urdu"
}
LANG_NAME_TO_CODE = {v.lower(): k for k, v in LANG_CODE_TO_NAME.items()}

# ---------------- FastAPI APP ----------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- OCR SYSTEM ----------------
ocr_system = OCR(verbose=True, identifier_lang="auto", device="cpu")

# ---------------- GEMINI CLIENT ----------------
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# ---------------- SESSION STORE ----------------
sessions = {}
SESSION_TIMEOUT = 60*30  # 30 minutes

def cleanup_expired_sessions():
    now = time.time()
    expired = [sid for sid, s in sessions.items() if now - s["last_active"] > SESSION_TIMEOUT]
    for sid in expired:
        try:
            if os.path.exists(sessions[sid]["image_path"]):
                os.remove(sessions[sid]["image_path"])
        except:
            pass
        del sessions[sid]
        logging.info(f"Cleaned up session {sid}")

# ---------------- Bhashini Translation ----------------
def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    if not text.strip(): return ""
    if source_lang not in SUPPORTED_LANGUAGES or target_lang not in SUPPORTED_LANGUAGES: return text
    if source_lang == target_lang: return text

    payload = {
        "pipelineTasks":[{"taskType":"translation",
                          "config":{"language":{"sourceLanguage":source_lang,"targetLanguage":target_lang},
                                    "serviceId":MT_SERVICE_ID,"numTranslation":"True"}}],
        "inputData":{"input":[{"source":text}],"audio":[{"audioContent":None}]}
    }
    headers = {"Authorization": AUTH_TOKEN, "Content-Type": "application/json"}

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            return result["pipelineResponse"][0]["output"][0]["target"]
    except Exception as e:
        logging.warning(f"Translation failed: {e}")
    return text

# ---------------- PLACE NAME / DESCRIPTION ----------------
def find_place_name(query, lat, lon):
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json][timeout:25];
    (node["name"~"{query}",i](around:500,{lat},{lon});
     way["name"~"{query}",i](around:500,{lat},{lon}););
    out body; >; out skel qt;
    """
    headers = {'User-Agent':'LocationDescriberApp/1.0'}
    try:
        response = requests.get(overpass_url, params={'data':overpass_query}, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data.get('elements'):
            return data['elements'][0].get('tags', {}).get('name')
    except: pass

    # fallback Nominatim
    url = f"https://nominatim.openstreetmap.org/search?q={requests.utils.quote(query)}&format=jsonv2&lat={lat}&lon={lon}&limit=1"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data: return data[0].get('display_name')
    except: pass
    return None

def get_gemini_details(place_name, lat, lon):
    model = genai.GenerativeModel('gemini-2.5-flash')
    prompt = f"""
You are an expert tour guide. A user is at coordinates ({lat}, {lon}) and has identified a place called "{place_name}".
Provide a comprehensive description covering: Introduction, History, What to See and Do, Review Summary. Entire response in English.
"""
    try: return model.generate_content(prompt).text
    except: return "Could not retrieve detailed information from Gemini."

def get_general_description(lat, lon):
    headers = {'User-Agent':'LocationDescriberApp/1.0'}
    url = f"https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat={lat}&lon={lon}"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        address = response.json().get('display_name')
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"Briefly describe the area around this location: {address}. Entire response in English."
        gemini_response = model.generate_content(prompt)
        return address, gemini_response.text
    except:
        return None, "Could not retrieve information for this location."

# ---------------- LIVE LOCATION ----------------
def get_live_location():
    try:
        response = requests.get("https://ipinfo.io/json")
        loc = response.json().get('loc')
        if loc: lat_str, lon_str = loc.split(","); return float(lat_str), float(lon_str)
    except: pass
    return None, None

# ---------------- OCR ENDPOINT ----------------
@app.post("/ocr")
async def run_ocr(file: UploadFile = File(...)):
    tmp_path = f"tmp_{file.filename}"
    with open(tmp_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)
    try:
        result = ocr_system.ocr(tmp_path)
        flat_words = []
        for item in result:
            if isinstance(item, list): flat_words.extend([str(word) for word in item])
            else: flat_words.append(str(item))
        text_output = " ".join(flat_words)
    finally:
        os.remove(tmp_path)
    return {"ocr_text": text_output}

# ---------------- START IMAGE SESSION ----------------
@app.post("/start_image_session")
async def start_image_session(
    response: Response,
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    target_language: str = Form("English"),
    location_info: str = Form("")
):
    cleanup_expired_sessions()
    session_id = str(uuid.uuid4())
    tmp_path = f"session_{session_id}_{file.filename}"
    with open(tmp_path, "wb") as buffer: shutil.copyfileobj(file.file, buffer)

    # Run OCR
    result = ocr_system.ocr(tmp_path)
    ocr_text = " ".join(str(word) for item in result for word in (item if isinstance(item,list) else [item]))

    # Live location fallback
    if latitude is None or longitude is None:
        latitude, longitude = get_live_location()
        if latitude is None or longitude is None:
            latitude, longitude = 17.4417, 78.3575

    # Determine target language code
    target_lang_code = LANG_NAME_TO_CODE.get(target_language.lower(), "en")
    target_lang_full_name = LANG_CODE_TO_NAME.get(target_lang_code, "English")

    # Find place and get description
    found_place = find_place_name(ocr_text, latitude, longitude)
    if found_place:
        english_desc = get_gemini_details(found_place, latitude, longitude)
        translated_desc = translate_text(english_desc, "en", target_lang_code)
        place_name = found_place
    else:
        place_name, english_desc = get_general_description(latitude, longitude)
        if not place_name: place_name = "Unknown area"
        translated_desc = translate_text(english_desc, "en", target_lang_code)

    # Save session
    sessions[session_id] = {
        "image_path": tmp_path,
        "ocr_text": ocr_text,
        "latitude": latitude,
        "longitude": longitude,
        "location_info": location_info,
        "chat_history": [],
        "last_active": time.time(),
        "description_english": english_desc,
        "description_translated": translated_desc,
        "place_name": place_name,
        "target_language_code": target_lang_code,
        "target_language_name": target_lang_full_name
    }

    response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=SESSION_TIMEOUT)
    return {
        "session_id": session_id,
        "ocr_text": ocr_text,
        "place_name": place_name,
        "description_english": english_desc,
        "description_translated": translated_desc,
        "target_language": target_lang_full_name
    }

# ---------------- IMAGE CHAT SESSION ----------------
@app.post("/image_chat_session")
async def image_chat_session(request: Request, user_question: str = Form(...)):
    cleanup_expired_sessions()
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        return {"error": "Invalid or expired session_id."}
    s = sessions[session_id]
    s["last_active"] = time.time()

    chat_history_text = "\n".join([f"User: {q}\nAI: {a}" for q,a in s["chat_history"]])
    context = f"""
You are a friendly travel AI.
Session context:
- Coordinates: {s['latitude']}, {s['longitude']}
- OCR text: {s['ocr_text']}
- Extra info: {s['location_info']}
Conversation so far:
{chat_history_text}
New question: "{user_question}"
"""
    with open(s["image_path"], "rb") as img_file:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-pro-exp-02-05",
            contents=[
                types.Part.from_text(text=context),
                types.ImagePart(content=img_file.read(), mime_type="image/jpeg")
            ],
            config=types.GenerateContentConfig(temperature=0.6, max_output_tokens=2048)
        )

    ai_answer = response.text.strip() if response and response.text else "[No response]"
    s["chat_history"].append((user_question, ai_answer))
    return {"session_id": session_id, "user_question": user_question, "ai_response": ai_answer}

# ---------------- ACTIVE SESSIONS ----------------
@app.get("/active_sessions")
async def active_sessions():
    cleanup_expired_sessions()
    return {"active_sessions": list(sessions.keys())}