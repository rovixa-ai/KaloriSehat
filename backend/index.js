
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
// EXPRESS
// ========================================

const app = express();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());

// ========================================
// GEMINI AI
// ========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ========================================
// FIREBASE ADMIN SDK
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
    origin: function (origin, callback) {
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
// HELPER NORMALISASI NAMA MAKANAN
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
// HELPER ID DOKUMEN FIRESTORE
// ========================================

function createFoodDocumentId(normalizedName) {
  return createHash("sha256")
    .update(normalizedName)
    .digest("hex");
}

// ========================================
// HELPER NILAI NUTRISI
// ========================================

function parseNutrient(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// ========================================
// VALIDASI DATA NUTRISI
// ========================================

function validateNutrition(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const kcal = parseNutrient(data.kcal);
  const protein = parseNutrient(data.protein);
  const carbs = parseNutrient(data.carbs);
  const fat = parseNutrient(data.fat);

  // Nutrisi utama wajib tersedia.
  if (
    kcal === null ||
    protein === null ||
    carbs === null ||
    fat === null
  ) {
    return false;
  }

  // Validasi batas teknis per 100 gram.
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
// FORMAT DATA MAKANAN
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

    validationStatus: data.validationStatus || "auto_validated",

    sourceUrls: data.sourceUrls || [],
    sourceNames: data.sourceNames || [],
  };
}

// ========================================
// PENCARIAN MAKANAN DI FIRESTORE
// ========================================

async function findFoodInFirestore(normalizedName) {
  const foodsCollection = db.collection("foods");

  // 1. Cari berdasarkan ID dokumen.
  const documentId = createFoodDocumentId(normalizedName);
  const directDocument = await foodsCollection.doc(documentId).get();

  if (directDocument.exists) {
    return directDocument.data();
  }

  // 2. Cari berdasarkan alias.
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
// HOME
// ========================================

app.get("/", (req, res) => {
  res.json({
    status: "KaloriKu AI aktif",
    firestore: db ? "initialized" : "not_initialized",
  });
});

// ========================================
// FIRESTORE CONNECTION TEST
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
    console.error("Firestore health error:", error);

    return res.status(503).json({
      status: "error",
      message: "Tidak dapat terhubung ke Firestore.",
    });
  }
});

// ========================================
// FIND NUTRITION — FIRESTORE + GEMINI
// ========================================

app.post("/find-nutrition", async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({
        error: "Firestore belum terhubung.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API belum dikonfigurasi.",
      });
    }

    const requestedName = String(req.body?.name || "").trim();

    if (!requestedName || requestedName.length > 150) {
      return res.status(400).json({
        error: "Nama makanan tidak valid.",
      });
    }

    const normalizedName = normalizeFoodName(requestedName);

    if (!normalizedName) {
      return res.status(400).json({
        error: "Nama makanan tidak valid.",
      });
    }

    console.log("===== PENCARIAN NUTRISI =====");
    console.log("Nama:", requestedName);

    // ------------------------------------
    // 1. PERIKSA FIRESTORE TERLEBIH DAHULU
    // ------------------------------------

    const cachedFood = await findFoodInFirestore(normalizedName);

    if (cachedFood) {
      console.log("Sumber: Firestore");
      console.log("=============================");

      return res.json({
        found: true,
        source: "firestore",
        food: formatFoodData(cachedFood, requestedName),
      });
    }

    console.log("Makanan belum ditemukan di Firestore.");
    console.log("Melakukan pencarian melalui Gemini...");

    // ------------------------------------
    // 2. GEMINI + GOOGLE SEARCH
    // ------------------------------------

    const prompt = `
Kamu adalah asisten pencarian data nutrisi makanan untuk aplikasi KaloriKu.

Cari data nutrisi makanan berikut:

"${requestedName}"

Gunakan Google Search untuk mencari informasi nutrisi dari sumber yang dapat dipercaya.

Prioritaskan sumber:
1. Database resmi komposisi pangan Indonesia seperti TKPI atau Panganku.
2. USDA FoodData Central.
3. Situs resmi lembaga kesehatan atau institusi penelitian.
4. Sumber nutrisi lain yang kredibel jika sumber utama tidak tersedia.

ATURAN:

- Identifikasi makanan yang paling sesuai dengan nama yang diminta.
- Gunakan makanan dalam bentuk penyajian yang disebutkan.
- Jangan menyamakan makanan mentah, rebus, goreng, dan olahan.
- Semua nilai nutrisi harus berdasarkan 100 gram bagian yang dapat dimakan.
- Energi menggunakan kcal.
- Protein, karbohidrat, lemak, dan serat menggunakan gram.
- Sodium menggunakan mg.
- Air menggunakan gram atau ml per 100 gram.
- Jangan mengarang nilai nutrisi.
- Jika suatu nutrisi tidak ditemukan, gunakan null.
- Jangan menggunakan nilai nutrisi per porsi atau per sajian.
- Jika makanan tidak dapat diidentifikasi dengan cukup yakin, kembalikan found false.

Jawab hanya dengan JSON menggunakan format:

{
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
  "description": "Keterangan singkat"
}

Jika data tidak dapat ditemukan, gunakan:

{
  "found": false
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",

      contents: [
        {
          text: prompt,
        },
      ],

      config: {
        responseMimeType: "application/json",

        // Mengaktifkan Google Search grounding.
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });

    // ------------------------------------
    // 3. CATAT PEMAKAIAN TOKEN
    // ------------------------------------

    const usage = result.usageMetadata;

    console.log("===== PEMAKAIAN TOKEN GEMINI =====");
    console.log(
      "Token input:",
      usage?.promptTokenCount ?? "Tidak tersedia"
    );
    console.log(
      "Token output:",
      usage?.candidatesTokenCount ?? "Tidak tersedia"
    );
    console.log(
      "Total token:",
      usage?.totalTokenCount ?? "Tidak tersedia"
    );
    console.log("=================================");

    // ------------------------------------
    // 4. PARSE HASIL GEMINI
    // ------------------------------------

    const responseText = result.text;

    if (!responseText) {
      return res.status(502).json({
        error: "Gemini tidak memberikan hasil.",
      });
    }

    let aiData;

    try {
      aiData = JSON.parse(responseText);
    } catch (error) {
      console.error("JSON Gemini tidak valid:", responseText);

      return res.status(502).json({
        error: "Format data nutrisi dari Gemini tidak valid.",
      });
    }

    if (aiData.found !== true) {
      return res.json({
        found: false,
        source: "gemini",
        message: "Data nutrisi makanan belum ditemukan.",
      });
    }

    // ------------------------------------
    // 5. AMBIL SUMBER GOOGLE SEARCH
    // ------------------------------------

    const groundingChunks =
      result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources = groundingChunks
      .filter(chunk => chunk.web?.uri)
      .map(chunk => ({
        title: chunk.web.title || "",
        url: chunk.web.uri,
      }));

    // Jangan menyimpan data tanpa sumber pencarian.
    if (!sources.length) {
      return res.status(422).json({
        error: "Gemini tidak memberikan sumber referensi yang dapat diverifikasi.",
      });
    }

    // ------------------------------------
    // 6. VALIDASI NUTRISI
    // ------------------------------------

    if (!validateNutrition(aiData)) {
      return res.status(422).json({
        error: "Data nutrisi tidak lolos validasi otomatis.",
      });
    }

    const foodName = String(aiData.name || requestedName).trim();

    if (!foodName) {
      return res.status(422).json({
        error: "Nama makanan dari Gemini tidak valid.",
      });
    }

    const normalizedFoodName = normalizeFoodName(foodName);

    const foodDocumentId = createFoodDocumentId(normalizedFoodName);

    const foodCollection = db.collection("foods");
    const foodDocument = foodCollection.doc(foodDocumentId);

    // ------------------------------------
    // 7. SIAPKAN DATA UNTUK FIRESTORE
    // ------------------------------------

    const foodData = {
      name: foodName,
      normalizedName: normalizedFoodName,

      aliases: [
        ...new Set([
          normalizedFoodName,
          normalizedName,
        ]),
      ],

      kcal: parseNutrient(aiData.kcal),
      protein: parseNutrient(aiData.protein),
      carbs: parseNutrient(aiData.carbs),
      fat: parseNutrient(aiData.fat),

      fiber: parseNutrient(aiData.fiber),
      sodium: parseNutrient(aiData.sodium),
      water: parseNutrient(aiData.water),

      code: null,
      source: "AI (Google Search)",
      category: aiData.category || "Makanan",
      type: "food",
      basis: "100 g",

      description: aiData.description || "",

      sourceUrls: sources.map(source => source.url),
      sourceNames: sources.map(source => source.title),

      // Ini berarti lolos validasi teknis otomatis,
      // bukan verifikasi oleh ahli gizi.
      validationStatus: "auto_validated",

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // ------------------------------------
    // 8. SIMPAN DENGAN TRANSAKSI
    // ------------------------------------

    const savedFood = await db.runTransaction(async transaction => {
      const existingDocument = await transaction.get(foodDocument);

      // Mencegah duplikasi jika pengguna lain
      // menyimpan makanan yang sama pada saat bersamaan.
      if (existingDocument.exists) {
        return existingDocument.data();
      }

      transaction.set(foodDocument, foodData);

      return foodData;
    });

    console.log("Makanan berhasil disimpan ke Firestore.");
    console.log("Nama:", savedFood.name);
    console.log("=============================");

    // ------------------------------------
    // 9. KEMBALIKAN HASIL KE APLIKASI
    // ------------------------------------

    return res.json({
      found: true,
      source: "gemini",
      food: formatFoodData(savedFood, requestedName),
    });

  
} catch (error) {
  console.error("===== DETAIL ERROR GEMINI / NUTRITION =====");

  console.error("Status:", error.status);
  console.error("Code:", error.code);
  console.error("Message:", error.message);
  console.error("Details:", JSON.stringify(error.error || {}, null, 2));

  console.error("============================================");

  const status = Number(error.status || error.code);

  if (status === 429) {
    return res.status(429).json({
      found: false,
      error: "Gemini sedang mencapai batas penggunaan.",
      code: "GEMINI_QUOTA_EXCEEDED",
      message: "Silakan coba kembali beberapa saat lagi."
    });
  }

  return res.status(500).json({
    found: false,
    error: "Gagal mencari data nutrisi makanan.",
    code: "NUTRITION_SEARCH_ERROR"
  });
}


    return res.status(500).json({
      error: "Gagal mencari data nutrisi makanan.",
    });
  }
});

// ========================================
// ANALYZE FOOD — TETAP DIPERTAHANKAN
// ========================================

app.post("/analyze-food", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Foto makanan tidak ditemukan",
      });
    }

    if (!req.file.mimetype.startsWith("image/")) {
      return res.status(400).json({
        error: "File harus berupa gambar",
      });
    }

    const prompt = `
      Analisis foto makanan ini untuk aplikasi KaloriKu.

      Identifikasi makanan yang terlihat.
      Berikan perkiraan berat porsi dalam gram.
      Jika ada beberapa makanan, pisahkan masing-masing.

      Jawab hanya dengan JSON menggunakan format:
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
      model: "gemini-3.1-flash-lite",

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

    const responseText = result.text;
    const data = JSON.parse(responseText);

    const usage = result.usageMetadata;

    console.log("===== PEMAKAIAN TOKEN KALORIKU =====");
    console.log(
      "Token input:",
      usage?.promptTokenCount ?? "Tidak tersedia"
    );
    console.log(
      "Token output:",
      usage?.candidatesTokenCount ?? "Tidak tersedia"
    );
    console.log(
      "Total token:",
      usage?.totalTokenCount ?? "Tidak tersedia"
    );
    console.log("====================================");

    res.json(data);

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      error: "Gagal menganalisis makanan",
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
