
import {
  getMeals,
  getTarget
} from "./meal-storage.js";

const $ = (id) => document.getElementById(id);

// =========================================
// SISTEM TERJEMAHAN
// =========================================

const t = (key) => window.t?.(key) ?? key;

function getLocale() {
  return window.getLanguage?.() === "en" ? "en-US" : "id-ID";
}

function numberFormat(value, maximumFractionDigits = 2) {
  return Number(value).toLocaleString(getLocale(), {
    maximumFractionDigits
  });
}

// =========================================
// UTILITAS
// =========================================

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
  if (!dateString) {
    return t("historyDynamic.unknownDate");
  }

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(getLocale(), {
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

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(number)
  ) {
    return "—";
  }

  return `${numberFormat(number)} ${unit}`;
}

// =========================================
// DETAIL NUTRISI MAKANAN
// =========================================

function renderFoodNutrition(food) {
  const nutrients = [
    {
      label: t("historyDynamic.calories"),
      value: food.kcal,
      unit: "kcal"
    },
    {
      label: t("historyDynamic.protein"),
      value: food.protein,
      unit: "g"
    },
    {
      label: t("historyDynamic.carbohydrates"),
      value: food.carbs,
      unit: "g"
    },
    {
      label: t("historyDynamic.fat"),
      value: food.fat,
      unit: "g"
    },
    {
      label: t("historyDynamic.fiber"),
      value: food.fiber,
      unit: "g"
    },
    {
      label: t("historyDynamic.sodium"),
      value: food.sodium,
      unit: "mg"
    },
    {
      label: t("historyDynamic.water"),
      value: food.water,
      unit: "g"
    }
  ];

  return `
    <div class="history-nutrition-grid">
      ${nutrients.map(item => `
        <div class="history-nutrition-item">
          <span>${escapeHTML(item.label)}</span>
          <strong>${formatNutrient(item.value, item.unit)}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

// =========================================
// PERHITUNGAN NUTRISI HARIAN
// =========================================

function calculateDailyNutrition(dailyMeals) {
  const nutrients = [
    {
      key: "kcal",
      label: t("historyDynamic.calories"),
      unit: "kcal"
    },
    {
      key: "protein",
      label: t("historyDynamic.protein"),
      unit: "g"
    },
    {
      key: "carbs",
      label: t("historyDynamic.carbohydrates"),
      unit: "g"
    },
    {
      key: "fat",
      label: t("historyDynamic.fat"),
      unit: "g"
    },
    {
      key: "fiber",
      label: t("historyDynamic.fiber"),
      unit: "g"
    },
    {
      key: "sodium",
      label: t("historyDynamic.sodium"),
      unit: "mg"
    },
    {
      key: "water",
      label: t("historyDynamic.water"),
      unit: "g"
    }
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

// =========================================
// RINGKASAN HARIAN
// =========================================

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

  // Grafik makronutrisi
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
          <span>${escapeHTML(t("historyDynamic.macro"))}</span>
        </div>
      </div>

      <div class="history-macro-legend">
        <div>
          <i class="protein-dot"></i>
          <span>${escapeHTML(t("historyDynamic.protein"))}</span>
          <strong>${numberFormat(protein, 1)} g</strong>
        </div>

        <div>
          <i class="carbs-dot"></i>
          <span>${escapeHTML(t("historyDynamic.carbohydrateShort"))}</span>
          <strong>${numberFormat(carbs, 1)} g</strong>
        </div>

        <div>
          <i class="fat-dot"></i>
          <span>${escapeHTML(t("historyDynamic.fat"))}</span>
          <strong>${numberFormat(fat, 1)} g</strong>
        </div>
      </div>
    `
    : `
      <p class="history-macro-unavailable">
        ${escapeHTML(t("historyDynamic.incompleteMacro"))}
      </p>
    `;

  // Detail nutrisi lainnya
  const summaryItems = nutrients
    .filter(item => item.key !== "kcal")
    .map(item => `
      <div class="history-summary-item">
        <span>${escapeHTML(item.label)}</span>
        <strong>${formatNutrient(item.total, item.unit)}</strong>
      </div>
    `).join("");

  return `
    <div class="history-daily-summary">

      <div class="history-summary-header">
        <div>
          <span>${escapeHTML(t("historyDynamic.nutritionPerformance"))}</span>
          <strong>${escapeHTML(t("historyDynamic.dailySummary"))}</strong>
        </div>

        <span class="history-meal-count">
          ${dailyMeals.length} ${escapeHTML(t("historyPage.recordCount"))}
        </span>
      </div>

      <!-- KALORI UTAMA -->

      <div class="history-calorie-panel">
        <div class="history-calorie-heading">
          <span>${escapeHTML(t("historyDynamic.totalCalories"))}</span>
          <span class="history-calorie-badge">
            ${escapeHTML(t("historyDynamic.calorieBadge"))}
          </span>
        </div>

        <div class="history-calorie-number">
          <strong>${formatNutrient(kcal, "kcal")}</strong>
        </div>

        <div class="history-target-info">
          <span>${escapeHTML(t("historyDynamic.dailyTarget"))}</span>
          <strong>
            ${validTarget
              ? formatNutrient(target, "kcal")
              : escapeHTML(t("historyDynamic.notSet"))}
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
                <strong>
                  ${numberFormat(progress, 1)}%
                  ${escapeHTML(t("historyDynamic.achieved"))}
                </strong>

                <span>
                  ${remaining >= 0
                    ? `${escapeHTML(t("historyDynamic.remaining"))} ${formatNutrient(remaining, "kcal")}`
                    : `${escapeHTML(t("historyDynamic.exceeded"))} ${formatNutrient(Math.abs(remaining), "kcal")}`}
                </span>
              </div>
            `
            : `
              <p class="history-target-unavailable">
                ${
                  !validTarget
                    ? escapeHTML(t("historyDynamic.setCalorieTarget"))
                    : escapeHTML(t("historyDynamic.incompleteCalories"))
                }
              </p>
            `
        }
      </div>

      <!-- GRAFIK MAKRO -->

      <div class="history-macro-section">
        <div class="history-macro-heading">
          <div>
            <span>${escapeHTML(t("historyDynamic.nutritionComposition"))}</span>
            <strong>${escapeHTML(t("historyDynamic.macroDistribution"))}</strong>
          </div>
        </div>

        <div class="history-macro-content">
          ${macroChart}
        </div>
      </div>

      <!-- NUTRISI LAINNYA -->

      <div class="history-summary-heading">
        <span>${escapeHTML(t("historyDynamic.nutritionDetails"))}</span>
        <strong>${escapeHTML(t("historyDynamic.totalIntake"))}</strong>
      </div>

      <div class="history-summary-grid">
        ${summaryItems}
      </div>

    </div>
  `;
}

// =========================================
// HALAMAN RIWAYAT MAKANAN
// =========================================

function renderHistoryPage(selectedDate = "") {
  const container = $("fullHistoryList");
  const countElement = $("historyCount");

  if (!container || !countElement) return;

  let meals = getMeals().slice();

  // Filter berdasarkan tanggal
  if (selectedDate) {
    meals = meals.filter(meal => meal.date === selectedDate);
  }

  // Urutkan dari terbaru
  meals.sort((a, b) => {
    const dateA = a.createdAt || new Date(a.date || 0).getTime();
    const dateB = b.createdAt || new Date(b.date || 0).getTime();

    return dateB - dateA;
  });

  countElement.textContent =
    `${meals.length} ${t("historyPage.recordCount")}`;

  // Tampilan ketika belum ada riwayat
  if (meals.length === 0) {
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">▤</div>

        <h3>
          ${escapeHTML(
            selectedDate
              ? t("historyDynamic.noHistory")
              : t("historyDynamic.emptyHistory")
          )}
        </h3>

        <p>
          ${escapeHTML(
            selectedDate
              ? t("historyDynamic.noHistoryDate")
              : t("historyDynamic.emptyHistoryDescription")
          )}
        </p>
      </div>
    `;

    return;
  }

  // Kelompokkan makanan berdasarkan tanggal
  const groupedMeals = {};

  meals.forEach(meal => {
    const date = meal.date || t("historyDynamic.unknownDate");

    if (!groupedMeals[date]) {
      groupedMeals[date] = [];
    }

    groupedMeals[date].push(meal);
  });

  container.innerHTML = Object.entries(groupedMeals)
    .map(([date, dailyMeals], dayIndex) => {

      // Kartu makanan
      const mealCards = dailyMeals.map((meal, mealIndex) => {
        const foods = Array.isArray(meal.foods)
          ? meal.foods
          : [meal];

        const foodList = foods.map(food => {
          const name = escapeHTML(
            food.name || t("historyDynamic.food")
          );

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
                    ? `${numberFormat(weight)} ${escapeHTML(t("historyDynamic.gram"))}`
                    : escapeHTML(t("historyDynamic.weightUnavailable"))}
                </small>
              </div>

              <span>${numberFormat(Math.round(kcal))} kcal</span>
            </div>
          `;
        }).join("");

        const infoId = `history-info-${dayIndex}-${mealIndex}`;

        const nutritionDetails = foods.map(food => `
          <div class="history-food-nutrition">
            <strong>
              ${escapeHTML(food.name || t("historyDynamic.food"))}
            </strong>

            ${renderFoodNutrition(food)}
          </div>
        `).join("");

        return `
          <article class="history-record">

            <div class="history-record-header">
              <strong>
                ${escapeHTML(meal.name || t("historyDynamic.foodRecord"))}
              </strong>

              <b>
                ${numberFormat(Math.round(Number(meal.kcal) || 0))} kcal
              </b>
            </div>

            <div class="history-food-list">
              ${foodList}
            </div>

            <button
              type="button"
              class="history-info-button"
              data-info-target="${infoId}"
            >
              <span>ⓘ</span>
              ${escapeHTML(t("historyDynamic.nutritionInfo"))}
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

// =========================================
// INISIALISASI HALAMAN
// =========================================

function initializeHistoryPage() {
  const dateInput = $("historyDate");
  const resetButton = $("resetHistoryFilter");

  // Filter tanggal
  dateInput?.addEventListener("change", () => {
    renderHistoryPage(dateInput.value);
  });

  // Reset filter
  resetButton?.addEventListener("click", () => {
    if (dateInput) {
      dateInput.value = "";
    }

    renderHistoryPage();
  });

  // Ketika halaman riwayat dibuka
  document.addEventListener("kaloriku:pagechange", (event) => {
    if (event.detail?.pageId === "historyPage") {
      renderHistoryPage(dateInput?.value || "");
    }
  });

  // Ketika bahasa diganti
  window.addEventListener("languageChanged", () => {
    renderHistoryPage(dateInput?.value || "");
  });

  // Tombol buka/tutup detail nutrisi
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
      ? `<span>ⓘ</span> ${escapeHTML(t("historyDynamic.nutritionInfo"))}`
      : `<span>⌃</span> ${escapeHTML(t("historyDynamic.closeInfo"))}`;
  });

  // Render awal
  renderHistoryPage(dateInput?.value || "");
}

initializeHistoryPage();
