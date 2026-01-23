import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

//GetAuth Method is used to Configure our app to use Firebase Authentication
import { getAuth } from "firebase/auth";

// ! ✅✅

console.log('import.meta.env.VITE_APIKEY', import.meta.env.VITE_APIKEY);
console.log('import.meta.env.VITE_AUTHDOMAIN', import.meta.env.VITE_AUTHDOMAIN);
console.log('import.meta.env.VITE_PROJECTID', import.meta.env.VITE_PROJECTID);
console.log('import.meta.env.VITE_STORAGEBUCKET', import.meta.env.VITE_STORAGEBUCKET);
console.log('import.meta.env.VITE_MESSAGINGSENDERID', import.meta.env.VITE_MESSAGINGSENDERID);
console.log('import.meta.env.VITE_APPID', import.meta.env.VITE_APPID);

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