
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { createHash } from "node:crypto";

import { GoogleGenAI } from "@google/genai";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// ========================================
// CONFIGURATION
// ========================================

const MODEL_NAME = "gemini-3.1-flash-lite";
const MAX_BATCH_FOODS = 10;

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json({ limit: "1mb" }));

// ========================================
// GEMINI AI
// ========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ========================================
// FIREBASE ADMIN
// ========================================

let db = null;

try {
  const serviceAccountText = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountText) {
    console.warn("FIREBASE_SERVICE_ACCOUNT belum dikonfigurasi.");
  } else {
    const serviceAccount = JSON.parse(serviceAccountText);

    serviceAccount.private_key =
      serviceAccount.private_key?.replace(/\\n/g, "\n");

    const firebaseApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
          });

    db = getFirestore(firebaseApp);

    console.log("Firebase Admin SDK berhasil diinisialisasi.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error.message);
}

// ========================================
// CORS
// ========================================

const allowedOrigins = [
  "https://rovixa-ai.github.io",
  "https://kalorisehatku.rovixa.web.id",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Origin tidak diizinkan oleh CORS: " + origin)
      );
    },
  })
);

// ========================================
// NORMALISASI NAMA MAKANAN
// ========================================

function normalizeFoodName(name) {
  return String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " dan ")
    .replace(/[.,;:()[\]{}'"`]/g, " ")
    .replace(/[-/\\]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ========================================
// ID DOKUMEN FIRESTORE
// ========================================

function createFoodDocumentId(normalizedName) {
  return createHash("sha256")
    .update(normalizedName)
    .digest("hex");
}

// ========================================
// PARSE NUTRISI
// ========================================

function parseNutrient(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// ========================================
// VALIDASI NUTRISI
// ========================================

function validateNutrition(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const kcal = parseNutrient(data.kcal);
  const protein = parseNutrient(data.protein);
  const carbs = parseNutrient(data.carbs);
  const fat = parseNutrient(data.fat);

  if (
    kcal === null ||
    protein === null ||
    carbs === null ||
    fat === null
  ) {
    return false;
  }

  if (
    kcal < 0 || kcal > 900 ||
    protein < 0 || protein > 100 ||
    carbs < 0 || carbs > 100 ||
    fat < 0 || fat > 100
  ) {
    return false;
  }

  const fiber = parseNutrient(data.fiber);
  const sodium = parseNutrient(data.sodium);
  const water = parseNutrient(data.water);

  if (fiber !== null && (fiber < 0 || fiber > 100)) {
    return false;
  }

  if (sodium !== null && (sodium < 0 || sodium > 100000)) {
    return false;
  }

  if (water !== null && (water < 0 || water > 100)) {
    return false;
  }

  return true;
}

// ========================================
// FORMAT DATA
// ========================================

function formatFoodData(data, requestedName) {
  return {
    name: data.name || requestedName,

    kcal: parseNutrient(data.kcal),
    protein: parseNutrient(data.protein),
    carbs: parseNutrient(data.carbs),
    fat: parseNutrient(data.fat),

    fiber: parseNutrient(data.fiber),
    sodium: parseNutrient(data.sodium),
    water: parseNutrient(data.water),

    code: data.code || null,
    source: data.source || "AI",
    category: data.category || "Makanan",
    type: data.type || "food",
    basis: "100 g",

    validationStatus:
      data.validationStatus || "auto_validated",

    isEstimation: data.isEstimation === true,
    confidence: data.confidence || null,
    estimationNotes: data.estimationNotes || "",

    sourceUrls: data.sourceUrls || [],
    sourceNames: data.sourceNames || [],
  };
}

// ========================================
// CARI FIRESTORE
// ========================================

async function findFoodInFirestore(normalizedName) {
  if (!db || !normalizedName) {
    return null;
  }

  const foodsCollection = db.collection("foods");

  // Cari melalui ID dokumen.
  const documentId = createFoodDocumentId(normalizedName);
  const directDocument = await foodsCollection.doc(documentId).get();

  if (directDocument.exists) {
    return directDocument.data();
  }

  // Cari melalui alias.
  const aliasResult = await foodsCollection
    .where("aliases", "array-contains", normalizedName)
    .limit(1)
    .get();

  if (!aliasResult.empty) {
    return aliasResult.docs[0].data();
  }

  return null;
}

// ========================================
// CONFIDENCE
// ========================================

function normalizeConfidence(value) {
  const confidence = String(value || "").toLowerCase();

  if (["low", "medium", "high"].includes(confidence)) {
    return confidence;
  }

  return "low";
}

// ========================================
// SIAPKAN RECORD ESTIMASI AI
// ========================================

function createEstimatedFoodRecord(aiData, requestedName) {
  const foodName = String(aiData.name || requestedName).trim();
  const normalizedFoodName = normalizeFoodName(foodName);

  const normalizedRequestedName =
    normalizeFoodName(requestedName);

  const confidence = normalizeConfidence(aiData.confidence);

  return {
    name: foodName,
    normalizedName: normalizedFoodName,

    aliases: [
      ...new Set([
        normalizedFoodName,
        normalizedRequestedName,
      ].filter(Boolean)),
    ],

    kcal: parseNutrient(aiData.kcal),
    protein: parseNutrient(aiData.protein),
    carbs: parseNutrient(aiData.carbs),
    fat: parseNutrient(aiData.fat),

    fiber: parseNutrient(aiData.fiber),
    sodium: parseNutrient(aiData.sodium),
    water: parseNutrient(aiData.water),

    code: null,

    source: "Gemini AI Estimation",
    category: aiData.category || "Makanan",
    type: "food",
    basis: "100 g",

    description: aiData.description || "",
    estimationNotes: aiData.estimation_notes || "",

    isEstimation: true,
    confidence,

    validationStatus: "ai_estimated",

    sourceUrls: [],
    sourceNames: [],

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ========================================
// SIMPAN ESTIMASI
// TRANSAKSI UNTUK MENCEGAH DUPLIKASI
// ========================================


async function saveEstimatedFood(aiData, requestedName) {
  const normalizedRequestedName =
    normalizeFoodName(requestedName);

  if (!normalizedRequestedName) {
    throw new Error("Nama makanan tidak valid.");
  }

  const foodCollection = db.collection("foods");

  // Gunakan nama permintaan sebagai ID dokumen.
  const foodDocument = foodCollection.doc(
    createFoodDocumentId(normalizedRequestedName)
  );

  const foodData = createEstimatedFoodRecord(
    aiData,
    requestedName
  );

  return db.runTransaction(async transaction => {
    const existingDocument = await transaction.get(foodDocument);

    if (existingDocument.exists) {
      return existingDocument.data();
    }

    transaction.set(foodDocument, foodData);

    return foodData;
  });
}


// ========================================
// TOKEN USAGE LOGGER
// ========================================

function logTokenUsage(result, label = "GEMINI") {
  const usage = result?.usageMetadata;

  console.log(`===== TOKEN ${label} =====`);
  console.log(
    "Input:",
    usage?.promptTokenCount ?? "N/A"
  );
  console.log(
    "Output:",
    usage?.candidatesTokenCount ?? "N/A"
  );
  console.log(
    "Total:",
    usage?.totalTokenCount ?? "N/A"
  );
  console.log("========================");
}

// ========================================
// PARSE JSON GEMINI
// ========================================

function parseGeminiJson(result) {
  const text = result?.text;

  if (!text) {
    throw new Error("Gemini tidak memberikan hasil.");
  }

  return JSON.parse(text);
}

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
  res.json({
    status: "KaloriKu AI aktif",
    firestore: db ? "initialized" : "not_initialized",
    nutritionSearch: "Gemini AI without Google Search grounding",
    batchNutrition: true,
    maxBatchFoods: MAX_BATCH_FOODS,
  });
});

// ========================================
// FIRESTORE HEALTH
// ========================================

app.get("/firestore-health", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        status: "error",
        message: "Firebase Admin SDK belum terinisialisasi.",
      });
    }

    await db.listCollections();

    return res.json({
      status: "connected",
      database: "(default)",
      message: "Koneksi Firestore KaloriKu berhasil.",
    });
  } catch (error) {
    console.error("Firestore health error:", error.message);

    return res.status(503).json({
      status: "error",
      message: "Tidak dapat terhubung ke Firestore.",
    });
  }
});


// ========================================
// LOOKUP FOOD — FIRESTORE READ ONLY
// KHUSUS INPUT MANUAL KALORIKU
// TIDAK MEMANGGIL GEMINI
// TIDAK MENYIMPAN DATA BARU
// ========================================

app.post("/lookup-food", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        found: false,
        error: "Firestore belum terhubung.",
      });
    }

    const requestedName = String(
      req.body?.name || ""
    ).trim();

    if (
      !requestedName ||
      requestedName.length > 150
    ) {
      return res.status(400).json({
        success: false,
        found: false,
        error: "Nama makanan tidak valid.",
      });
    }

    const normalizedName =
      normalizeFoodName(requestedName);

    if (!normalizedName) {
      return res.status(400).json({
        success: false,
        found: false,
        error: "Nama makanan tidak valid.",
      });
    }

    console.log("===== MANUAL FOOD LOOKUP =====");
    console.log("Nama:", requestedName);

    // HANYA MEMBACA FIRESTORE
    const existingFood =
      await findFoodInFirestore(normalizedName);

    if (!existingFood) {
      console.log("Hasil: Tidak ditemukan");
      console.log("==============================");

      return res.json({
        success: true,
        found: false,
        food: null,
        message: "Makanan belum tersedia di database.",
      });
    }

    console.log("Hasil: Ditemukan");
    console.log("Sumber:", existingFood.source || "Firestore");
    console.log("==============================");

    return res.json({
      success: true,
      found: true,
      source: "firestore",
      food: formatFoodData(
        existingFood,
        requestedName
      ),
    });

  } catch (error) {
    console.error(
      "Manual food lookup error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      found: false,
      error: "Gagal mencari makanan di database.",
    });
  }
});


// ========================================
// FIND NUTRITION
// FIRESTORE + GEMINI SINGLE
// ========================================

app.post("/find-nutrition", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        found: false,
        error: "Firestore belum terhubung.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        found: false,
        error: "Gemini API belum dikonfigurasi.",
      });
    }

    const requestedName = String(req.body?.name || "").trim();

    if (!requestedName || requestedName.length > 150) {
      return res.status(400).json({
        found: false,
        error: "Nama makanan tidak valid.",
      });
    }

    const normalizedName = normalizeFoodName(requestedName);

    if (!normalizedName) {
      return res.status(400).json({
        found: false,
        error: "Nama makanan tidak valid.",
      });
    }

    console.log("===== NUTRITION SINGLE =====");
    console.log("Nama:", requestedName);

    // 1. Firestore dahulu.
    const cachedFood = await findFoodInFirestore(normalizedName);

    if (cachedFood) {
      return res.json({
        found: true,
        source: "firestore",
        food: formatFoodData(cachedFood, requestedName),
      });
    }

    // 2. Gemini.
    const prompt = `
Kamu adalah asisten estimasi nutrisi makanan untuk aplikasi KaloriKu.

Estimasi nutrisi makanan:
"${requestedName}"

Utamakan makanan Indonesia jika relevan.
Bedakan makanan mentah, rebus, kukus, goreng, panggang,
dan cara pengolahan lainnya.

Semua nilai per 100 gram bagian yang dapat dimakan:
- kcal dalam kcal
- protein, carbs, fat, fiber dalam gram
- sodium dalam mg
- water dalam gram

Jangan mengklaim data berasal dari database resmi.
Jangan gunakan Google Search.
Jika makanan tidak dapat dikenali dengan cukup yakin,
jawab found false.

Pastikan kalori cukup konsisten dengan protein, carbs, fat.
Rumus referensi: protein*4 + carbs*4 + fat*9.
Jangan memberikan presisi berlebihan.

confidence: low, medium, atau high.
is_estimation harus true.

Jawab JSON:
{
  "found": true,
  "name": "${requestedName}",
  "kcal": 150,
  "protein": 10,
  "carbs": 15,
  "fat": 5,
  "fiber": 2,
  "sodium": 250,
  "water": 60,
  "category": "Makanan jadi",
  "confidence": "medium",
  "is_estimation": true,
  "estimation_notes": "Estimasi berdasarkan komposisi umum makanan."
}

Jika tidak dikenali:
{
  "found": false
}
`;

    const result = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ text: prompt }],
      config: {
        responseMimeType: "application/json",
      },
    });

    logTokenUsage(result, "SINGLE");

    const aiData = parseGeminiJson(result);

    if (aiData.found !== true) {
      return res.json({
        found: false,
        source: "gemini",
        message: "Makanan tidak dapat diidentifikasi.",
      });
    }

    if (!validateNutrition(aiData)) {
      return res.status(422).json({
        found: false,
        error: "Data nutrisi tidak lolos validasi.",
      });
    }

    const foodName = String(
      aiData.name || requestedName
    ).trim();

    if (!foodName || foodName.length > 150) {
      return res.status(422).json({
        found: false,
        error: "Nama makanan tidak valid.",
      });
    }

    const savedFood = await saveEstimatedFood(
      aiData,
      requestedName
    );

    return res.json({
      found: true,
      source: "gemini",
      food: formatFoodData(savedFood, requestedName),
    });

  } catch (error) {
    console.error("Nutrition single error:", error.message);

    const status = Number(error.status || error.statusCode);

    if (status === 429) {
      return res.status(429).json({
        found: false,
        error: "Gemini sedang mencapai batas penggunaan.",
        code: "GEMINI_QUOTA_EXCEEDED",
      });
    }

    return res.status(500).json({
      found: false,
      error: "Gagal mencari data nutrisi.",
      code: "NUTRITION_SEARCH_ERROR",
    });
  }
});

// ========================================
// FIND NUTRITION BATCH
// FIRESTORE FIRST + ONE GEMINI REQUEST
// ========================================

app.post("/find-nutrition-batch", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        success: false,
        error: "Firestore belum terhubung.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        error: "Gemini API belum dikonfigurasi.",
      });
    }

    // ------------------------------------
    // 1. VALIDASI INPUT
    // ------------------------------------

    const rawNames = req.body?.names;

    if (!Array.isArray(rawNames)) {
      return res.status(400).json({
        success: false,
        error: "names harus berupa array.",
      });
    }

    if (rawNames.length === 0) {
      return res.json({
        success: true,
        foods: [],
        total: 0,
        firestoreHits: 0,
        aiGenerated: 0,
      });
    }

    if (rawNames.length > MAX_BATCH_FOODS) {
      return res.status(400).json({
        success: false,
        error: `Maksimal ${MAX_BATCH_FOODS} makanan per batch.`,
      });
    }

    const requestedNames = rawNames
      .map(name => String(name || "").trim())
      .filter(name => name && name.length <= 150);

    if (requestedNames.length !== rawNames.length) {
      return res.status(400).json({
        success: false,
        error: "Terdapat nama makanan kosong atau terlalu panjang.",
      });
    }

    // ------------------------------------
    // 2. HILANGKAN DUPLIKASI
    // ------------------------------------

    const uniqueNamesMap = new Map();

    for (const name of requestedNames) {
      const normalized = normalizeFoodName(name);

      if (!normalized) continue;

      if (!uniqueNamesMap.has(normalized)) {
        uniqueNamesMap.set(normalized, name);
      }
    }

    const uniqueNames = [...uniqueNamesMap.values()];

    console.log("===== NUTRITION BATCH =====");
    console.log("Total makanan:", uniqueNames.length);
    console.log(uniqueNames);

    // ------------------------------------
    // 3. CARI SEMUA DI FIRESTORE
    // ------------------------------------

    const lookupResults = await Promise.all(
      uniqueNames.map(async name => {
        const normalized = normalizeFoodName(name);

        try {
          const existing = await findFoodInFirestore(normalized);

          return {
            name,
            normalized,
            food: existing,
          };
        } catch (error) {
          console.error(
            "Firestore lookup error:",
            name,
            error.message
          );

          return {
            name,
            normalized,
            food: null,
            lookupError: true,
          };
        }
      })
    );

    const foundFoods = new Map();
    const missingFoods = [];

    for (const item of lookupResults) {
      if (item.food) {
        foundFoods.set(item.normalized, item.food);
      } else {
        missingFoods.push(item.name);
      }
    }

    console.log("Firestore ditemukan:", foundFoods.size);
    console.log("Belum ditemukan:", missingFoods.length);
    console.log("===== DETAIL FIRESTORE LOOKUP =====");

for (const item of lookupResults) {
  console.log({
    name: item.name,
    normalized: item.normalized,
    found: Boolean(item.food),
    lookupError: item.lookupError === true,
    source: item.food?.source || null,
  });
}

console.log("===================================");

    // ------------------------------------
    // 4. GEMINI SEKALI UNTUK SEMUA
    // ------------------------------------

    let aiFoods = [];
    let batchAiError = null;

    if (missingFoods.length > 0) {
      const foodList = missingFoods
        .map((name, index) => `${index + 1}. ${name}`)
        .join("\n");

      const prompt = `
Kamu adalah AI estimasi nutrisi untuk aplikasi KaloriKu.

Estimasi nutrisi untuk SEMUA makanan berikut dalam satu kali tugas:

${foodList}

ATURAN IDENTIFIKASI:
- Utamakan makanan Indonesia jika nama makanan berasal dari konteks Indonesia.
- Identifikasi masing-masing makanan secara terpisah.
- Perhatikan metode memasak, bahan, dan penyajian.
- Jangan menyamakan makanan mentah, rebus, kukus, goreng,
  panggang, dan olahan.
- Jika makanan tidak bisa dikenali, set found false untuk
  makanan tersebut saja. Jangan menggagalkan makanan lainnya.

ATURAN NUTRISI:
Semua nilai harus per 100 gram bagian yang dapat dimakan.
- kcal: kilokalori
- protein: gram
- carbs: gram
- fat: gram
- fiber: gram
- sodium: miligram
- water: gram

ATURAN KUALITAS:
- Gunakan estimasi masuk akal.
- Jangan mengklaim menggunakan sumber resmi.
- Jangan menggunakan Google Search.
- Pastikan kcal cukup konsisten dengan protein*4 + carbs*4 + fat*9.
- Jangan terlalu presisi.
- confidence harus low, medium, atau high.
- is_estimation harus selalu true.
- Jika nutrisi tidak diketahui, gunakan null.

Jawab hanya JSON valid dengan format:

{
  "foods": [
    {
      "requested_name": "Nama sesuai daftar input",
      "found": true,
      "name": "Nama makanan",
      "kcal": 150,
      "protein": 10,
      "carbs": 15,
      "fat": 5,
      "fiber": 2,
      "sodium": 250,
      "water": 60,
      "category": "Makanan jadi",
      "confidence": "medium",
      "is_estimation": true,
      "estimation_notes": "Estimasi berdasarkan komposisi umum makanan."
    }
  ]
}

PENTING:
- Kembalikan satu objek untuk setiap nama input.
- requested_name harus sesuai dengan nama input.
- Jangan menghilangkan item.
- Jangan menambahkan makanan di luar daftar.
- Jika gagal mengidentifikasi satu makanan, formatnya:
  {"requested_name":"Nama makanan","found":false}
`;

      try {
        const result = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{ text: prompt }],
          config: {
            responseMimeType: "application/json",
          },
        });

        logTokenUsage(result, "BATCH");

        const aiData = parseGeminiJson(result);

        if (!Array.isArray(aiData.foods)) {
          throw new Error("Respons batch tidak memiliki foods array.");
        }

        aiFoods = aiData.foods;

      } catch (error) {
        batchAiError = error;
        console.error("Batch Gemini error:", error.message);
      }
    }

    // ------------------------------------
    // 5. MAP HASIL AI
    // ------------------------------------

    const aiResultsMap = new Map();

    for (const aiFood of aiFoods) {
      const responseName =
        aiFood.requested_name || aiFood.name || "";

      const normalized = normalizeFoodName(responseName);

      if (normalized) {
        aiResultsMap.set(normalized, aiFood);
      }
    }

    // ------------------------------------
    // 6. VALIDASI DAN SIMPAN
    // ------------------------------------

    const finalFoodsMap = new Map(foundFoods);
    let aiGeneratedCount = 0;

    for (const name of missingFoods) {
      const normalized = normalizeFoodName(name);
      const aiFood = aiResultsMap.get(normalized);

      if (!aiFood || aiFood.found !== true) {
        continue;
      }

      if (!validateNutrition(aiFood)) {
        console.warn("Data batch tidak valid:", name);
        continue;
      }

      try {
        const savedFood = await saveEstimatedFood(
          aiFood,
          name
        );

        finalFoodsMap.set(normalized, savedFood);
        aiGeneratedCount++;

      } catch (error) {
        console.error(
          "Gagal menyimpan makanan:",
          name,
          error.message
        );
      }
    }

    // ------------------------------------
    // 7. FORMAT HASIL SESUAI INPUT
    // ------------------------------------

    const foods = requestedNames.map(name => {
      const normalized = normalizeFoodName(name);
      const food = finalFoodsMap.get(normalized);

      if (!food) {
        return {
          name,
          found: false,
          food: null,
        };
      }

      return {
        name,
        found: true,
        food: formatFoodData(food, name),
      };
    });

    const firestoreHits = foundFoods.size;

    console.log("===== BATCH SELESAI =====");
    console.log("Total:", requestedNames.length);
    console.log("Firestore hits:", firestoreHits);
    console.log("AI generated:", aiGeneratedCount);
    console.log("Failed:", foods.filter(f => !f.found).length);
    console.log("========================");

    // ------------------------------------
    // 8. RESPONSE
    // ------------------------------------

    return res.json({
      success: true,
      foods,
      total: requestedNames.length,
      firestoreHits,
      aiGenerated: aiGeneratedCount,
      failed: foods.filter(item => !item.found).length,
      ...(batchAiError
        ? { batchError: "Sebagian data gagal diproses AI." }
        : {}),
    });

  } catch (error) {
    console.error("===== BATCH ERROR =====");
    console.error(error.message);
    console.error("======================");

    const status = Number(error.status || error.statusCode);

    if (status === 429) {
      return res.status(429).json({
        success: false,
        error: "Gemini sedang mencapai batas penggunaan.",
        code: "GEMINI_QUOTA_EXCEEDED",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Gagal memproses pencarian nutrisi batch.",
      code: "NUTRITION_BATCH_ERROR",
    });
  }
});

// ========================================
// ANALYZE FOOD — FOTO
// ========================================

app.post("/analyze-food", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Foto makanan tidak ditemukan.",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "File harus berupa gambar.",
      });
    }

    const prompt = `
Analisis foto makanan ini untuk aplikasi KaloriKu.

Identifikasi makanan yang terlihat.
Berikan estimasi berat porsi dalam gram.
Jika ada beberapa makanan, pisahkan masing-masing.

Jawab hanya JSON:

{
  "foods": [
    {
      "name": "nama makanan dalam bahasa Indonesia",
      "estimatedWeight": 100,
      "confidence": "tinggi",
      "description": "deskripsi singkat"
    }
  ]
}

Jangan mengarang jika makanan tidak dapat dikenali.
Perkiraan berat adalah estimasi visual, bukan pengukuran pasti.
`;

    const result = await ai.models.generateContent({
      model: MODEL_NAME,

      contents: [
        {
          inlineData: {
            mimeType: req.file.mimetype,
            data: req.file.buffer.toString("base64"),
          },
        },
        {
          text: prompt,
        },
      ],

      config: {
        responseMimeType: "application/json",
      },
    });

    logTokenUsage(result, "PHOTO ANALYSIS");

    const data = parseGeminiJson(result);

    if (!Array.isArray(data.foods)) {
      return res.status(502).json({
        error: "Format hasil analisis foto tidak valid.",
      });
    }

    return res.json(data);

  } catch (error) {
    console.error("Analyze food error:", error.message);

    const status = Number(error.status || error.statusCode);

    if (status === 429) {
      return res.status(429).json({
        error: "Gemini sedang mencapai batas penggunaan.",
        code: "GEMINI_QUOTA_EXCEEDED",
      });
    }

    return res.status(500).json({
      error: "Gagal menganalisis makanan.",
    });
  }
});



app.get("/debug-food", async (req, res) => {
  try {
    const name = String(req.query.name || "").trim();
    const normalized = normalizeFoodName(name);

    if (!normalized) {
      return res.status(400).json({
        success: false,
        error: "Nama makanan wajib diisi."
      });
    }

    const documentId = createFoodDocumentId(normalized);

    const doc = await db
      .collection("foods")
      .doc(documentId)
      .get();

    const aliasQuery = await db
      .collection("foods")
      .where("aliases", "array-contains", normalized)
      .limit(5)
      .get();

    return res.json({
      success: true,
      requestedName: name,
      normalizedName: normalized,
      documentId,
      directDocumentFound: doc.exists,
      aliasDocumentsFound: aliasQuery.size,
      directDocumentName: doc.exists
        ? doc.data().name
        : null,
      aliasDocumentNames: aliasQuery.docs.map(
        item => item.data().name
      )
    });

  } catch (error) {
    console.error("Debug food error:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`KaloriKu AI berjalan di port ${PORT}`);
});
