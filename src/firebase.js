import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Імпорт для Realtime Database
import { getAuth } from "firebase/auth"; // Імпорт для аутентифікації
import { getStorage } from "firebase/storage"; // Імпорт для Storage

// Конфігурація Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDxThigdPEhTO5-J20_bed73IxaDyZQEiw",
  authDomain: "your-storage-5a4d0.firebaseapp.com",
  projectId: "your-storage-5a4d0",
  storageBucket: "your-storage-5a4d0.appspot.com", // Додайте Storage Bucket
  messagingSenderId: "768697364236",
  appId: "1:768697364236:web:a410b05cb80824c4976329",
  measurementId: "G-XCB5DGJMW7",
  databaseURL: "https://your-storage-5a4d0-default-rtdb.europe-west1.firebasedatabase.app" // URL Realtime Database
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Ініціалізація аутентифікації
export const database = getDatabase(app); // Ініціалізація бази даних
export const storage = getStorage(app); // Ініціалізація Firebase Storage
