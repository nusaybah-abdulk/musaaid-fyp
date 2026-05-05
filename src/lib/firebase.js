import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3Lk7wLJYjUfBL_hGzr_EJHt2z9sHcoHI",
  authDomain: "fyp1-ee94a.firebaseapp.com",
  projectId: "fyp1-ee94a",
  storageBucket: "fyp1-ee94a.firebasestorage.app",
  messagingSenderId: "514127909082",
  appId: "1:514127909082:web:59716ce33f6aebc3d515e3",
  measurementId: "G-5DWGHWTESY"
};

const app = initializeApp(firebaseConfig); //connect to FB making fb instance
const auth = getAuth(app);
const db = getFirestore(app); //connect to DB

export {app, auth,db,setDoc,doc };