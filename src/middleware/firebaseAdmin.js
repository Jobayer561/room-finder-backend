import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
  admin.app();
} catch {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  let serviceAccount;
  if (serviceAccountJson) {
    serviceAccount = JSON.parse(serviceAccountJson);
  } else {
    serviceAccount = require("../../serviceAccountKey.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
