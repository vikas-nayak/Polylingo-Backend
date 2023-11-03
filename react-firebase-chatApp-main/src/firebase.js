// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDEl3pM_w_o1XYp7WCSXe4KEYg4iu0M-rU",
  authDomain: "cllgproject-506e2.firebaseapp.com",
  projectId: "cllgproject-506e2",
  storageBucket: "cllgproject-506e2.appspot.com",
  messagingSenderId: "840684295152",
  appId: "1:840684295152:web:2ce87e603b9943e5bdc335",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export default app;
