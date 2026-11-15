
// Database makanan manual tidak lagi digunakan.
// Nutrisi diambil dari Panganku, TKPI, dan USDA.

export const foods = {};

export const foodAliases = {
  "nasi": "nasi putih",
  "nasi putih matang": "nasi putih",
  "dada ayam": "ayam dada",
  "telur ayam rebus": "telur rebus",
  "telur rebus kupas": "telur rebus",
  "tahu putih": "tahu",
  "ayam goreng kentucky": "ayam goreng kentucky dada",
  "sayur sop bening": "sayur sop",
  "jengkol semur": "semur jengkol",
  "bayam santan": "tumis bayam bersantan",
  "telur dadar daun bawang": "telur ayam dadar masakan",
  "telur dadar": "telur ayam dadar masakan",
  "tempe goreng": "tempe kedelai murni goreng",
  "tumis buncis wortel": "tumis buncis dan wortel",
  "buncis wortel tumis": "tumis buncis dan wortel"
};


// ========================================
// HELPER: NORMALISASI NAMA
// ========================================

export function normalizeFoodName(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[,.]/g, " ")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ");
}


// ========================================
// HELPER: KONVERSI NILAI NUTRISI
// ========================================

function getValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    !Number.isFinite(Number(value))
  ) {
    return null;
  }

  return Number(value);
}


// ========================================
// KONVERSI PANGANKU
// ========================================

function convertPanganku(item) {
  if (!item.nama || !item.nutrisi) return null;

  const n = item.nutrisi;

  const air = getValue(n.air_g);

  return {
    kcal: getValue(n.energi_kcal),
    protein: getValue(n.protein_g),
    carbs: getValue(n.karbohidrat_g),
    fat: getValue(n.lemak_g),
    fiber: getValue(n.serat_g),
    sodium: getValue(n.natrium_mg),

    water: air !== null && air >= 0 ? air : null,

    code: item.kode ?? null,
    source: item.sumber ?? "Panganku",
    category: item.kategori ?? null,
    type: item.tipe ?? null,
    basis: item.basis ?? "100 g"
  };
}


// ========================================
// KONVERSI TKPI
// ========================================

function convertTKPI(item) {
  if (!item.name) return null;

  const air = getValue(item.air_g);

  return {
    kcal: getValue(item.energy_kcal),
    protein: getValue(item.protein_g),
    carbs: getValue(item.carb_g),
    fat: getValue(item.fat_g),
    fiber: getValue(item.fiber_g),
    sodium: getValue(item.sodium_mg),

    water: air !== null && air >= 0 ? air : null,

    code: item.code ?? null,
    source: item.source ?? "TKPI",
    category: item.category ?? null,
    type: item.section ?? null,
    basis: "100 g",

    bdd_percent: getValue(item.bdd_percent),

    calcium: getValue(item.calcium_mg),
    phosphorus: getValue(item.phosphorus_mg),
    iron: getValue(item.iron_mg),
    potassium: getValue(item.potassium_mg),
    copper: getValue(item.copper_mg),
    zinc: getValue(item.zinc_mg),

    retinol: getValue(item.retinol_mcg),
    beta_carotene: getValue(item.beta_carotene_mcg),
    carotene_total: getValue(item.carotene_total_mcg),

    thiamin: getValue(item.thiamin_mg),
    riboflavin: getValue(item.riboflavin_mg),
    niacin: getValue(item.niacin_mg),
    vitamin_c: getValue(item.vitamin_c_mg)
  };
}


// ========================================
// MEMUAT SEMUA DATABASE
// ========================================

export async function loadPangankuDatabase() {

  const pangankuUrl = new URL(
    "../data/panganku/panganku-nutrisi.json",
    import.meta.url
  );

  const tkpiUrl = new URL(
    "../data/tkpi/tkpi.json",
    import.meta.url
  );

  const usdaUrl = new URL(
    "../data/usda/usda_foundation_kaloriku.json",
    import.meta.url
  );

  // Muat ketiga database secara bersamaan
  const [
    pangankuResponse,
    tkpiResponse,
    usdaResponse
  ] = await Promise.all([
    fetch(pangankuUrl),
    fetch(tkpiUrl),
    fetch(usdaUrl)
  ]);

  if (!pangankuResponse.ok) {
    throw new Error("Database Panganku gagal dimuat.");
  }

  if (!tkpiResponse.ok) {
    throw new Error("Database TKPI gagal dimuat.");
  }

  if (!usdaResponse.ok) {
    throw new Error("Database USDA gagal dimuat.");
  }

  const [
    pangankuRecords,
    tkpiRecords,
    usdaRecords
  ] = await Promise.all([
    pangankuResponse.json(),
    tkpiResponse.json(),
    usdaResponse.json()
  ]);

  if (!Array.isArray(pangankuRecords)) {
    throw new Error("Format database Panganku tidak valid.");
  }

  if (!Array.isArray(tkpiRecords)) {
    throw new Error("Format database TKPI tidak valid.");
  }

  if (!Array.isArray(usdaRecords)) {
    throw new Error("Format database USDA tidak valid.");
  }

  // Prioritas:
  // 1. Panganku
  // 2. TKPI
  // 3. USDA

  const database = {};

  let pangankuCount = 0;
  let tkpiCount = 0;
  let usdaCount = 0;
  let duplicateCount = 0;

  function addFood(name, food, sourceType) {

    const normalizedName = normalizeFoodName(name);

    if (!normalizedName || !food) return;

    // Pertahankan database dengan prioritas tertinggi
    if (database[normalizedName]) {
      duplicateCount++;
      return;
    }

    database[normalizedName] = food;

    if (sourceType === "Panganku") {
      pangankuCount++;
    } else if (sourceType === "TKPI") {
      tkpiCount++;
    } else if (sourceType === "USDA") {
      usdaCount++;
    }
  }


  // --------------------------------------
  // 1. PANGANKU
  // --------------------------------------

  pangankuRecords.forEach(item => {

    const food = convertPanganku(item);

    if (!food) return;

    addFood(item.nama, food, "Panganku");

  });


  // --------------------------------------
  // 2. TKPI
  // --------------------------------------

  tkpiRecords.forEach(item => {

    const food = convertTKPI(item);

    if (!food) return;

    addFood(item.name, food, "TKPI");

  });


  // --------------------------------------
  // 3. USDA
  // --------------------------------------

  usdaRecords.forEach(item => {

    if (!item.nama || !item.nutrisi) return;

    const n = item.nutrisi;

    const air = getValue(n.air_g);

    const food = {
      kcal: getValue(n.energi_kcal),
      protein: getValue(n.protein_g),
      carbs: getValue(n.karbohidrat_g),
      fat: getValue(n.lemak_g),
      fiber: getValue(n.serat_g),
      sodium: getValue(n.natrium_mg),

      water: air !== null && air >= 0 ? air : null,

      code: item.kode ?? null,
      source: item.sumber ?? "USDA",
      category: item.kategori ?? null,
      type: item.tipe ?? null,
      basis: item.basis ?? "100 g"
    };

    addFood(item.nama, food, "USDA");

  });


  // --------------------------------------
  // STATISTIK DATABASE
  // --------------------------------------

  console.log("================================");
  console.log("       DATABASE KALORIKU");
  console.log("================================");

  console.log("Panganku :", pangankuCount);
  console.log("TKPI     :", tkpiCount);
  console.log("USDA     :", usdaCount);

  console.log("Total    :", Object.keys(database).length);
  console.log("Duplikat :", duplicateCount);

  console.log("================================");

  return database;
}


// ========================================
// ALIAS MAKANAN
// ========================================

function getAliasTarget(name, aliases) {

  const normalizedAliases = {};

  Object.entries(aliases).forEach(([key, value]) => {

    normalizedAliases[normalizeFoodName(key)] = value;

  });

  return normalizedAliases[name];
}


// ========================================
// PENCARIAN MAKANAN
// ========================================

export function findFood(name, database, aliases = {}) {

  const normalizedName = normalizeFoodName(name);

  if (!normalizedName) return null;

  // 1. Nama persis
  if (database[normalizedName]) {
    return database[normalizedName];
  }

  // 2. Alias
  const alias = getAliasTarget(normalizedName, aliases);

  if (alias) {

    const normalizedAlias = normalizeFoodName(alias);

    if (database[normalizedAlias]) {
      return database[normalizedAlias];
    }

  }

  // 3. Nama yang mirip
  const matches = Object.entries(database)
    .filter(([foodName]) =>
      foodName.includes(normalizedName) ||
      normalizedName.includes(foodName)
    );

  if (matches.length === 1) {
    return matches[0][1];
  }

  return null;
}


// ========================================
// SARAN MAKANAN
// ========================================


export function findFoodSuggestions(name, database) {
  const query = normalizeFoodName(name);

  if (!query) return [];

  const queryWords = query
    .split(" ")
    .filter(Boolean);

  return Object.entries(database)
    .map(([foodName, food]) => {
      // Semua kata wajib ada
      const containsAllWords = queryWords.every(word =>
        foodName.includes(word)
      );

      if (!containsAllWords) return null;

      let score = 0;

      // Nama sama persis
      if (foodName === query) {
        score += 1000;
      }

      // Nama diawali frasa pencarian
      else if (foodName.startsWith(query)) {
        score += 500;
      }

      // Frasa pencarian ditemukan utuh
      else if (foodName.includes(query)) {
        score += 300;
      }

      // Prioritaskan kecocokan kata yang berdekatan
      const words = foodName.split(" ");
      let consecutiveMatches = 0;

      for (let i = 0; i <= words.length - queryWords.length; i++) {
        if (
          queryWords.every((word, index) =>
            words[i + index].includes(word)
          )
        ) {
          consecutiveMatches = 1;
          break;
        }
      }

      if (consecutiveMatches) score += 100;

      // Nama lebih pendek lebih diprioritaskan
      score -= foodName.length * 0.1;

      return {
        name: foodName,
        food,
        score
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
}


// ========================================
// MAKANAN GABUNGAN
// ========================================

export function createCompositeFood(database, ingredients) {

  const selectedFoods = ingredients.map(item => {

    const name = normalizeFoodName(item.name);

    const food = database[name];

    if (!food) {
      throw new Error(
        `Bahan "${item.name}" tidak ditemukan.`
      );
    }

    if (!Number.isFinite(item.weight) || item.weight <= 0) {
      throw new Error("Berat komposisi bahan tidak valid.");
    }

    return {
      name,
      weight: item.weight,
      food
    };

  });

  const totalWeight = selectedFoods.reduce(
    (sum, item) => sum + item.weight,
    0
  );

  const calculateNutrient = key => {

    const values = selectedFoods.map(item => item.food[key]);

    // Nilai yang tidak tersedia bukan berarti nol
    if (values.some(value =>
      value === null ||
      value === undefined ||
      !Number.isFinite(value)
    )) {
      return null;
    }

    return selectedFoods.reduce(
      (sum, item) =>
        sum + item.food[key] * item.weight / totalWeight,
      0
    );

  };

  return {

    kcal: calculateNutrient("kcal"),
    protein: calculateNutrient("protein"),
    carbs: calculateNutrient("carbs"),
    fat: calculateNutrient("fat"),
    fiber: calculateNutrient("fiber"),
    sodium: calculateNutrient("sodium"),
    water: calculateNutrient("water"),

    code: null,
    source: "Panganku - komposisi gabungan",
    category: "Hidangan campuran",
    type: "Gabungan",
    basis: "100 g",

    ingredients: selectedFoods.map(item => ({
      name: item.name,
      proportion: item.weight / totalWeight * 100
    }))

  };
}
