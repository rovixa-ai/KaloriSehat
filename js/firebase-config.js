
import { Capacitor } from "@capacitor/core";

import { initializeApp } from "firebase/app";

import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";

// Konfigurasi Firebase KaloriKu
const firebaseConfig = {
  apiKey: "AIzaSyBj7322SMN-pCXOgl9DIwQuW0Eq1bQZ52o",
  authDomain: "auth.rovixa.web.id",
  projectId: "gen-lang-client-0589900687",
  storageBucket: "gen-lang-client-0589900687.firebasestorage.app",
  messagingSenderId: "541073457264",
  appId: "1:541073457264:web:a98eb2b6a3def9cfafb4b5"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Authentication: native Android menggunakan IndexedDB.
export const auth = Capacitor.isNativePlatform()
  ? initializeAuth(app, {
      persistence: indexedDBLocalPersistence
    })
  : getAuth(app);

// Cloud Firestore
export const db = getFirestore(app);
