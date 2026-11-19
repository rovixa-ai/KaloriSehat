
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

  const target = Number(getTarget()) || 0;
  const period = selectedPeriod;

  container.classList.remove("is-animated");

  // ========================================
  // HELPER TANGGAL
  // ========================================

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function getDateLabel(dateKey, options = {}) {
    const date = new Date(`${dateKey}T00:00:00`);

    return date.toLocaleDateString(getLocale(), {
      day: "numeric",
      month: "short",
      ...options
    });
  }

  
  // ========================================
  // AMBIL TANGGAL SESUAI PERIODE
  // ========================================

  const recordedDates = Object.keys(dailyData)
    .filter(date => Number(dailyData[date]?.kcal) > 0)
    .sort();

  let dates = [];

  if (period === "7") {
    // 7 hari terakhir: selalu tampilkan 7 batang
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      dates.push(formatDateKey(addDays(today, -i)));
    }

  } else if (period === "30") {
    // 30 hari terakhir: hanya tanggal yang memiliki kalori
    const today = new Date();
    const startDate = formatDateKey(addDays(today, -29));

    dates = recordedDates
      .filter(date => date >= startDate)
      .slice(-30);

  } else {
    // Semua: maksimal 30 tanggal terbaru yang memiliki kalori
    dates = recordedDates.slice(-30);
  }

  // ========================================
  // DATA GRAFIK
  // ========================================

  const values = dates.map(date => {
    const hasData = Object.prototype.hasOwnProperty.call(
      dailyData,
      date
    );

    return {
      date,
      kcal: hasData
        ? Number(dailyData[date].kcal) || 0
        : 0,
      hasData
    };
  });

  // Jika tidak ada data, hanya grafik garis yang kosong
  if (period !== "7" && !values.length) {
    container.innerHTML = `
      <p>${escapeHTML(t("statisticsDynamic.noData"))}</p>
    `;
    return;
  }

  // ========================================
  // SKALA GRAFIK
  // ========================================

  const recordedValues = values
    .filter(item => item.hasData)
    .map(item => item.kcal);

  const maxCalories = Math.max(
    ...recordedValues,
    target,
    1
  );

  // ========================================
  // GRAFIK 7 HARI: BAR CHART
  // ========================================

  if (period === "7") {
    const chartMax = maxCalories * 1.12;
    const targetPosition = target > 0
      ? (target / chartMax) * 100
      : 0;

    container.innerHTML = `
      <div class="statistics-chart-wrapper statistics-bar-view">

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
            const kcal = item.kcal ?? 0;

            const height = item.hasData
              ? Math.max(0, (kcal / chartMax) * 100)
              : 0;

            const isSuccess = target > 0 &&
              item.hasData &&
              kcal <= target;

            const isOverTarget = target > 0 &&
              item.hasData &&
              kcal > target;

            let statusClass = "";

            if (isSuccess) statusClass = "success";
            else if (isOverTarget) statusClass = "over-target";

            const statusText = isSuccess
              ? t("statisticsDynamic.according")
              : t("statisticsDynamic.exceeded");

            const titleText = !item.hasData
              ? "Belum ada catatan"
              : isSuccess
                ? t("statisticsDynamic.successful")
                : isOverTarget
                  ? t("statisticsDynamic.exceededTarget")
                  : "";

            return `
              <div class="statistics-chart-column">

                <strong
                  data-chart-value="${kcal}"
                  class="${item.hasData ? "" : "no-data"}"
                >
                  ${item.hasData
                    ? formatNumber(Math.round(kcal))
                    : "—"}
                </strong>

                <div class="statistics-bar-track">
                  <div
                    class="statistics-bar ${statusClass}"
                    style="height: ${height}%"
                    title="${escapeHTML(titleText)}"
                  ></div>
                </div>

                <small>${getDateLabel(item.date)}</small>

                ${target > 0 ? `
                  <span class="statistics-day-status">
                    ${!item.hasData
                      ? "—"
                      : isSuccess
                        ? "✓"
                        : "↑"}
                    ${item.hasData
                      ? escapeHTML(statusText)
                      : "—"}
                  </span>
                ` : ""}

              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;

  // ========================================
  // GRAFIK 30 HARI & SEMUA: LINE CHART
  // ========================================

  } else {
    const chartHeight = 240;
const paddingTop = 25;
const paddingBottom = 38;
const paddingLeft = 48;
const paddingRight = 16;

// Grafik 30 hari mengikuti lebar kontainer.
// Grafik semua menyesuaikan jumlah tanggal.
const chartWidth = period === "30"
  ? 720
  : Math.max(720, values.length * 22);

    const innerWidth = chartWidth - paddingLeft - paddingRight;
    const innerHeight = chartHeight - paddingTop - paddingBottom;

    const chartMax = maxCalories * 1.15;

    function getX(index) {
      if (values.length <= 1) return paddingLeft;

      return paddingLeft +
        (index / (values.length - 1)) * innerWidth;
    }

    function getY(kcal) {
      return paddingTop +
        innerHeight -
        (kcal / chartMax) * innerHeight;
    }

    // Garis grafik hanya menghubungkan tanggal yang memiliki data.
    // Tanggal tanpa data membuat garis terputus.
    const segments = [];
    let currentSegment = [];

    values.forEach((item, index) => {
      if (item.hasData) {
        currentSegment.push({
          x: getX(index),
          y: getY(item.kcal),
          item
        });
      } else if (currentSegment.length) {
        segments.push(currentSegment);
        currentSegment = [];
      }
    });

    if (currentSegment.length) {
      segments.push(currentSegment);
    }

   
function createSmoothPath(segment) {
  if (!segment.length) return "";

  if (segment.length === 1) {
    const point = segment[0];
    return `M ${point.x} ${point.y}`;
  }

  let path = `M ${segment[0].x} ${segment[0].y}`;

  for (let i = 0; i < segment.length - 1; i++) {
    const current = segment[i];
    const next = segment[i + 1];

    const controlX = (current.x + next.x) / 2;

    path += `
      C ${controlX} ${current.y},
        ${controlX} ${next.y},
        ${next.x} ${next.y}
    `;
  }

  return path;
}

const linePaths = segments.map(segment => ({
  line: createSmoothPath(segment),
  area: `
    ${createSmoothPath(segment)}
    L ${segment[segment.length - 1].x} ${chartHeight - paddingBottom}
    L ${segment[0].x} ${chartHeight - paddingBottom}
    Z
  `
}));


    // Titik untuk setiap hari yang memiliki catatan
    const points = values
      .map((item, index) => {
        if (!item.hasData) return "";

        const x = getX(index);
        const y = getY(item.kcal);

        return `
          <circle
            class="statistics-line-point"
            cx="${x}"
            cy="${y}"
            r="4"
          >
            <title>
              ${escapeHTML(getDateLabel(item.date, {
                year: "numeric"
              }))}
              — ${formatNumber(Math.round(item.kcal))} kcal
            </title>
          </circle>
        `;
      })
      .join("");

    // Label tanggal dibuat lebih renggang agar tidak bertumpuk
    const labelStep = period === "30"
      ? 5
      : Math.max(1, Math.ceil(values.length / 12));

    const dateLabels = values
      .map((item, index) => {
        const isLast = index === values.length - 1;

        if (index % labelStep !== 0 && !isLast) return "";

        return `
          <text
            class="statistics-line-date"
            x="${getX(index)}"
            y="${chartHeight - 12}"
            text-anchor="middle"
          >
            ${escapeHTML(getDateLabel(item.date))}
          </text>
        `;
      })
      .join("");

    const gridLines = [0, 0.5, 1].map(ratio => {
      const y = paddingTop + innerHeight * (1 - ratio);
      const value = chartMax * ratio;

      return `
        <line
          class="statistics-line-grid"
          x1="${paddingLeft}"
          y1="${y}"
          x2="${chartWidth - paddingRight}"
          y2="${y}"
        />

        <text
          class="statistics-line-axis"
          x="${paddingLeft - 10}"
          y="${y + 4}"
          text-anchor="end"
        >
          ${formatNumber(Math.round(value))}
        </text>
      `;
    }).join("");

    const targetLine = target > 0
      ? `
        <line
          class="statistics-line-target"
          x1="${paddingLeft}"
          y1="${getY(target)}"
          x2="${chartWidth - paddingRight}"
          y2="${getY(target)}"
        />
        <text
          class="statistics-line-target-label"
          x="${chartWidth - paddingRight - 4}"
          y="${getY(target) - 8}"
          text-anchor="end"
        >
          Target ${formatNumber(Math.round(target))} kcal
        </text>
      `
      : "";

    container.innerHTML = `
      <div class="statistics-line-wrapper">

        <div class="statistics-line-scroll">
          
<svg
  class="statistics-line-chart"
  viewBox="0 0 ${chartWidth} ${chartHeight}"
  style="width: ${period === "30" ? "100%" : `${chartWidth}px`}; height: auto;"
  role="img"
  aria-label="Grafik tren konsumsi kalori"
>
  <defs>
    <!-- Gradasi area -->
    <linearGradient
      id="calorieAreaGradient"
      x1="0"
      y1="0"
      x2="0"
      y2="1"
    >
      <stop
        offset="0%"
        stop-color="#16A085"
        stop-opacity="0.32"
      />
      <stop
        offset="65%"
        stop-color="#16A085"
        stop-opacity="0.10"
      />
      <stop
        offset="100%"
        stop-color="#16A085"
        stop-opacity="0.01"
      />
    </linearGradient>

    <!-- Efek glow -->
    <filter
      id="calorieLineGlow"
      x="-30%"
      y="-30%"
      width="160%"
      height="160%"
    >
      <feGaussianBlur
        stdDeviation="3"
        result="blur"
      />
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Grid -->
  ${gridLines}

  <!-- Target -->
  ${targetLine}

  <!-- Area gradient -->
  ${linePaths.map(item => `
    <path
      class="statistics-line-area"
      d="${item.area}"
      fill="url(#calorieAreaGradient)"
    />
  `).join("")}

  <!-- Garis utama -->
  ${linePaths.map(item => `
    <path
      class="statistics-line-path"
      d="${item.line}"
      filter="url(#calorieLineGlow)"
    />
  `).join("")}

  <!-- Titik data -->
  ${values.map((item, index) => {
    if (!item.hasData) return "";

    const x = getX(index);
    const y = getY(item.kcal);

    return `
      <g class="statistics-line-marker">
        <circle
          class="statistics-line-point-halo"
          cx="${x}"
          cy="${y}"
          r="10"
        />

        <circle
          class="statistics-line-point"
          cx="${x}"
          cy="${y}"
          r="4.5"
        >
          <title>
            ${escapeHTML(getDateLabel(item.date, {
              year: "numeric"
            }))}
            — ${formatNumber(Math.round(item.kcal))} kcal
          </title>
        </circle>
      </g>
    `;
  }).join("")}

  <!-- Tanggal -->
  ${dateLabels}
</svg>

        </div>

        <div class="statistics-line-legend">
          <span>
            <i class="statistics-legend-dot"></i>
            Kalori harian
          </span>

          ${target > 0 ? `
            <span>
              <i class="statistics-legend-target"></i>
              Target kalori
            </span>
          ` : ""}
        </div>

      </div>
    `;
  }

  // Jalankan animasi setelah elemen grafik selesai dibuat
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
