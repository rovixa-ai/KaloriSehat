
import { auth } from "./firebase-config.js";
import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";



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

  const confirmation = await confirmAppModal({
    type: "warning",
    title: "Keluar dari KaloriKu?",
    message: "Apakah kamu yakin ingin keluar? Data lokal KaloriKu pada perangkat ini akan dihapus.",
    confirmText: "Ya, Keluar",
    cancelText: "Batal"
  });

  if (!confirmation) return;

  try {
    logoutButton.disabled = true;
    logoutButton.textContent = "Keluar...";

    // Akhiri sesi Firebase.
    await signOut(auth);

    // Hapus seluruh data lokal KaloriKu.
    clearKaloriKuLocalData();

    // Kembali ke halaman login.
    window.location.replace("./login.html");

  } catch (error) {
    console.error("Logout gagal:", error);

    showAppModal({
      type: "error",
      title: "Logout Gagal",
      message: "Gagal keluar. Silakan coba kembali."
    });

    logoutButton.disabled = false;
    logoutButton.innerHTML =
      '<span aria-hidden="true">↪</span> Keluar';
  }
});
