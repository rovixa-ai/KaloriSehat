import { getDashboardData } from "./dashboard.js";

import {
  getTarget,
  saveTarget,
  getNutritionTargets
} from "./meal-storage.js";

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderToday() {
  const element = $("today");
  if (!element) return;

  element.textContent = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function renderHistory(meals) {
  const container = $("historyList");
  if (!container) return;

  if (!meals.length) {
    container.innerHTML =
      '<div class="empty-history">Belum ada makanan hari ini.</div>';
    return;
  }

  container.innerHTML = meals.map(meal => {
    if (Array.isArray(meal.foods)) {
      return `
        <div class="history-item">
          <div>
            <b>${escapeHTML(meal.name)}</b>
            <div>${meal.foodCount || meal.foods.length} jenis makanan</div>
            <div class="history-food-details">
              ${meal.foods.map(food => `
                <div>
                  ${escapeHTML(food.name)}
                  (${Number(food.weight) || 0} g)
                </div>
              `).join("")}
            </div>
          </div>
          <strong>${Math.round(meal.kcal)} kkal</strong>
        </div>
      `;
    }

    return `
      <div class="history-item">
        <div>
          <b>${escapeHTML(meal.name)}</b>
          <div>${meal.weight} gram</div>
        </div>
        <strong>${Math.round(meal.kcal)} kkal</strong>
      </div>
    `;
  }).join("");
}

export function updateDashboard() {
  const {
    meals,
    total,
    target,
    remaining
  } = getDashboardData();

    const nutritionTargets = getNutritionTargets();

  if ($("totalCalories")) {
    $("totalCalories").textContent = Math.round(total.kcal);
  }

  if ($("targetText")) {
    $("targetText").textContent = target;
  }

  if ($("remainingCalories")) {
    $("remainingCalories").textContent = Math.round(remaining);
  }

  if ($("progressBar")) {
    const progress = target > 0
  ? Math.min(100, total.kcal / target * 100)
  : 0;

    $("progressBar").style.width = progress + "%";
  }

  if ($("totalProtein")) {
    $("totalProtein").textContent =
      total.protein.toFixed(1) + " g";
  }

  if ($("totalCarbs")) {
    $("totalCarbs").textContent =
      total.carbs.toFixed(1) + " g";
  }

  if ($("totalFat")) {
    $("totalFat").textContent =
      total.fat.toFixed(1) + " g";
  }

    // Menampilkan target nutrisi.
  if ($("proteinTargetText")) {
    $("proteinTargetText").textContent = nutritionTargets.protein;
  }

  if ($("carbsTargetText")) {
    $("carbsTargetText").textContent = nutritionTargets.carbs;
  }

  if ($("fatTargetText")) {
    $("fatTargetText").textContent = nutritionTargets.fat;
  }

  // Mengatur panjang progress bar.
  const setNutritionProgress = (id, consumed, target) => {
    const bar = $(id);
    if (!bar) return;

    const progress = target > 0
      ? Math.min(100, (consumed / target) * 100)
      : 0;

    bar.style.width = progress + "%";
  };

  setNutritionProgress(
    "proteinProgress",
    total.protein,
    nutritionTargets.protein
  );

  setNutritionProgress(
    "carbsProgress",
    total.carbs,
    nutritionTargets.carbs
  );

  setNutritionProgress(
    "fatProgress",
    total.fat,
    nutritionTargets.fat
  );

  renderHistory(meals);
}

function setupTargetButton() {
  const button = $("editTarget");
  if (!button) return;

  button.addEventListener("click", () => {
    const value = prompt(
      "Masukkan target kalori harian:",
      getTarget()
    );

    if (value === null) return;

    const target = Number(value);

    if (!Number.isFinite(target) || target <= 0) {
      alert("Target harus berupa angka positif.");
      return;
    }

    saveTarget(target);
    updateDashboard();
  });
}

function initializeDashboard() {
  renderToday();
  updateDashboard();

  // Memperbarui Dashboard ketika target Profil berubah.
  window.addEventListener("profileTargetUpdated", updateDashboard);
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
  );
} else {
  initializeDashboard();
}