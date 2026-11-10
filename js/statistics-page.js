
import {
  getMeals,
  getTarget
} from "./meal-storage.js";

const $ = (id) => document.getElementById(id);

let selectedPeriod = "7";

// Mengambil isi makanan tanpa menghitung total kelompok dua kali
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

// Mengambil data sesuai periode
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

  // Periode saat ini
  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - (days - 1));

  // Periode sebelumnya dengan jumlah hari yang sama
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

  const targetCalories = Number(
    profile.dailyCalorieTarget
  ) || getTarget();

  const tdee = Number(profile.tdee);

  // Pastikan data profil tersedia
  if (
    !currentWeight ||
    !goalWeight ||
    !duration ||
    !targetCalories
  ) {
    return null;
  }

  const weightDifference =
    goalWeight - currentWeight;

  // Perubahan berat yang direncanakan per minggu
  const totalWeeks = duration * 4.345;

  const plannedWeeklyChange =
    weightDifference / totalWeeks;

  // Estimasi perubahan berdasarkan selisih kalori.
  // 7.700 kkal kira-kira setara dengan 1 kg perubahan berat.
  let estimatedWeeklyChange = 0;

  if (tdee && stats.average > 0) {
    const dailyDifference =
      stats.average - tdee;

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

// Menghitung ringkasan statistik
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

// Menampilkan angka statistik
function renderStatistics() {
  const meals = getFilteredMeals();
  const stats = calculateStatistics(meals);

  // Data periode sebelumnya
  const previousMeals = getPreviousPeriodMeals();
  const previousStats =
    calculateStatistics(previousMeals);

  // Tampilkan ringkasan utama
  $("statTotalCalories").textContent =
    Math.round(stats.total.kcal)
      .toLocaleString("id-ID");

  $("statAverageCalories").textContent =
    Math.round(stats.average)
      .toLocaleString("id-ID");

  $("statTotalMeals").textContent =
    meals.length.toLocaleString("id-ID");

  $("statRecordedDays").textContent =
    stats.recordedDays.toLocaleString("id-ID");

  $("statProtein").textContent =
    `${stats.total.protein.toFixed(1)} g`;

  $("statCarbs").textContent =
    `${stats.total.carbs.toFixed(1)} g`;

  $("statFat").textContent =
    `${stats.total.fat.toFixed(1)} g`;

  // Bandingkan rata-rata kalori
  renderCalorieTrend(
    stats.average,
    previousStats.average
  );

  // Progress menuju berat badan tujuan
  renderGoalProgress(stats);

  // Grafik
  renderCalorieChart(stats.dailyData);
}


function renderCalorieTrend(
  currentAverage,
  previousAverage
) {
  const trendElement = $("statCalorieTrend");

  if (!trendElement) return;

  // Belum ada data periode sebelumnya
  if (!previousAverage) {
    trendElement.innerHTML = `
      <span class="statistics-trend neutral">
        Belum ada data periode sebelumnya
      </span>
    `;
    return;
  }

  const difference =
    currentAverage - previousAverage;

  if (difference > 0) {
    trendElement.innerHTML = `
      <span class="statistics-trend up">
        ↑ Naik ${Math.round(difference)
          .toLocaleString("id-ID")} kkal
      </span>
      <small>
        dibanding periode sebelumnya
      </small>
    `;
  } else if (difference < 0) {
    trendElement.innerHTML = `
      <span class="statistics-trend down">
        ↓ Turun ${Math.abs(Math.round(difference))
          .toLocaleString("id-ID")} kkal
      </span>
      <small>
        dibanding periode sebelumnya
      </small>
    `;
  } else {
    trendElement.innerHTML = `
      <span class="statistics-trend neutral">
        → Tidak berubah
      </span>
    `;
  }
}

function renderGoalProgress(stats) {
  const container = $("goalProgressContent");

  if (!container) return;

  const goal = calculateGoalProgress(stats);

  if (!goal) {
    container.innerHTML = `
      <p class="statistics-empty-goal">
        Lengkapi profil dan tujuan berat badan untuk
        melihat simulasi progress Anda.
      </p>
    `;
    return;
  }

  const isLosingWeight =
    goal.goalWeight < goal.currentWeight;

  const directionText = isLosingWeight
    ? "menurunkan"
    : "menaikkan";

  const difference = Math.abs(
    goal.weightDifference
  );

  const averageDifference =
    goal.averageCalories - goal.targetCalories;

  let calorieStatus = "";

  if (Math.abs(averageDifference) < 50) {
    calorieStatus = `
      Rata-rata kalori Anda sangat dekat dengan
      target harian.
    `;
  } else if (averageDifference > 0) {
    calorieStatus = `
      Rata-rata konsumsi Anda ${Math.round(
        averageDifference
      ).toLocaleString("id-ID")} kkal di atas target.
    `;
  } else {
    calorieStatus = `
      Rata-rata konsumsi Anda ${Math.abs(
        Math.round(averageDifference)
      ).toLocaleString("id-ID")} kkal di bawah target.
    `;
  }

  container.innerHTML = `
    <div class="statistics-goal-grid">

      <div class="statistics-goal-item">
        <span>Berat saat ini</span>
        <strong>${goal.currentWeight} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>Berat tujuan</span>
        <strong>${goal.goalWeight} kg</strong>
      </div>

      <div class="statistics-goal-item">
        <span>Perubahan tujuan</span>
        <strong>
          ${directionText} ${difference.toFixed(1)} kg
        </strong>
      </div>

      <div class="statistics-goal-item">
        <span>Target waktu</span>
        <strong>${goal.duration} bulan</strong>
      </div>

    </div>

    <div class="statistics-goal-calories">
      <span>Rata-rata konsumsi</span>
      <strong>
        ${Math.round(goal.averageCalories)
          .toLocaleString("id-ID")} kkal/hari
      </strong>

      <small>
        Target: ${Math.round(goal.targetCalories)
          .toLocaleString("id-ID")} kkal/hari
      </small>
    </div>

    <div class="statistics-goal-status">
      ${calorieStatus}
    </div>
  `;
}

function renderCalorieChart(dailyData) {
  const container = $("calorieChart");

  if (!container) return;

  const dates = Object.keys(dailyData).sort();
  const target = getTarget();

  if (!dates.length) {
    container.innerHTML = "<p>Belum ada data statistik.</p>";
    return;
  }

  const values = dates.map(date => ({
    date,
    kcal: dailyData[date].kcal
  }));

  // Skala grafik harus mempertimbangkan target kalori.
  // Dengan demikian garis target tetap terlihat meskipun
  // semua konsumsi kalori berada di bawah target.
  const maxCalories = Math.max(
    ...values.map(item => item.kcal),
    target,
    1
  );

  // Posisi garis target dalam persen.
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
            Target ${Math.round(target).toLocaleString("id-ID")} kkal
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

          // Menentukan status pencapaian target
          const isSuccess = target > 0 &&
            item.kcal <= target;

          const isOverTarget = target > 0 &&
            item.kcal > target;

          let statusClass = "";

          if (isSuccess) {
            statusClass = "success";
          } else if (isOverTarget) {
            statusClass = "over-target";
          }

          return `
            <div class="statistics-chart-column">
              <strong>
                ${Math.round(item.kcal).toLocaleString("id-ID")}
              </strong>

              <div class="statistics-bar-track">
                <div
                  class="statistics-bar ${statusClass}"
                  style="height: ${height}%"
                  title="${isSuccess
                    ? "Berhasil memenuhi target"
                    : isOverTarget
                      ? "Melebihi target"
                      : ""}"
                ></div>
              </div>

              <small>
                ${date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short"
                })}
              </small>

              ${target > 0 ? `
                <span class="statistics-day-status">
                  ${isSuccess ? "✓ Sesuai" : "↑ Melebihi"}
                </span>
              ` : ""}
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// Filter periode
function initializeStatistics() {
  document.querySelectorAll(".statistics-period")
    .forEach(button => {
      button.addEventListener("click", () => {
        selectedPeriod = button.dataset.period;

        document.querySelectorAll(".statistics-period")
          .forEach(item => {
            item.classList.toggle("active", item === button);
          });

        renderStatistics();
      });
    });

  document.addEventListener("kaloriku:pagechange", event => {
    if (event.detail.pageId === "statisticsPage") {
      renderStatistics();
    }
  });
}

initializeStatistics();
