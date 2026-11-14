
// Database makanan manual tidak lagi digunakan.
// Semua nutrisi diambil dari Panganku.
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
  "telur dadar daun bawang": "telur dadar",
  "tumis buncis wortel": "buncis dan wortel",
  "telur dadar daun bawang": "telur ayam dadar masakan",
"telur dadar": "telur ayam dadar masakan",
"tempe goreng": "tempe kedelai murni goreng",
"tumis buncis wortel": "tumis buncis dan wortel",
"buncis wortel tumis": "tumis buncis dan wortel"
};

// Memuat database Panganku + USDA
export async function loadPangankuDatabase() {
  const pangankuUrl = new URL(
    "../data/panganku/panganku-nutrisi.json",
    import.meta.url
  );

  const usdaUrl = new URL(
    "../data/usda/usda_foundation_kaloriku.json",
    import.meta.url
  );

  // Memuat kedua database secara bersamaan
  const [pangankuResponse, usdaResponse] = await Promise.all([
    fetch(pangankuUrl),
    fetch(usdaUrl)
  ]);

  if (!pangankuResponse.ok) {
    throw new Error("Database Panganku gagal dimuat.");
  }

  if (!usdaResponse.ok) {
    throw new Error("Database USDA gagal dimuat.");
  }

  const pangankuRecords = await pangankuResponse.json();
  const usdaRecords = await usdaResponse.json();

  if (!Array.isArray(pangankuRecords)) {
    throw new Error("Format database Panganku tidak valid.");
  }

  if (!Array.isArray(usdaRecords)) {
    throw new Error("Format database USDA tidak valid.");
  }

  // Panganku ditempatkan lebih dulu agar menjadi prioritas
  const records = [
    ...pangankuRecords,
    ...usdaRecords
  ];

  const database = {};

  records.forEach(item => {
    if (!item.nama || !item.nutrisi) return;

    const name = normalizeFoodName(item.nama);

    // Jika nama sudah ada, pertahankan data pertama.
    // Dengan urutan di atas, Panganku memiliki prioritas.
    if (!name || database[name]) return;

    const n = item.nutrisi;

    const getValue = value => {
      if (
        value === null ||
        value === undefined ||
        value === "" ||
        !Number.isFinite(Number(value))
      ) {
        return null;
      }

      return Number(value);
    };

    const air = getValue(n.air_g);

    database[name] = {
      kcal: getValue(n.energi_kcal),
      protein: getValue(n.protein_g),
      carbs: getValue(n.karbohidrat_g),
      fat: getValue(n.lemak_g),
      fiber: getValue(n.serat_g),
      sodium: getValue(n.natrium_mg),

      water: air !== null && air >= 0 ? air : null,

      code: item.kode,
      source: item.sumber,
      category: item.kategori,
      type: item.tipe,
      basis: item.basis
    };
  });

 

  return database;
}

// Membersihkan nama makanan
export function normalizeFoodName(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[,.]/g, " ")
    .replace(/[-_/]/g, " ")
    .replace(/\s+/g, " ");
}

// Membuat indeks alias yang sudah dinormalisasi
function getAliasTarget(name, aliases) {
  const normalizedAliases = {};

  Object.entries(aliases).forEach(([key, value]) => {
    normalizedAliases[normalizeFoodName(key)] = value;
  });

  return normalizedAliases[name];
}

// Mencari makanan
export function findFood(name, database, aliases = {}) {
  const normalizedName = normalizeFoodName(name);

  if (!normalizedName) return null;

  // 1. Nama persis
  if (database[normalizedName]) {
    return database[normalizedName];
  }

  // 2. Melalui alias
  const alias = getAliasTarget(normalizedName, aliases);

  if (alias) {
    const normalizedAlias = normalizeFoodName(alias);

    if (database[normalizedAlias]) {
      return database[normalizedAlias];
    }
  }

  // 3. Pencarian nama yang mirip
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

// Memberikan semua saran makanan yang mengandung semua kata pencarian
export function findFoodSuggestions(name, database) {
  const query = normalizeFoodName(name);

  if (!query) return [];

  const queryWords = query
    .split(" ")
    .filter(word => word.length > 1);

  return Object.entries(database)
    .map(([foodName, food]) => {
      // Pastikan semua kata pencarian ada di nama makanan
      const containsAllWords = queryWords.every(word =>
        foodName.includes(word)
      );

      if (!containsAllWords) {
        return null;
      }

      let score = 0;

      // Prioritas tertinggi jika seluruh kalimat ditemukan
      if (foodName.includes(query)) {
        score += 10;
      }

      // Beri skor untuk setiap kata yang cocok
      queryWords.forEach(word => {
        if (foodName.includes(word)) {
          score += 2;
        }
      });

      return {
        name: foodName,
        food,
        score
      };
    })
    .filter(item => item !== null)
    .sort((a, b) => b.score - a.score);
}



// Membuat makanan gabungan dari beberapa data Panganku
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

  // Menghitung nilai rata-rata berdasarkan proporsi berat
  const calculateNutrient = key => {
    const values = selectedFoods.map(item => item.food[key]);

    // Jangan menganggap data yang tidak tersedia sebagai nol
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
