# 🌍 Bhashani Sarthi

**Bhashani Sarthi** is an AI-powered multilingual travel companion that helps users plan, explore, and navigate their travel experiences across India and beyond. The application seamlessly integrates speech-to-speech translation, optical character recognition (OCR), and intelligent travel planning to break down language barriers for travelers.

The name combines "Bhashani" (linguistic) and "Sarthi" (guide/companion), representing its mission to be your ultimate linguistic guide and travel companion.

## ✨ Key Features

### 🗺️ **Smart Travel Planning**
- **Chapter-Based Organization**: Create travel "chapters" for each city or destination
- **AI-Powered Recommendations**: Get personalized place suggestions powered by Google Gemini 2.5 Flash
- **Intelligent Matching**: Recommendations based on your interests, budget, and travel style
- **Dynamic XP System**: Earn 20-200 XP per place based on popularity and significance
- **Progress Tracking**: Mark places as visited and watch your journey unfold

### 🗣️ **Real-Time Speech Translation**
- **Speech-to-Speech Translation**: Record in one language, hear translation in another
- **23+ Indian Languages**: Hindi, Tamil, Telugu, Urdu, Bengali, Marathi, and more
- **Bhashini Integration**: Powered by India's National Language Translation Mission
- **Local & Remote Options**: Choose between Bhashini API or local Whisper model

### 📸 **Live Lens OCR**
- **Real-Time Text Recognition**: Extract text from signs, menus, documents
- **13 Indian Scripts**: Supports Devanagari, Bengali, Tamil, Telugu, and more
- **Instant Translation**: Translate extracted text to your preferred language
- **Information Retrieval**: RAG Based, Location aware information Retrieval
- **IndicPhotoOCR**: Custom-built OCR optimized for Indian languages

### 🌐 **Multilingual Interface**
- **12 Languages**: Full interface translation (Hindi, English, Bengali, Gujarati, etc.)
- **i18next Integration**: Seamless language switching
- **Persistent Preferences**: Your language choice stays with you

### 🤖 **AI Travel Assistant**
- **Context-Aware Chat**: Get travel advice, tips, and recommendations
- **Gemini 2.5 Flash**: Powered by Google's latest AI model
- **Multilingual Conversations**: Chat in your native language

### 🎮 **Gamification System**
- **XP Points**: Earn points for visiting places (20-200 XP based on popularity)
- **Tier Progression**: Wanderer → Trailblazer → Pathfinder → World Explorer → Sarthi Elite
- **Achievement Tracking**: Monitor your travel milestones
- **Visual Progress**: Beautiful XP bars and tier badges

## 🏗️ Tech Stack

### **Frontend Technologies**
- **React 18.3** - Modern UI library with hooks
- **TypeScript 5.9** - Type-safe development
- **Vite 7.1** - Lightning-fast build tool and dev server
- **React Router v6** - Client-side routing (SPA)
- **Tailwind CSS 3.4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations
- **i18next** - Internationalization framework
- **React Query** - Data fetching and caching
- **Lucide React** - Beautiful icon library

### **Backend Technologies**
- **Python 3.10/3.12** - Dual environment setup
- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server with auto-reload
- **Google Gemini AI** - Chat and recommendations (Gemini 2.5 Flash)
- **Pydantic** - Data validation

### **OCR & Machine Learning**
- **PyTorch 2.5** - Deep learning framework
- **OpenCV 4.10** - Computer vision
- **IndicPhotoOCR** - Custom OCR for Indian scripts
- **TextBPN++** - Text detection model
- **Custom Recognition Models** - For 13 Indian scripts

### **Speech Processing**
- **Bhashini API** - ASR & TTS for Indian languages
- **faster-whisper** - Local speech recognition
- **Web Audio API** - Browser-based audio recording
- **Speech synthesis** - Text-to-speech generation

### **Database & Authentication**
- **Firebase Firestore** - NoSQL cloud database
- **Firebase Authentication** - User management (Email + Google OAuth)
- **Firestore Security Rules** - Fine-grained access control

### **Development Tools**
- **pnpm** - Fast, efficient package manager
- **Concurrently** - Run multiple dev servers
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **Make** - Build automation
- **SWC** - Fast TypeScript/JSX compilation

---

## 📁 Project Structure
```
bhashani-sarthi/
├── client/                      # Frontend React app
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Radix UI components
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   ├── ChapterCard.tsx
│   │   └── XpBar.tsx
│   ├── context/               # React Context providers
│   │   ├── AuthContext.tsx   # Firebase auth
│   │   └── UserContext.tsx   # User data management
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities & services
│   │   ├── firebase.ts       # Firebase config
│   │   ├── firestore-service.ts  # Database operations
│   │   ├── firebase-types.ts  # TypeScript types
│   │   └── i18n.ts          # Internationalization
│   ├── locales/              # Translation files (12 languages)
│   ├── pages/                # Route components
│   │   ├── Home.tsx         # Main dashboard
│   │   ├── OCR.tsx          # Live Lens feature
│   │   ├── Speech.tsx       # Speech translation
│   │   ├── Chat_Ai.jsx      # AI chat interface
│   │   ├── Translate.tsx    # Text translation
│   │   ├── Login.tsx        # Authentication
│   │   └── Profile.tsx      # User profile
│   └── App.tsx              # Root component
│
├── server/                    # Node.js API (optional)
│   ├── routes/
│   │   └── speech_pipeline.ts  # S2S API endpoint
│   └── services/
│
├── IndicPhotoOCR/            # Custom OCR system
│   ├── IndicPhotoOCR/
│   │   ├── detection/       # Text detection models
│   │   ├── recognition/     # Character recognition
│   │   └── script_identification/  # Script detection
│   └── server.py           # FastAPI OCR server
│
├── final_s2s/                # Speech-to-speech pipeline
│   ├── asr.py              # Automatic speech recognition
│   ├── mt.py               # Machine translation
│   ├── tts.py              # Text-to-speech
|   |── requirements.txt    # requirement file
│   └── pipeline.py         # Complete S2S pipeline
|   
│
├── chat_ai.py               # FastAPI chat backend
├── requirements2.txt     
├── package.json             # Node.js dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS config
└── firestore.rules          # Firebase security rules
```

---

## 🗄️ Database Schema

### Firestore Collections
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

### XP & Tier System
| Tier | XP Required | Description |
|------|-------------|-------------|
| **Wanderer** | 0 - 999 | Starting your journey |
| **Trailblazer** | 1,000 - 2,999 | Getting experienced |
| **Pathfinder** | 3,000 - 5,999 | Seasoned explorer |
| **World Explorer** | 6,000 - 9,999 | Expert traveler |
| **Sarthi Elite** | 10,000+ | Master guide |

### Security Rules
- Users can only read/write their own data (`userId` matching)
- Authentication required for all operations
- Firestore Security Rules enforce access control
- Chapters stored as subcollections under users

---

## 🧰 Project Setup

Follow these steps to set up the entire project locally.

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/namanaggarwal76/bhashani-sarthi
cd bhashani-sarthi
```

---

### 2️⃣ Speech-to-Speech Module

```bash
cd final_s2s
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> This module handles **speech-to-speech translation** using the Bhashini ASR → MT → TTS pipeline.

---

### 3️⃣ Chat AI Module

```bash
cd ..
uvicorn chat_ai:app --host 0.0.0.0 --port 8002
```

> Starts the **AI Chat backend**, which enables multilingual conversations using Gemini and Bhashini APIs.

---

### 4️⃣ OCR Module (IndicPhotoOCR)

```bash
git clone https://github.com/Bhashini-IITJ/IndicPhotoOCR.git
mv server.py IndicPhotoOCR/
cd IndicPhotoOCR

# Create and activate environment
conda create -n indicphotoocr python=3.9 -y
conda activate indicphotoocr

# Build and install package
python setup.py sdist bdist_wheel
pip install dist/indicphotoocr-1.3.1-py3-none-any.whl[cpu]

# Setup environment
chmod +x setup.sh
./setup.sh
pip install -r requirements2.txt

# Run OCR server
uvicorn server:app --reload --port 8001
```

> This module handles **image-based text extraction** and supports multiple Indic languages.

---

### 5️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory and add your API keys:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Get your keys from:

* **Firebase** → [console.firebase.google.com](https://console.firebase.google.com)
* **Gemini API** → [aistudio.google.com/apikey](https://aistudio.google.com/app/apikey)
* **Bhashini (optional)** → [bhashini.gov.in](https://bhashini.gov.in)

---

### 6️⃣ Frontend Setup

```bash
cd ..
pnpm dev
```

> Starts the **frontend**, which connects all modules (Speech-to-Speech, OCR, and Chat AI) into one unified multilingual travel assistant interface.

---

## ⚙️ Tech Stack

| Layer                      | Technologies                             |
| -------------------------- | ---------------------------------------- |
| **Frontend**               | Next.js, Tailwind CSS, Vite, pnpm        |
| **Backend**                | Python, FastAPI, Uvicorn                 |
| **AI / ML**                | Bhashini APIs (ASR, MT, TTS), Gemini API |
| **OCR**                    | IndicPhotoOCR                            |
| **Database / Auth**        | Firebase                                 |
| **Environment Management** | Virtualenv, Conda                        |

---

## 🚀 Run the Full System

1. Run **Speech-to-Speech** module
2. Start **Chat AI** backend
3. Launch **OCR** server
4. Start **Frontend**

   ```bash
   pnpm dev
   ```

Then open the app in your browser at:
👉 **[http://localhost:2000](http://localhost:2000)**

---

## 🌍 Supported Languages

### Interface Languages (12)
Hindi, English, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Urdu

### Speech Translation (23+)
English, Hindi, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Marathi, Odia, Punjabi, Assamese, Urdu, Sanskrit, Nepali, Sindhi, Kashmiri, Bodo, Dogri, Konkani, Maithili, Manipuri, Santali

### OCR Recognition (13 Scripts)
Devanagari, Bengali, Tamil, Telugu, Malayalam, Kannada, Gujarati, Odia, Gurmukhi, Urdu, English, Oriya, Gurumukhi

---

## 🎯 Use Cases

- **Solo Travelers**: Plan trips and navigate with confidence
- **Language Learners**: Practice with real-time translation
- **Cultural Explorers**: Discover hidden gems
- **Business Travelers**: Translate signs, menus, documents
- **Tour Guides**: Assist tourists with multilingual support

---

## 🛣️ Roadmap

- [ ] Offline mode for speech translation
- [ ] Social features (share chapters)
- [ ] Google Maps integration
- [ ] Audio guides for tourist spots
- [ ] AR navigation with translated signs
- [ ] Currency converter & weather
- [ ] Travel safety alerts

---

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
