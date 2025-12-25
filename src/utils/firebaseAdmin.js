import admin from "firebase-admin";

// Initialize Firebase Admin SDK once and reuse the default app
try {
  // Will throw if no default app initialized
  admin.app();
} catch (e) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private key often contains literal \n in env; convert to real newlines
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Firebase Admin env vars missing: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default admin;
