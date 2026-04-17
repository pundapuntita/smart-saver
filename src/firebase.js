import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATSjOFapzTlKt1Dov3D3oCRcjV8zF0a2c",
  authDomain: "smart-saver-98fe3.firebaseapp.com",
  projectId: "smart-saver-98fe3",
  storageBucket: "smart-saver-98fe3.firebasestorage.app",
  messagingSenderId: "1037132092350",
  appId: "1:1037132092350:web:f67438d4b5f48f95939fef",
  measurementId: "G-6L0YEE3W7W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
