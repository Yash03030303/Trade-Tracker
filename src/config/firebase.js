// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAD9pMfb7r049I-ntlASs2AiSIku5DqF2w",
  authDomain: "trading-tracker-95434.firebaseapp.com",
  projectId: "trading-tracker-95434",
  storageBucket: "trading-tracker-95434.firebasestorage.app",
  messagingSenderId: "308517989966",
  appId: "1:308517989966:web:f6ded053f34d9eccf75d1f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);