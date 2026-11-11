
import { auth } from "./firebase-config.js";

import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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

// Login menggunakan akun Google.
googleLoginButton?.addEventListener("click", async () => {
  try {
    googleLoginButton.disabled = true;
    googleLoginButton.textContent = "Menghubungkan ke Google...";

    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account"
    });

    await signInWithRedirect(auth, provider);

  } catch (error) {
    console.error("Login Google gagal:", error);

    alert("Login Google gagal: " + error.message);

    googleLoginButton.disabled = false;
    googleLoginButton.innerHTML =
      '<span class="google-icon">G</span> Lanjutkan dengan Google';
  }
});

// Periksa hasil login setelah kembali dari Google.
async function initializeLogin() {
  try {
    const result = await getRedirectResult(auth);

    if (result?.user) {
      saveGoogleUser(result.user);
      window.location.replace("index.html");
      return;
    }

    // Periksa apakah sebelumnya sudah ada sesi login aktif.
    onAuthStateChanged(auth, (user) => {
      if (user) {
        saveGoogleUser(user);
        window.location.replace("index.html");
      }
    });

  } catch (error) {
    console.error("Autentikasi Google gagal:", error);

    alert("Autentikasi Google gagal. Silakan coba kembali.");

    if (googleLoginButton) {
      googleLoginButton.disabled = false;
      googleLoginButton.innerHTML =
        '<span class="google-icon">G</span> Lanjutkan dengan Google';
    }
  }
}

initializeLogin();

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
