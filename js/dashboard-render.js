
import { getDashboardData } from "./dashboard.js";

import {
  getTarget,
  saveTarget,
  getNutritionTargets
} from "./meal-storage.js";

const $ = id => document.getElementById(id);

// Menyimpan animasi angka yang sedang berjalan.
const numberAnimations = new Map();

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ==========================================
// ANIMASI ANGKA
// ==========================================

function animateNumber(element, targetValue, suffix = "", decimals = 0) {
  if (!element) return;

  const target = Number(targetValue) || 0;
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const previousAnimation = numberAnimations.get(element);

  if (previousAnimation) {
    cancelAnimationFrame(previousAnimation);
  }

  const previousValue = Number(element.dataset.currentValue);

  const startValue = Number.isFinite(previousValue)
    ? previousValue
    : 0;

  if (reducedMotion || startValue === target) {
    element.textContent = target.toFixed(decimals) + suffix;
    element.dataset.currentValue = target;
    return;
  }

  const duration = 750;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic.
    const eased = 1 - Math.pow(1 - progress, 3);

    const currentValue =
      startValue + (target - startValue) * eased;

    element.textContent =
      currentValue.toFixed(decimals) + suffix;

    if (progress < 1) {
      const frame = requestAnimationFrame(animate);
      numberAnimations.set(element, frame);
    } else {
      element.textContent = target.toFixed(decimals) + suffix;
      element.dataset.currentValue = target;
      numberAnimations.delete(element);
    }
  }

  const frame = requestAnimationFrame(animate);
  numberAnimations.set(element, frame);
}

// ==========================================
// TANGGAL HARI INI
// ==========================================

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

// ==========================================
// RIWAYAT MAKANAN HARI INI
// ==========================================

function renderHistory(meals) {
  const container = $("historyList");
  if (!container) return;

  if (!meals || !meals.length) {
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
          <strong>${Math.round(Number(meal.kcal) || 0)} kkal</strong>
        </div>
      `;
    }

    return `
      <div class="history-item">
        <div>
          <b>${escapeHTML(meal.name)}</b>
          <div>${Number(meal.weight) || 0} gram</div>
        </div>
        <strong>${Math.round(Number(meal.kcal) || 0)} kkal</strong>
      </div>
    `;
  }).join("");
}


// ==========================================
// CIRCULAR NUTRITION PROGRESS
// KALORIKU — SYNCHRONIZED ANIMATION
// ==========================================

function setNutritionProgress(id, consumed, target) {

  const ring = $(id);
  if (!ring) return;

  const circle = ring.querySelector(".ring-fill");
  const percentage = ring.querySelector(".ring-percent");

  if (!circle || !percentage) return;

  // ------------------------------------------
  // NORMALISASI NILAI
  // ------------------------------------------

  const current = Math.max(0, Number(consumed) || 0);
  const goal = Math.max(0, Number(target) || 0);

  // ------------------------------------------
  // HITUNG PROGRESS
  // ------------------------------------------

  const progress = goal > 0
    ? Math.min(100, (current / goal) * 100)
    : 0;

  // ------------------------------------------
  // CIRCULAR SVG
  // ------------------------------------------

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = circumference;

  circle.style.strokeDashoffset =
    circumference - (progress / 100) * circumference;

  // ------------------------------------------
  // ACCESSIBILITY
  // ------------------------------------------

  ring.setAttribute("role", "progressbar");

  ring.setAttribute("aria-valuemin", "0");
  ring.setAttribute("aria-valuemax", "100");

  ring.setAttribute(
    "aria-valuenow",
    Math.round(progress)
  );

  // ------------------------------------------
  // PROGRESS STATUS
  // ------------------------------------------

  ring.dataset.progress = Math.round(progress);

  ring.dataset.reached =
    progress >= 100 ? "true" : "false";

  // ------------------------------------------
  // ANIMATED PERCENTAGE
  // ------------------------------------------

  animateNumber(
    percentage,
    Math.round(progress),
    "%",
    0
  );
}


// ==========================================
// UPDATE DASHBOARD
// ==========================================


// ==========================================
// UPDATE DASHBOARD
// KALORIKU — SYNCHRONIZED ANIMATION
// ==========================================

export function updateDashboard() {

  const {
    meals,
    total,
    target,
    remaining
  } = getDashboardData();

  const nutritionTargets = getNutritionTargets();

  // ------------------------------------------
  // NORMALISASI ANGKA
  // ------------------------------------------

  const kcal = Number(total.kcal) || 0;
  const protein = Number(total.protein) || 0;
  const carbs = Number(total.carbs) || 0;
  const fat = Number(total.fat) || 0;

  const calorieTarget = Number(target) || 0;
  const remainingCalories = Number(remaining) || 0;

  const proteinTarget = Number(nutritionTargets.protein) || 0;
  const carbsTarget = Number(nutritionTargets.carbs) || 0;
  const fatTarget = Number(nutritionTargets.fat) || 0;

  // ------------------------------------------
  // KALORI
  // ------------------------------------------

  animateNumber(
    $("totalCalories"),
    Math.round(kcal)
  );

  if ($("targetText")) {
    $("targetText").textContent =
      Math.round(calorieTarget);
  }

  animateNumber(
    $("remainingCalories"),
    Math.round(remainingCalories)
  );

  // ------------------------------------------
  // CALORIE PROGRESS
  // ------------------------------------------

  const calorieProgress = calorieTarget > 0
    ? Math.min(100, Math.max(0,
        (kcal / calorieTarget) * 100
      ))
    : 0;

  const progressBar = $("progressBar");

  if (progressBar) {

    progressBar.style.width =
      calorieProgress + "%";

    progressBar.setAttribute(
      "aria-valuenow",
      Math.round(calorieProgress)
    );

    // Status target kalori
    progressBar.setAttribute(
      "aria-valuemin",
      "0"
    );

    progressBar.setAttribute(
      "aria-valuemax",
      "100"
    );

    progressBar.dataset.reached =
      calorieProgress >= 100 ? "true" : "false";
  }

  // ------------------------------------------
  // TOTAL MAKRO NUTRISI
  // ------------------------------------------

  animateNumber(
    $("totalProtein"),
    protein,
    " g",
    1
  );

  animateNumber(
    $("totalCarbs"),
    carbs,
    " g",
    1
  );

  animateNumber(
    $("totalFat"),
    fat,
    " g",
    1
  );

  // ------------------------------------------
  // TARGET NUTRISI
  // ------------------------------------------

  if ($("proteinTargetText")) {
    $("proteinTargetText").textContent =
      proteinTarget;
  }

  if ($("carbsTargetText")) {
    $("carbsTargetText").textContent =
      carbsTarget;
  }

  if ($("fatTargetText")) {
    $("fatTargetText").textContent =
      fatTarget;
  }

  // ------------------------------------------
  // CIRCULAR NUTRITION PROGRESS
  // ------------------------------------------

  setNutritionProgress(
    "proteinProgress",
    protein,
    proteinTarget
  );

  setNutritionProgress(
    "carbsProgress",
    carbs,
    carbsTarget
  );

  setNutritionProgress(
    "fatProgress",
    fat,
    fatTarget
  );

  // ------------------------------------------
  // RIWAYAT MAKANAN
  // ------------------------------------------

  renderHistory(meals);
}


// ==========================================
// EDIT TARGET KALORI
// ==========================================

function setupTargetButton() {
  const button = $("editTarget");
  if (!button || button.dataset.initialized === "true") return;

  button.dataset.initialized = "true";

  button.addEventListener("click", () => {
    const value = prompt(
      "Masukkan target kalori harian:",
      getTarget()
    );

    if (value === null) return;

    const target = Number(value);

    if (!Number.isFinite(target) || target <= 0) {
      showAppModal({
        type: "warning",
        title: "Error",
        message: "Target harus berupa angka positif."
      });

      return;
    }

    saveTarget(target);
    updateDashboard();
  });
}

// ==========================================
// INITIALIZATION
// ==========================================

function initializeDashboard() {
  renderToday();
  setupTargetButton();
  updateDashboard();

  // Memperbarui dashboard ketika target profil berubah.
  window.addEventListener(
    "profileTargetUpdated",
    updateDashboard
  );
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard,
    { once: true }
  );
} else {
  initializeDashboard();
}
