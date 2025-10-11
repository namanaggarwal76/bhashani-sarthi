# 🎯 Quick Start Guide - Firebase Integration

## Prerequisites
✅ Firebase SDK installed  
✅ All configuration files created  
✅ Environment variables template ready  

---

## Step-by-Step Setup (5 minutes)

### Step 1: Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" → Enter "bhashani-sarthi" → Continue
3. Disable Google Analytics (optional) → Create project

### Step 2: Enable Authentication
1. Click "Authentication" in sidebar
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" sign-in method (optional)
5. Add your email to the authorized domains

### Step 3: Create Firestore Database
1. Click "Firestore Database" in sidebar
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your region (closest to you)
5. Click "Enable"

### Step 4: Deploy Security Rules
1. In Firestore, click "Rules" tab
2. Replace the content with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isOwner(userId);
      
      match /chapters/{chapterId} {
        allow read, write: if isOwner(userId);
      }
    }
  }
}
```
3. Click "Publish"

### Step 5: Get Firebase Config
1. Click ⚙️ (Project Settings) → General tab
2. Scroll to "Your apps" → Click web icon `</>`
3. Register app: Name = "Bhashani Sarthi Web"
4. Copy the `firebaseConfig` object

### Step 6: Configure Your App
1. Open `.env.local` in your project
2. Fill in the values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=bhashani-sarthi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bhashani-sarthi
VITE_FIREBASE_STORAGE_BUCKET=bhashani-sarthi.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

### Step 7: Run the App
```bash
npm run dev
```

### Step 8: Test
1. Open http://localhost:5173
2. Click "Sign Up" → Create account
3. Complete onboarding
4. Create a chapter
5. Mark places as done
6. Check Firebase Console to see your data!

---

## 🔍 Verify It's Working

### Firebase Console Checks:
- **Authentication > Users** → See your new user
- **Firestore > users collection** → See user document
- **Firestore > users/{userId}/chapters** → See chapters

### App Functionality:
- ✅ Sign up with email/password
- ✅ Sign in with Google
- ✅ Complete onboarding saves to Firestore
- ✅ Create chapters appear in Firestore
- ✅ Marking places updates XP and tier
- ✅ Data persists across page reloads
- ✅ Logout clears user data

---

## 🆘 Need Help?

**Problem:** "Permission denied"  
**Solution:** Make sure Firestore rules are published

**Problem:** "Firebase not initialized"  
**Solution:** Check all env variables are filled, restart dev server

**Problem:** Can't see data in console  
**Solution:** Make sure you've completed onboarding, check correct Firebase project

---

## 📖 Full Documentation
- Detailed setup: `FIREBASE_SETUP.md`
- Integration details: `FIREBASE_INTEGRATION.md`
- Security rules: `firestore.rules`

---

**Time to complete:** ~5 minutes  
**Difficulty:** Easy  
**Status:** Ready to use! 🚀
