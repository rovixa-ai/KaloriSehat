
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
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Pengaturan sinkronisasi
const MAX_MEALS_PER_BATCH = 10;
const PARTIAL_SYNC_DELAY = 1 * 60 * 1000;

let syncTimer = null;
let flushPromise = null;
let syncStarted = false;

// Memastikan pengguna benar-benar login dengan Google.
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

// Membuat ID unik untuk setiap catatan.
export function createMealId() {
  return crypto.randomUUID();
}

// Key antrean dibuat terpisah untuk setiap akun.
function getQueueKey(uid) {
  return `kaloriku_pending_meals_${uid}`;
}

// Key jadwal sinkronisasi untuk setiap akun.
function getSyncDueKey(uid) {
  return `kaloriku_sync_due_${uid}`;
}

// Membaca waktu jatuh tempo.
function getSyncDueAt(uid) {
  const value = Number(
    localStorage.getItem(getSyncDueKey(uid))
  );

  return Number.isFinite(value) && value > 0
    ? value
    : null;
}

// Menyimpan waktu jatuh tempo.
function setSyncDueAt(uid, timestamp) {
  localStorage.setItem(
    getSyncDueKey(uid),
    String(timestamp)
  );
}

// Menghapus jadwal setelah antrean kosong.
function clearSyncDueAt(uid) {
  localStorage.removeItem(getSyncDueKey(uid));
}

// Membaca antrean lokal.
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

// Menyimpan antrean lokal.
function savePendingMeals(uid, meals) {
  localStorage.setItem(
    getQueueKey(uid),
    JSON.stringify(meals)
  );
}

// Mengambil hanya field yang diperlukan untuk cloud.
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

// Menyaring data satu catatan makanan.
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

// ID batch tetap berdasarkan catatan pertama dan terakhir.
function createBatchId(meals) {
  const firstId = meals[0].id;
  const lastId = meals[meals.length - 1].id;

  return `batch_${firstId}_${lastId}`.replaceAll("/", "_");
}

// Menyimpan batch ke Firestore.
export async function saveMealBatch(meals) {
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

  await setDoc(batchRef, {
    meals: preparedMeals,
    updatedAt: serverTimestamp()
  });

  console.log(
    `${preparedMeals.length} catatan berhasil disimpan ke Firestore.`
  );

  return true;
}

// Mengirim antrean secara bertahap.
async function flushPendingMeals(partial = false) {
  const user = getGoogleUser();

  if (!user) return;

  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    const uid = user.uid;

    try {
      while (true) {
        if (auth.currentUser?.uid !== uid) break;

        const queue = getPendingMeals(uid);

        if (queue.length === 0) break;

        // Batch penuh dikirim langsung.
        // Batch parsial hanya dikirim saat waktunya tiba.
        if (queue.length < MAX_MEALS_PER_BATCH && !partial) {
          break;
        }

        const batch = queue.slice(0, MAX_MEALS_PER_BATCH);

        await saveMealBatch(batch);

        // Jangan mengubah antrean jika akun berganti.
        if (auth.currentUser?.uid !== uid) break;

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

  // Jika gagal, jadwalkan percobaan ulang 1 menit lagi.
  if (auth.currentUser?.uid === uid) {
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

    if (currentUser) {
      schedulePartialSync(currentUser.uid);
    }
  }
}

// Menjadwalkan pengiriman catatan yang belum mencapai 10.

function schedulePartialSync(uid) {
  clearTimeout(syncTimer);
  syncTimer = null;

  const queue = getPendingMeals(uid);

  // Tidak ada antrean: hapus jadwal.
  if (queue.length === 0) {
    clearSyncDueAt(uid);
    return;
  }

  // Jika batch penuh, langsung kirim.
  if (queue.length >= MAX_MEALS_PER_BATCH) {
    clearSyncDueAt(uid);
    void flushPendingMeals(false);
    return;
  }

  // Pertahankan jadwal lama jika sudah tersedia.
  let dueAt = getSyncDueAt(uid);

  // Jika belum ada jadwal, buat jadwal baru 1 menit.
  if (!dueAt) {
    dueAt = Date.now() + PARTIAL_SYNC_DELAY;
    setSyncDueAt(uid, dueAt);
  }

  // Hitung sisa waktu berdasarkan jadwal tersimpan.
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

    if (user?.uid === uid) {
      void flushPendingMeals(true);
    }
  }, remainingTime);
}


// Memasukkan catatan baru ke antrean.
export async function enqueueMealsForSync(meals) {
  const user = getGoogleUser();

  // Akun tamu tidak menggunakan sinkronisasi cloud.
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


// Menggabungkan riwayat lokal dan cloud berdasarkan ID.
export async function syncMealsFromCloud() {
  const user = getGoogleUser();

  if (!user) return false;

  try {
    const uid = user.uid;

    // Ambil data cloud.
    const cloudMeals = await loadMealsFromCloud();

    // Pastikan akun tidak berganti selama proses berlangsung.
    if (auth.currentUser?.uid !== uid) return false;

    // Ambil data lokal.
    const localMeals = getMeals();

    // Gabungkan berdasarkan ID unik.
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
      (a, b) => Number(b.createdAt || 0) -
                Number(a.createdAt || 0)
    );

    // Simpan hasil penggabungan ke lokal.
    saveMeals(mergedMeals);

    // Cari catatan lokal yang belum ada di cloud.
    const cloudIds = new Set(
      cloudMeals.map(meal => meal.id)
    );

    const unsyncedMeals = localMeals.filter(
      meal => meal.id && !cloudIds.has(meal.id)
    );

    // Masukkan catatan yang belum tersinkron ke antrean.
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


// Memulai sinkronisasi dan melanjutkan antrean lama.
export function startMealSync() {
  if (syncStarted) return;

  syncStarted = true;

onAuthStateChanged(auth, user => {
  clearTimeout(syncTimer);
  syncTimer = null;

  if (!user || !getGoogleUser()) return;

  void syncMealsFromCloud().finally(() => {
    const currentUser = getGoogleUser();

    if (currentUser) {
      schedulePartialSync(currentUser.uid);
    }
  });
});

  window.addEventListener("online", () => {
    const user = getGoogleUser();

    if (user) {
      flushPendingMeals(true);
    }
  });
}

// Mengambil seluruh catatan dari cloud.
export async function loadMealsFromCloud() {
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

  const meals = [];

  snapshot.forEach(document => {
    const data = document.data();

    if (Array.isArray(data.meals)) {
      meals.push(...data.meals);
    }
  });

  meals.sort(
    (a, b) => Number(b.createdAt || 0) -
              Number(a.createdAt || 0)
  );

  console.log(
    `${meals.length} catatan berhasil dimuat dari Firestore.`
  );

  return meals;
}
