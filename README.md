# Bhashani Sarthi 

A multilingual language learning and translation platform with real-time speech-to-speech translation capabilities.

## Quick Setup

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create `.env.local`:
```env
PORT=2000
GEMINI_API_KEY=your-gemini-api-key
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Setup Python Services

**Chat Service** (uses `python_services/venv/`):
```bash
python3 -m venv python_services/venv
python_services/venv/bin/pip install google-genai requests
```

**Speech Service** (uses `final_s2s/venv/`):
```bash
cd final_s2s
python3 -m venv venv
venv/bin/pip install -r requirements.txt
```

**OCR Service** (uses system Python):
```bash
pip3 install requests google-genai
```

### 4. Deploy Firestore Rules
Go to [Firebase Console](https://console.firebase.google.com) → Firestore → Rules tab, paste [firestore.rules](firestore.rules) content, then publish.

### 5. Start Server
```bash
pnpm dev
```
Server runs at **http://localhost:2000**

## Features

- **Speech Translation**: Real-time speech-to-speech translation using Bhashini API with local fallback
- **Text Translation**: Translate text between multiple Indian languages
- **OCR (LiveLens)**: Extract and translate text from images in real-time
- **AI Guide**: Chat-based AI assistant for language learning
- **Progress Tracking**: Track your learning journey with XP and levels

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (dev server & build tool)
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Firebase (Authentication & Firestore database)
- i18next for multilingual support

### Backend
- Express.js (Node.js API server)
- Python speech pipeline (ASR → MT → TTS)
- Bhashini API integration
- faster-whisper for local ASR fallback

## Project Structure

Top-level repo layout (trimmed to relevant files/folders):

- **.env.example, .env.local** — environment samples
- **package.json**, **pnpm-lock.yaml** — Node deps & scripts
- **firestore.rules** — Firebase security rules
- **IndicPhotoOCR/** — bundled OCR library and resources
- **client/** — React frontend (App.tsx, components/, pages/, lib/, context/, hooks/, locales/)
- **server/** — Express API (index.ts, routes/ { `chat.ts`, `ocr.ts`, `speech_pipeline.ts` })
- **final_s2s/** — Python speech pipeline (pipeline.py, asr.py, mt.py, tts.py, run_wrapper.py, requirements.txt, venv/)
- **python_services/** — small Python wrappers used by server (chat_service.py, ocr_service.py, requirements.txt, venv/)
- **public/** — static assets (favicon, logo, images, robots.txt)
- **static/**, **test_images/**, **tmp/** — misc assets and temporary files

Note: I trimmed large folders (e.g. `client/components/ui/` and `IndicPhotoOCR/` internals) for readability — tell me if you want a full recursive tree included.

## Architecture / Pipeline

Below is a plain-text ASCII diagram that works in any viewer, followed by a concise flow summary.

```
 +----------------------+      +-------------------------+      +-------------------------+
 |  React Frontend      | ---> |  Express API Server     | ---> |  Firebase Auth & DB     |
 |  (client)            |      |  (server)               |      |  (Firestore)            |
 +----------------------+      +-------------------------+      +-------------------------+
                                      |      |      \
                                      |      |       \
                  +-------------------+      |        +----------------+
                  |                          |        |                |
         (POST /api/ocr)               (POST /api/chat)   (POST /api/speech/pipeline)
                  |                          |        |                |
      +---------------------+      +----------------------+      +-------------------------+
      | python_services/    |      | python_services/     |      | final_s2s/ (run_wrapper)|
      | ocr_service.py      |      | chat_service.py      |      | pipeline.py             |
      +---------------------+      +----------------------+      +-------------------------+
             |   |                           |   |                      |    |    |
             |   |                           |   |                      |    |    +--> output: `translated_output.wav` (audio)
             |   |                           |   |                      |    |
   IndicPhotoOCR |                   Gemini AI (LLM)          ASR -> MT -> TTS (Bhashini)
   (image OCR)   |                   (Gemini client)           (remote APIs with local fallbacks)
                 |                                                   |
          optional translation                                     sidecar JSON
            via Bhashini MT                                              |
                 |                                                      V
                 +-------------------------------------------------> server encodes
                                                            audio to base64 and returns JSON
```


### 1. Install Dependencies

```bash
# Clone the repository
git clone <repo-url>
cd bhashani-sarthi

# Install Node.js dependencies
pnpm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password provider)
3. Enable **Firestore Database**
4. Copy your Firebase config and create `.env.local`:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Python Speech Pipeline Setup

```bash
cd final_s2s

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install Python dependencies
pip install -r requirements.txt

cd ..
```

### 4. (Optional) Bhashini API Token

For remote ASR/TTS via Bhashini API:

```bash
export BHASHINI_AUTH_TOKEN=your_bhashini_token
```

Or add to `.env.local`:
```bash
BHASHINI_AUTH_TOKEN=your_bhashini_token
```

## Development

Start both frontend and backend servers:

```bash
pnpm dev
```

This runs:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

The Python speech pipeline is called automatically by the backend when needed.

## Production Build

```bash
pnpm build
```

Builds optimized frontend to `dist/` directory.

## API Endpoints

### Speech Pipeline
```
POST /api/speech/pipeline
Content-Type: multipart/form-data

Parameters:
- audio: WAV file (recorded speech)
- target: Target language code (e.g., 'en', 'hi')
- model: 'remote-default' or 'local-whisper'

Returns:
{
  "source_language": "ur",
  "recognized_text": "...",
  "translated_text": "...",
  "audio_base64": "...",  // Translated speech audio
  "timings": {...}
}
```

### Health Check
```
GET /api/ping
```

## Supported Languages

| Code | Language |
|------|----------|
| en   | English  |
| hi   | Hindi    |
| ta   | Tamil    |
| te   | Telugu   |
| ur   | Urdu     |
| bn   | Bengali  |
| mr   | Marathi  |
| gu   | Gujarati |
| kn   | Kannada  |
| ml   | Malayalam|
| pa   | Punjabi  |
| or   | Odia     |
| as   | Assamese |

## Environment Variables

### Required
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Optional
```bash
# Bhashini API (for remote ASR/TTS)
BHASHINI_AUTH_TOKEN=your_token

# Python Speech Pipeline
FORCE_LOCAL_ASR=1          # Force local ASR (faster-whisper)
WHISPER_MODEL=base         # Whisper model: tiny, base, small, medium, large
WHISPER_DEVICE=cpu         # Device: cpu or cuda
```

## Troubleshooting

### Python Dependencies Not Found
If you get `ModuleNotFoundError: No module named 'pydub'`:

```bash
cd final_s2s
source venv/bin/activate
pip install -r requirements.txt
```

The server automatically detects and uses the venv Python if available.

### Audio Not Playing in Safari
The app includes a Safari-specific fallback using WebAudio API. If the `<audio>` element fails, it automatically decodes and plays via AudioContext.

### Port Already in Use
If port 5000 or 5173 is busy:

```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

## Scripts

```bash
pnpm dev          # Start dev servers (frontend + backend)
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm clean        # Clean build artifacts
```

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
 
