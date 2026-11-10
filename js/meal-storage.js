export function getMeals() {
  try {
    return JSON.parse(
      localStorage.getItem("kaloriku_meals") || "[]"
    );
  } catch (error) {
    console.error("Gagal membaca data makanan:", error);
    return [];
  }
}

export function saveMeals(meals) {
  localStorage.setItem(
    "kaloriku_meals",
    JSON.stringify(meals)
  );
}

export function getTarget() {
  try {
    const profile = JSON.parse(
      localStorage.getItem("kaloriku_profile") || "{}"
    );

    const target = Number(profile.dailyCalorieTarget);

    return Number.isFinite(target) && target > 0
      ? target
      : 0;

  } catch (error) {
    console.error("Gagal membaca target kalori:", error);
    return 0;
  }
}

export function getNutritionTargets() {
  try {
    const profile = JSON.parse(
      localStorage.getItem("kaloriku_profile") || "{}"
    );

    return {
      protein: Number(profile.dailyProteinTarget) || 0,
      carbs: Number(profile.dailyCarbTarget) || 0,
      fat: Number(profile.dailyFatTarget) || 0
    };

  } catch (error) {
    console.error("Gagal membaca target nutrisi:", error);

    return {
      protein: 0,
      carbs: 0,
      fat: 0
    };
  }
}

export function saveTarget(target) {
  localStorage.setItem(
    "kaloriku_target",
    target
  );
}