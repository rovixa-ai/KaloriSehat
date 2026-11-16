
// Database makanan manual tidak lagi digunakan.
// Nutrisi diambil dari Panganku, TKPI, dan USDA.

export const foods = {};

export const foodAliases = {
  
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

function getAliasTarget(name, aliases = {}) {
  const normalizedAliases = {};

  Object.entries(aliases).forEach(([key, value]) => {
    normalizedAliases[normalizeFoodName(key)] = value;
  });

  return normalizedAliases[name];
}


// ========================================
// NORMALISASI KATA MAKANAN
// ========================================

const foodWordAliases = {
  "toge": "tauge",
  "taoge": "tauge",
  "telor": "telur",
  "gorengan": "goreng",
  "digoreng": "goreng",
  "menggoreng": "goreng",
  "dibakar": "bakar",
  "panggang": "bakar",
  "dipanggang": "bakar",
  "direbus": "rebus",
  "merebus": "rebus",
  "dikukus": "kukus",
  "ditumis": "tumis",
  "menumis": "tumis",
  "bertepung": "tepung"
};

function normalizeFoodWords(name) {
  return normalizeFoodName(name)
    .split(" ")
    .filter(Boolean)
    .map(word => foodWordAliases[word] || word);
}


// ========================================
// KATEGORI KATA MAKANAN
// ========================================

// Kata yang menjelaskan cara pengolahan
const cookingMethods = [
  "goreng",
  "bakar",
  "rebus",
  "kukus",
  "tumis",
  "panggang",
  "pepes"
];

// Kata yang dapat mengubah karakteristik makanan
const importantModifiers = [
  "tepung",
  "santan",
  "crispy",
  "kering",
  "basah",
  "asin",
  "manis",
  "pedas",
  "sambal"
];

const ignoredWords = [
  "dan",
  "dengan",
  "atau",
  "yang",
  "masakan",
  "makanan"
];

function getImportantWords(words) {
  return words.filter(word =>
    cookingMethods.includes(word) ||
    importantModifiers.includes(word)
  );
}

function getWordWeight(word) {
  if (cookingMethods.includes(word)) return 1.8;
  if (importantModifiers.includes(word)) return 1.6;
  return 1.3;
}


// ========================================
// SKOR KEC0COKAN MAKANAN
// ========================================


function calculateFoodMatchScore(query, candidate) {

  const queryWords = [
    ...new Set(
      normalizeFoodWords(query)
        .filter(word => !ignoredWords.includes(word))
    )
  ];

  const candidateWords = [
    ...new Set(
      normalizeFoodWords(candidate)
        .filter(word => !ignoredWords.includes(word))
    )
  ];

  if (!queryWords.length || !candidateWords.length) {
    return 0;
  }

  // Nama sama persis
  if (queryWords.join(" ") === candidateWords.join(" ")) {
    return 100;
  }

  // Pisahkan kata bahan, pengolahan, dan karakter tambahan
  const queryIngredients = queryWords.filter(word =>
    !cookingMethods.includes(word) &&
    !importantModifiers.includes(word)
  );

  const candidateIngredients = candidateWords.filter(word =>
    !cookingMethods.includes(word) &&
    !importantModifiers.includes(word)
  );

  // --------------------------------------
  // 1. KECOCOKAN BAHAN UTAMA
  // --------------------------------------

  const matchedIngredients = queryIngredients.filter(word =>
    candidateIngredients.includes(word)
  );

  // Tidak boleh cocok hanya karena kata goreng,
  // tepung, rebus, atau kata pengolahan lainnya.
  if (
    queryIngredients.length > 0 &&
    matchedIngredients.length === 0
  ) {
    return 0;
  }

  const ingredientRecall = queryIngredients.length
    ? matchedIngredients.length / queryIngredients.length
    : 0;

  const ingredientPrecision = candidateIngredients.length
    ? matchedIngredients.length / candidateIngredients.length
    : 0;

  // --------------------------------------
  // 2. HITUNG JUMLAH KATA YANG COCOK
  // --------------------------------------

  const matchedWords = queryWords.filter(word =>
    candidateWords.includes(word)
  );

  const wordRecall = matchedWords.length / queryWords.length;

  // --------------------------------------
  // 3. KECOCOKAN CARA PENGOLAHAN
  // --------------------------------------

  const queryMethods = queryWords.filter(word =>
    cookingMethods.includes(word)
  );

  const candidateMethods = candidateWords.filter(word =>
    cookingMethods.includes(word)
  );

  let methodScore = 0;

  if (queryMethods.length > 0) {

    const matchedMethods = queryMethods.filter(method =>
      candidateMethods.includes(method)
    );

    methodScore =
      (matchedMethods.length / queryMethods.length) * 15;

    // Penalti jika cara pengolahan berbeda
    if (matchedMethods.length === 0) {
      methodScore = -15;
    }

  }

  // --------------------------------------
  // 4. KECOCOKAN KATA TAMBAHAN
  // --------------------------------------

  const queryModifiers = queryWords.filter(word =>
    importantModifiers.includes(word)
  );

  const candidateModifiers = candidateWords.filter(word =>
    importantModifiers.includes(word)
  );

  let modifierScore = 0;

  if (queryModifiers.length > 0) {

    const matchedModifiers = queryModifiers.filter(word =>
      candidateModifiers.includes(word)
    );

    modifierScore =
      (matchedModifiers.length / queryModifiers.length) * 10;

  }

  // --------------------------------------
  // 5. HITUNG SKOR AKHIR
  // --------------------------------------

  let score =
    (ingredientRecall * 35) +
    (ingredientPrecision * 25) +
    (wordRecall * 15) +
    methodScore +
    modifierScore;

  // Kandidat dengan terlalu banyak kata tambahan
  // mendapat sedikit penalti.
  const extraWords = candidateWords.filter(word =>
    !queryWords.includes(word)
  );

  score -= extraWords.length * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}




// ========================================
// PENCARIAN KANDIDAT TERBAIK
// ========================================

export function findFoodSuggestions(name, database) {

  const query = normalizeFoodName(name);

  if (!query || !database) return [];

  // --------------------------------------
  // 1. CARI NAMA PERSIS
  // --------------------------------------

  if (database[query]) {
    return [{
      name: query,
      food: database[query],
      score: 100,
      matchType: "exact"
    }];
  }

  // --------------------------------------
  // 2. CARI BERDASARKAN SKOR
  // --------------------------------------

  const matches = Object.entries(database)
    .map(([foodName, food]) => {

      const score = calculateFoodMatchScore(
        query,
        foodName
      );

      return {
        name: foodName,
        food,
        score: Math.round(score),
        matchType: "similar"
      };

    })
    .filter(item => item.score >= 30)
    .sort((a, b) => b.score - a.score);

  return matches;
}


// ========================================
// PENCARIAN MAKANAN TERBAIK
// ========================================

export function findBestFoodMatch(
  name,
  database,
  aliases = {}
) {

  const normalizedName = normalizeFoodName(name);

  if (!normalizedName || !database) return null;

  // 1. Nama persis
  if (database[normalizedName]) {
    return {
      name: normalizedName,
      food: database[normalizedName],
      score: 100,
      matchType: "exact"
    };
  }

  // 2. Alias yang sudah disimpan pengguna
  const alias = getAliasTarget(normalizedName, aliases);

  if (alias) {

    const normalizedAlias = normalizeFoodName(alias);

    if (database[normalizedAlias]) {
      return {
        name: normalizedAlias,
        food: database[normalizedAlias],
        score: 100,
        matchType: "alias"
      };
    }

  }

  // 3. Pencocokan berdasarkan skor
  const suggestions = findFoodSuggestions(
    normalizedName,
    database
  );

  if (!suggestions.length) return null;

  const bestMatch = suggestions[0];

  // Batas minimal untuk pencocokan otomatis.
  // Kandidat di bawah nilai ini perlu dipilih manual.
  if (bestMatch.score < 70) {
    return null;
  }

  return bestMatch;
}


// ========================================
// FUNGSI LAMA - TETAP KOMPATIBEL
// ========================================

export function findFood(name, database, aliases = {}) {

  const result = findBestFoodMatch(
    name,
    database,
    aliases
  );

  return result ? result.food : null;
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
