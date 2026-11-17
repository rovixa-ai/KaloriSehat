
import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ==========================================
// KALORIKU — ONBOARDING SYNC
// ==========================================

const ONBOARDING_VERSION = 1;

const GUEST_STORAGE_KEY =
  "kaloriku_onboarding_guest";

const GOOGLE_CACHE_PREFIX =
  "kaloriku_onboarding_google_";

// ==========================================
// MEMBACA SESSION PENGGUNA
// ==========================================

function getLocalUser() {
  try {
    return JSON.parse(
      localStorage.getItem("kaloriku_user") || "{}"
    );
  } catch (error) {
    console.error(
      "Gagal membaca data pengguna:",
      error
    );

    return {};
  }
}

// ==========================================
// MENUNGGU STATUS FIREBASE AUTH
// ==========================================

function waitForAuth() {
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};

    unsubscribe = onAuthStateChanged(
      auth,

      user => {
        unsubscribe();
        resolve(user || null);
      },

      error => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

// ==========================================
// MENENTUKAN PENGGUNA AKTIF
// ==========================================

async function getOnboardingSession() {
  const localUser = getLocalUser();

  // Guest tidak menggunakan Firestore.
  if (
    localUser.uid === "guest" &&
    localUser.loginMethod === "guest"
  ) {
    return {
      type: "guest",
      uid: "guest"
    };
  }

  // Pengguna Google menunggu Firebase Auth.
  try {
    const user = await waitForAuth();

    if (!user) {
      return null;
    }

    return {
      type: "google",
      uid: user.uid
    };

  } catch (error) {
    console.error(
      "Gagal memeriksa autentikasi:",
      error
    );

    return null;
  }
}

// ==========================================
// LOCAL CACHE GOOGLE
// ==========================================

function getGoogleCacheKey(uid) {
  return `${GOOGLE_CACHE_PREFIX}${uid}`;
}

function getGoogleLocalStatus(uid) {
  try {
    const data = JSON.parse(
      localStorage.getItem(
        getGoogleCacheKey(uid)
      ) || "{}"
    );

    return (
      data.completed === true &&
      Number(data.version) >= ONBOARDING_VERSION
    );

  } catch (error) {
    return false;
  }
}

function saveGoogleLocalStatus(uid) {
  try {
    localStorage.setItem(
      getGoogleCacheKey(uid),
      JSON.stringify({
        completed: true,
        version: ONBOARDING_VERSION
      })
    );

  } catch (error) {
    console.error(
      "Gagal menyimpan cache onboarding:",
      error
    );
  }
}

// ==========================================
// MEMERIKSA STATUS ONBOARDING
// ==========================================

export async function isOnboardingCompleted() {
  const session = await getOnboardingSession();

  if (!session) {
    return false;
  }

  // ----------------------------------------
  // GUEST
  // ----------------------------------------

  if (session.type === "guest") {
    try {
      const data = JSON.parse(
        localStorage.getItem(GUEST_STORAGE_KEY) || "{}"
      );

      return (
        data.completed === true &&
        Number(data.version) >= ONBOARDING_VERSION
      );

    } catch (error) {
      return false;
    }
  }

  // ----------------------------------------
  // GOOGLE
  // ----------------------------------------

  const cachedCompleted =
    getGoogleLocalStatus(session.uid);

  try {
    const onboardingRef = doc(
      db,
      "users",
      session.uid,
      "onboarding",
      "status"
    );

    const snapshot = await getDoc(onboardingRef);

    if (!snapshot.exists()) {
      return cachedCompleted;
    }

    const data = snapshot.data();

    const completed =
      data.completed === true &&
      Number(data.version) >= ONBOARDING_VERSION;

    if (completed) {
      saveGoogleLocalStatus(session.uid);
    }

    return completed;

  } catch (error) {
    console.error(
      "Gagal mengambil status onboarding dari Firestore:",
      error
    );

    // Jika Firestore tidak dapat diakses,
    // gunakan status lokal sebagai cadangan.
    return cachedCompleted;
  }
}

// ==========================================
// MENYELESAIKAN ONBOARDING
// ==========================================

export async function completeOnboarding() {
  const session = await getOnboardingSession();

  if (!session) {
    console.error(
      "Session pengguna tidak ditemukan."
    );

    return false;
  }

  // ----------------------------------------
  // GUEST
  // ----------------------------------------

  if (session.type === "guest") {
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({
          completed: true,
          version: ONBOARDING_VERSION,
          completedAt: new Date().toISOString()
        })
      );

      return true;

    } catch (error) {
      console.error(
        "Gagal menyimpan onboarding Guest:",
        error
      );

      return false;
    }
  }

  // ----------------------------------------
  // GOOGLE
  // ----------------------------------------

  // Simpan cache lebih dahulu agar status
  // tetap tersedia ketika koneksi terputus.
  saveGoogleLocalStatus(session.uid);

  try {
    const onboardingRef = doc(
      db,
      "users",
      session.uid,
      "onboarding",
      "status"
    );

    await setDoc(
      onboardingRef,
      {
        completed: true,
        version: ONBOARDING_VERSION,
        completedAt: serverTimestamp()
      },
      {
        merge: true
      }
    );

    console.log(
      "Status onboarding berhasil disimpan ke Firestore."
    );

    return true;

  } catch (error) {
    console.error(
      "Gagal menyimpan onboarding ke Firestore:",
      error
    );

    // Cache lokal tetap tersimpan.
    // Sinkronisasi Firestore dapat dicoba lagi
    // pada kesempatan berikutnya.
    return false;
  }
}
