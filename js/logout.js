
import { auth } from "./firebase-config.js";

import {
  signOut
} from "firebase/auth";

// =========================================
// TERJEMAHAN
// =========================================

function tr(key) {
  return window.t ? window.t(key) : key;
}

// =========================================
// ELEMEN LOGOUT
// =========================================

const logoutButton = document.getElementById("logoutButton");

// =========================================
// HAPUS SELURUH DATA LOKAL KALORIKU
// =========================================

function clearKaloriKuLocalData() {
  const keysToRemove = Object.keys(localStorage);

  keysToRemove.forEach((key) => {
    if (key.startsWith("kaloriku_")) {
      localStorage.removeItem(key);
    }
  });

  console.log("Data lokal KaloriKu berhasil dibersihkan.");
}

// =========================================
// PROSES LOGOUT
// =========================================

logoutButton?.addEventListener("click", async () => {

  // Konfirmasi logout menggunakan bahasa aktif
  const confirmation = await window.confirmAppModal({
    type: "warning",
    title: tr("identity.logoutTitle"),
    message: tr("identity.logoutMessage"),
    confirmText: tr("identity.logoutConfirm"),
    cancelText: tr("identity.logoutCancel")
  });

  if (!confirmation) return;

  try {
    logoutButton.disabled = true;
    logoutButton.textContent = tr("identity.logoutLoading");

    // Akhiri sesi Firebase
    await signOut(auth);

    // Hapus seluruh data lokal KaloriKu
    clearKaloriKuLocalData();

    // Kembali ke halaman login
    window.location.replace("./login.html");

  } catch (error) {
    console.error("Logout gagal:", error);

    window.showAppModal({
      type: "error",
      title: tr("identity.logoutFailedTitle"),
      message: tr("identity.logoutFailedMessage")
    });

    logoutButton.disabled = false;

    logoutButton.innerHTML =
      '<span aria-hidden="true">↪</span> ' +
      tr("identity.logout");
  }
});
