# Bhashani Sarthi 🌍

**Bhashani Sarthi** is a multilingual travel companion application designed to help travelers explore new destinations, track their journeys, and overcome language barriers. The name combines "Bhashani" (linguistic) with "Sarthi" (guide/companion), representing its mission to be a linguistic guide for travelers.

## 🎯 Overview

Bhashani Sarthi provides travelers with tools to:
- Create and manage travel chapters for different cities
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
      │   sex: string
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

### 2. **Travel Chapters**
- Create chapters for different cities
- Track places to visit with AI suggestions
- Mark places as completed
- Automatic XP calculation
- Tier progression system

### 3. **Gamification**
- XP points for completing activities
- Tier system (Explorer → Trailblazer → Globetrotter)
- Progress visualization
- Achievement tracking

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
- Node.js 18+
- pnpm 10+
- Firebase project with:
  - Authentication enabled (Email/Password + Google)
  - Firestore database created
  - Web app registered

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd bhashani-sarthi
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (optional)

3. Create Firestore Database:
   - Go to Firestore Database → Create database
   - Start in production mode
   - Choose your region

4. Deploy Security Rules:
   - Copy content from `firestore.rules`
   - Paste in Firebase Console → Firestore → Rules
   - Publish the rules

5. Get Firebase Config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Add web app
   - Copy the config object

### Step 4: Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 5: Run Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:8080`

## 📝 Development Commands

```bash
pnpm dev          # Start dev server (client + API server)
pnpm build        # Build for production (client only)
pnpm start        # Start production server
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run Vitest unit tests
pnpm format.fix   # Format code with Prettier
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

## 🙏 Acknowledgments

- **Firebase** - Authentication and database
- **Radix UI** - Accessible component primitives
- **Vercel** - For the amazing open-source tools
- **TailwindCSS** - Utility-first CSS framework

---

**Built with ❤️ for travelers who want to explore the world without language barriers**
