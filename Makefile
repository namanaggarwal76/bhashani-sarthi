.PHONY: help install install-deps install-python setup-venv setup-venv-ocr install-ocr dev clean test build fix-conflicts

# Default target
help:
	@echo "Bhashani Sarthi - Development Commands"
	@echo "======================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  make install          - Complete setup (all dependencies)"
	@echo "  make install-deps     - Install Node.js dependencies only"
	@echo "  make install-python   - Install Python dependencies (chat backend)"
	@echo "  make setup-venv       - Create Python virtual environment (chat)"
	@echo "  make setup-venv-ocr   - Create separate venv for OCR (recommended)"
	@echo "  make install-ocr      - Install OCR dependencies in separate venv"
	@echo "  make fix-conflicts    - Fix dependency conflicts by recreating venvs"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev              - Run all servers (Vite + Chat AI + OCR)"
	@echo "  make dev-frontend     - Run frontend only"
	@echo "  make dev-backend      - Run chat backend only"
	@echo "  make dev-ocr          - Run OCR backend only"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build            - Build for production"
	@echo "  make test             - Run tests"
	@echo "  make typecheck        - Run TypeScript type checking"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean            - Remove build artifacts"
	@echo "  make clean-all        - Remove all generated files (including venvs)"
	@echo ""

# Complete installation (with separate venvs to avoid conflicts)
install: install-deps setup-venv install-python setup-venv-ocr install-ocr
	@echo "✅ Installation complete!"
	@echo ""
	@echo "✨ Two separate virtual environments created:"
	@echo "   - venv/      (for chat backend)"
	@echo "   - venv_ocr/  (for OCR backend)"
	@echo ""
	@echo "Next steps:"
	@echo "1. Copy .env.local.example to .env.local and fill in your API keys"
	@echo "2. Run 'make dev' to start the development servers"
	@echo ""

# Install Node.js dependencies
install-deps:
	@echo "📦 Installing Node.js dependencies..."
	pnpm install

# Create Python virtual environment for chat backend
setup-venv:
	@echo "🐍 Creating Python virtual environment for chat backend..."
	@if [ ! -d "venv" ]; then \
		python3 -m venv venv; \
		echo "✅ Virtual environment (venv) created"; \
	else \
		echo "⚠️  Virtual environment (venv) already exists"; \
	fi

# Create separate virtual environment for OCR (to avoid dependency conflicts)
setup-venv-ocr:
	@echo "🐍 Creating separate Python virtual environment for OCR backend..."
	@if [ ! -d "venv_ocr" ]; then \
		python3 -m venv venv_ocr; \
		echo "✅ Virtual environment (venv_ocr) created"; \
	else \
		echo "⚠️  Virtual environment (venv_ocr) already exists"; \
	fi

# Install Python dependencies
install-python: setup-venv
	@echo "📦 Installing Python dependencies..."
	./venv/bin/pip install --upgrade pip
	./venv/bin/pip install -r requirements.txt
	@echo "✅ Python dependencies installed"

# Install OCR dependencies in separate venv (avoids conflicts with chat backend)
install-ocr: setup-venv-ocr
	@echo "📦 Installing OCR dependencies in separate virtual environment..."
	./venv_ocr/bin/pip install --upgrade pip
	./venv_ocr/bin/pip install -r requirements-ocr.txt
	@echo "📦 Installing IndicPhotoOCR package..."
	cd IndicPhotoOCR && ../venv_ocr/bin/pip install -e .
	@echo "✅ OCR dependencies installed in venv_ocr/"
	@echo ""
	@echo "ℹ️  OCR uses separate venv to avoid numpy/torch version conflicts"

# Fix dependency conflicts by recreating virtual environments
fix-conflicts:
	@echo "🔧 Fixing dependency conflicts..."
	@echo ""
	@echo "This will:"
	@echo "  1. Remove existing virtual environments"
	@echo "  2. Create separate venvs for chat and OCR backends"
	@echo "  3. Install dependencies in isolated environments"
	@echo ""
	@read -p "Continue? [y/N] " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		echo "🧹 Removing old virtual environments..."; \
		rm -rf venv/ venv_ocr/; \
		echo "✅ Cleaned up"; \
		echo ""; \
		$(MAKE) setup-venv; \
		$(MAKE) install-python; \
		$(MAKE) setup-venv-ocr; \
		$(MAKE) install-ocr; \
		echo ""; \
		echo "✅ Virtual environments recreated successfully!"; \
		echo ""; \
		echo "Now update package.json to use venv_ocr for OCR server:"; \
		echo '  "dev": "concurrently \\"vite\\" \\"./venv/bin/uvicorn chat_ai:app --reload --host 0.0.0.0 --port 8001\\" \\"cd IndicPhotoOCR && ../venv_ocr/bin/uvicorn server:app --reload --host 0.0.0.0 --port 8002\\"",'; \
	else \
		echo "Cancelled."; \
	fi

# Run all development servers
dev:
	@echo "🚀 Starting all servers..."
	@echo "   - Frontend (Vite): http://localhost:2000"
	@echo "   - Chat Backend: http://localhost:8001"
	@echo "   - OCR Backend: http://localhost:8002"
	@echo ""
	pnpm dev

# Run frontend only
dev-frontend:
	@echo "🚀 Starting frontend server..."
	pnpm dev:frontend

# Run chat backend only
dev-backend:
	@echo "🚀 Starting chat backend..."
	./venv/bin/uvicorn chat_ai:app --reload --host 0.0.0.0 --port 8001

# Run OCR backend only (uses separate venv)
dev-ocr:
	@echo "🚀 Starting OCR backend..."
	@if [ -d "venv_ocr" ]; then \
		cd IndicPhotoOCR && ../venv_ocr/bin/uvicorn server:app --reload --host 0.0.0.0 --port 8002; \
	else \
		echo "❌ venv_ocr not found. Run 'make setup-venv-ocr' and 'make install-ocr'"; \
		exit 1; \
	fi

# Build for production
build:
	@echo "🏗️  Building for production..."
	pnpm build
	@echo "✅ Build complete! Output in dist/spa/"

# Run tests
test:
	@echo "🧪 Running tests..."
	pnpm test

# Run TypeScript type checking
typecheck:
	@echo "🔍 Running TypeScript type checking..."
	pnpm typecheck

# Format code
format:
	@echo "✨ Formatting code..."
	pnpm format.fix

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/.vite
	@echo "✅ Clean complete"

# Clean everything (including dependencies)
clean-all: clean
	@echo "🧹 Removing all generated files..."
	rm -rf node_modules/
	rm -rf venv/
	rm -rf venv_ocr/
	rm -rf IndicPhotoOCR/__pycache__/
	rm -rf IndicPhotoOCR/*.egg-info/
	rm -rf IndicPhotoOCR/build/
	rm -rf IndicPhotoOCR/dist/
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Deep clean complete"

# Check if environment is set up
check-env:
	@echo "🔍 Checking environment setup..."
	@if [ ! -f ".env.local" ]; then \
		echo "❌ .env.local not found"; \
		echo "   Copy .env.local.example to .env.local and configure it"; \
		exit 1; \
	fi
	@if [ ! -d "venv" ]; then \
		echo "❌ Python virtual environment not found"; \
		echo "   Run 'make setup-venv'"; \
		exit 1; \
	fi
	@if [ ! -d "node_modules" ]; then \
		echo "❌ Node modules not found"; \
		echo "   Run 'make install-deps'"; \
		exit 1; \
	fi
	@echo "✅ Environment is set up correctly"
