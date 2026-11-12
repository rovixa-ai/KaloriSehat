
import { auth } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const googleLoginButton = document.getElementById("googleLoginButton");
const guestLoginButton = document.getElementById("guestLoginButton");

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

// Login menggunakan akun Google melalui Popup.
googleLoginButton?.addEventListener("click", async () => {
  try {
    googleLoginButton.disabled = true;
    googleLoginButton.textContent = "Menghubungkan ke Google...";

    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account"
    });

    const result = await signInWithPopup(auth, provider);

    saveGoogleUser(result.user);

    window.location.replace("index.html");

  } catch (error) {
    console.error("Login Google gagal:", error.code, error.message);

    let message = "Login Google gagal. Silakan coba kembali.";

    if (error.code === "auth/popup-closed-by-user") {
      message = "Jendela login Google ditutup sebelum proses selesai.";
    } else if (error.code === "auth/popup-blocked") {
      message = "Popup Google diblokir browser. Izinkan popup untuk situs ini.";
    } else if (error.code === "auth/network-request-failed") {
      message = "Koneksi internet bermasalah. Periksa koneksi lalu coba lagi.";
    }

    alert(message);

    googleLoginButton.disabled = false;
    googleLoginButton.innerHTML =
      '<span class="google-icon">G</span> Lanjutkan dengan Google';
  }
});

// Periksa apakah sebelumnya sudah ada sesi login aktif.
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
