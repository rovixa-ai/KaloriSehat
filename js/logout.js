
import { auth } from "./firebase-config.js";
import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const logoutButton = document.getElementById("logoutButton");

logoutButton?.addEventListener("click", async () => {
  const confirmation = confirm(
    "Apakah kamu yakin ingin keluar dari KaloriKu?"
  );

  if (!confirmation) return;

  try {
    logoutButton.disabled = true;
    logoutButton.textContent = "Keluar...";

    // Akhiri sesi Firebase.
    await signOut(auth);

    // Hapus identitas login saja.
    localStorage.removeItem("kaloriku_user");

    // Kembali ke halaman login.
    window.location.replace("./login.html");

  } catch (error) {
    console.error("Logout gagal:", error);

    alert("Gagal keluar. Silakan coba kembali.");

    logoutButton.disabled = false;
    logoutButton.innerHTML =
      '<span aria-hidden="true">↪</span> Keluar';
  }
});
