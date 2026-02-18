import "dotenv/config";
import admin from "firebase-admin";

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT não definida");
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `gs://${serviceAccount.project_id}.firebasestorage.app`
  });
}

export const bucket = admin.storage().bucket();
