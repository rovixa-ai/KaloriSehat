
import { auth } from "./firebase-config.js";

import { Capacitor } from "@capacitor/core";

import {
  FirebaseAuthentication
} from "@capacitor-firebase/authentication";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  onAuthStateChanged
} from "firebase/auth";

const googleLoginButton = document.getElementById("googleLoginButton");
const guestLoginButton = document.getElementById("guestLoginButton");

let isSigningIn = false;

// Simpan identitas Google tanpa menimpa profil dan riwayat KaloriKu.
function saveGoogleUser(user) {
  const userData = {
    uid: user.uid,
    name: user.displayName || "",
    email: user.email || "",
    photo: user.photoURL || "",
    loginMethod: "google"
  };

  localStorage.setItem("kaloriku_user", JSON.stringify(userData));
}

// Login Google native Android.
async function signInGoogleNative() {
  const nativeResult = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true
  });

  const idToken = nativeResult.credential?.idToken;

  if (!idToken) {
    throw new Error("Google tidak mengembalikan ID Token.");
  }

  const credential = GoogleAuthProvider.credential(idToken);

  const result = await signInWithCredential(auth, credential);

  return result.user;
}

// Login Google browser.
async function signInGoogleWeb() {
  const provider = new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account"
  });

  const result = await signInWithPopup(auth, provider);

  return result.user;
}

// Tombol login Google.
googleLoginButton?.addEventListener("click", async () => {
  if (isSigningIn) return;

  try {
    isSigningIn = true;

    googleLoginButton.disabled = true;
    googleLoginButton.textContent = "Menghubungkan ke Google...";

    const user = Capacitor.isNativePlatform()
      ? await signInGoogleNative()
      : await signInGoogleWeb();

    saveGoogleUser(user);

    window.location.replace("index.html");

  } catch (error) {
    console.error(
      "Login Google gagal:",
      error.code,
      error.message
    );

    let message = "Login Google gagal. Silakan coba kembali.";

    if (
      error.code === "auth/popup-closed-by-user" ||
      error.message?.toLowerCase().includes("cancel")
    ) {
      message = "Proses login dibatalkan.";
    } else if (error.code === "auth/popup-blocked") {
      message = "Popup Google diblokir browser.";
    } else if (error.code === "auth/network-request-failed") {
      message = "Koneksi internet bermasalah.";
    } else if (error.message?.includes("ID Token")) {
      message = "Google tidak memberikan token autentikasi.";
    }

    alert(message);

    isSigningIn = false;

    googleLoginButton.disabled = false;
    googleLoginButton.innerHTML =
      '<span class="google-icon">G</span> Lanjutkan dengan Google';
  }
});

// Periksa sesi Firebase aktif.
onAuthStateChanged(auth, (user) => {
  if (user) {
    saveGoogleUser(user);
    window.location.replace("index.html");
  }
});

// Login sebagai tamu.
guestLoginButton?.addEventListener("click", () => {
  localStorage.setItem(
    "kaloriku_user",
    JSON.stringify({
      uid: "guest",
      name: "Tamu",
      loginMethod: "guest"
    })
  );

  window.location.replace("index.html");
});
