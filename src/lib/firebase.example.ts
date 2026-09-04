/**
 * Firebase integration template — Mahi And Muhi Traders Tali Khata
 * ----------------------------------------------------------------
 * How to use:
 *   1. Rename this file to  src/lib/firebase.ts
 *   2. Paste your Firebase web-app config values below (from Firebase Console
 *      → Project settings → Your apps → Web app → SDK setup).
 *   3. No .env file is needed. Config lives here in code (it is public by
 *      design — security comes from Firestore rules).
 *   4. Then enable a real login (Firebase Auth) when you want it. The app
 *      itself has NO mock login — it works fully offline until you connect.
 */

export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};

/*
 * Suggested Firestore layout once you connect Firebase:
 *
 *   /shops/{shopId}
 *     - settings (shop name, owner, phone, gateways...)
 *     - customers/{id}
 *     - txns/{id}
 *
 * Then replace the localStorage store in src/lib/store.ts with a
 * Firestore-backed store (or keep localStorage as an offline cache and
 * sync in the background — recommended for a shop that sometimes has no
 * internet).
 */
