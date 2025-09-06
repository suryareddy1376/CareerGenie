# Firebase Configuration Guide for CareerGenie

## Prerequisites
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication
3. Enable Firestore Database

## Step 1: Enable Authentication Methods

1. Go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click Enable
   - **Google**: Click Enable and configure your OAuth consent screen

## Step 2: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your preferred location

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web** icon to add a web app
4. Register your app with name "CareerGenie"
5. Copy the configuration object

## Step 4: Update Firebase Config

Replace the placeholder values in `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Firestore Security Rules (Optional for Production)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 6: Test Authentication

1. Start your development server: `npm run dev`
2. Navigate to `/login` or `/register`
3. Test both email/password and Google sign-in

## Environment Variables (Optional)

For better security, you can use environment variables:

Create a `.env` file in your project root:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

Then update `firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## Troubleshooting

- **CORS Issues**: Ensure your domain is added to Firebase Auth's authorized domains
- **Google Sign-in**: Make sure OAuth consent screen is configured
- **Firestore Permissions**: Check security rules if getting permission denied errors
