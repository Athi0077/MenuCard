const admin = require('firebase-admin');

let serviceAccount;
try {
  // Option 1: Load from a local JSON file (downloaded from Firebase Console)
  serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
  // Option 2: Fallback to environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully.');
} else {
  console.warn('Firebase Admin SDK not initialized. Please add serviceAccountKey.json or set FIREBASE_* environment variables to send push notifications.');
}

module.exports = admin;
