
import { auth, db } from "./firebase-config.js";

import {
  getMeals,
  saveMeals
} from "./meal-storage.js";

import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// =========================================
// PENGATURAN SINKRONISASI
// =========================================

const MAX_MEALS_PER_BATCH = 10;
const PARTIAL_SYNC_DELAY = 1 * 60 * 1000;

let mealResetInProgress = false;
let syncTimer = null;
let flushPromise = null;
let syncStarted = false;


// =========================================
// PEMERIKSAAN AKUN GOOGLE
// =========================================

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


// =========================================
// ID DAN ANTREAN LOKAL
// =========================================

export function createMealId() {
  return crypto.randomUUID();
}

function getQueueKey(uid) {
  return `kaloriku_pending_meals_${uid}`;
}

function getSyncDueKey(uid) {
  return `kaloriku_sync_due_${uid}`;
}

function getSyncDueAt(uid) {
  const value = Number(
    localStorage.getItem(getSyncDueKey(uid))
  );

  return Number.isFinite(value) && value > 0
    ? value
    : null;
}

function setSyncDueAt(uid, timestamp) {
  localStorage.setItem(
    getSyncDueKey(uid),
    String(timestamp)
  );
}

function clearSyncDueAt(uid) {
  localStorage.removeItem(getSyncDueKey(uid));
}

function getPendingMeals(uid) {
  try {
    return JSON.parse(
      localStorage.getItem(getQueueKey(uid)) || "[]"
    );
  } catch (error) {
    console.error("Gagal membaca antrean:", error);
    return [];
  }
}

function savePendingMeals(uid, meals) {
  localStorage.setItem(
    getQueueKey(uid),
    JSON.stringify(meals)
  );
}


// =========================================
// PERSIAPAN DATA UNTUK FIRESTORE
// =========================================

function prepareFoodForCloud(food) {
  const allowedFields = [
    "name",
    "weight",
    "kcal",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "sodium",
    "water",
    "source",
    "code"
  ];

  const result = {};

  allowedFields.forEach(key => {
    if (food[key] !== undefined) {
      result[key] = food[key];
    }
  });

  return result;
}

export function prepareMealForCloud(meal) {
  const allowedFields = [
    "id",
    "name",
    "weight",
    "kcal",
    "protein",
    "carbs",
    "fat",
    "fiber",
    "sodium",
    "water",
    "source",
    "code",
    "date",
    "createdAt",
    "foodCount"
  ];

  const result = {};

  allowedFields.forEach(key => {
    if (meal[key] !== undefined) {
      result[key] = meal[key];
    }
  });

  if (Array.isArray(meal.foods)) {
    result.foods = meal.foods.map(prepareFoodForCloud);
  }

  return result;
}

function createBatchId(meals) {
  const firstId = meals[0].id;
  const lastId = meals[meals.length - 1].id;

  return `batch_${firstId}_${lastId}`.replaceAll("/", "_");
}


// =========================================
// MENYIMPAN BATCH KE FIRESTORE
// =========================================

export async function saveMealBatch(meals) {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return false;
  }

  const user = getGoogleUser();

  if (!user) {
    throw new Error("Pengguna belum login dengan Google.");
  }

  if (
    !Array.isArray(meals) ||
    meals.length === 0 ||
    meals.length > MAX_MEALS_PER_BATCH
  ) {
    throw new Error("Jumlah catatan dalam batch tidak valid.");
  }

  const preparedMeals = meals.map(prepareMealForCloud);

  if (
    preparedMeals.some(meal => !meal.id) ||
    new Set(preparedMeals.map(meal => meal.id)).size !== preparedMeals.length
  ) {
    throw new Error("ID catatan tidak valid atau duplikat.");
  }

  const batchId = createBatchId(preparedMeals);

  const batchRef = doc(
    db,
    "users",
    user.uid,
    "scanBatches",
    batchId
  );

  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return false;
  }

  await setDoc(batchRef, {
    meals: preparedMeals,
    updatedAt: serverTimestamp()
  });

  console.log(
    `${preparedMeals.length} catatan berhasil disimpan ke Firestore.`
  );

  return true;
}


// =========================================
// MENGIRIM ANTREAN SECARA BERTAHAP
// =========================================

async function flushPendingMeals(partial = false) {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return;
  }

  const user = getGoogleUser();

  if (!user) return;

  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    const uid = user.uid;

    try {
      while (true) {
        if (
          mealResetInProgress ||
          window.__kalorikuResetInProgress ||
          auth.currentUser?.uid !== uid
        ) {
          break;
        }

        const queue = getPendingMeals(uid);

        if (queue.length === 0) break;

        if (
          queue.length < MAX_MEALS_PER_BATCH &&
          !partial
        ) {
          break;
        }

        const batch = queue.slice(0, MAX_MEALS_PER_BATCH);

        await saveMealBatch(batch);

        if (
          mealResetInProgress ||
          window.__kalorikuResetInProgress ||
          auth.currentUser?.uid !== uid
        ) {
          break;
        }

        const sentIds = new Set(
          batch.map(meal => meal.id)
        );

        const latestQueue = getPendingMeals(uid);

        savePendingMeals(
          uid,
          latestQueue.filter(meal => !sentIds.has(meal.id))
        );

        console.log(
          `Antrean tersisa: ${getPendingMeals(uid).length}`
        );
      }

    } catch (error) {
      console.error(
        "Sinkronisasi gagal. Data tetap dalam antrean:",
        error
      );

      if (
        auth.currentUser?.uid === uid &&
        !mealResetInProgress &&
        !window.__kalorikuResetInProgress
      ) {
        setSyncDueAt(
          uid,
          Date.now() + PARTIAL_SYNC_DELAY
        );
      }
    }
  })();

  try {
    await flushPromise;

  } finally {
    flushPromise = null;

    const currentUser = getGoogleUser();

    if (
      currentUser &&
      !mealResetInProgress &&
      !window.__kalorikuResetInProgress
    ) {
      schedulePartialSync(currentUser.uid);
    }
  }
}


// =========================================
// PENJADWALAN SINKRONISASI
// =========================================

function schedulePartialSync(uid) {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return;
  }

  clearTimeout(syncTimer);
  syncTimer = null;

  const queue = getPendingMeals(uid);

  if (queue.length === 0) {
    clearSyncDueAt(uid);
    return;
  }

  if (queue.length >= MAX_MEALS_PER_BATCH) {
    clearSyncDueAt(uid);
    void flushPendingMeals(false);
    return;
  }

  let dueAt = getSyncDueAt(uid);

  if (!dueAt) {
    dueAt = Date.now() + PARTIAL_SYNC_DELAY;
    setSyncDueAt(uid, dueAt);
  }

  const remainingTime = Math.max(
    0,
    dueAt - Date.now()
  );

  console.log(
    "Sinkronisasi dijadwalkan dalam:",
    Math.ceil(remainingTime / 1000),
    "detik"
  );

  syncTimer = setTimeout(() => {
    const user = getGoogleUser();

    if (
      user?.uid === uid &&
      !mealResetInProgress &&
      !window.__kalorikuResetInProgress
    ) {
      void flushPendingMeals(true);
    }
  }, remainingTime);
}


// =========================================
// MEMASUKKAN CATATAN BARU KE ANTREAN
// =========================================

export async function enqueueMealsForSync(meals) {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return false;
  }

  const user = getGoogleUser();

  if (!user) return false;

  if (!Array.isArray(meals) || meals.length === 0) {
    return false;
  }

  const uid = user.uid;
  const queue = getPendingMeals(uid);
  const existingIds = new Set(queue.map(meal => meal.id));

  for (const meal of meals) {
    if (!meal.id) {
      throw new Error("Catatan belum memiliki ID unik.");
    }

    if (!existingIds.has(meal.id)) {
      queue.push(prepareMealForCloud(meal));
      existingIds.add(meal.id);
    }
  }

  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return false;
  }

  savePendingMeals(uid, queue);

  console.log(
    `Antrean sinkronisasi: ${queue.length} catatan.`
  );

  if (queue.length >= MAX_MEALS_PER_BATCH) {
    clearTimeout(syncTimer);
    syncTimer = null;

    await flushPendingMeals(false);

  } else {
    schedulePartialSync(uid);
  }

  return true;
}


// =========================================
// MENGGABUNGKAN RIWAYAT LOKAL DAN CLOUD
// =========================================

export async function syncMealsFromCloud() {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return false;
  }

  const user = getGoogleUser();

  if (!user) return false;

  try {
    const uid = user.uid;

    const cloudMeals = await loadMealsFromCloud();

    if (
      mealResetInProgress ||
      window.__kalorikuResetInProgress ||
      auth.currentUser?.uid !== uid
    ) {
      return false;
    }

    const localMeals = getMeals();

    const mealMap = new Map();

    cloudMeals.forEach(meal => {
      if (meal.id) {
        mealMap.set(meal.id, meal);
      }
    });

    localMeals.forEach(meal => {
      if (meal.id) {
        mealMap.set(meal.id, meal);
      }
    });

    const mergedMeals = Array.from(mealMap.values());

    mergedMeals.sort(
      (a, b) =>
        Number(b.createdAt || 0) -
        Number(a.createdAt || 0)
    );

    if (
      mealResetInProgress ||
      window.__kalorikuResetInProgress
    ) {
      return false;
    }

    saveMeals(mergedMeals);

    const cloudIds = new Set(
      cloudMeals.map(meal => meal.id)
    );

    const unsyncedMeals = localMeals.filter(
      meal => meal.id && !cloudIds.has(meal.id)
    );

    if (unsyncedMeals.length > 0) {
      await enqueueMealsForSync(unsyncedMeals);
    }

    console.log("===== SINKRONISASI RIWAYAT =====");
    console.log("Data cloud:", cloudMeals.length);
    console.log("Data lokal:", localMeals.length);
    console.log("Data gabungan:", mergedMeals.length);
    console.log("Belum tersinkron:", unsyncedMeals.length);
    console.log("================================");

    return true;

  } catch (error) {
    console.error("Gagal menggabungkan riwayat:", error);
    return false;
  }
}


// =========================================
// MEMULAI SINKRONISASI
// =========================================

export function startMealSync() {
  if (syncStarted) return;

  syncStarted = true;

  onAuthStateChanged(auth, user => {
    clearTimeout(syncTimer);
    syncTimer = null;

    if (
      !user ||
      !getGoogleUser() ||
      mealResetInProgress ||
      window.__kalorikuResetInProgress
    ) {
      return;
    }

    void syncMealsFromCloud().finally(() => {
      const currentUser = getGoogleUser();

      if (
        currentUser &&
        !mealResetInProgress &&
        !window.__kalorikuResetInProgress
      ) {
        schedulePartialSync(currentUser.uid);
      }
    });
  });

  window.addEventListener("online", () => {
    const user = getGoogleUser();

    if (
      user &&
      !mealResetInProgress &&
      !window.__kalorikuResetInProgress
    ) {
      void flushPendingMeals(true);
    }
  });
}


// =========================================
// MEMUAT SELURUH CATATAN DARI CLOUD
// =========================================

export async function loadMealsFromCloud() {
  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return [];
  }

  const user = getGoogleUser();

  if (!user) {
    throw new Error("Pengguna belum login dengan Google.");
  }

  const batchesRef = collection(
    db,
    "users",
    user.uid,
    "scanBatches"
  );

  const snapshot = await getDocs(batchesRef);

  if (
    mealResetInProgress ||
    window.__kalorikuResetInProgress
  ) {
    return [];
  }

  const meals = [];

  snapshot.forEach(document => {
    const data = document.data();

    if (Array.isArray(data.meals)) {
      meals.push(...data.meals);
    }
  });

  meals.sort(
    (a, b) =>
      Number(b.createdAt || 0) -
      Number(a.createdAt || 0)
  );

  console.log(
    `${meals.length} catatan berhasil dimuat dari Firestore.`
  );

  return meals;
}


// =========================================
// RESET SELURUH RIWAYAT MAKANAN DI FIRESTORE
// =========================================

export async function resetMealsCloudData() {
  if (mealResetInProgress) {
    throw new Error("Reset riwayat makanan sedang berjalan.");
  }

  mealResetInProgress = true;

  clearTimeout(syncTimer);
  syncTimer = null;

  try {
    // Tunggu proses pengiriman batch yang sedang berjalan.
    if (flushPromise) {
      await flushPromise;
    }

    clearTimeout(syncTimer);
    syncTimer = null;

    const user = getGoogleUser();

    if (!user) {
      throw new Error("Akun Google tidak ditemukan.");
    }

    const batchesRef = collection(
      db,
      "users",
      user.uid,
      "scanBatches"
    );

    const snapshot = await getDocs(batchesRef);

    const documents = snapshot.docs;
    const chunkSize = 450;

    for (
      let i = 0;
      i < documents.length;
      i += chunkSize
    ) {
      const batch = writeBatch(db);

      documents
        .slice(i, i + chunkSize)
        .forEach(document => {
          batch.delete(document.ref);
        });

      await batch.commit();
    }

    if (auth.currentUser?.uid !== user.uid) {
      throw new Error("Akun berubah selama proses reset.");
    }

    // Hapus antrean dan jadwal sinkronisasi akun ini.
    localStorage.removeItem(getQueueKey(user.uid));
    localStorage.removeItem(getSyncDueKey(user.uid));

    console.log(
      `${documents.length} batch riwayat berhasil dihapus dari Firestore.`
    );

    return true;

  } catch (error) {
    console.error(
      "Gagal menghapus riwayat makanan Firestore:",
      error
    );

    throw error;

  } finally {
    mealResetInProgress = false;
  }
}
