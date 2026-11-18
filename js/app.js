import {
  openFoodEditModal
} from "./food-edit-modal.js";

import {
  foodAliases,
  loadPangankuDatabase,
  findFood,
  findFoodSuggestions,
  createCompositeFood
} from "./food-database.js";

import {
  getMeals,
  saveMeals
} from "./meal-storage.js";

import {
  createMealId,
  enqueueMealsForSync,
  startMealSync
} from "./firestore-meals.js";

import {
  updateDashboard
} from "./dashboard-render.js";

import {
  analyzeFoodPhoto
} from "./food-analysis.js";

import {
  maybeStartFoodEditTour
} from "./food-edit-tour.js";

const $ = id => document.getElementById(id);

// ========================================
// SISTEM TERJEMAHAN
// ========================================

const t = key =>
  window.t?.(`foodScanner.${key}`) ?? key;

function getLocale() {
  return window.getLanguage?.() === "en"
    ? "en-US"
    : "id-ID";
}

// ========================================
// INISIALISASI
// ========================================

startMealSync();

let currentResult = null;
let selectedSuggestedFood = null;
let pangankuFoods = {};
let previewObjectUrl = null;
let latestDetectedFoods = null;

let analysisStatusType = "";
let analysisStatusValue = null;

// Mencegah render lama menimpa render baru
let detectedFoodRenderVersion = 0;

// ========================================
// STATUS ANALISIS
// ========================================

function setAnalysisStatus(type = "", value = null) {
  analysisStatusType = type;
  analysisStatusValue = value;

  const status = $("analysisStatus");
  if (!status) return;

  switch (type) {
    case "analyzing":
      status.textContent = t("analyzing");
      break;

    case "found":
      status.textContent =
        `${t("foundFoods")} ${value} ${t("foods")}`;
      break;

    case "error":
      status.textContent = value || t("analysisError");
      break;

    default:
      status.textContent = "";
  }
}

// ========================================
// RESET SCANNER
// ========================================

function resetFoodScanner() {
  $("foodPhoto").value = "";

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  $("preview").src = "";
  $("preview").hidden = true;

  $("analyzeButton").disabled = true;

  setAnalysisStatus();

  $("analysisResults").hidden = true;
  $("detectedFoods").innerHTML = "";

  $("foodName").value = "";
  $("foodWeight").value = 100;

  $("result").hidden = true;
  $("resultDetails").textContent = "";

  $("foodSuggestions").hidden = true;
  $("suggestionList").innerHTML = "";

  currentResult = null;
  selectedSuggestedFood = null;
  latestDetectedFoods = null;

  // Batalkan render yang sedang berjalan
  detectedFoodRenderVersion++;
}

// ========================================
// DATABASE PANGANKU
// ========================================

const pangankuDatabasePromise = loadPangankuDatabase()
  .then(database => {
    pangankuFoods = database;

    pangankuFoods["tumis buncis dan wortel"] =
      createCompositeFood(pangankuFoods, [
        {
          name: "buncis tumis",
          weight: 50
        },
        {
          name: "wortel tumis",
          weight: 50
        }
      ]);

    console.log(
      "Database Panganku berhasil dimuat:",
      Object.keys(pangankuFoods).length,
      "makanan"
    );

    return pangankuFoods;
  })
  .catch(error => {
    console.error("Gagal memuat Panganku:", error);
    throw error;
  });

// ========================================
// ALIAS MAKANAN
// ========================================

function getFoodAliases() {
  try {
    const savedAliases = JSON.parse(
      localStorage.getItem("kaloriku_food_aliases") || "{}"
    );

    return {
      ...foodAliases,
      ...savedAliases
    };
  } catch {
    return foodAliases;
  }
}

function saveFoodAlias(originalName, pangankuName) {
  try {
    const savedAliases = JSON.parse(
      localStorage.getItem("kaloriku_food_aliases") || "{}"
    );

    savedAliases[originalName] = pangankuName;

    localStorage.setItem(
      "kaloriku_food_aliases",
      JSON.stringify(savedAliases)
    );
  } catch (error) {
    console.error("Gagal menyimpan alias makanan:", error);
  }
}

// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ========================================
// PREVIEW FOTO
// ========================================

$("foodPhoto").addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showAppModal({
      type: "warning",
      title: t("fileNotSelected"),
      message: t("selectImageFirst")
    });

    event.target.value = "";
    return;
  }

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }

  previewObjectUrl = URL.createObjectURL(file);

  $("preview").src = previewObjectUrl;
  $("preview").hidden = false;

  $("analyzeButton").disabled = false;

  setAnalysisStatus();

  $("analysisResults").hidden = true;
  $("detectedFoods").innerHTML = "";

  latestDetectedFoods = null;
});

// ========================================
// ANALISIS FOTO
// ========================================

$("analyzeButton").addEventListener("click", async () => {
  const file = $("foodPhoto").files[0];

  if (!file) {
    showAppModal({
      type: "warning",
      title: t("fileNotSelected"),
      message: t("selectFoodPhoto")
    });

    return;
  }

  $("analyzeButton").disabled = true;
  setAnalysisStatus("analyzing");
  $("analysisResults").hidden = true;

  try {
    const foods = await analyzeFoodPhoto(file);

    if (!Array.isArray(foods) || !foods.length) {
      throw new Error(t("analysisError"));
    }

    await renderDetectedFoods(foods);

    setAnalysisStatus("found", foods.length);
    $("analysisResults").hidden = false;

  } catch (error) {
    console.error(error);

    setAnalysisStatus(
      "error",
      error.message || t("analysisError")
    );

  } finally {
    $("analyzeButton").disabled = false;
  }
});

// ========================================
// AI NUTRITION ENGINE
// ========================================

const NUTRITION_API_URL =
  "https://kalori-sehat.vercel.app";

const AI_FOOD_CACHE_KEY =
  "kaloriku_ai_food_cache";

const AI_CACHE_TTL =
  30 * 24 * 60 * 60 * 1000;

const aiFoodMemoryCache = new Map();
const aiFoodPendingRequests = new Map();

// Normalisasi nama makanan
function normalizeAIFoodName(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " dan ")
    .replace(/[.,;:()[\]{}'"`]/g, " ")
    .replace(/[-/\\]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Membaca cache lokal
function getAIFoodLocalCache() {
  try {
    return JSON.parse(
      localStorage.getItem(AI_FOOD_CACHE_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

// Menyimpan cache lokal
function saveAIFoodLocalCache(name, nutrition) {
  try {
    const cache = getAIFoodLocalCache();
    const key = normalizeAIFoodName(name);

    cache[key] = {
      ...nutrition,
      cachedAt: Date.now()
    };

    localStorage.setItem(
      AI_FOOD_CACHE_KEY,
      JSON.stringify(cache)
    );
  } catch (error) {
    console.warn("Gagal menyimpan cache nutrisi AI:", error);
  }
}

// Normalisasi data nutrisi
function normalizeNutritionData(nutrition, foodName) {
  if (!nutrition) return null;

  const normalized = {
    name: nutrition.name || foodName,

    kcal: Number(nutrition.kcal),
    protein: Number(nutrition.protein),
    carbs: Number(nutrition.carbs),
    fat: Number(nutrition.fat),

    fiber: nutrition.fiber == null
      ? null
      : Number(nutrition.fiber),

    sodium: nutrition.sodium == null
      ? null
      : Number(nutrition.sodium),

    water: nutrition.water == null
      ? null
      : Number(nutrition.water),

    code: nutrition.code || null,
    source: nutrition.source || "AI",
    category: nutrition.category || "Makanan",
    type: nutrition.type || "food",
    basis: nutrition.basis || "100 g",

    sourceUrls: nutrition.sourceUrls || [],
    sourceNames: nutrition.sourceNames || [],

    validationStatus:
      nutrition.validationStatus || "ai_estimated",

    isEstimation:
      nutrition.isEstimation ?? true,

    confidence:
      nutrition.confidence || "low",

    estimationNotes:
      nutrition.estimationNotes || ""
  };

  if (
    !Number.isFinite(normalized.kcal) ||
    !Number.isFinite(normalized.protein) ||
    !Number.isFinite(normalized.carbs) ||
    !Number.isFinite(normalized.fat)
  ) {
    return null;
  }

  return normalized;
}

// Mengambil cache makanan
function getCachedAIFood(name, localCache = null) {
  const key = normalizeAIFoodName(name);

  if (!key) return null;

  if (aiFoodMemoryCache.has(key) &&
      aiFoodMemoryCache.get(key)) {
    return aiFoodMemoryCache.get(key);
  }

  const cache = localCache || getAIFoodLocalCache();
  const cached = cache[key];

  if (
    cached &&
    Date.now() - Number(cached.cachedAt || 0) < AI_CACHE_TTL
  ) {
    aiFoodMemoryCache.set(key, cached);
    return cached;
  }

  return null;
}

// Menyimpan cache memori + localStorage
function storeAIFoodCache(name, nutrition) {
  const key = normalizeAIFoodName(name);

  if (!key || !nutrition) return;

  const data = {
    ...nutrition,
    cachedAt: Date.now()
  };

  aiFoodMemoryCache.set(key, data);
  saveAIFoodLocalCache(name, data);
}




// ========================================
// LOOKUP BATCH FOOD
// ========================================


async function findFoodsWithAI(foodNames) {
  await pangankuDatabasePromise;

  // Hilangkan nama duplikat
  const uniqueNames = [
    ...new Map(
      foodNames
        .map(name => [normalizeAIFoodName(name), name])
        .filter(([key]) => key)
    ).values()
  ];

  const results = new Map();
  const missingNames = [];

  const localCache = getAIFoodLocalCache();
  const pendingEntries = [];

  // ========================================
  // 1. DATABASE LOKAL + CACHE
  // ========================================

  for (const name of uniqueNames) {
    const key = normalizeAIFoodName(name);

    const localNutrition = findFood(
      name,
      pangankuFoods,
      getFoodAliases()
    );

    if (localNutrition) {
      results.set(key, localNutrition);
      continue;
    }

    const cached = getCachedAIFood(name, localCache);

    if (cached) {
      results.set(key, cached);
      continue;
    }

    // Gunakan request yang sudah berjalan
    if (aiFoodPendingRequests.has(key)) {
      pendingEntries.push({
        key,
        promise: aiFoodPendingRequests.get(key)
      });
      continue;
    }

    missingNames.push(name);
  }

  // ========================================
  // 2. TUNGGU REQUEST YANG SUDAH BERJALAN
  // ========================================

  if (pendingEntries.length) {
    const pendingResults = await Promise.all(
      pendingEntries.map(async entry => ({
        key: entry.key,
        nutrition: await entry.promise
      }))
    );

    for (const item of pendingResults) {
      results.set(item.key, item.nutrition);
    }
  }

  // Semua sudah ditemukan secara lokal/cache
  if (!missingNames.length) {
    return results;
  }

  // ========================================
  // 3. KIRIM SATU REQUEST BATCH
  // ========================================

  try {
    const response = await fetch(
      `${NUTRITION_API_URL}/find-nutrition-batch`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          names: missingNames
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const error = new Error(
        errorData.error || `Batch HTTP ${response.status}`
      );

      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (!data.success || !Array.isArray(data.foods)) {
      throw new Error("Format respons batch tidak valid.");
    }

    // ========================================
    // 4. BACA HASIL BACKEND
    // ========================================

    const batchMap = new Map();

    for (const item of data.foods) {
      const name = item.name || item.requestedName;

      if (!name) continue;

      const key = normalizeAIFoodName(name);

      if (!key) continue;

      if (item.found !== true || !item.food) {
        batchMap.set(key, null);
        continue;
      }

      batchMap.set(key, item.food);
    }

    // ========================================
    // 5. NORMALISASI + CACHE
    // ========================================

    for (const name of missingNames) {
      const key = normalizeAIFoodName(name);

      const rawNutrition = batchMap.get(key);

      const nutrition = normalizeNutritionData(
        rawNutrition,
        name
      );

      if (nutrition) {
        storeAIFoodCache(name, nutrition);
        results.set(key, nutrition);
      } else {
        // Simpan null agar tidak memicu AI lagi
        // ketika tombol Simpan ditekan.
        results.set(key, null);
      }
    }

    console.log("===== KALORIKU BATCH =====");
    console.log("Jumlah permintaan:", missingNames.length);
    console.log("Firestore hits:", data.firestoreHits);
    console.log("AI generated:", data.aiGenerated);
    console.log("Failed:", data.failed);
    console.log("==========================");

  } catch (error) {
    console.error("Batch nutrition error:", error);

    // Jangan fallback ke banyak request satuan
    // jika server membalas 429 atau 5xx.
    const shouldUseLegacyFallback =
      error.status === 404 ||
      error.status === 405;

    if (shouldUseLegacyFallback) {
      console.warn(
        "Endpoint batch belum tersedia. Menggunakan endpoint lama."
      );

      const fallbackResults = await Promise.all(
        missingNames.map(async name => ({
          key: normalizeAIFoodName(name),
          nutrition: await findFoodWithAI(name)
        }))
      );

      for (const item of fallbackResults) {
        results.set(item.key, item.nutrition);
      }

    } else {
      // Jangan membuat request AI tambahan
      // ketika batch mengalami masalah kuota/server.
      for (const name of missingNames) {
        results.set(
          normalizeAIFoodName(name),
          null
        );
      }
    }
  }

  return results;
}

// ========================================
// RENDER HASIL ANALISIS FOTO
// ========================================

async function renderDetectedFoods(foodList) {
  await pangankuDatabasePromise;

  latestDetectedFoods = foodList;

  const currentRenderVersion =
    ++detectedFoodRenderVersion;

  const container = $("detectedFoods");
  container.innerHTML = "";

  // Nutrisi di-cache berdasarkan object food
  // agar nama duplikat tidak menimpa data.
  const nutritionMap = new Map();
  const foodCardMap = new Map();

  const total = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0
  };

  function isCurrentRender() {
    return currentRenderVersion ===
      detectedFoodRenderVersion;
  }

  function updateTotalText() {
    const totalText = container.querySelector(
      ".detected-total-text"
    );

    if (!totalText) return;

    totalText.textContent =
      `${Math.round(total.kcal)} ${t("calories")} | ` +
      `${t("protein")} ${total.protein.toFixed(1)} g | ` +
      `${t("carbohydrates")} ${total.carbs.toFixed(1)} g | ` +
      `${t("fat")} ${total.fat.toFixed(1)} g | ` +
      `${Math.round(total.water)} ml ${t("water")}`;
  }

  function applyNutrition(food, nutrition) {
    const cardData = foodCardMap.get(food);
    if (!cardData) return;

    cardData.contribution = null;
    nutritionMap.set(food, nutrition);

    if (!nutrition || cardData.weight <= 0) {
      cardData.nutritionInfo.textContent =
        t("nutritionNotFound");

      cardData.statusDot.hidden = false;

      updateTotalText();
      return;
    }

    cardData.statusDot.hidden = true;

    const factor = cardData.weight / 100;

    const contribution = {
      kcal: (Number(nutrition.kcal) || 0) * factor,
      protein: (Number(nutrition.protein) || 0) * factor,
      carbs: (Number(nutrition.carbs) || 0) * factor,
      fat: (Number(nutrition.fat) || 0) * factor,
      water: nutrition.water == null
        ? 0
        : (Number(nutrition.water) || 0) * factor
    };

    cardData.contribution = contribution;

    total.kcal += contribution.kcal;
    total.protein += contribution.protein;
    total.carbs += contribution.carbs;
    total.fat += contribution.fat;
    total.water += contribution.water;

    cardData.nutritionInfo.textContent =
      `${Math.round(contribution.kcal)} ${t("calories")} | ` +
      `${t("protein")} ${contribution.protein.toFixed(1)} g | ` +
      `${t("carbohydrates")} ${contribution.carbs.toFixed(1)} g | ` +
      `${t("fat")} ${contribution.fat.toFixed(1)} g`;

    updateTotalText();
  }

  // ========================================
  // BUAT KARTU MAKANAN TERLEBIH DAHULU
  // ========================================

  for (const food of foodList) {
    const item = document.createElement("div");
    item.className = "detected-food-item";

    const info = document.createElement("div");

    const originalName = food.originalName || food.name;

    const nameRow = document.createElement("div");
    nameRow.className = "detected-food-name";

    const name = document.createElement("strong");
    name.textContent = food.name;

    nameRow.appendChild(name);

    const weight = Number(food.estimatedWeight) || 0;

    const weightText = document.createElement("p");
    weightText.textContent =
      `${t("estimatedWeight")} ${weight} ${t("gram")}`;

    const confidence = document.createElement("small");
    confidence.textContent =
      `${t("aiConfidence")} ${food.confidence || t("unknown")}`;

    const nutritionInfo = document.createElement("p");
    nutritionInfo.textContent = t("analyzing");

    const statusDot = document.createElement("span");
    statusDot.className = "nutrition-status-dot";
    statusDot.hidden = true;
    statusDot.title = t("nutritionNotFoundTitle");

    nameRow.appendChild(statusDot);

    info.append(
      nameRow,
      weightText,
      confidence,
      nutritionInfo
    );

    // ========================================
    // EDIT
    // ========================================

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = t("edit");
    editButton.className = "small-select-button";
    editButton.dataset.foodEditTour = "trigger";

    editButton.addEventListener("click", () => {
      openFoodEditModal({
        mode: "edit",
        food,
        pangankuFoods,
        findFoodSuggestions,

        onSave: ({
          originalName: modalOriginalName,
          selectedFoodName,
          weight
        }) => {
          saveFoodAlias(
            modalOriginalName || originalName,
            selectedFoodName
          );

          if (food.name !== selectedFoodName) {
            saveFoodAlias(
              food.name,
              selectedFoodName
            );
          }

          food.originalName =
            modalOriginalName || originalName;

          food.name = selectedFoodName;
          food.estimatedWeight = Number(weight);

          $("result").hidden = true;
          currentResult = null;
          selectedSuggestedFood = null;

          void renderDetectedFoods(foodList);
        },

        onDelete: deletedFood => {
          const index = foodList.indexOf(deletedFood);

          if (index !== -1) {
            foodList.splice(index, 1);
          }

          $("result").hidden = true;
          currentResult = null;
          selectedSuggestedFood = null;

          void renderDetectedFoods(foodList);
        }
      });
    });

    item.append(info, editButton);
    container.appendChild(item);

    foodCardMap.set(food, {
      item,
      food,
      weight,
      name,
      nameRow,
      nutritionInfo,
      statusDot,
      contribution: null
    });
  }

  // ========================================
  // TAMBAH MAKANAN
  // ========================================

  const addFoodButton = document.createElement("button");
  addFoodButton.type = "button";
  addFoodButton.textContent = `+ ${t("addFood")}`;
  addFoodButton.className = "add-food-button";

  addFoodButton.addEventListener("click", () => {
    openFoodEditModal({
      mode: "add",
      pangankuFoods,
      findFoodSuggestions,

      onSave: ({
        selectedFoodName,
        weight
      }) => {
        foodList.push({
          name: selectedFoodName,
          originalName: selectedFoodName,
          estimatedWeight: Number(weight),
          confidence: t("manuallySelected")
        });

        $("result").hidden = true;
        currentResult = null;
        selectedSuggestedFood = null;

        void renderDetectedFoods(foodList);
      }
    });
  });

  container.appendChild(addFoodButton);

  // ========================================
  // TOTAL NUTRISI
  // ========================================

  const totalBox = document.createElement("div");
  totalBox.className = "detected-food-item";

  const totalInfo = document.createElement("div");

  const totalTitle = document.createElement("strong");
  totalTitle.textContent = t("totalNutrition");

  const totalText = document.createElement("p");
  totalText.className = "detected-total-text";

  totalInfo.append(totalTitle, totalText);
  totalBox.appendChild(totalInfo);

  // ========================================
  // SIMPAN
  // ========================================

  const saveGroupButton = document.createElement("button");
  saveGroupButton.type = "button";
  saveGroupButton.textContent = t("saveFood");
  saveGroupButton.className = "save-group-button";

  saveGroupButton.addEventListener("click", async () => {
    if (saveGroupButton.disabled) return;

    saveGroupButton.disabled = true;

    try {
      const foodsToSave = await Promise.all(
        foodList.map(async food => {
          const weight =
            Number(food.estimatedWeight) || 0;

          // Gunakan nutrisi yang sudah diperoleh.
          // Tidak memanggil AI ulang jika sudah ada.
          const nutrition = nutritionMap.has(food)
  ? nutritionMap.get(food)
  : await findFoodWithAI(food.name);

          if (
            !nutrition ||
            weight <= 0 ||
            nutrition.kcal == null
          ) {
            return null;
          }

          const factor = weight / 100;

          return {
            name: food.name,
            weight,
            kcal: nutrition.kcal * factor,
            protein: nutrition.protein * factor,
            carbs: nutrition.carbs * factor,
            fat: nutrition.fat * factor,
            fiber: nutrition.fiber == null
              ? null
              : nutrition.fiber * factor,
            sodium: nutrition.sodium == null
              ? null
              : nutrition.sodium * factor,
            water: nutrition.water == null
              ? null
              : nutrition.water * factor,
            source: nutrition.source,
            code: nutrition.code
          };
        })
      );

      const validFoodsToSave =
        foodsToSave.filter(Boolean);

      if (!validFoodsToSave.length) {
        showAppModal({
          type: "warning",
          title: t("noData"),
          message: t("noFoodNutrition")
        });

        return;
      }

      const groupTotal = validFoodsToSave.reduce(
        (sum, food) => {
          sum.kcal += Number(food.kcal) || 0;
          sum.protein += Number(food.protein) || 0;
          sum.carbs += Number(food.carbs) || 0;
          sum.fat += Number(food.fat) || 0;
          sum.water += Number(food.water) || 0;

          return sum;
        },
        {
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          water: 0
        }
      );

      const meals = getMeals();

      meals.push({
        id: createMealId(),
        name: t("photoMenu"),
        foods: validFoodsToSave,
        foodCount: validFoodsToSave.length,
        ...groupTotal,
        date: new Date().toLocaleDateString("sv-SE"),
        createdAt: Date.now()
      });

      saveMeals(meals);

      void enqueueMealsForSync([
        meals[meals.length - 1]
      ]).catch(error => {
        console.error(
          "Gagal memasukkan scan foto ke antrean:",
          error
        );
      });

      updateDashboard();
      resetFoodScanner();

      showAppModal({
        type: "success",
        title: t("success"),
        message: t("foodSaved")
      });

    } catch (error) {
      console.error("Gagal menyimpan scan:", error);

      showAppModal({
        type: "warning",
        title: t("noData"),
        message: t("noFoodNutrition")
      });

    } finally {
      saveGroupButton.disabled = false;
    }
  });

  // ========================================
  // BATAL
  // ========================================

  const cancelGroupButton = document.createElement("button");
  cancelGroupButton.type = "button";
  cancelGroupButton.textContent = t("cancel");
  cancelGroupButton.className = "cancel-button";

  cancelGroupButton.addEventListener("click", async () => {
    const confirmCancel = await window.confirmAppModal({
      type: "warning",
      title: t("cancel"),
      message: t("cancelIdentification"),
      confirmText: t("yes"),
      cancelText: t("cancel"
      )
    });

    if (!confirmCancel) return;

    resetFoodScanner();
  });

  const groupActions = document.createElement("div");
  groupActions.className = "group-actions";

  groupActions.append(
    cancelGroupButton,
    saveGroupButton
  );

  totalBox.appendChild(groupActions);
  container.appendChild(totalBox);

  updateTotalText();

  // ========================================
  // PENCARIAN NUTRISI BATCH
  // ========================================

  const namesToFind = foodList.map(food => food.name);

  try {
    const batchResults =
      await findFoodsWithAI(namesToFind);

    if (!isCurrentRender()) return;

    for (const food of foodList) {
      const nutrition =
        batchResults.get(normalizeAIFoodName(food.name)) ||
        null;

      const cardData = foodCardMap.get(food);
      if (!cardData) continue;

      // Jika hasil cocok dengan nama database Panganku
      if (nutrition) {
        const matchedName = Object.keys(pangankuFoods)
          .find(name =>
            pangankuFoods[name] === nutrition
          );

        if (matchedName) {
          food.originalName =
            food.originalName || food.name;

          food.name = matchedName;
          cardData.name.textContent = matchedName;
        }
      }

      applyNutrition(food, nutrition);
    }

  } catch (error) {
    console.error("Batch nutrisi gagal:", error);

    if (!isCurrentRender()) return;

    for (const food of foodList) {
      applyNutrition(food, null);
    }
  }

  setTimeout(() => {
    if (isCurrentRender()) {
      void maybeStartFoodEditTour();
    }
  }, 700);
}

// ========================================
// SUGESTI MAKANAN MANUAL
// ========================================

function showFoodSuggestions(query) {
  const suggestions = findFoodSuggestions(
    query,
    pangankuFoods
  );

  const container = $("suggestionList");
  container.innerHTML = "";

  if (!suggestions.length) {
    $("foodSuggestions").hidden = false;

    container.innerHTML = `
      <p class="no-suggestion">
        ${escapeHTML(query)} ${t("noSuggestion")}
      </p>
      <p class="suggestion-hint">
        ${t("tryOtherFood")}
      </p>
    `;

    return;
  }

  suggestions.forEach(item => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "suggestion-item";

    button.textContent =
      `${item.name} — ${item.food.kcal ?? "—"} ${t("calories")} / ${t("per100g")}`;

    button.addEventListener("click", () => {
      $("foodName").value = item.name;

      selectedSuggestedFood = item.food;
      $("foodSuggestions").hidden = true;

      $("calculateButton").click();
    });

    container.appendChild(button);
  });

  $("foodSuggestions").hidden = false;
}

// ========================================
// HITUNG MAKANAN MANUAL
// ========================================


$("calculateButton").addEventListener("click", async () => {
  await pangankuDatabasePromise;

  const name = $("foodName").value.trim();
  const weight = Number($("foodWeight").value);

  // ========================================
  // 1. VALIDASI INPUT
  // ========================================

  if (!name || !weight || weight <= 0) {
    showAppModal({
      type: "warning",
      title: t("enterFoodData"),
      message: t("enterValidFood")
    });
    return;
  }

  const button = $("calculateButton");
  const buttonContent = button.innerHTML;

  button.disabled = true;

  try {
    let food = selectedSuggestedFood ||
      findFood(name, pangankuFoods, getFoodAliases());

    selectedSuggestedFood = null;

    // ========================================
    // 2. CARI FIRESTORE JIKA TIDAK ADA DI LOKAL
    // ========================================

    if (!food) {
      button.innerHTML = t("searchingDatabase");

      const response = await fetch(
        `${NUTRITION_API_URL}/lookup-food`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name
          })
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || `HTTP ${response.status}`
        );
      }

      if (!data || data.success !== true) {
        throw new Error(
          data?.error || "Respons database tidak valid."
        );
      }

      if (data.found === true && data.food) {
        food = data.food;
      }
    }

    // ========================================
    // 3. JIKA TIDAK DITEMUKAN
    // ========================================

    if (!food) {
      $("result").hidden = true;

      showFoodSuggestions(name);
      return;
    }

    // ========================================
    // 4. VALIDASI DATA NUTRISI
    // ========================================

    if (
      food.kcal === null ||
      food.kcal === undefined ||
      !Number.isFinite(Number(food.kcal))
    ) {
      showAppModal({
        type: "warning",
        title: t("emptyData"),
        message: t("dataUnavailable")
      });
      return;
    }

    // ========================================
    // 5. HITUNG BERDASARKAN BERAT
    // ========================================

    $("foodSuggestions").hidden = true;

    const factor = weight / 100;

    currentResult = {
      name,
      weight,

      kcal: Number(food.kcal) * factor,
      protein: Number(food.protein || 0) * factor,
      carbs: Number(food.carbs || 0) * factor,
      fat: Number(food.fat || 0) * factor,

      fiber: food.fiber == null
        ? null
        : Number(food.fiber) * factor,

      sodium: food.sodium == null
        ? null
        : Number(food.sodium) * factor,

      water: food.water == null
        ? null
        : Number(food.water) * factor,

      source: food.source || "Firestore",
      code: food.code || null
    };

    // ========================================
    // 6. TAMPILKAN HASIL
    // ========================================

    $("resultDetails").textContent =
      `${Math.round(currentResult.kcal)} ${t("calories")} | ` +
      `${t("protein")} ${currentResult.protein.toFixed(1)} g | ` +
      `${t("carbohydrates")} ${currentResult.carbs.toFixed(1)} g | ` +
      `${t("fat")} ${currentResult.fat.toFixed(1)} g | ` +
      `${Math.round(currentResult.water || 0)} ml ${t("water")}`;

    $("result").hidden = false;

  } catch (error) {
    console.error("Manual food lookup error:", error);

    showAppModal({
      type: "error",
      title: "Gagal mencari makanan",
      message: error.message ||
        "Tidak dapat terhubung ke database. Silakan coba lagi."
    });

  } finally {
    button.disabled = false;
    button.innerHTML = buttonContent;
  }
});


// ========================================
// SIMPAN MAKANAN MANUAL
// ========================================

$("saveMeal").addEventListener("click", () => {
  if (!currentResult) return;

  const meals = getMeals();

  meals.push({
    id: createMealId(),
    ...currentResult,
    date: new Date().toLocaleDateString("sv-SE"),
    createdAt: Date.now()
  });

  saveMeals(meals);

  void enqueueMealsForSync([
    meals[meals.length - 1]
  ]).catch(error => {
    console.error(
      "Gagal memasukkan scan manual ke antrean:",
      error
    );
  });

  updateDashboard();
  resetFoodScanner();

  showAppModal({
    type: "success",
    title: t("success"),
    message: t("foodSaved")
  });
});

// ========================================
// DEBUG PANGANKU
// ========================================

window.cariPanganku = function (kata) {
  return findFoodSuggestions(
    kata,
    pangankuFoods,
    15
  ).map(x => ({
    nama: x.name,
    kcal: x.food.kcal,
    protein: x.food.protein,
    karbohidrat: x.food.carbs,
    lemak: x.food.fat
  }));
};

// ========================================
// RESET
// ========================================

const resetMealButton = $("resetMeal");

resetMealButton?.addEventListener("click", async () => {
  const confirmReset = await window.confirmAppModal({
    type: "warning",
    title: t("resetAll"),
    message: t("resetAll"),
    confirmText: t("yes"),
    cancelText: t("cancel")
  });

  if (!confirmReset) return;

  resetFoodScanner();
});

// ========================================
// CANCEL INPUT MANUAL
// ========================================

const cancelMealButton = $("cancelMeal");

cancelMealButton?.addEventListener("click", () => {
  $("foodName").value = "";
  $("foodWeight").value = 100;

  $("result").hidden = true;
  $("resultDetails").textContent = "";

  currentResult = null;
  selectedSuggestedFood = null;

  $("foodSuggestions").hidden = true;
  $("suggestionList").innerHTML = "";
});

// ========================================
// STICKY HEADER ANIMATION
// ========================================

function initializeStickyHeader() {
  const topbar = document.querySelector(".topbar");

  if (!topbar) return;

  function updateHeader() {
    topbar.classList.toggle(
      "is-scrolled",
      window.scrollY > 20
    );
  }

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });

  updateHeader();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeStickyHeader
  );
} else {
  initializeStickyHeader();
}

// ========================================
// WELCOME GREETING
// ========================================

function updateWelcomeGreeting() {
  const greeting = $("welcomeGreeting");

  if (!greeting) return;

  let profile = {};

  try {
    profile = JSON.parse(
      localStorage.getItem("kaloriku_profile") || "{}"
    );
  } catch (error) {
    console.error("Gagal membaca profil:", error);
  }

  const name = profile.name?.trim();

  greeting.textContent = name
    ? (window.getLanguage?.() === "en"
        ? `Hello, ${name}! 👋`
        : `Halo, ${name}! 👋`)
    : t("greeting");
}

updateWelcomeGreeting();

window.addEventListener(
  "profileUpdated",
  updateWelcomeGreeting
);

// ========================================
// DASHBOARD AVATAR
// ========================================

function updateDashboardAvatar() {
  const avatar = $("dashboardAvatar");
  const photo = $("dashboardAvatarPhoto");
  const initial = $("dashboardAvatarInitial");

  if (!avatar || !photo || !initial) return;

  let profile = {};

  try {
    profile = JSON.parse(
      localStorage.getItem("kaloriku_profile") || "{}"
    );
  } catch (error) {
    console.error("Gagal membaca profil:", error);
  }

  if (profile.photo) {
    photo.src = profile.photo;
    photo.hidden = false;
    initial.hidden = true;
  } else {
    photo.removeAttribute("src");
    photo.hidden = true;
    initial.hidden = false;

    initial.textContent =
      profile.name?.trim().charAt(0).toUpperCase() || "K";
  }
}

updateDashboardAvatar();

window.addEventListener(
  "profileUpdated",
  updateDashboardAvatar
);

// ========================================
// LANGUAGE CHANGED
// ========================================

window.addEventListener("languageChanged", async () => {
  updateWelcomeGreeting();
  updateDashboardAvatar();

  setAnalysisStatus(
    analysisStatusType,
    analysisStatusValue
  );

  if (
    latestDetectedFoods &&
    !$("analysisResults").hidden
  ) {
    await renderDetectedFoods(latestDetectedFoods);
  }

  if (currentResult && !$("result").hidden) {
    $("resultDetails").textContent =
      `${Math.round(currentResult.kcal)} ${t("calories")} | ` +
      `${t("protein")} ${currentResult.protein.toFixed(1)} g | ` +
      `${t("carbohydrates")} ${currentResult.carbs.toFixed(1)} g | ` +
      `${t("fat")} ${currentResult.fat.toFixed(1)} g`;
  }
});