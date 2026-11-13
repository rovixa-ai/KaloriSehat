
import { auth, db } from "./firebase-config.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

let profileWriteQueue = Promise.resolve();
let profileResetInProgress = false;

// Memastikan akun yang digunakan adalah akun Google,
// bukan mode Tamu.
function getGoogleUser() {
  const user = auth.currentUser;

  if (!user) return null;

  try {
    const localUser = JSON.parse(
      localStorage.getItem("kaloriku_user") || "{}"
    );

    if (
      localUser.loginMethod !== "google" ||
      localUser.uid !== user.uid
    ) {
      return null;
    }

    return user;

  } catch (error) {
    console.error("Gagal memeriksa akun:", error);
    return null;
  }
}

// Menunggu status Authentication selesai diperiksa.
function waitForAuth() {
  return new Promise((resolve, reject) => {
    let unsubscribe = () => {};

    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

// Menghapus foto Base64 dan hanya mengambil
// data profil yang boleh disimpan ke Firestore.
function prepareCloudProfile(profile) {
  const {
    name,
    age,
    gender,
    weight,
    height,
    activity,
    goalWeight,
    goalDuration,
    dailyCalorieTarget,
    dailyProteinTarget,
    dailyCarbTarget,
    dailyFatTarget
  } = profile || {};

  return Object.fromEntries(
    Object.entries({
      name,
      age,
      gender,
      weight,
      height,
      activity,
      goalWeight,
      goalDuration,
      dailyCalorieTarget,
      dailyProteinTarget,
      dailyCarbTarget,
      dailyFatTarget
    }).filter(([, value]) => value !== undefined)
  );
}

// Memuat profil cloud atau mengirim profil lokal
// jika dokumen cloud belum tersedia.
export async function loadProfileFromCloud() {
  try {
    await waitForAuth();

    const user = getGoogleUser();

    if (!user) return null;

    const profileRef = doc(
      db,
      "users",
      user.uid,
      "profile",
      "main"
    );

    const snapshot = await getDoc(profileRef);

    let localProfile = {};

    try {
      localProfile = JSON.parse(
        localStorage.getItem("kaloriku_profile") || "{}"
      );
    } catch (error) {
      console.error("Profil lokal tidak valid:", error);
    }

    if (snapshot.exists()) {
      const {
  updatedAt,
  ...cloudProfile
} = snapshot.data();

      // Data cloud menjadi acuan.
      // Foto lokal tetap dipertahankan.
      const mergedProfile = {
        ...localProfile,
        ...cloudProfile,
        photo: localProfile.photo || ""
      };

      localStorage.setItem(
        "kaloriku_profile",
        JSON.stringify(mergedProfile)
      );

      console.log("Profil berhasil dimuat dari Firestore.");

      return mergedProfile;
    }

    // Dokumen cloud belum ada:
    // migrasikan profil lokal jika memang berisi data.
    const cloudProfile = prepareCloudProfile(localProfile);

    const hasLocalData = Object.values(cloudProfile).some(
      value => value !== undefined &&
               value !== null &&
               value !== ""
    );

    if (hasLocalData) {
      await setDoc(profileRef, {
        ...cloudProfile,
        updatedAt: serverTimestamp()
      });

      console.log("Profil lokal berhasil disalin ke Firestore.");
    }

    return localProfile;

  } catch (error) {
    console.error("Gagal memuat profil cloud:", error);

    // Jika internet atau Firestore bermasalah,
    // aplikasi tetap menggunakan profil lokal.
    return null;
  }
}

// Menyimpan perubahan profil ke Firestore.
export function syncProfileToCloud(profile) {
  if (
    profileResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return Promise.resolve(false);
  }

  const task = profileWriteQueue.then(async () => {
    // Cek ulang sebelum menulis ke Firestore.
    if (
      profileResetInProgress ||
      window.__kalorikuResetInProgress
    ) {
      return false;
    }

    const user = getGoogleUser();
    if (!user) return false;

    const cloudProfile = prepareCloudProfile(profile);

    const profileRef = doc(
      db,
      "users",
      user.uid,
      "profile",
      "main"
    );

    await setDoc(
      profileRef,
      {
        ...cloudProfile,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    console.log("Profil berhasil disinkronkan ke Firestore.");
    return true;
  });

  profileWriteQueue = task.catch(error => {
    console.error("Gagal menyinkronkan profil:", error);
    return false;
  });

  return profileWriteQueue;
}


// Menghapus profil pengguna dari Firestore.
export async function deleteProfileFromCloud() {
  profileResetInProgress = true;

  try {
    // Tunggu penulisan profil sebelumnya selesai.
    await profileWriteQueue;

    const user = getGoogleUser();

    if (!user) {
      throw new Error("Akun Google tidak ditemukan.");
    }

    const profileRef = doc(
      db,
      "users",
      user.uid,
      "profile",
      "main"
    );

    await deleteDoc(profileRef);

    console.log("Profil berhasil dihapus dari Firestore.");
    return true;

  } catch (error) {
    console.error("Gagal menghapus profil Firestore:", error);
    throw error;

  } finally {
    profileResetInProgress = false;
  }
}
