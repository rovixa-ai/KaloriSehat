
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Sembunyikan halaman sementara status login diperiksa.
document.documentElement.style.visibility = "hidden";

function showApplication() {
  document.documentElement.style.visibility = "visible";
}

function redirectToLogin() {
  window.location.replace("./login.html");
}

// Periksa apakah pengguna memilih mode Tamu.
let localUser = {};

try {
  localUser = JSON.parse(
    localStorage.getItem("kaloriku_user") || "{}"
  );
} catch (error) {
  console.error("Data pengguna tidak valid:", error);
}

// Mode Tamu boleh langsung masuk tanpa akun Google.
if (
  localUser.uid === "guest" &&
  localUser.loginMethod === "guest"
) {
  showApplication();

} else {
  // Untuk akun Google, validasi sesi langsung ke Firebase.
  onAuthStateChanged(
    auth,
    (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          photo: user.photoURL || "",
          loginMethod: "google"
        };

        localStorage.setItem(
          "kaloriku_user",
          JSON.stringify(userData)
        );

        showApplication();

      } else {
        // Tidak ada sesi Google dan bukan pengguna Tamu.
        redirectToLogin();
      }
    },
    (error) => {
      console.error("Pemeriksaan sesi gagal:", error);
      redirectToLogin();
    }
  );
}
