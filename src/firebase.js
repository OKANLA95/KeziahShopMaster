// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtlkxMCVGHSabkDIoPVbMedaIBTpQIvSA",
  authDomain: "keziah-shop-master.firebaseapp.com",
  projectId: "keziah-shop-master",
  storageBucket: "keziah-shop-master.appspot.com",
  messagingSenderId: "814030213419",
  appId: "1:814030213419:web:5c8718cd7d3abfb50bf56e",
  measurementId: "G-KK4164K877",
};

// 🔥 Initialize main Firebase app (safe check)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 🔐 Auth
const auth = getAuth(app);

// 🧾 Firestore
const db = getFirestore(app);

// 📦 Storage
const storage = getStorage(app);

// 🔐 Secondary app (for admin user creation without logging them out)
const secondaryApp =
  getApps().find((a) => a.name === "Secondary") ||
  initializeApp(firebaseConfig, "Secondary");

const secondaryAuth = getAuth(secondaryApp);

// 📊 Analytics (conditionally, safe for SSR)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  });
}

// 🌍 Export for global use
export { app, auth, db, storage, secondaryAuth, analytics, firebaseConfig };
