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
  createMealId
} from "./firestore-meals.js";

import {
  updateDashboard
} from "./dashboard-render.js";

import {
  analyzeFoodPhoto
} from "./food-analysis.js";

const $ = id => document.getElementById(id);

let currentResult = null;
let selectedSuggestedFood = null;
let pangankuFoods = {};



let previewObjectUrl = null;

// Mengembalikan scanner ke kondisi awal
function resetFoodScanner() {
  // Reset foto
  $("foodPhoto").value = "";

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
  }

  $("preview").src = "";
  $("preview").hidden = true;

  // Reset tombol dan status analisis
  $("analyzeButton").disabled = true;
  $("analysisStatus").textContent = "";

  // Hapus hasil analisis sebelumnya
  $("analysisResults").hidden = true;
  $("detectedFoods").innerHTML = "";

  // Reset input makanan manual
  $("foodName").value = "";
  $("foodWeight").value = 100;

  // Reset hasil perhitungan
  $("result").hidden = true;
  $("resultDetails").textContent = "";

  // Reset sugesti makanan
  $("foodSuggestions").hidden = true;
  $("suggestionList").innerHTML = "";

  // Reset variabel sementara
  currentResult = null;
  selectedSuggestedFood = null;
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
    alert("Pilih file gambar.");
    event.target.value = "";
    return;
  }

  // Hapus URL foto sebelumnya
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }

  previewObjectUrl = URL.createObjectURL(file);

  $("preview").src = previewObjectUrl;
  $("preview").hidden = false;

  $("analyzeButton").disabled = false;
  $("analysisStatus").textContent = "";
  $("analysisResults").hidden = true;
  $("detectedFoods").innerHTML = "";
});



// Analisis foto menggunakan modul food-analysis.js
$("analyzeButton").addEventListener("click", async () => {
  const file = $("foodPhoto").files[0];

  if (!file) {
    alert("Pilih foto makanan terlebih dahulu.");
    return;
  }

  $("analyzeButton").disabled = true;

  $("analysisStatus").textContent =
    "AI sedang menganalisis foto makanan...";

  $("analysisResults").hidden = true;

  try {
    const foods = await analyzeFoodPhoto(file);

    await renderDetectedFoods(foods);

    $("analysisStatus").textContent =
      `AI menemukan ${foods.length} makanan.`;

    $("analysisResults").hidden = false;

  } catch (error) {
    console.error(error);

    $("analysisStatus").textContent =
      error.message || "Terjadi kesalahan saat menghubungi AI.";

  } finally {
    $("analyzeButton").disabled = false;
  }
});

// Menampilkan makanan hasil identifikasi AI

async function renderDetectedFoods(foodList) {
  await pangankuDatabasePromise;

  const container = $("detectedFoods");
  container.innerHTML = "";

  const total = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
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
      `Perkiraan berat: ${weight} gram`;

    const confidence = document.createElement("small");
    confidence.textContent =
      `Keyakinan AI: ${food.confidence || "Tidak diketahui"}`;

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

      total.kcal += kcal;
      total.protein += protein;
      total.carbs += carbs;
      total.fat += fat;

      nutritionInfo.textContent =
        `${Math.round(kcal)} kkal | ` +
        `Protein ${protein.toFixed(1)} g | ` +
        `Karbohidrat ${carbs.toFixed(1)} g | ` +
        `Lemak ${fat.toFixed(1)} g`;

    } else {
      nutritionInfo.textContent =
        "Data nutrisi belum ditemukan di Panganku.";

      const statusDot = document.createElement("span");
      statusDot.className = "nutrition-status-dot";
      statusDot.title = "Data nutrisi belum ditemukan";

      nameRow.appendChild(statusDot);
    }

    info.append(
      nameRow,
      weightText,
      confidence,
      nutritionInfo
    );

    // Satu tombol Edit untuk setiap card
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.className = "small-select-button";

    
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

    onDelete: (deletedFood) => {
      // Hapus makanan dari hasil analisis
      const index = foodList.indexOf(deletedFood);

      if (index !== -1) {
        foodList.splice(index, 1);
      }

      // Reset hasil perhitungan manual
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
  addFoodButton.textContent = "+ Tambah Makanan";
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
          confidence: "Dipilih manual"
        });

        // Reset hasil perhitungan manual
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
  totalTitle.textContent = "Total Nutrisi Makanan";

  const totalText = document.createElement("p");
  totalText.textContent =
    `${Math.round(total.kcal)} kkal | ` +
    `Protein ${total.protein.toFixed(1)} g | ` +
    `Karbohidrat ${total.carbs.toFixed(1)} g | ` +
    `Lemak ${total.fat.toFixed(1)} g`;

  totalInfo.append(totalTitle, totalText);
  totalBox.appendChild(totalInfo);

  // Simpan seluruh makanan sebagai satu kelompok
  const saveGroupButton = document.createElement("button");
  saveGroupButton.type = "button";
  saveGroupButton.textContent = "Simpan Makanan";
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
      alert(
        "Belum ada makanan dengan data nutrisi Panganku yang bisa disimpan."
      );
      return;
    }

    const groupTotal = foodsToSave.reduce((sum, food) => {
      sum.kcal += food.kcal;
      sum.protein += food.protein || 0;
      sum.carbs += food.carbs || 0;
      sum.fat += food.fat || 0;

      return sum;
    }, {
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    });

    const meals = getMeals();

    meals.push({
  id: createMealId(),
  name: "Menu dari foto",
      foods: foodsToSave,
      foodCount: foodsToSave.length,
      ...groupTotal,
      date: new Date().toLocaleDateString("sv-SE"),
      createdAt: Date.now()
    });

    saveMeals(meals);

    updateDashboard();
    resetFoodScanner();

    alert("Seluruh makanan berhasil disimpan dalam satu kelompok.");
  });

  // Tombol Batal
const cancelGroupButton = document.createElement("button");
cancelGroupButton.type = "button";
cancelGroupButton.textContent = "Batal";
cancelGroupButton.className = "cancel-button";

cancelGroupButton.addEventListener("click", () => {
  const confirmCancel = confirm(
    "Batalkan hasil identifikasi makanan?"
  );

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
        Makanan "${escapeHTML(query)}" belum ditemukan dalam database Panganku.
      </p>
      <p class="suggestion-hint">
        Coba gunakan nama makanan lain atau nama yang lebih spesifik.
      </p>
    `;

    return;
  }

  suggestions.forEach(item => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "suggestion-item";
    button.textContent =
      `${item.name} — ${item.food.kcal} kkal / 100 g`;

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
    alert("Isi nama makanan dan berat yang benar.");
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
    alert("Data energi makanan ini tidak tersedia di Panganku.");
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
    water: food.water,
    source: food.source,
    code: food.code
  };

  $("resultDetails").textContent =
    `${Math.round(currentResult.kcal)} kkal | ` +
    `Protein ${currentResult.protein.toFixed(1)} g | ` +
    `Karbohidrat ${currentResult.carbs.toFixed(1)} g | ` +
    `Lemak ${currentResult.fat.toFixed(1)} g`;

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

  updateDashboard();

  resetFoodScanner();

  alert("Makanan berhasil disimpan.");
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

const resetMealButton = $("resetMeal");

resetMealButton?.addEventListener("click", () => {
  const confirmReset = confirm(
    "Reset seluruh isian dan hasil analisis makanan?"
  );

  if (!confirmReset) return;

  resetFoodScanner();
});

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
    ? `Halo, ${name}! 👋`
    : "Halo, selamat datang! 👋";
}

updateWelcomeGreeting();

window.addEventListener("profileUpdated", updateWelcomeGreeting);

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

window.addEventListener("profileUpdated", updateDashboardAvatar);