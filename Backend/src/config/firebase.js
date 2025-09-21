const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// The service account key will be loaded from the config folder.
// NOTE: Firebase project (auth/firestore/storage) may differ from the Vertex AI GCP project.
// Ensure the following env vars are set in Backend/.env:
//   FIREBASE_PROJECT_ID=carrergenie-55e58
//   FIREBASE_STORAGE_BUCKET=carrergenie-55e58.appspot.com
//   (Separate) VERTEX_AI_PROJECT_ID=annular-catfish-471811-h6
// Do NOT hard-code secrets in source control.
let serviceAccount;

try {
  serviceAccount = require('../../config/serviceAccountKey.json');
} catch (error) {
  console.error('❌ Firebase service account key not found!');
  console.error('📋 Please add serviceAccountKey.json to the config folder');
  console.error('🔗 Get it from: https://console.firebase.google.com/project/carrergenie-55e58/settings/serviceaccounts/adminsdk');
  process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${firebaseProjectId}.appspot.com`;

  if (!firebaseProjectId) {
    console.error('❌ FIREBASE_PROJECT_ID not set and not derivable from service account.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
    databaseURL: `https://${firebaseProjectId}.firebaseio.com`
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
