
import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "firebase/auth";


/* ==========================================
   KALORIKU — AUTH GUARD
========================================== */

// Sembunyikan halaman sementara status login diperiksa.
document.documentElement.style.visibility = "hidden";


/* ==========================================
   TAMPILKAN APLIKASI
========================================== */

function showApplication() {
  document.documentElement.style.visibility = "visible";
}


/* ==========================================
   REDIRECT LOGIN
========================================== */

function redirectToLogin() {
  window.location.replace("./login.html");
}


/* ==========================================
   NOTIFIKASI AUTH READY
========================================== */

function notifyAuthReady(type, user) {
  const state = {
    ready: true,
    type,
    user
  };

  window.__kalorikuAuthState = state;

  window.dispatchEvent(
    new CustomEvent("kaloriku:authready", {
      detail: state
    })
  );
}


/* ==========================================
   BACA DATA PENGGUNA LOKAL
========================================== */

let localUser = {};

try {
  localUser = JSON.parse(
    localStorage.getItem("kaloriku_user") || "{}"
  );

} catch (error) {
  console.error(
    "Data pengguna tidak valid:",
    error
  );
}


/* ==========================================
   MODE TAMU
========================================== */

if (
  localUser.uid === "guest" &&
  localUser.loginMethod === "guest"
) {
  showApplication();

  notifyAuthReady("guest", localUser);


/* ==========================================
   LOGIN GOOGLE
========================================== */

} else {

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

        notifyAuthReady(
          "google",
          userData
        );

      } else {

        redirectToLogin();

      }

    },

    (error) => {

      console.error(
        "Pemeriksaan sesi gagal:",
        error
      );

      redirectToLogin();

    }
  );

}
