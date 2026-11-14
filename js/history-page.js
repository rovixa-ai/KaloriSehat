
import {
  getMeals,
  getTarget
} from "./meal-storage.js";

const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function formatDate(dateString) {
  if (!dateString) return "Tanggal tidak diketahui";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function getMealItems(meal) {
  if (Array.isArray(meal.foods)) {
    return meal.foods;
  }

  return [meal];
}


function formatNutrient(value, unit) {
  const number = Number(value);

  if (value === null || value === undefined || value === "" ||
      !Number.isFinite(number)) {
    return "—";
  }

  return `${number.toLocaleString("id-ID", {
    maximumFractionDigits: 2
  })} ${unit}`;
}

function renderFoodNutrition(food) {
  const nutrients = [
    { label: "Kalori", value: food.kcal, unit: "kkal" },
    { label: "Protein", value: food.protein, unit: "g" },
    { label: "Karbohidrat", value: food.carbs, unit: "g" },
    { label: "Lemak", value: food.fat, unit: "g" },
    { label: "Serat", value: food.fiber, unit: "g" },
    { label: "Natrium", value: food.sodium, unit: "mg" },
    { label: "Air", value: food.water, unit: "g" }
  ];

  return `
    <div class="history-nutrition-grid">
      ${nutrients.map(item => `
        <div class="history-nutrition-item">
          <span>${item.label}</span>
          <strong>${formatNutrient(item.value, item.unit)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}


function calculateDailyNutrition(dailyMeals) {
  const nutrients = [
    { key: "kcal", label: "Kalori", unit: "kkal" },
    { key: "protein", label: "Protein", unit: "g" },
    { key: "carbs", label: "Karbohidrat", unit: "g" },
    { key: "fat", label: "Lemak", unit: "g" },
    { key: "fiber", label: "Serat", unit: "g" },
    { key: "sodium", label: "Natrium", unit: "mg" },
    { key: "water", label: "Air", unit: "g" }
  ];

  // Ambil isi makanan tanpa menjumlahkan total kelompok dua kali
  const foods = dailyMeals.flatMap(meal =>
    Array.isArray(meal.foods) && meal.foods.length
      ? meal.foods
      : [meal]
  );

  return nutrients.map(nutrient => {
    const values = foods.map(food => {
      const value = food[nutrient.key];

      return value === null || value === undefined || value === ""
        ? null
        : Number(value);
    });

    const complete = values.every(value =>
      value !== null && Number.isFinite(value)
    );

    return {
      ...nutrient,
      total: complete
        ? values.reduce((sum, value) => sum + value, 0)
        : null
    };
  });
}


function renderDailySummary(dailyMeals) {
  const nutrients = calculateDailyNutrition(dailyMeals);

  const getNutrient = (key) =>
    nutrients.find(item => item.key === key)?.total ?? null;

  const kcal = getNutrient("kcal");
  const protein = getNutrient("protein");
  const carbs = getNutrient("carbs");
  const fat = getNutrient("fat");

  const target = Number(getTarget());
  const validTarget = Number.isFinite(target) && target > 0;

  const validKcal = kcal !== null && Number.isFinite(kcal);
  const progress = validTarget && validKcal
    ? (kcal / target) * 100
    : null;

  const progressWidth = progress === null
    ? 0
    : Math.min(progress, 100);

  const remaining = validTarget && validKcal
    ? target - kcal
    : null;

  const macroValuesValid = [protein, carbs, fat].every(value =>
    value !== null && Number.isFinite(value) && value >= 0
  );

  const proteinCalories = macroValuesValid ? protein * 4 : 0;
  const carbCalories = macroValuesValid ? carbs * 4 : 0;
  const fatCalories = macroValuesValid ? fat * 9 : 0;

  const macroTotal =
    proteinCalories + carbCalories + fatCalories;

  const proteinPercent = macroTotal > 0
    ? (proteinCalories / macroTotal) * 100
    : 0;

  const carbPercent = macroTotal > 0
    ? (carbCalories / macroTotal) * 100
    : 0;

  const fatPercent = macroTotal > 0
    ? (fatCalories / macroTotal) * 100
    : 0;

  const macroChart = macroValuesValid && macroTotal > 0
    ? `
      <div
        class="history-macro-donut"
        style="background: conic-gradient(
          var(--history-blue) 0% ${proteinPercent}%,
          var(--history-orange) ${proteinPercent}% ${proteinPercent + carbPercent}%,
          var(--history-purple) ${proteinPercent + carbPercent}% 100%
        )"
      >
        <div class="history-macro-donut-center">
          <strong>3</strong>
          <span>Makro</span>
        </div>
      </div>

      <div class="history-macro-legend">
        <div>
          <i class="protein-dot"></i>
          <span>Protein</span>
          <strong>${protein.toLocaleString("id-ID", {
            maximumFractionDigits: 1
          })} g</strong>
        </div>

        <div>
          <i class="carbs-dot"></i>
          <span>Karbo</span>
          <strong>${carbs.toLocaleString("id-ID", {
            maximumFractionDigits: 1
          })} g</strong>
        </div>

        <div>
          <i class="fat-dot"></i>
          <span>Lemak</span>
          <strong>${fat.toLocaleString("id-ID", {
            maximumFractionDigits: 1
          })} g</strong>
        </div>
      </div>
    `
    : `
      <p class="history-macro-unavailable">
        Data makro belum lengkap untuk menampilkan grafik.
      </p>
    `;

  const summaryItems = nutrients
    .filter(item => item.key !== "kcal")
    .map(item => `
      <div class="history-summary-item">
        <span>${item.label}</span>
        <strong>${formatNutrient(item.total, item.unit)}</strong>
      </div>
    `).join("");

  return `
    <div class="history-daily-summary">

      <div class="history-summary-header">
        <div>
          <span>Nutrition performance</span>
          <strong>Ringkasan harian</strong>
        </div>

        <span class="history-meal-count">
          ${dailyMeals.length} catatan
        </span>
      </div>

      <!-- KALORI UTAMA -->

      <div class="history-calorie-panel">
        <div class="history-calorie-heading">
          <span>Total asupan kalori</span>
          <span class="history-calorie-badge">KALORI</span>
        </div>

        <div class="history-calorie-number">
          <strong>${formatNutrient(kcal, "kkal")}</strong>
        </div>

        <div class="history-target-info">
          <span>Target harian</span>
          <strong>
            ${validTarget
              ? formatNutrient(target, "kkal")
              : "Belum diatur"}
          </strong>
        </div>

        ${
          progress !== null
            ? `
              <div class="history-progress-track">
                <div
                  class="history-progress-fill"
                  style="width: ${progressWidth}%"
                ></div>
              </div>

              <div class="history-progress-caption">
                <strong>${progress.toLocaleString("id-ID", {
                  maximumFractionDigits: 1
                })}% tercapai</strong>

                <span>
                  ${remaining >= 0
                    ? `Sisa ${formatNutrient(remaining, "kkal")}`
                    : `Melebihi ${formatNutrient(Math.abs(remaining), "kkal")}`}
                </span>
              </div>
            `
            : `
              <p class="history-target-unavailable">
                ${
                  !validTarget
                    ? "Atur target kalori di profil untuk melihat progres."
                    : "Data kalori belum lengkap."
                }
              </p>
            `
        }
      </div>

      <!-- GRAFIK MAKRO -->

      <div class="history-macro-section">
        <div class="history-macro-heading">
          <div>
            <span>Komposisi nutrisi</span>
            <strong>Distribusi makronutrisi</strong>
          </div>
        </div>

        <div class="history-macro-content">
          ${macroChart}
        </div>
      </div>

      <!-- NUTRISI LAINNYA -->

      <div class="history-summary-heading">
        <span>Detail nutrisi</span>
        <strong>Total asupan</strong>
      </div>

      <div class="history-summary-grid">
        ${summaryItems}
      </div>

    </div>
  `;
}



function renderHistoryPage(selectedDate = "") {
  const container = $("fullHistoryList");
  const countElement = $("historyCount");

  if (!container || !countElement) return;

  let meals = getMeals().slice();

  // Filter berdasarkan satu tanggal
  if (selectedDate) {
    meals = meals.filter(meal => meal.date === selectedDate);
  }

  meals.sort((a, b) => {
    const dateA = a.createdAt || new Date(a.date || 0).getTime();
    const dateB = b.createdAt || new Date(b.date || 0).getTime();
    return dateB - dateA;
  });

  countElement.textContent = `${meals.length} catatan`;

  if (meals.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">▤</div>
        <h3>${selectedDate ? "Tidak ada riwayat" : "Belum ada riwayat"}</h3>
        <p>
          ${selectedDate
            ? "Tidak ada makanan yang disimpan pada tanggal ini."
            : "Makanan yang kamu simpan akan muncul di sini."}
        </p>
      </div>
    `;
    return;
  }

  const groupedMeals = {};

  meals.forEach(meal => {
    const date = meal.date || "Tanggal tidak diketahui";

    if (!groupedMeals[date]) {
      groupedMeals[date] = [];
    }

    groupedMeals[date].push(meal);
  });

  container.innerHTML = Object.entries(groupedMeals)
    .map(([date, dailyMeals], dayIndex) => {
      
      
const mealCards = dailyMeals.map((meal, mealIndex) => {
  const foods = Array.isArray(meal.foods)
    ? meal.foods
    : [meal];

  const foodList = foods.map(food => {
    const name = escapeHTML(food.name || "Makanan");

    const weight = Number(
      food.weight ?? food.estimatedWeight
    );

    const kcal = Number(food.kcal) || 0;

    return `
      <div class="history-food-item">
        <div>
          <strong>${name}</strong>
          <small>
            ${Number.isFinite(weight) && weight > 0
              ? `${weight} gram`
              : "Berat tidak tersedia"}
          </small>
        </div>
        <span>${Math.round(kcal)} kkal</span>
      </div>
    `;
  }).join("");

  const infoId = `history-info-${dayIndex}-${mealIndex}`;

  const nutritionDetails = foods.map(food => `
    <div class="history-food-nutrition">
      <strong>${escapeHTML(food.name || "Makanan")}</strong>
      ${renderFoodNutrition(food)}
    </div>
  `).join("");

  return `
    <article class="history-record">
      <div class="history-record-header">
        <strong>${escapeHTML(meal.name || "Catatan makanan")}</strong>
        <b>${Math.round(Number(meal.kcal) || 0)} kkal</b>
      </div>

      <div class="history-food-list">
        ${foodList}
      </div>

      <button
        type="button"
        class="history-info-button"
        data-info-target="${infoId}"
      >
        <span>ⓘ</span> Info Nutrisi
      </button>

      <div
        id="${infoId}"
        class="history-info-panel"
        hidden
      >
        ${nutritionDetails}
      </div>
    </article>
  `;
}).join("");


      return `
        <section class="history-day">
          <div class="history-day-header">
  <h3>${escapeHTML(formatDate(date))}</h3>
</div>

${renderDailySummary(dailyMeals)}
          ${mealCards}
        </section>
      `;
    }).join("");
}


function initializeHistoryPage() {
  

  
  const dateInput = $("historyDate");
  const resetButton = $("resetHistoryFilter");

  dateInput?.addEventListener("change", () => {
    renderHistoryPage(dateInput.value);
  });

  resetButton?.addEventListener("click", () => {
    if (dateInput) {
      dateInput.value = "";
    }

    renderHistoryPage();
  });


  document.addEventListener("kaloriku:pagechange", (event) => {
  if (event.detail.pageId === "historyPage") {
    renderHistoryPage();
  }
});

  
const historyContainer = $("fullHistoryList");

historyContainer?.addEventListener("click", event => {
  const button = event.target.closest("[data-info-target]");

  if (!button) return;

  const panel = document.getElementById(
    button.dataset.infoTarget
  );

  if (!panel) return;

  panel.hidden = !panel.hidden;

  button.innerHTML = panel.hidden
    ? "<span>ⓘ</span> Info Nutrisi"
    : "<span>⌃</span> Tutup Info";
});

}

initializeHistoryPage();
