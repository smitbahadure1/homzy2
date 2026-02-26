import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJNJ5unAP1W1ldTwoJMtB7Np0MKTkOpq4",
  authDomain: "realestate-b4afe.firebaseapp.com",
  projectId: "realestate-b4afe",
  storageBucket: "realestate-b4afe.firebasestorage.app",
  messagingSenderId: "624277031164",
  appId: "1:624277031164:web:1d37d39ca66ceeb8f32f79",
  measurementId: "G-9GLTWFFLLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Keep analytics optional, it can fail on some environments
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

// Initialize Firestore
export const db = getFirestore(app);
