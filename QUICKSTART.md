# Quick Setup Guide - Bhashani Sarthi 🚀

## TL;DR - Get Running in 3 Commands

```bash
git clone <repository-url> && cd bhashani-sarthi
make install
cp .env.local.example .env.local  # Then add your API keys
make dev
```

Visit: http://localhost:2000 🎉

---

## Understanding the Setup

### Two Virtual Environments
This project uses **two separate Python virtual environments** to avoid dependency conflicts:

```
bhashani-sarthi/
├── venv/          ← Chat backend (FastAPI)
│   └── Dependencies: fastapi, google-genai, websockets, etc.
│
├── venv_ocr/      ← OCR backend (IndicPhotoOCR)
│   └── Dependencies: numpy==1.26.4, torch==2.6.0, IndicPhotoOCR
│
└── node_modules/  ← Frontend (React + Vite)
    └── Dependencies: react, vite, tailwindcss, etc.
```

**Why separate venvs?**
- IndicPhotoOCR needs `numpy==1.26.4` and `torch==2.6.0`
- Other packages need newer versions
- Conflicts cause `RecursionError` and import failures
- **Solution:** Isolated environments! 🎯

---

## If You Already Have Conflicts

### Quick Fix
```bash
make fix-conflicts
```

This removes old venvs and recreates them properly.

### Manual Fix
```bash
# Clean everything
rm -rf venv/ venv_ocr/

# Recreate environments
make setup-venv          # Creates venv/
make install-python      # Installs chat dependencies

make setup-venv-ocr      # Creates venv_ocr/
make install-ocr         # Installs OCR dependencies
```

---

## Development Workflow

### Starting Servers

**All at once:**
```bash
make dev
# Starts: Frontend (2000) + Chat (8001) + OCR (8002)
```

**Individually:**
```bash
make dev-frontend    # Frontend only
make dev-backend     # Chat backend only
make dev-ocr         # OCR backend only
```

### Common Issues

**Port already in use:**
```bash
lsof -ti:8001 | xargs kill -9  # Kill chat backend
lsof -ti:8002 | xargs kill -9  # Kill OCR backend
```

**Module not found errors:**
```bash
# For chat backend
./venv/bin/pip install -r requirements.txt

# For OCR backend
./venv_ocr/bin/pip install -r requirements-ocr.txt
cd IndicPhotoOCR && ../venv_ocr/bin/pip install -e .
```

**Node modules issues:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## Environment Variables

### Required API Keys

1. **Firebase** (Authentication + Database)
   - Get from: https://console.firebase.google.com/
   - Add to `.env.local`: All `VITE_FIREBASE_*` variables

2. **Google Gemini** (AI features)
   - Get from: https://aistudio.google.com/app/apikey
   - Add to `.env.local`: `GEMINI_API_KEY`

3. **Bhashini** (Translation - Optional)
   - Get from: https://bhashini.gov.in/
   - Add to `.env.local`: `BHASHINI_*` variables

### Quick Setup
```bash
cp .env.local.example .env.local
# Edit .env.local and add your API keys
```

---

## Project Structure

```
Frontend:  client/    → React 18 + TypeScript + Vite
Backend 1: chat_ai.py → FastAPI (Chat + Translation)
Backend 2: IndicPhotoOCR/server.py → FastAPI (OCR + Location)
Database:  Firebase Firestore
Auth:      Firebase Authentication
```

---

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `make help` | Show all commands |
| `make install` | Complete setup |
| `make dev` | Run all servers |
| `make fix-conflicts` | Fix dependency conflicts |
| `make clean-all` | Remove all generated files |
| `make check-env` | Verify setup is correct |
| `make test` | Run tests |
| `make build` | Build for production |

---

## Need Help?

1. **Check the full README.md** for detailed documentation
2. **Run `make help`** for all available commands
3. **Check logs** when servers start for specific errors
4. **Verify `.env.local`** has all required API keys

---

**Happy Coding! 🚀**
