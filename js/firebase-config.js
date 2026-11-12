
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Konfigurasi Firebase KaloriKu
const firebaseConfig = {
    apiKey: "AIzaSyBj7322SMN-pCXOgl9DIwQuW0Eq1bQZ52o",
    authDomain: "gen-lang-client-0589900687.firebaseapp.com",
    projectId: "gen-lang-client-0589900687",
    storageBucket: "gen-lang-client-0589900687.firebasestorage.app",
    messagingSenderId: "541073457264",
    appId: "1:541073457264:web:a98eb2b6a3def9cfafb4b5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Authentication
export const auth = getAuth(app);

// Inisialisasi Cloud Firestore
export const db = getFirestore(app);
