import {
  getMeals,
  getTarget
} from "./meal-storage.js";

export function getTodayDate() {
  return new Date().toLocaleDateString("sv-SE");
}

export function getTodayMeals() {
  const meals = getMeals();
  const today = getTodayDate();

  return meals.filter(meal => meal.date === today);
}

export function calculateDailyNutrition(meals) {
  return meals.reduce((total, meal) => {
    total.kcal += Number(meal.kcal) || 0;
    total.protein += Number(meal.protein) || 0;
    total.carbs += Number(meal.carbs) || 0;
    total.fat += Number(meal.fat) || 0;

    return total;
  }, {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
}

export function getDashboardData() {
  const meals = getTodayMeals();
  const total = calculateDailyNutrition(meals);
  const target = getTarget();

  return {
    meals,
    total,
    target,
    remaining: Math.max(0, target - total.kcal)
  };
}