
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions'; // Import getFunctions

const firebaseConfig = {
  apiKey: "AIzaSyDKwEW6beMinv7Htwt59Ue2cPuzkhrJkR0",
  authDomain: "kye-trust-app.firebaseapp.com",
  projectId: "kye-trust-app",
  storageBucket: "kye-trust-app.firebasestorage.app",
  messagingSenderId: "828203228458",
  appId: "1:828203228458:web:49df624c76724f21819253",
  measurementId: "G-H5W7TT8H2Q"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app); // Export functions instance
