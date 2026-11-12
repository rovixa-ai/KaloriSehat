
import { auth, db } from "./firebase-config.js";

import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Maksimal catatan dalam satu dokumen Firestore.
const MAX_MEALS_PER_BATCH = 10;

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

// Membuat ID dokumen berdasarkan ID catatan.
// ID yang sama menghasilkan dokumen yang sama.
function createBatchId(meals) {
  const firstId = meals[0].id;
  const lastId = meals[meals.length - 1].id;

  return `batch_${firstId}_${lastId}`.replaceAll("/", "_");
}

// Menyimpan maksimal 10 catatan dalam satu dokumen.
export async function saveMealBatch(meals) {
  const user = getGoogleUser();

  if (!user) {
    throw new Error("Pengguna belum login dengan Google.");
  }

  if (!Array.isArray(meals) || meals.length === 0) {
    throw new Error("Data makanan kosong.");
  }

  if (meals.length > MAX_MEALS_PER_BATCH) {
    throw new Error("Maksimal 10 catatan per batch.");
  }

  const preparedMeals = meals.map(prepareMealForCloud);

  if (preparedMeals.some(meal => !meal.id)) {
    throw new Error("Ada catatan makanan yang belum memiliki ID.");
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
