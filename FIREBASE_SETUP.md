# Firebase Integration for Bhashani Sarthi

This project is integrated with Firebase for authentication and Firestore database.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "bhashani-sarthi")
4. Follow the setup wizard

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password** (recommended)
   - **Google** (optional but recommended)

### 3. Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode** (we'll add security rules)
3. Select your preferred location
4. Click **Enable**

### 4. Set Up Security Rules

1. Go to **Firestore Database** → **Rules**
2. Copy the contents from `firestore.rules` in this project
3. Paste and **Publish** the rules

### 5. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **Your apps** section
3. Click the web icon (`</>`) to add a web app
4. Register your app (e.g., "Bhashani Sarthi Web")
5. Copy the Firebase configuration object

### 6. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase configuration in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 7. Install Dependencies

```bash
npm install
```

### 8. Run the Application

```bash
npm run dev
```

## Firestore Data Structure

### Collections Structure

```
users (collection)
  └─ {userId} (document)
      ├─ basic_info (object)
      │   ├─ name: string
      │   ├─ email: string
      │   ├─ country: string
      │   ├─ age: number
      │   ├─ sex: string
      │   └─ language (object)
      │       ├─ code: string (e.g., "hi-IN")
      │       └─ name: string (e.g., "Hindi")
      ├─ preferences (object)
      │   ├─ interests: array[string]
      │   ├─ travel_style: string
      │   └─ budget: string
      ├─ stats (object)
      │   ├─ xp: number
      │   ├─ tier: string
      │   ├─ chapters_created: number
      │   └─ places_visited: number
      └─ chapters (subcollection)
          └─ {chapterId} (document)
              ├─ city: string
              ├─ country: string
              ├─ description: string
              └─ ai_suggested_places: array
                  └─ (object)
                      ├─ place_id: string
                      ├─ name: string
                      ├─ type: string
                      ├─ rating: number
                      ├─ status: string ("done" | "pending")
                      └─ visited_on: timestamp (optional)
```

## Key Features

### Authentication (`client/context/AuthContext.tsx`)
- Email/Password sign-in and sign-up
- Google OAuth sign-in
- Password reset
- Session management

### User Management (`client/context/UserContext.tsx`)
- User profile management
- Onboarding flow
- Real-time user data sync with Firestore

### Firestore Service (`client/lib/firestore-service.ts`)
- CRUD operations for users
- Chapter management (create, read, update, delete)
- Place management (toggle status, add, remove)
- Automatic XP and tier calculation

## Security

The Firestore security rules ensure:
- Users can only read/write their own data
- Authentication is required for all operations
- Proper validation of data structure

## Testing

To test the integration:

1. Start the development server
2. Go to `/onboarding` to create a new user
3. Complete the onboarding process
4. Verify data is saved in Firestore Console

## Troubleshooting

### "Firebase not initialized" error
- Make sure you've filled in all environment variables in `.env.local`
- Restart the development server after adding environment variables

### "Permission denied" error
- Verify Firestore security rules are properly deployed
- Check that the user is authenticated

### Authentication not working
- Verify authentication providers are enabled in Firebase Console
- Check that your domain is authorized in Firebase Console

## Next Steps

1. **Add Google Places API integration** for real place suggestions
2. **Implement offline support** using Firebase's offline persistence
3. **Add Firebase Storage** for user profile pictures
4. **Set up Firebase Cloud Functions** for server-side logic
5. **Configure Firebase Hosting** for deployment

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
