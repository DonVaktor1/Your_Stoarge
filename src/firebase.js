// firebase.js (кореневий файл)
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Додай getDatabase для ініціалізації бази
import { getAuth } from "firebase/auth";


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

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app); // Створення об'єкта бази даних

