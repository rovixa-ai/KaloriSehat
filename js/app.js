
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

// Sistem terjemahan
const t = key => window.t?.(`foodScanner.${key}`) ?? key;

function getLocale() {
  return window.getLanguage?.() === "en" ? "en-US" : "id-ID";
}

// Memulai sinkronisasi riwayat makanan.
startMealSync();

let currentResult = null;
let selectedSuggestedFood = null;
let pangankuFoods = {};
let previewObjectUrl = null;
let latestDetectedFoods = null;

// Status analisis agar dapat diterjemahkan ulang
let analysisStatusType = "";
let analysisStatusValue = null;

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

// Mengembalikan scanner ke kondisi awal
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
}

// Memuat database Panganku
const pangankuDatabasePromise = loadPangankuDatabase()
  .then(database => {
    pangankuFoods = database;

    // Membuat makanan gabungan tumis buncis dan wortel
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

// Mengambil alias makanan tersimpan
function getFoodAliases() {
  try {
    const savedAliases = JSON.parse(
      localStorage.getItem("kaloriku_food_aliases") || "{}"
    );

    return {
      ...foodAliases,
      ...savedAliases
    };
  } catch (error) {
    return foodAliases;
  }
}

// Menyimpan hubungan nama AI dengan nama Panganku
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

// Mengamankan teks HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Memilih foto makanan
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

// Analisis foto menggunakan modul food-analysis.js
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

// Menampilkan makanan hasil identifikasi AI
async function renderDetectedFoods(foodList) {
    await pangankuDatabasePromise;

    latestDetectedFoods = foodList;

    const container = $("detectedFoods");
    container.innerHTML = "";

    const total = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0
  };

  foodList.forEach(food => {
    const item = document.createElement("div");
    item.className = "detected-food-item";

    const info = document.createElement("div");

    // Simpan nama asli dari AI sebelum kemungkinan diubah oleh alias
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

    // Cari nutrisi di database Panganku
    const nutrition = findFood(
      food.name,
      pangankuFoods,
      getFoodAliases()
    );

    // Jika ditemukan melalui alias, gunakan nama Panganku
    if (nutrition) {
      const matchedName = Object.keys(pangankuFoods)
        .find(key => pangankuFoods[key] === nutrition);

      if (matchedName) {
        food.originalName = originalName;
        food.name = matchedName;
        name.textContent = matchedName;
      }
    }

    const nutritionInfo = document.createElement("p");

    // Tampilkan nutrisi jika ditemukan
    if (
      nutrition &&
      weight > 0 &&
      nutrition.kcal !== null
    ) {
      const factor = weight / 100;

      const kcal = nutrition.kcal * factor;
      const protein = nutrition.protein * factor;
      const carbs = nutrition.carbs * factor;
      const fat = nutrition.fat * factor;

      const water = nutrition.water === null
        ? 0
        : (Number(nutrition.water) || 0) * factor;

      total.kcal += kcal;
      total.protein += protein;
      total.carbs += carbs;
      total.fat += fat;
      total.water += water;

      nutritionInfo.textContent =
        `${Math.round(kcal)} ${t("calories")} | ` +
        `${t("protein")} ${protein.toFixed(1)} g | ` +
        `${t("carbohydrates")} ${carbs.toFixed(1)} g | ` +
        `${t("fat")} ${fat.toFixed(1)} g`;

    } else {
      nutritionInfo.textContent = t("nutritionNotFound");

      const statusDot = document.createElement("span");
      statusDot.className = "nutrition-status-dot";
      statusDot.title = t("nutritionNotFoundTitle");

      nameRow.appendChild(statusDot);
    }

    info.append(
      nameRow,
      weightText,
      confidence,
      nutritionInfo
    );

    // Tombol Edit
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
          // Simpan alias nama AI ke nama Panganku
          saveFoodAlias(
            modalOriginalName || originalName,
            selectedFoodName
          );

          // Simpan juga nama sebelumnya jika berbeda
          if (food.name !== selectedFoodName) {
            saveFoodAlias(food.name, selectedFoodName);
          }

          // Perbarui data makanan
          food.originalName = modalOriginalName || originalName;
          food.name = selectedFoodName;
          food.estimatedWeight = Number(weight);

          // Hapus hasil perhitungan manual sebelumnya
          $("result").hidden = true;
          currentResult = null;
          selectedSuggestedFood = null;

          // Hitung ulang seluruh nutrisi
          renderDetectedFoods(foodList);
        },

        onDelete: deletedFood => {
          // Hapus makanan dari hasil analisis
          const index = foodList.indexOf(deletedFood);

          if (index !== -1) {
            foodList.splice(index, 1);
          }

          $("result").hidden = true;
          currentResult = null;
          selectedSuggestedFood = null;

          // Hitung ulang seluruh nutrisi
          renderDetectedFoods(foodList);
        }
      });
    });

    item.append(info, editButton);
    container.appendChild(item);
  });

  // Tombol Tambah Makanan
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
        // Masukkan makanan baru ke daftar
        foodList.push({
          name: selectedFoodName,
          originalName: selectedFoodName,
          estimatedWeight: Number(weight),
          confidence: t("manuallySelected")
        });

        $("result").hidden = true;
        currentResult = null;
        selectedSuggestedFood = null;

        // Render ulang card dan total nutrisi
        renderDetectedFoods(foodList);
      }
    });
  });

  container.appendChild(addFoodButton);

  // Total nutrisi
  const totalBox = document.createElement("div");
  totalBox.className = "detected-food-item";

  const totalInfo = document.createElement("div");

  const totalTitle = document.createElement("strong");
  totalTitle.textContent = t("totalNutrition");

  const totalText = document.createElement("p");
  totalText.textContent =
  `${Math.round(total.kcal)} ${t("calories")} | ` +
  `${t("protein")} ${total.protein.toFixed(1)} g | ` +
  `${t("carbohydrates")} ${total.carbs.toFixed(1)} g | ` +
  `${t("fat")} ${total.fat.toFixed(1)} g | ` +
  `${Math.round(total.water)} ml ${t("water")}`;

  totalInfo.append(totalTitle, totalText);
  totalBox.appendChild(totalInfo);

  // Tombol simpan seluruh makanan
  const saveGroupButton = document.createElement("button");
  saveGroupButton.type = "button";
  saveGroupButton.textContent = t("saveFood");
  saveGroupButton.className = "save-group-button";

  saveGroupButton.addEventListener("click", () => {
    const foodsToSave = foodList
      .map(food => {
        const weight = Number(food.estimatedWeight) || 0;

        const nutrition = findFood(
          food.name,
          pangankuFoods,
          getFoodAliases()
        );

        if (
          !nutrition ||
          weight <= 0 ||
          nutrition.kcal === null
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
          fiber: nutrition.fiber === null
            ? null
            : nutrition.fiber * factor,
          sodium: nutrition.sodium === null
            ? null
            : nutrition.sodium * factor,
          water: nutrition.water === null
            ? null
            : nutrition.water * factor,
          source: nutrition.source,
          code: nutrition.code
        };
      })
      .filter(Boolean);

    if (!foodsToSave.length) {
      showAppModal({
        type: "warning",
        title: t("noData"),
        message: t("noFoodNutrition")
      });

      return;
    }

    const groupTotal = foodsToSave.reduce((sum, food) => {
  sum.kcal += Number(food.kcal) || 0;
  sum.protein += Number(food.protein) || 0;
  sum.carbs += Number(food.carbs) || 0;
  sum.fat += Number(food.fat) || 0;
  sum.water += Number(food.water) || 0;

  return sum;
}, {
  kcal: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  water: 0
});

    const meals = getMeals();

    meals.push({
      id: createMealId(),
      name: t("photoMenu"),
      foods: foodsToSave,
      foodCount: foodsToSave.length,
      ...groupTotal,
      date: new Date().toLocaleDateString("sv-SE"),
      createdAt: Date.now()
    });

    saveMeals(meals);

    // Masukkan catatan terbaru ke antrean Firestore.
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
  });

  // Tombol Batal
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
    cancelText: t("cancel")
  });

  if (!confirmCancel) return;

  resetFoodScanner();
});

  // Susun tombol dalam satu baris
  const groupActions = document.createElement("div");
  groupActions.className = "group-actions";

  groupActions.append(
    cancelGroupButton,
    saveGroupButton
  );

  totalBox.appendChild(groupActions);
  container.appendChild(totalBox);
  // Jalankan petunjuk edit makanan jika belum pernah selesai.
setTimeout(() => {
  void maybeStartFoodEditTour();
}, 700);
}

// Menampilkan sugesti makanan untuk input manual
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

// Menghitung nutrisi makanan manual
$("calculateButton").addEventListener("click", async () => {
  await pangankuDatabasePromise;

  const name = $("foodName").value.trim();
  const weight = Number($("foodWeight").value);

  if (!name || !weight || weight <= 0) {
    showAppModal({
      type: "warning",
      title: t("enterFoodData"),
      message: t("enterValidFood")
    });

    return;
  }

  const food = selectedSuggestedFood ||
    findFood(name, pangankuFoods, getFoodAliases());

  selectedSuggestedFood = null;

  if (!food) {
    showFoodSuggestions(name);
    return;
  }

  if (food.kcal === null) {
    showAppModal({
      type: "warning",
      title: t("emptyData"),
      message: t("dataUnavailable")
    });

    return;
  }

  $("foodSuggestions").hidden = true;

  const factor = weight / 100;

 currentResult = {
  name,
  weight,
  kcal: food.kcal * factor,
  protein: food.protein * factor,
  carbs: food.carbs * factor,
  fat: food.fat * factor,
  fiber: food.fiber,
  sodium: food.sodium,

  // Kandungan air disesuaikan dengan berat makanan
  water: food.water === null
    ? null
    : (Number(food.water) || 0) * factor,

  source: food.source,
  code: food.code
};

  $("resultDetails").textContent =
    `${Math.round(currentResult.kcal)} ${t("calories")} | ` +
    `${t("protein")} ${currentResult.protein.toFixed(1)} g | ` +
    `${t("carbohydrates")} ${currentResult.carbs.toFixed(1)} g | ` +
    `${t("fat")} ${currentResult.fat.toFixed(1)} g | ` +
    `${Math.round(currentResult.water)} ml ${t("water")} `;

  $("result").hidden = false;
});

// Menyimpan satu makanan manual
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

  // Masukkan catatan terbaru ke antrean Firestore.
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

// Debug pencarian Panganku
window.cariPanganku = function (kata) {
  return findFoodSuggestions(kata, pangankuFoods, 15)
    .map(x => ({
      nama: x.name,
      kcal: x.food.kcal,
      protein: x.food.protein,
      karbohidrat: x.food.carbs,
      lemak: x.food.fat
    }));
};

// Reset seluruh isian
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

// Membatalkan input makanan manual
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

/*
 * STICKY HEADER ANIMATION
 */

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

// Memperbarui sapaan berdasarkan profil tersimpan.
function updateWelcomeGreeting() {
  const greeting = document.getElementById("welcomeGreeting");

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

// Menampilkan foto profil pada header Dashboard.
function updateDashboardAvatar() {
  const avatar = document.getElementById("dashboardAvatar");
  const photo = document.getElementById("dashboardAvatarPhoto");
  const initial = document.getElementById("dashboardAvatarInitial");

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

// Memperbarui tampilan dinamis ketika bahasa diganti.
window.addEventListener("languageChanged", async () => {
  updateWelcomeGreeting();
  updateDashboardAvatar();

  // Perbarui status analisis
  setAnalysisStatus(
    analysisStatusType,
    analysisStatusValue
  );

  // Render ulang hasil identifikasi agar teks ikut berubah bahasa
  if (
    latestDetectedFoods &&
    !$("analysisResults").hidden
  ) {
    await renderDetectedFoods(latestDetectedFoods);
  }

  // Perbarui hasil perhitungan makanan manual
  if (currentResult && !$("result").hidden) {
    $("resultDetails").textContent =
      `${Math.round(currentResult.kcal)} ${t("calories")} | ` +
      `${t("protein")} ${currentResult.protein.toFixed(1)} g | ` +
      `${t("carbohydrates")} ${currentResult.carbs.toFixed(1)} g | ` +
      `${t("fat")} ${currentResult.fat.toFixed(1)} g`;
  }
});
