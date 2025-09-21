/**
 * Firebase Authentication Troubleshooting Guide
 */

// Common Firebase auth/internal-error causes and solutions:

/*
1. INVALID API KEY
   - Check if VITE_FIREBASE_API_KEY is correct
   - Verify the API key is enabled for the correct services in Firebase Console

2. INCORRECT PROJECT CONFIGURATION
   - Ensure projectId matches exactly: 'carrergenie-55e58'
   - Check authDomain: 'carrergenie-55e58.firebaseapp.com'

3. CORS ISSUES
   - Add your domain to authorized domains in Firebase Console
   - For development: localhost:3000 should be added

4. SERVICE CONFIGURATION
   - Enable Authentication in Firebase Console
   - Configure sign-in providers (Email/Password, Google, etc.)

5. API QUOTAS
   - Check if you've exceeded API quotas in Google Cloud Console

CURRENT CONFIGURATION:
- Project ID: carrergenie-55e58
- API Key: AIzaSyBqLGR_jbB-DYtMo41ZmqUetPWBkWgwSj8
- Auth Domain: carrergenie-55e58.firebaseapp.com
- Frontend URL: http://localhost:3000
- Backend URL: http://localhost:5000

STEPS TO RESOLVE:

1. Go to Firebase Console: https://console.firebase.google.com/project/carrergenie-55e58
2. Navigate to Authentication > Settings
3. Add localhost:3000 to Authorized domains
4. Verify Authentication providers are enabled
5. Check API key permissions in Google Cloud Console
*/

export const firebaseAuthTroubleshooting = {
  checkConfig: () => {
    console.log('🔍 Firebase Configuration Check:');
    console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
    console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Present' : 'Missing');
    console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN);
  },
  
  testConnection: async () => {
    try {
      const { getAuth, signInAnonymously } = await import('firebase/auth');
      const auth = getAuth();
      await signInAnonymously(auth);
      console.log('✅ Firebase Authentication is working');
      return true;
    } catch (error) {
      console.error('❌ Firebase Authentication error:', error);
      return false;
    }
  }
};
