
// ========================================
// KALORIKU — FOOD DATABASE
// Sumber: Panganku dan USDA
//
// Prioritas:
// 1. Panganku
// 2. USDA
//
// Alias:
// Panganku dan alias manual
// ========================================

export const foods = {};

// Alias dimuat dari JSON
export let foodAliases = {};


// ========================================
// HELPER: NORMALISASI NAMA
// ========================================

export function normalizeFoodName(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " dan ")
    .replace(/[,.]/g, " ")
    .replace(/[-_/]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
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

  if (!item) return null;

  // Mendukung dua format:
  // 1. Format bertingkat: nama + nutrisi
  // 2. Format datar: name + energy_kcal

  const isNested = Boolean(item.nama && item.nutrisi);

  const name = isNested
    ? item.nama
    : item.name;

  const n = isNested
    ? item.nutrisi
    : item;

  if (!name || !n) return null;

  const air = getValue(n.air_g);

  return {
    name,

    kcal: getValue(
      n.energi_kcal ?? n.energy_kcal
    ),

    protein: getValue(n.protein_g),

    carbs: getValue(
      n.karbohidrat_g ?? n.carb_g
    ),

    fat: getValue(
      n.lemak_g ?? n.fat_g
    ),

    fiber: getValue(
      n.serat_g ?? n.fiber_g
    ),

    sodium: getValue(n.natrium_mg ?? n.sodium_mg),

    water: air !== null && air >= 0
      ? air
      : null,

    code: item.kode ?? item.code ?? null,

    source:
      item.sumber ??
      item.source ??
      "Panganku",

    category: item.kategori ?? item.category ?? null,

    type: item.tipe ?? item.section ?? null,

    basis: item.basis ?? "100 g",

    calcium: getValue(n.kalsium_mg ?? n.calcium_mg),
    phosphorus: getValue(n.fosfor_mg ?? n.phosphorus_mg),
    iron: getValue(n.besi_mg ?? n.iron_mg),
    potassium: getValue(n.kalium_mg ?? n.potassium_mg),
    copper: getValue(n.tembaga_mg ?? n.copper_mg),
    zinc: getValue(n.seng_mg ?? n.zinc_mg),

    retinol: getValue(n.retinol_mcg),
    beta_carotene: getValue(n.beta_karoten_mcg ?? n.beta_carotene_mcg),
    carotene_total: getValue(n.total_karoten_mcg ?? n.carotene_total_mcg),

    thiamin: getValue(n.tiamin_mg ?? n.thiamin_mg),
    riboflavin: getValue(n.riboflavin_mg),
    niacin: getValue(n.niasin_mg ?? n.niacin_mg),
    vitamin_c: getValue(n.vitamin_c_mg)
  };
}



// ========================================
// KONVERSI USDA
// ========================================

function convertUSDA(item) {
  if (!item.nama || !item.nutrisi) return null;

  const n = item.nutrisi;
  const air = getValue(n.air_g);

  return {
    name: item.nama,

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
}


// ========================================
// MEMUAT DATABASE PANGANKU DAN USDA
// ========================================

export async function loadPangankuDatabase() {

  const pangankuUrl = new URL(
    "../data/panganku/panganku-nutrisi.json",
    import.meta.url
  );

  const usdaUrl = new URL(
    "../data/usda/usda_foundation_kaloriku.json",
    import.meta.url
  );

  const aliasUrl = new URL(
    "../data/food-aliases.json",
    import.meta.url
  );


  // --------------------------------------
  // MUAT SEMUA FILE
  // --------------------------------------

  const [
    pangankuResponse,
    usdaResponse,
    aliasResponse
  ] = await Promise.all([
    fetch(pangankuUrl),
    fetch(usdaUrl),
    fetch(aliasUrl)
  ]);

  if (!pangankuResponse.ok) {
    throw new Error("Database Panganku gagal dimuat.");
  }

  if (!usdaResponse.ok) {
    throw new Error("Database USDA gagal dimuat.");
  }

  if (!aliasResponse.ok) {
    throw new Error("File alias makanan gagal dimuat.");
  }


  // --------------------------------------
  // PARSING JSON
  // --------------------------------------

  const [
    pangankuRecords,
    usdaRecords,
    aliasRecords
  ] = await Promise.all([
    pangankuResponse.json(),
    usdaResponse.json(),
    aliasResponse.json()
  ]);


  // --------------------------------------
  // VALIDASI FORMAT DATABASE
  // --------------------------------------

  if (!Array.isArray(pangankuRecords)) {
    throw new Error("Format database Panganku tidak valid.");
  }

  if (!Array.isArray(usdaRecords)) {
    throw new Error("Format database USDA tidak valid.");
  }

  if (
    !aliasRecords ||
    typeof aliasRecords !== "object" ||
    Array.isArray(aliasRecords)
  ) {
    throw new Error("Format file food-aliases.json tidak valid.");
  }


  // --------------------------------------
  // PRIORITAS DATABASE
  // --------------------------------------

  const database = {};

  let pangankuCount = 0;
  let usdaCount = 0;
  let duplicateCount = 0;

  function addFood(name, food, sourceType) {

    const normalizedName = normalizeFoodName(name);

    if (!normalizedName || !food) return;

    // Data sumber prioritas lebih tinggi
    // tidak akan ditimpa.
    if (database[normalizedName]) {
      duplicateCount++;
      return;
    }

    database[normalizedName] = food;

    if (sourceType === "Panganku") {
      pangankuCount++;
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
  // 2. USDA
  // --------------------------------------

  usdaRecords.forEach(item => {

    const food = convertUSDA(item);

    if (!food) return;

    addFood(item.nama, food, "USDA");

  });


  // ======================================
  // MEMUAT ALIAS MAKANAN
  // ======================================

  const validAliases = {};

  Object.entries(aliasRecords).forEach(([alias, target]) => {

    const aliasKey = normalizeFoodName(alias);
    const targetKey = normalizeFoodName(target);

    if (!aliasKey || !targetKey) return;

    // Target alias wajib tersedia
    // dalam database gabungan.
    if (!database[targetKey]) return;

    // Jangan menimpa nama makanan asli.
    if (database[aliasKey]) return;

    validAliases[aliasKey] = target;

  });

  foodAliases = validAliases;


  // ======================================
  // STATISTIK DATABASE
  // ======================================

  console.log("====================================");
  console.log("       DATABASE KALORIKU");
  console.log("====================================");

  console.log("Panganku :", pangankuCount);
  console.log("USDA     :", usdaCount);

  console.log("------------------------------------");

  console.log(
    "Total makanan unik :",
    Object.keys(database).length
  );

  console.log(
    "Total duplikat     :",
    duplicateCount
  );

  console.log(
    "Total alias aktif  :",
    Object.keys(foodAliases).length
  );

  console.log("====================================");

  return database;
}


// ========================================
// ALIAS MAKANAN
// ========================================

function getAliasTarget(name, aliases = foodAliases) {

  const normalizedName = normalizeFoodName(name);

  if (!normalizedName || !aliases) {
    return null;
  }

  if (aliases[normalizedName]) {
    return aliases[normalizedName];
  }

  const key = Object.keys(aliases).find(item =>
    normalizeFoodName(item) === normalizedName
  );

  return key ? aliases[key] : null;
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

const cookingMethods = [
  "goreng",
  "bakar",
  "rebus",
  "kukus",
  "tumis",
  "panggang",
  "pepes"
];


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
// SKOR KECOCOKAN MAKANAN
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

  if (queryWords.join(" ") === candidateWords.join(" ")) {
    return 100;
  }

  const queryIngredients = queryWords.filter(word =>
    !cookingMethods.includes(word) &&
    !importantModifiers.includes(word)
  );

  const candidateIngredients = candidateWords.filter(word =>
    !cookingMethods.includes(word) &&
    !importantModifiers.includes(word)
  );

  const matchedIngredients = queryIngredients.filter(word =>
    candidateIngredients.includes(word)
  );

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

  const matchedWords = queryWords.filter(word =>
    candidateWords.includes(word)
  );

  const wordRecall = matchedWords.length / queryWords.length;

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

    if (matchedMethods.length === 0) {
      methodScore = -15;
    }

  }

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

  let score =
    (ingredientRecall * 35) +
    (ingredientPrecision * 25) +
    (wordRecall * 15) +
    methodScore +
    modifierScore;

  const extraWords = candidateWords.filter(word =>
    !queryWords.includes(word)
  );

  score -= extraWords.length * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}


// ========================================
// PENCARIAN KANDIDAT TERBAIK
// ========================================

export function findFoodSuggestions(
  name,
  database,
  aliases = foodAliases
) {

  const query = normalizeFoodName(name);

  if (!query || !database) return [];

  // 1. NAMA PERSIS

  if (database[query]) {

    return [{
      name: query,
      food: database[query],
      score: 100,
      matchType: "exact"
    }];

  }

  // 2. ALIAS

  const alias = getAliasTarget(query, aliases);

  if (alias) {

    const normalizedAlias = normalizeFoodName(alias);

    if (database[normalizedAlias]) {

      return [{
        name: normalizedAlias,
        food: database[normalizedAlias],
        score: 100,
        matchType: "alias"
      }];

    }

  }

  // 3. PENCOCOKAN FUZZY

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
  aliases = foodAliases
) {

  const normalizedName = normalizeFoodName(name);

  if (!normalizedName || !database) return null;

  // 1. NAMA PERSIS

  if (database[normalizedName]) {

    return {
      name: normalizedName,
      food: database[normalizedName],
      score: 100,
      matchType: "exact"
    };

  }

  // 2. ALIAS

  const alias = getAliasTarget(
    normalizedName,
    aliases
  );

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

  // 3. PENCOCOKAN BERDASARKAN SKOR

  const suggestions = findFoodSuggestions(
    normalizedName,
    database,
    aliases
  );

  if (!suggestions.length) return null;

  const bestMatch = suggestions[0];

  // Minimal skor pencocokan otomatis
  if (bestMatch.score < 70) {
    return null;
  }

  return bestMatch;
}


// ========================================
// FUNGSI LAMA - TETAP KOMPATIBEL
// ========================================

export function findFood(
  name,
  database,
  aliases = foodAliases
) {

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

    let matchedName = name;

    if (!database[matchedName]) {

      const alias = getAliasTarget(name);

      if (alias) {
        matchedName = normalizeFoodName(alias);
      }

    }

    const food = database[matchedName];

    if (!food) {

      throw new Error(
        `Bahan "${item.name}" tidak ditemukan.`
      );

    }

    if (
      !Number.isFinite(item.weight) ||
      item.weight <= 0
    ) {

      throw new Error(
        "Berat komposisi bahan tidak valid."
      );

    }

    return {
      name: matchedName,
      weight: item.weight,
      food
    };

  });


  // TOTAL BERAT

  const totalWeight = selectedFoods.reduce(
    (sum, item) => sum + item.weight,
    0
  );


  // HITUNG NUTRISI

  const calculateNutrient = key => {

    const values = selectedFoods.map(
      item => item.food[key]
    );

    if (
      values.some(value =>
        value === null ||
        value === undefined ||
        !Number.isFinite(value)
      )
    ) {
      return null;
    }

    return selectedFoods.reduce(
      (sum, item) =>
        sum + item.food[key] * item.weight / totalWeight,
      0
    );

  };


  // HASIL MAKANAN GABUNGAN

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

      proportion:
        item.weight / totalWeight * 100

    }))

  };

}
