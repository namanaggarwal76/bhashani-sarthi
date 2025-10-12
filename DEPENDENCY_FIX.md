# Dependency Conflict Solution - Summary

## The Problem 🐛

IndicPhotoOCR requires specific package versions that conflict with other dependencies:

- **IndicPhotoOCR needs:** `numpy==1.26.4`, `torch==2.6.0`
- **Other packages need:** `numpy>=2.0.0`, newer torch versions
- **Result:** `RecursionError: maximum recursion depth exceeded` when importing numpy

## The Solution ✅

**Use separate virtual environments for each backend:**

```
Project Structure:
├── venv/          ← Chat backend (FastAPI)
│   ├── fastapi
│   ├── google-genai
│   ├── websockets
│   └── numpy (latest compatible version)
│
├── venv_ocr/      ← OCR backend (isolated)
│   ├── fastapi
│   ├── numpy==1.26.4
│   ├── torch==2.6.0
│   └── IndicPhotoOCR
│
└── node_modules/  ← Frontend (React + Vite)
```

## How to Apply the Fix 🔧

### Option 1: Automated (Recommended)
```bash
make fix-conflicts
```

This command will:
1. Remove old virtual environments
2. Create `venv/` for chat backend
3. Create `venv_ocr/` for OCR backend
4. Install dependencies in isolated environments

### Option 2: Manual
```bash
# Clean up
rm -rf venv/ venv_ocr/

# Setup chat backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt

# Setup OCR backend (separate!)
python3 -m venv venv_ocr
./venv_ocr/bin/pip install -r requirements-ocr.txt
cd IndicPhotoOCR && ../venv_ocr/bin/pip install -e .
```

## Files Updated 📝

### 1. `Makefile`
- Added `setup-venv-ocr` target for separate OCR venv
- Added `fix-conflicts` command to automate the fix
- Updated `install-ocr` to use `venv_ocr/`
- Updated `dev-ocr` to use `venv_ocr/`
- Updated `clean-all` to remove both venvs

### 2. `package.json`
- Updated dev script to use `venv_ocr/` for OCR server:
  ```json
  "dev": "concurrently ... \"cd IndicPhotoOCR && ../venv_ocr/bin/uvicorn server:app ...\""
  ```
- Added `dev:ocr` script using `venv_ocr/`

### 3. `README.md`
- Added troubleshooting section explaining the conflict
- Documented the solution with separate venvs
- Updated Quick Start to mention two venvs
- Added explanation of why two venvs are needed

### 4. `QUICKSTART.md` (New)
- Quick reference guide
- Visual explanation of the venv structure
- Common troubleshooting steps
- TL;DR setup commands

### 5. `.env.local.example` (New)
- Template for environment variables
- Comments explaining where to get API keys

## How It Works 🎯

### Before (Single venv - Conflicts!)
```
venv/
├── numpy==1.26.4 (for IndicPhotoOCR)
└── torch==2.6.0 (for IndicPhotoOCR)
    ❌ Conflicts with other packages needing newer versions
```

### After (Separate venvs - No conflicts!)
```
venv/                      venv_ocr/
├── numpy (latest)        ├── numpy==1.26.4 ✓
├── fastapi               ├── torch==2.6.0 ✓
├── google-genai          ├── IndicPhotoOCR ✓
└── websockets            └── fastapi
    ✓ No conflicts            ✓ Isolated dependencies
```

## Development Workflow 🚀

### Starting All Servers
```bash
make dev
```

This runs:
- Frontend: `vite` → http://localhost:2000
- Chat Backend: `./venv/bin/uvicorn chat_ai:app` → http://localhost:8001
- OCR Backend: `./venv_ocr/bin/uvicorn server:app` → http://localhost:8002

Each backend uses its own virtual environment! 🎉

### Starting Individual Servers
```bash
make dev-frontend  # Uses node_modules/
make dev-backend   # Uses venv/
make dev-ocr       # Uses venv_ocr/
```

## Testing the Fix ✅

After running `make fix-conflicts`:

1. **Verify both venvs exist:**
   ```bash
   ls -la | grep venv
   # Should see: venv/ and venv_ocr/
   ```

2. **Check installations:**
   ```bash
   ./venv/bin/pip list | grep numpy
   # Should show numpy (latest version)
   
   ./venv_ocr/bin/pip list | grep numpy
   # Should show numpy==1.26.4
   ```

3. **Start servers:**
   ```bash
   make dev
   # All three servers should start without errors
   ```

## Advantages of This Solution 👍

1. **No dependency conflicts** - Each backend has its own isolated environment
2. **Clean separation** - Chat and OCR dependencies don't interfere
3. **Easy to maintain** - Each venv can be updated independently
4. **Scalable** - Can add more isolated backends if needed
5. **Standard practice** - Common pattern for Python projects with conflicting deps

## Alternative Solutions (Not Used)

### Why not Docker?
- More complex setup for development
- Slower startup times
- Overkill for this use case

### Why not conda?
- Not everyone has conda installed
- venv is standard Python tool
- Simpler and lighter weight

### Why not upgrade IndicPhotoOCR?
- Would require modifying the external library
- May break OCR functionality
- Not maintainable long-term

## Maintenance 🔧

### Adding new chat backend dependencies:
```bash
# Add to requirements.txt
echo "new-package==1.0.0" >> requirements.txt

# Install in chat venv
./venv/bin/pip install -r requirements.txt
```

### Adding new OCR backend dependencies:
```bash
# Add to requirements-ocr.txt
echo "new-package==1.0.0" >> requirements-ocr.txt

# Install in OCR venv
./venv_ocr/bin/pip install -r requirements-ocr.txt
```

### Rebuilding environments:
```bash
make fix-conflicts
# Recreates both venvs from scratch
```

## Summary 📋

✅ **Problem Solved:** Dependency conflicts between IndicPhotoOCR and other packages
✅ **Solution Applied:** Separate virtual environments (venv/ and venv_ocr/)
✅ **Commands Added:** make fix-conflicts, make setup-venv-ocr, make install-ocr
✅ **Documentation Updated:** README.md, QUICKSTART.md, Makefile help
✅ **Configuration Updated:** package.json scripts use correct venvs

**Everything is now automated and documented!** 🎉

Just run `make install` for new setups or `make fix-conflicts` if you already have the old setup.
