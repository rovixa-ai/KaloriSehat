
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
// MEMBACA VARIASI NAMA DARI PANGANKU
// ========================================

function extractFoodNameAliases(originalName) {
  const aliases = new Set();

  const parts = String(originalName || "")
    .split(",")
    .map(part => normalizeFoodName(part))
    .filter(Boolean);

  if (parts.length <= 1) return [];

  // Simpan nama lengkap setiap bagian.
  parts.forEach(part => aliases.add(part));

  // Ambil konteks nama dari bagian pertama
  // dan bagian berikutnya.
  const prefixes = new Set();

  for (const part of parts) {
    const words = part.split(" ");

    // Cari konteks bahan utama sebelum metode memasak.
    const methodIndex = words.findIndex(word =>
      cookingMethods.includes(word)
    );

    if (methodIndex > 0) {
      prefixes.add(words.slice(0, methodIndex).join(" "));
    } else if (words.length > 1) {
      prefixes.add(words.slice(0, -1).join(" "));
    }
  }

  // Gabungkan konteks dengan variasi nama pendek.
  for (const part of parts) {
    if (part.split(" ").length > 2) continue;

    for (const prefix of prefixes) {
      if (prefix && !part.startsWith(prefix + " ")) {
        aliases.add(`${prefix} ${part}`);
      }
    }
  }

  return [...aliases].filter(alias =>
    alias !== normalizeFoodName(originalName)
  );
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
  const generatedAliases = {};
  let pangankuCount = 0;
  let usdaCount = 0;
  let duplicateCount = 0;
const duplicateDetails = [];

  
function addFood(name, food, sourceType) {
  const normalizedName = normalizeFoodName(name);

  if (!normalizedName || !food) return;

  if (database[normalizedName]) {
    duplicateCount++;
    return;
  }

  database[normalizedName] = food;

  if (sourceType === "Panganku") {
    pangankuCount++;

    // Buat alias otomatis dari nama
    // yang memiliki pemisah koma.
    const aliases = extractFoodNameAliases(name);

    aliases.forEach(alias => {
      if (
        !database[alias] &&
        !generatedAliases[alias]
      ) {
        generatedAliases[alias] = normalizedName;
      }
    });

  } else if (sourceType === "USDA") {
    usdaCount++;
  }
}



 
  // --------------------------------------
  // 1. PANGANKU
  // --------------------------------------

  // Mendukung format:
  // 1. Array biasa: [...]
  // 2. Array bertingkat: [[...]]

  const pangankuItems = pangankuRecords.flat(Infinity);

  pangankuItems.forEach(item => {

    const food = convertPanganku(item);

    if (!food) return;

    // Gunakan nama hasil konversi agar format
    // "nama" dan "name" sama-sama terbaca.
    addFood(food.name, food, "Panganku");

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

// 1. Masukkan alias otomatis dari Panganku.
Object.entries(generatedAliases).forEach(
  ([alias, target]) => {
    if (
      database[target] &&
      !database[alias]
    ) {
      validAliases[alias] = target;
    }
  }
);

// 2. Masukkan alias manual.
// Alias manual memiliki prioritas lebih tinggi.
Object.entries(aliasRecords).forEach(
  ([alias, target]) => {
    const aliasKey = normalizeFoodName(alias);
    const targetKey = normalizeFoodName(target);

    if (!aliasKey || !targetKey) return;

    if (!database[targetKey]) return;

    // Jangan menimpa nama makanan asli.
    if (database[aliasKey]) return;

    validAliases[aliasKey] = target;
  }
);

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

// Sinonim dan variasi penulisan kata
const foodWordAliases = {
  "toge": "tauge",
  "taoge": "tauge",
  "telor": "telur",

  "digoreng": "goreng",
  "menggoreng": "goreng",
  "gorengan": "goreng",

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

// Sinonim berupa gabungan kata.
// Hanya gunakan padanan yang cukup spesifik.
const foodPhraseAliases = {
  "telur ceplok": "telur mata sapi",
  "telor ceplok": "telur mata sapi",
  "telor mata sapi": "telur mata sapi",

  "ayam goreng crispy": "ayam goreng tepung",
  "ayam crispy goreng": "ayam goreng tepung",

  "kentang goreng french fries": "kentang goreng"
};

function normalizeFoodWords(name) {
  let normalized = normalizeFoodName(name);

  // Normalisasi frasa sebelum kata per kata
  for (const [alias, target] of Object.entries(foodPhraseAliases)) {
    const pattern = new RegExp(
      `\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "g"
    );

    normalized = normalized.replace(pattern, target);
  }

  return normalized
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

// Kata umum yang tidak cukup untuk menentukan
// identitas bahan makanan.
const genericFoodWords = [
  "sayur",
  "sayuran",
  "masakan",
  "makanan",
  "hidangan",
  "lauk",
  "menu"
];

const ignoredWords = [
  "dan",
  "dengan",
  "atau",
  "yang"
];

function isCookingMethod(word) {
  return cookingMethods.includes(word);
}

function isImportantModifier(word) {
  return importantModifiers.includes(word);
}

function isGenericFoodWord(word) {
  return genericFoodWords.includes(word);
}

function getUniqueWords(words) {
  return [...new Set(words)];
}


// ========================================
// NORMALISASI KATA UNTUK PENCOCOKAN
// ========================================

function getFoodTokens(name) {
  return getUniqueWords(
    normalizeFoodWords(name).filter(word =>
      !ignoredWords.includes(word)
    )
  );
}

function getIngredientTokens(words) {
  return words.filter(word =>
    !isCookingMethod(word) &&
    !isImportantModifier(word) &&
    !isGenericFoodWord(word)
  );
}


// ========================================
// SKOR KECOCOKAN MAKANAN
// ========================================

function calculateFoodMatchScore(query, candidate) {
  const queryWords = getFoodTokens(query);
  const candidateWords = getFoodTokens(candidate);

  if (!queryWords.length || !candidateWords.length) {
    return 0;
  }

  // Nama setelah normalisasi sama
  if (queryWords.join(" ") === candidateWords.join(" ")) {
    return 100;
  }

  const queryIngredients = getIngredientTokens(queryWords);
  const candidateIngredients = getIngredientTokens(candidateWords);

  // Metode memasak
  const queryMethods = queryWords.filter(isCookingMethod);
  const candidateMethods = candidateWords.filter(isCookingMethod);

  // Jika keduanya menyebut metode berbeda,
  // jangan menganggapnya makanan yang sama.
  if (
    queryMethods.length &&
    candidateMethods.length &&
    !queryMethods.some(method =>
      candidateMethods.includes(method)
    )
  ) {
    return 0;
  }

  // Bahan utama harus memiliki kecocokan.
  const matchedIngredients = queryIngredients.filter(word =>
    candidateIngredients.includes(word)
  );

  if (
    queryIngredients.length &&
    matchedIngredients.length === 0
  ) {
    return 0;
  }

  // Jika nama AI terlalu umum, jangan memberikan
  // skor tinggi hanya karena metode memasaknya sama.
  if (
    queryIngredients.length === 0 &&
    candidateIngredients.length > 0
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

  // Skor metode memasak
  let methodScore = 0;

  if (queryMethods.length) {
    const matchedMethods = queryMethods.filter(method =>
      candidateMethods.includes(method)
    );

    methodScore = matchedMethods.length
      ? (matchedMethods.length / queryMethods.length) * 15
      : -15;
  }

  // Skor modifier
  const queryModifiers = queryWords.filter(isImportantModifier);
  const candidateModifiers = candidateWords.filter(isImportantModifier);

  let modifierScore = 0;

  if (queryModifiers.length) {
    const matchedModifiers = queryModifiers.filter(word =>
      candidateModifiers.includes(word)
    );

    modifierScore =
      (matchedModifiers.length / queryModifiers.length) * 10;
  }

  // Bobot bahan dibuat lebih besar daripada
  // kesamaan kata umum.
  let score =
    ingredientRecall * 35 +
    ingredientPrecision * 25 +
    wordRecall * 15 +
    methodScore +
    modifierScore;

  // Kurangi skor jika kandidat memiliki
  // bahan tambahan yang tidak disebut AI.
  const extraIngredients = candidateIngredients.filter(word =>
    !queryIngredients.includes(word)
  );

  score -= extraIngredients.length * 5;

  // Kurangi skor untuk modifier yang tidak sesuai.
  const extraModifiers = candidateModifiers.filter(word =>
    !queryWords.includes(word)
  );

  score -= extraModifiers.length * 3;

  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
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

  // 1. Nama persis
  if (database[query]) {
    return [{
      name: query,
      food: database[query],
      score: 100,
      matchType: "exact"
    }];
  }

  // 2. Alias
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

  // 3. Pencocokan variasi kata
  const matches = Object.entries(database)
    .map(([foodName, food]) => {
      const score = calculateFoodMatchScore(
        query,
        foodName
      );

      return {
        name: foodName,
        food,
        score,
        matchType: "similar"
      };
    })
    .filter(item => item.score >= 25)
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

  // 1. Nama persis
  if (database[normalizedName]) {
    return {
      name: normalizedName,
      food: database[normalizedName],
      score: 100,
      matchType: "exact"
    };
  }

  // 2. Alias
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

  // 3. Pencocokan berdasarkan skor
  const suggestions = findFoodSuggestions(
    normalizedName,
    database,
    aliases
  );

  if (!suggestions.length) return null;

  const bestMatch = suggestions[0];
  const secondMatch = suggestions[1];

  // Ambang otomatis
  if (bestMatch.score < 70) {
    return null;
  }

  // Jika dua kandidat memiliki skor hampir sama,
  // jangan memilih secara otomatis.
  if (
    secondMatch &&
    bestMatch.score - secondMatch.score < 8
  ) {
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
