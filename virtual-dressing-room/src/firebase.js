// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9TnrMHgPPfoVSCHJ9_maUWaLgKLs0W84",
  authDomain: "tryandbuy-c9238.firebaseapp.com",
  projectId: "tryandbuy-c9238",
  storageBucket: "tryandbuy-c9238.firebasestorage.app",
  messagingSenderId: "1075563180042",
  appId: "1:1075563180042:web:a01099ca9e164b3fb96ff3",
  measurementId: "G-T0CFHQ8M4J",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Core services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
