/**
 * Firebase initialization. Reads credentials from Vite env vars:
 *   VITE_APIKEY, VITE_AUTHDOMAIN, VITE_PROJECTID,
 *   VITE_STORAGEBUCKET, VITE_MESSAGINGSENDERID, VITE_APPID
 *
 * Exports:
 *   - `db`   — Firestore instance (currently unused by app code; reserved)
 *   - `auth` — Firebase Auth instance, consumed by ./auth.js and AuthContext
 */
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_APIKEY,
    authDomain: import.meta.env.VITE_AUTHDOMAIN,
    projectId: import.meta.env.VITE_PROJECTID,
    storageBucket: import.meta.env.VITE_STORAGEBUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
    appId: import.meta.env.VITE_APPID
}; 

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);