
import { getMeals } from "./meal-storage.js";

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

  return `
    <div class="history-daily-summary">
      <div class="history-summary-header">
        <div>
          <span>Total asupan nutrisi</span>
          <strong>Ringkasan harian</strong>
        </div>
        <span class="history-meal-count">
          ${dailyMeals.length} catatan
        </span>
      </div>

      <div class="history-summary-grid">
        ${nutrients.map((item, index) => `
          <div class="history-summary-item ${index === 0 ? "main-nutrient" : ""}">
            <span>${item.label}</span>
            <strong>
              ${item.total === null
                ? "—"
                : `${item.total.toLocaleString("id-ID", {
                    maximumFractionDigits: 2
                  })} ${item.unit}`}
            </strong>
          </div>
        `).join("")}
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
