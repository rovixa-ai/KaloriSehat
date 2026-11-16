
import {
  getMeals,
  getTarget
} from "./meal-storage.js";

const $ = (id) => document.getElementById(id);

let selectedPeriod = "7";

// =========================================
// SISTEM TERJEMAHAN
// =========================================

const t = (key) => window.t?.(key) ?? key;

function getLocale() {
  return window.getLanguage?.() === "en" ? "en-US" : "id-ID";
}

function formatNumber(value, digits = 0) {
  return Number(value).toLocaleString(getLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}


// =========================================
// STATISTICS ANIMATION ENGINE
// =========================================

function animateStatNumber(element, target, suffix = "", digits = 0, duration = 1800) {
  if (!element) return;

  const value = Number(target);

  if (!Number.isFinite(value)) return;

  const formatter = new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

  const startTime = performance.now();

  element.textContent = `${formatter.format(0)}${suffix}`;

  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);

    const currentValue = value * eased;

    element.textContent =
      `${formatter.format(currentValue)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent =
        `${formatter.format(value)}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}


function animateStatisticsPage(stats) {
  const sections = document.querySelectorAll(
    "#statisticsPage .statistics-section"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Reset animasi seluruh section
  sections.forEach((section, index) => {
    section.classList.remove("statistics-animated");

    section.style.setProperty(
      "--stat-delay",
      `${index * 120}ms`
    );
  });

  // Atur jeda animasi setiap kartu ringkasan
  const summaryCards = document.querySelectorAll(
    "#statisticsPage .statistics-summary .statistics-card"
  );

  summaryCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 150}ms`;
  });

  // Animasi langsung jika pengguna memilih reduced motion
  if (reducedMotion) {
    sections.forEach(section => {
      section.classList.add("statistics-animated");
    });

    animateStatisticsNumbers(stats);
    return;
  }

  // Paksa browser membaca kondisi awal animasi
  sections.forEach(section => {
    section.getBoundingClientRect();
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {

      // Aktifkan animasi seluruh section
      sections.forEach(section => {
        section.classList.add("statistics-animated");
      });

      // Jalankan animasi angka
      animateStatisticsNumbers(stats);

    });
  });
}


// =========================================
// ANIMASI ANGKA STATISTIK
// =========================================

function animateStatisticsNumbers(stats) {

  // Ringkasan utama
  animateStatNumber(
    $("statTotalCalories"),
    Math.round(stats.total.kcal)
  );

  animateStatNumber(
    $("statAverageCalories"),
    Math.round(stats.average)
  );

  animateStatNumber(
    $("statTotalMeals"),
    stats.mealCount
  );

  animateStatNumber(
    $("statRecordedDays"),
    stats.recordedDays
  );

  // Rincian nutrisi
  animateStatNumber(
    $("statProtein"),
    stats.total.protein,
    " g",
    1
  );

  animateStatNumber(
    $("statCarbs"),
    stats.total.carbs,
    " g",
    1
  );

  animateStatNumber(
    $("statFat"),
    stats.total.fat,
    " g",
    1
  );

  // Angka pada grafik kalori
  const chart = $("calorieChart");

  if (chart) {
    chart.querySelectorAll(
      ".statistics-chart-column strong"
    ).forEach(element => {

      const target = Number(
        element.dataset.chartValue
      );

      if (Number.isFinite(target)) {
        animateStatNumber(element, target);
      }

    });
  }
}



// =========================================
// MENGAMBIL DATA MAKANAN
// =========================================

function getFoodItems(meal) {
  return Array.isArray(meal.foods) && meal.foods.length
    ? meal.foods
    : [meal];
}

// Menghitung nutrisi dalam satu catatan
function getMealNutrition(meal) {
  const foods = getFoodItems(meal);

  return foods.reduce((total, food) => {
    total.kcal += Number(food.kcal) || 0;
    total.protein += Number(food.protein) || 0;
    total.carbs += Number(food.carbs) || 0;
    total.fat += Number(food.fat) || 0;

    return total;
  }, {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
}

// =========================================
// FILTER PERIODE
// =========================================

function getFilteredMeals() {
  const meals = getMeals();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedPeriod === "all") {
    return meals;
  }

  const days = Number(selectedPeriod);

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (days - 1));

  return meals.filter(meal => {
    if (!meal.date) return false;

    const mealDate = new Date(`${meal.date}T00:00:00`);

    return !Number.isNaN(mealDate.getTime()) &&
      mealDate >= startDate &&
      mealDate <= today;
  });
}

function getPreviousPeriodMeals() {
  const meals = getMeals();

  if (selectedPeriod === "all") {
    return [];
  }

  const days = Number(selectedPeriod);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - (days - 1));

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(previousEnd.getDate() - 1);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - (days - 1));

  return meals.filter(meal => {
    if (!meal.date) return false;

    const mealDate = new Date(`${meal.date}T00:00:00`);

    return !Number.isNaN(mealDate.getTime()) &&
      mealDate >= previousStart &&
      mealDate <= previousEnd;
  });
}

// =========================================
// PROFIL PENGGUNA
// =========================================

function getUserProfile() {
  try {
    return JSON.parse(
      localStorage.getItem("kaloriku_profile") || "{}"
    );
  } catch (error) {
    console.error("Gagal membaca profil:", error);
    return {};
  }
}

function calculateGoalProgress(stats) {
  const profile = getUserProfile();

  const currentWeight = Number(profile.weight);
  const goalWeight = Number(profile.goalWeight);
  const duration = Number(profile.goalDuration);

  const targetCalories =
    Number(profile.dailyCalorieTarget) || getTarget();

  const tdee = Number(profile.tdee);

  if (
    !currentWeight ||
    !goalWeight ||
    !duration ||
    !targetCalories
  ) {
    return null;
  }

  const weightDifference = goalWeight - currentWeight;

  const totalWeeks = duration * 4.345;

  const plannedWeeklyChange =
    weightDifference / totalWeeks;

  let estimatedWeeklyChange = 0;

  if (tdee && stats.average > 0) {
    const dailyDifference = stats.average - tdee;

    estimatedWeeklyChange =
      (dailyDifference * 7) / 7700;
  }

  return {
    currentWeight,
    goalWeight,
    duration,
    weightDifference,
    plannedWeeklyChange,
    estimatedWeeklyChange,
    targetCalories,
    averageCalories: stats.average
  };
}

// =========================================
// PERHITUNGAN STATISTIK
// =========================================

function calculateStatistics(meals) {
  const dailyData = {};

  meals.forEach(meal => {
    const date = meal.date || "unknown";

    if (!dailyData[date]) {
      dailyData[date] = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };
    }

    const nutrition = getMealNutrition(meal);

    dailyData[date].kcal += nutrition.kcal;
    dailyData[date].protein += nutrition.protein;
    dailyData[date].carbs += nutrition.carbs;
    dailyData[date].fat += nutrition.fat;
  });

  const days = Object.values(dailyData);

  const total = days.reduce((sum, day) => {
    sum.kcal += day.kcal;
    sum.protein += day.protein;
    sum.carbs += day.carbs;
    sum.fat += day.fat;

    return sum;
  }, {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  return {
    total,
    dailyData,
    recordedDays: days.length,
    average: days.length ? total.kcal / days.length : 0
  };
}

// =========================================
// MENAMPILKAN STATISTIK
// =========================================


function renderStatistics() {
  const meals = getFilteredMeals();
  const stats = calculateStatistics(meals);

  const previousMeals = getPreviousPeriodMeals();
  const previousStats = calculateStatistics(previousMeals);

  // Ringkasan utama
  const totalCalories = $("statTotalCalories");
  const averageCalories = $("statAverageCalories");
  const totalMeals = $("statTotalMeals");
  const recordedDays = $("statRecordedDays");

  if (totalCalories) {
    totalCalories.textContent =
      formatNumber(Math.round(stats.total.kcal));
  }

  if (averageCalories) {
    averageCalories.textContent =
      formatNumber(Math.round(stats.average));
  }

  if (totalMeals) {
    totalMeals.textContent = formatNumber(meals.length);
  }

  if (recordedDays) {
    recordedDays.textContent =
      formatNumber(stats.recordedDays);
  }

  // Detail nutrisi
  const protein = $("statProtein");
  const carbs = $("statCarbs");
  const fat = $("statFat");

  if (protein) {
    protein.textContent =
      `${formatNumber(stats.total.protein, 1)} g`;
  }

  if (carbs) {
    carbs.textContent =
      `${formatNumber(stats.total.carbs, 1)} g`;
  }

  if (fat) {
    fat.textContent =
      `${formatNumber(stats.total.fat, 1)} g`;
  }

  // Tren kalori
  renderCalorieTrend(
    stats.average,
    previousStats.average
  );

  // Progress berat badan
  renderGoalProgress(stats);

  // Grafik kalori
  renderCalorieChart(stats.dailyData);

  // Jalankan animasi setelah seluruh elemen dirender
  animateStatisticsPage({
    ...stats,
    mealCount: meals.length
  });
}


// =========================================
// TREN KALORI
// =========================================

function renderCalorieTrend(
  currentAverage,
  previousAverage
) {
  const trendElement = $("statCalorieTrend");

  if (!trendElement) return;

  if (!previousAverage) {
    trendElement.innerHTML = `
      <span class="statistics-trend neutral">
        ${escapeHTML(t("statisticsDynamic.previousPeriodUnavailable"))}
      </span>
    `;
    return;
  }

  const difference = currentAverage - previousAverage;

  if (difference > 0) {
    trendElement.innerHTML = `
      <span class="statistics-trend up">
        ↑ ${escapeHTML(t("statisticsDynamic.increased"))}
        ${formatNumber(Math.round(difference))} kcal
      </span>

      <small>
        ${escapeHTML(t("statisticsDynamic.comparedPrevious"))}
      </small>
    `;
  } else if (difference < 0) {
    trendElement.innerHTML = `
      <span class="statistics-trend down">
        ↓ ${escapeHTML(t("statisticsDynamic.decreased"))}
        ${formatNumber(Math.abs(Math.round(difference)))} kcal
      </span>

      <small>
        ${escapeHTML(t("statisticsDynamic.comparedPrevious"))}
      </small>
    `;
  } else {
    trendElement.innerHTML = `
      <span class="statistics-trend neutral">
        → ${escapeHTML(t("statisticsDynamic.unchanged"))}
      </span>
    `;
  }
}

// =========================================
// PROGRESS BERAT BADAN
// =========================================

function renderGoalProgress(stats) {
  const container = $("goalProgressContent");

  if (!container) return;

  const goal = calculateGoalProgress(stats);

  if (!goal) {
    container.innerHTML = `
      <p class="statistics-empty-goal">
        ${escapeHTML(t("statisticsDynamic.completeProfile"))}
      </p>
    `;
    return;
  }

  const isLosingWeight =
    goal.goalWeight < goal.currentWeight;

  const directionText = isLosingWeight
    ? t("statisticsDynamic.lose")
    : t("statisticsDynamic.gain");

  const difference = Math.abs(goal.weightDifference);

  const averageDifference =
    goal.averageCalories - goal.targetCalories;

  let calorieStatus = "";

  if (Math.abs(averageDifference) < 50) {
    calorieStatus =
      t("statisticsDynamic.closeToTarget");
  } else if (averageDifference > 0) {
    calorieStatus = `
      ${escapeHTML(t("statisticsDynamic.aboveTarget"))}
      ${formatNumber(Math.round(averageDifference))}
      ${escapeHTML(t("statisticsDynamic.aboveTargetEnd"))}
    `;
  } else {
    calorieStatus = `
      ${escapeHTML(t("statisticsDynamic.belowTarget"))}
      ${formatNumber(Math.abs(Math.round(averageDifference)))}
      ${escapeHTML(t("statisticsDynamic.belowTargetEnd"))}
    `;
  }

  container.innerHTML = `
    <div class="statistics-goal-grid">

      <div class="statistics-goal-item">
        <span>${escapeHTML(t("statisticsDynamic.currentWeight"))}</span>
        <strong>${formatNumber(goal.currentWeight, 1)} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>${escapeHTML(t("statisticsDynamic.goalWeight"))}</span>
        <strong>${formatNumber(goal.goalWeight, 1)} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>${escapeHTML(t("statisticsDynamic.goalChange"))}</span>
        <strong>
          ${escapeHTML(directionText)}
          ${formatNumber(difference, 1)} kg
        </strong>
      </div>

      <div class="statistics-goal-item">
        <span>${escapeHTML(t("statisticsDynamic.duration"))}</span>
        <strong>
          ${formatNumber(goal.duration)}
          ${escapeHTML(t("statisticsDynamic.months"))}
        </strong>
      </div>

    </div>

    <div class="statistics-goal-calories">
      <span>
        ${escapeHTML(t("statisticsDynamic.averageIntake"))}
      </span>

      <strong>
        ${formatNumber(Math.round(goal.averageCalories))}
        ${escapeHTML(t("statisticsDynamic.perDay"))}
      </strong>

      <small>
        ${escapeHTML(t("statisticsDynamic.dailyTarget"))}:
        ${formatNumber(Math.round(goal.targetCalories))}
        ${escapeHTML(t("statisticsDynamic.perDay"))}
      </small>
    </div>

    <div class="statistics-goal-status">
      ${calorieStatus}
    </div>
  `;
}

// =========================================
// GRAFIK KALORI
// =========================================


function renderCalorieChart(dailyData) {
  const container = $("calorieChart");

  if (!container) return;

  const dates = Object.keys(dailyData).sort();
  const target = Number(getTarget()) || 0;

  container.classList.remove("is-animated");

  if (!dates.length) {
    container.innerHTML = `
      <p>${escapeHTML(t("statisticsDynamic.noData"))}</p>
    `;
    return;
  }

  const values = dates.map(date => ({
    date,
    kcal: dailyData[date].kcal
  }));

  const maxCalories = Math.max(
    ...values.map(item => item.kcal),
    target,
    1
  );

  const targetPosition = target > 0
    ? (target / maxCalories) * 100
    : 0;

  container.innerHTML = `
    <div class="statistics-chart-wrapper">

      ${target > 0 ? `
        <div
          class="statistics-target-line"
          style="bottom: ${targetPosition}%"
        >
          <span>
            ${escapeHTML(t("statisticsDynamic.targetLabel"))}
            ${formatNumber(Math.round(target))} kcal
          </span>
        </div>
      ` : ""}

      <div class="statistics-chart-bars">

        ${values.map(item => {
          const height = Math.max(
            4,
            (item.kcal / maxCalories) * 100
          );

          const date = new Date(
            `${item.date}T00:00:00`
          );

          const isSuccess =
            target > 0 && item.kcal <= target;

          const isOverTarget =
            target > 0 && item.kcal > target;

          let statusClass = "";

          if (isSuccess) {
            statusClass = "success";
          } else if (isOverTarget) {
            statusClass = "over-target";
          }

          const statusText = isSuccess
            ? t("statisticsDynamic.according")
            : t("statisticsDynamic.exceeded");

          const titleText = isSuccess
            ? t("statisticsDynamic.successful")
            : isOverTarget
              ? t("statisticsDynamic.exceededTarget")
              : "";

          return `
            <div class="statistics-chart-column">

              <strong data-chart-value="${item.kcal}">
                ${formatNumber(Math.round(item.kcal))}
              </strong>

              <div class="statistics-bar-track">
                <div
                  class="statistics-bar ${statusClass}"
                  style="height: ${height}%"
                  title="${escapeHTML(titleText)}"
                ></div>
              </div>

              <small>
                ${date.toLocaleDateString(getLocale(), {
                  day: "numeric",
                  month: "short"
                })}
              </small>

              ${target > 0 ? `
                <span class="statistics-day-status">
                  ${isSuccess ? "✓" : "↑"}
                  ${escapeHTML(statusText)}
                </span>
              ` : ""}

            </div>
          `;
        }).join("")}

      </div>
    </div>
  `;

  // Aktifkan animasi grafik setelah DOM selesai dibuat
  container.getBoundingClientRect();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.classList.add("is-animated");
    });
  });
}


// =========================================
// FILTER PERIODE DAN EVENT
// =========================================

function initializeStatistics() {
  document.querySelectorAll(".statistics-period")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectedPeriod = button.dataset.period;

        document.querySelectorAll(".statistics-period")
          .forEach(item => {
            item.classList.toggle(
              "active",
              item === button
            );
          });

        renderStatistics();
      });
    });

  // Ketika halaman statistik dibuka
  document.addEventListener("kaloriku:pagechange", event => {
    if (event.detail?.pageId === "statisticsPage") {
      renderStatistics();
    }
  });

  // Ketika bahasa diganti
  window.addEventListener("languageChanged", () => {
    renderStatistics();
  });

  // Render awal
  renderStatistics();
}

initializeStatistics();
