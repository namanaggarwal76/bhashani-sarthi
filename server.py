from fastapi import FastAPI, File, UploadFile, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types
from IndicPhotoOCR.ocr import OCR
import uuid, shutil, os, logging, time

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- OCR ----------------
ocr_system = OCR(verbose=True, identifier_lang="auto", device="cpu")

@app.post("/ocr")
async def run_ocr(file: UploadFile = File(...)):
    tmp_path = f"tmp_{file.filename}"
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        result = ocr_system.ocr(tmp_path)
        flat_words = []
        for item in result:
            if isinstance(item, list):
                flat_words.extend([str(word) for word in item])
            else:
                flat_words.append(str(item))
        text_output = " ".join(flat_words)
    finally:
        os.remove(tmp_path)
    
    return {"text": text_output}

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO)

# ---------------- GEMINI ----------------
GEMINI_API_KEY = "AIzaSyBAGb3eiHdAfZo_EGX8piTtxv8OOt-fHOQ"
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

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

# ---------------- START IMAGE SESSION ----------------
@app.post("/start_image_session")
async def start_image_session(
    response: Response,
    file: UploadFile = File(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_info: str = Form("")
):
    cleanup_expired_sessions()
    session_id = str(uuid.uuid4())
    tmp_path = f"session_{session_id}_{file.filename}"
    with open(tmp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ocr_system.ocr(tmp_path)
    ocr_text = " ".join(str(word) for item in result for word in (item if isinstance(item, list) else [item]))

    sessions[session_id] = {
        "image_path": tmp_path,
        "ocr_text": ocr_text,
        "latitude": latitude,
        "longitude": longitude,
        "location_info": location_info,
        "chat_history": [],
        "last_active": time.time(),
    }

    # Set cookie with session_id
    response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=SESSION_TIMEOUT)

    logging.info(f"Created session {session_id}")
    return {"session_id": session_id, "ocr_text": ocr_text, "message": "Session created successfully."}

# ---------------- IMAGE CHAT SESSION ----------------
@app.post("/image_chat_session")
async def image_chat_session(
    request: Request,
    user_question: str = Form(...)
):

    cleanup_expired_sessions()
    session_id = request.cookies.get("session_id")
    if not session_id or session_id not in sessions:
        return {"error": "Invalid or expired session_id."}

    s = sessions[session_id]
    s["last_active"] = time.time()
    
    chat_history_text = "\n".join([f"User: {q}\nAI: {a}" for q, a in s["chat_history"]])
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
            config=types.GenerateContentConfig(
                temperature=0.6,
                max_output_tokens=2048,
            )
        )

    ai_answer = response.text.strip() if response and response.text else "[No response]"
    s["chat_history"].append((user_question, ai_answer))

    return {"session_id": session_id, "user_question": user_question, "ai_response": ai_answer}

# ---------------- ACTIVE SESSIONS ----------------
@app.get("/active_sessions")
async def active_sessions():
    cleanup_expired_sessions()
    return {"active_sessions": list(sessions.keys())}
