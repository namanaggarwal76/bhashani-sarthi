# Bhashani Sarthi 🌍

**Bhashani Sarthi** is a multilingual travel companion application designed to help travelers explore new destinations, track their journeys, and overcome language barriers. The name combines "Bhashani" (linguistic) with "Sarthi" (guide/companion), representing its mission to be a linguistic guide for travelers.

## 🎯 Overview

Bhashani Sarthi provides travelers with tools to:
- Create and manage travel cha## 🔧 Troubleshooting

### ⚠️ Dependency Conflicts (numpy/torch versions)

**The Problem:** IndicPhotoOCR requires `numpy==1.26.4` and `torch==2.6.0`, but these conflict with other packages that need newer versions, causing `RecursionError` or import failures.

**The Solution:** Use **separate virtual environments** for chat and OCR backends.

**Quick Fix:**
```bash
make fix-conflicts
```

This command will:
1. Remove old virtual environments
2. Create `venv/` for chat backend
3. Create `venv_ocr/` for OCR backend (isolated from chat)
4. Install dependencies in separate environments

**Manual Fix:**
```bash
# Remove old venvs
rm -rf venv/ venv_ocr/

# Create separate environments
python3 -m venv venv
python3 -m venv venv_ocr

# Install chat backend dependencies
./venv/bin/pip install -r requirements.txt

# Install OCR backend dependencies (in separate venv)
./venv_ocr/bin/pip install -r requirements-ocr.txt
cd IndicPhotoOCR && ../venv_ocr/bin/pip install -e .
```

The `package.json` is already configured to use separate venvs:
- Chat backend uses `./venv/`
- OCR backend uses `./venv_ocr/`

### Port Already in Use
```bash
# Find and kill process on port 8001 or 8002
lsof -ti:8001 | xargs kill -9
lsof -ti:8002 | xargs kill -9
```

### Python Dependencies Issues
```bash
# Reinstall Python dependencies with separate venvs
make clean-all
make setup-venv
make install-python
make setup-venv-ocr
make install-ocr
```nt cities
- Track visited places and earn XP for exploration
- Translate text between languages in real-time
- Convert speech to text for easier communication
- Extract text from images using OCR technology
- Access AI-powered travel guides and recommendations

## 🏗️ Architecture

### Frontend Architecture
```
client/
├── pages/           # Route components (React Router 6 SPA)
│   ├── Home.tsx            # Main dashboard with chapters
│   ├── Login.tsx           # Authentication (Email + Google)
│   ├── SignUp.tsx          # User registration
│   ├── Onboarding.tsx      # First-time user setup
│   ├── Translate.tsx       # Real-time translation
│   ├── Speech.tsx          # Speech-to-text conversion
│   ├── OCR.tsx             # Image text extraction
│   └── Guide.tsx           # AI travel guide
│
├── components/      # Reusable UI components
│   ├── Header.tsx          # App header with branding
│   ├── BottomNav.tsx       # Mobile navigation bar
│   ├── ChapterCard.tsx     # Travel chapter display
│   ├── XpBar.tsx           # Progress visualization
│   └── ui/                 # Radix UI component library
│
├── context/         # React Context providers
│   ├── AuthContext.tsx     # Firebase authentication state
│   └── UserContext.tsx     # User data & Firestore sync
│
├── lib/             # Core utilities & services
│   ├── firebase.ts         # Firebase initialization
│   ├── firebase-types.ts   # TypeScript type definitions
│   ├── firestore-service.ts # Database operations
│   └── utils.ts            # Helper functions
│
└── App.tsx          # Root component with routing
```

### Backend Architecture
```
server/
├── index.ts         # Express server setup
└── routes/          # API endpoint handlers
    └── demo.ts      # Example API route

shared/
└── api.ts           # Shared TypeScript types
```

### Tech Stack

**Frontend:**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router 6** - Client-side routing (SPA mode)
- **TailwindCSS 3** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

**Backend:**
- **Express.js** - Lightweight API server
- **Firebase Authentication** - User auth (Email/Password + Google OAuth)
- **Firestore** - NoSQL database
- **Google Gemini API** - AI-powered task generation with Gemini 2.5 Flash
- **Vite Dev Server Integration** - Single-port development

**Development:**
- **Vitest** - Unit testing framework
- **pnpm** - Fast, efficient package manager
- **SWC** - Fast TypeScript/JSX compilation

## 🗄️ Database Schema

### Firestore Structure
```
users/ (collection)
  └─ {userId}/ (document)
      ├─ basic_info: {
      │   name: string
      │   email: string
      │   country: string
      │   age: number
      │   language: { code: string, name: string }
      │ }
      ├─ preferences: {
      │   interests: string[]
      │   travel_style: string
      │   budget: string
      │ }
      ├─ stats: {
      │   xp: number
      │   tier: string
      │   chapters_created: number
      │   places_visited: number
      │ }
      └─ chapters/ (subcollection)
          └─ {chapterId}/ (document)
              ├─ city: string
              ├─ country: string
              ├─ description: string
              └─ ai_suggested_places: [{
                  place_id: string
                  name: string
                  type: string
                  rating: number
                  status: "done" | "pending"
                  visited_on: Timestamp | null
                  xp: number (AI-calculated based on popularity)
                  description: string (AI-generated)
                  estimated_duration: string
                }]
```

### Security Rules
- Users can only read/write their own data
- Authentication required for all operations
- Firestore rules enforce userId matching

## 🚀 Features

### 1. **User Authentication**
- Email/Password sign-up and login
- Google OAuth integration
- Password reset functionality
- Persistent sessions

### 2. **AI-Powered Travel Planning**
- Create chapters for different cities
- **AI generates personalized tasks** based on your preferences
- Dynamic XP points (20-200) based on place popularity and fame
- Tasks tailored to your interests, travel style, and budget
- AI-powered descriptions and time estimates
- Mark places as completed to earn XP

### 3. **Gamification**
- Variable XP points for completing activities (based on place popularity)
- Tier system: Wanderer → Trailblazer → Pathfinder → World Explorer → Sarthi Elite
- Progress visualization
- Achievement tracking
- Higher XP for famous landmarks and attractions

### 4. **Language Tools**
- **Translator**: Real-time text translation
- **Speech-to-Text**: Convert spoken words to text
- **OCR**: Extract text from images

### 5. **AI Guide**
- Personalized travel recommendations
- Context-aware suggestions
- Cultural tips and insights

## 📦 Installation & Setup

### Prerequisites
- **Node.js 18+** and **pnpm 10+**
- **Python 3.9+** (for backend services)
- **Make** (usually pre-installed on Linux/macOS, on Windows use WSL or install GNU Make)
- **Firebase project** with:
  - Authentication enabled (Email/Password + Google)
  - Firestore database created
  - Web app registered

### Quick Start (Using Make)

**Option 1: One-Command Setup** 🚀
```bash
# Clone and setup everything
git clone <repository-url>
cd bhashani-sarthi
make install
```

This will:
- Install Node.js dependencies (pnpm)
- Create **two separate Python virtual environments**:
  - `venv/` for chat backend
  - `venv_ocr/` for OCR backend (avoids dependency conflicts)
- Install all Python dependencies in isolated environments
- Install OCR dependencies with IndicPhotoOCR package

> **Why two venvs?** IndicPhotoOCR requires specific package versions (numpy==1.26.4, torch==2.6.0) that conflict with other dependencies. Using separate virtual environments solves this issue.

**Option 2: Manual Setup** 📝
```bash
# Clone the repository
git clone <repository-url>
cd bhashani-sarthi

# Install Node.js dependencies
make install-deps

# Setup Python environment
make setup-venv
make install-python
make install-ocr

# Or install Python dependencies manually:
# ./venv/bin/pip install -r requirements.txt
# ./venv/bin/pip install -r requirements-ocr.txt
# cd IndicPhotoOCR && ../venv/bin/pip install -e .
```

### Configure Environment Variables

1. **Copy the example environment file:**
```bash
cp .env.local.example .env.local
```

2. **Get Firebase Configuration:**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password + Google OAuth)
   - Create Firestore Database (production mode)
   - Deploy security rules from `firestore.rules`
   - Go to Project Settings → General → Your apps
   - Copy the Firebase config values to `.env.local`

3. **Get API Keys:**
   - **Gemini API**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - **Bhashini API**: Visit [Bhashini Portal](https://bhashini.gov.in/)
   - Add all keys to `.env.local`

### Run Development Servers

**Option 1: Run All Servers** 🚀
```bash
make dev
```

This starts:
- **Frontend** (Vite): http://localhost:2000
- **Chat Backend** (FastAPI): http://localhost:8001
- **OCR Backend** (FastAPI): http://localhost:8002

**Option 2: Run Servers Individually**
```bash
make dev-frontend  # Frontend only
make dev-backend   # Chat backend only
make dev-ocr       # OCR backend only
```

**Without Make:**
```bash
pnpm dev  # Runs all three servers using concurrently
```

## 📝 Development Commands

### Using Make (Recommended)

```bash
make help           # Show all available commands

# Setup Commands
make install        # Complete setup (all dependencies)
make install-deps   # Install Node.js dependencies only
make install-python # Install Python dependencies only
make install-ocr    # Install OCR dependencies only

# Development
make dev            # Run all servers (Frontend + Chat + OCR)
make dev-frontend   # Run frontend only
make dev-backend    # Run chat backend only
make dev-ocr        # Run OCR backend only

# Build & Test
make build          # Build for production
make test           # Run tests
make typecheck      # Run TypeScript type checking
make format         # Format code with Prettier

# Cleanup
make clean          # Remove build artifacts
make clean-all      # Remove all generated files (including venv)
```

### Using pnpm Directly

```bash
pnpm dev           # Start all servers (Frontend + Backends)
pnpm dev:frontend  # Start frontend only
pnpm dev:backend   # Start chat backend only
pnpm build         # Build for production
pnpm start         # Start production server
pnpm typecheck     # Run TypeScript type checking
pnpm test          # Run Vitest unit tests
pnpm format.fix    # Format code with Prettier
```

## 🛣️ Routing

The application uses React Router 6 in SPA mode:

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Auto-redirect to `/home` or `/login` |
| `/login` | Login | User authentication |
| `/signup` | SignUp | New user registration |
| `/onboarding` | Onboarding | First-time user setup |
| `/home` | Home | Main dashboard with chapters |
| `/translate` | Translate | Text translation tool |
| `/speech` | Speech | Speech-to-text conversion |
| `/ocr` | OCR | Image text extraction |
| `/guide` | Guide | AI travel guide |

## 🎨 Styling System

### TailwindCSS Configuration
- Primary color system defined in `client/global.css`
- Custom design tokens for theming
- Dark mode support (via `next-themes`)
- Responsive breakpoints for mobile-first design

### Component Library
- Pre-built UI components from Radix UI
- Accessible by default
- Customizable via TailwindCSS
- Located in `client/components/ui/`

### Utility Function
```typescript
import { cn } from "@/lib/utils";

// Combine classes with conditional logic
<div className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className  // Allow overrides
)} />
```

## 🔐 Authentication Flow

1. **New User:**
   - Sign up via `/signup` (Email or Google)
   - Complete onboarding at `/onboarding`
   - Redirected to `/home`

2. **Returning User:**
   - Login via `/login`
   - Auto-redirect to `/home` if already logged in

3. **Protected Routes:**
   - `AuthContext` manages authentication state
   - `UserContext` syncs user data from Firestore
   - Loading states prevent flashing content

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

Tests are written using Vitest and located alongside source files (`*.spec.ts`)

### Type Checking
```bash
pnpm typecheck
```

Validates TypeScript types across the entire codebase

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

This generates optimized static files in `dist/spa/`

### Hosting Options
- **Firebase Hosting** (recommended for Firebase integration)
- **Vercel** (zero-config deployment)
- **Netlify** (with SPA redirect rules)
- **Any static hosting** (Cloudflare Pages, GitHub Pages, etc.)

### Firebase Hosting Deployment
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 📱 Mobile Support

The app is fully responsive with:
- Mobile-first design approach
- Bottom navigation for easy thumb access
- Touch-optimized UI components
- Progressive Web App (PWA) capabilities

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite configuration with Express integration |
| `tailwind.config.ts` | TailwindCSS customization |
| `tsconfig.json` | TypeScript compiler options |
| `components.json` | Radix UI component configuration |
| `firestore.rules` | Firestore security rules |
| `.env.local` | Environment variables (not in git) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of an academic project for Semester 3.

## � Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 8001 or 8002
lsof -ti:8001 | xargs kill -9
lsof -ti:8002 | xargs kill -9
```

### Python Dependencies Issues
```bash
# Reinstall Python dependencies
make clean-all
make setup-venv
make install-python
make install-ocr
```

### Node Dependencies Issues
```bash
# Clear pnpm cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf venv
make setup-venv
make install-python
```

### OCR Backend Not Starting
The OCR backend requires specific package versions. If you encounter errors:
1. Check Python version (requires 3.9+)
2. Ensure all dependencies in `requirements-ocr.txt` are installed
3. Check IndicPhotoOCR installation: `cd IndicPhotoOCR && ../venv/bin/pip install -e .`

### Firebase Connection Issues
1. Verify all Firebase config values in `.env.local`
2. Check Firebase Console → Project Settings for correct values
3. Ensure Authentication and Firestore are enabled
4. Deploy the security rules from `firestore.rules`

## 🧪 Testing Environment Setup

To verify your setup is correct:

```bash
# Check environment configuration
make check-env

# Test each server individually
make dev-frontend   # Should start on localhost:2000
make dev-backend    # Should start on localhost:8001
make dev-ocr        # Should start on localhost:8002
```

## �🙏 Acknowledgments

- **Firebase** - Authentication and database
- **Radix UI** - Accessible component primitives
- **Vercel** - For the amazing open-source tools
- **TailwindCSS** - Utility-first CSS framework
- **IndicPhotoOCR** - OCR for Indic languages
- **Bhashini** - Indian language translation API

---

**Built with ❤️ for travelers who want to explore the world without language barriers**
