const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// The service account key will be loaded from the config folder
let serviceAccount;

try {
  serviceAccount = require('../../config/serviceAccountKey.json');
} catch (error) {
  console.error('❌ Firebase service account key not found!');
  console.error('📋 Please add serviceAccountKey.json to the config folder');
  console.error('🔗 Get it from: https://console.firebase.google.com/project/bio-planters/settings/serviceaccounts/adminsdk');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'bio-planters.appspot.com',
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID || 'bio-planters'}.firebaseio.com`
  });
}

// Export Firebase services
const db = admin.firestore();
const storage = admin.storage().bucket();
const auth = admin.auth();

// Configure Firestore settings
db.settings({
  timestampsInSnapshots: true
});

module.exports = { 
  admin, 
  db, 
  storage, 
  auth,
  // Helper function to check Firebase connection
  testConnection: async () => {
    try {
      await db.collection('_test').doc('connection').set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'connected'
      });
      console.log('✅ Firebase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Firebase connection failed:', error.message);
      return false;
    }
  }
};
