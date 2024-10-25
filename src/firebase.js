import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; 
import { getAuth } from "firebase/auth"; 
import { getStorage } from "firebase/storage"; 

// Конфігурація Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxThigdPEhTO5-J20_bed73IxaDyZQEiw",
  authDomain: "your-storage-5a4d0.firebaseapp.com",
  projectId: "your-storage-5a4d0",
  storageBucket: "your-storage-5a4d0.appspot.com", 
  messagingSenderId: "768697364236",
  appId: "1:768697364236:web:a410b05cb80824c4976329",
  measurementId: "G-XCB5DGJMW7",
  databaseURL: "https://your-storage-5a4d0-default-rtdb.europe-west1.firebasedatabase.app" 
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); 
export const database = getDatabase(app); 
export const storage = getStorage(app); 
