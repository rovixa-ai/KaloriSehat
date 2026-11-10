
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(cors({
  origin: "https://rovixa-ai.github.io"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "KaloriKu AI aktif" });
});

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
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text;

const data = JSON.parse(responseText);

// Informasi pemakaian token Gemini
const usage = result.usageMetadata;

console.log("===== PEMAKAIAN TOKEN KALORIKU =====");
console.log("Token input:", usage?.promptTokenCount ?? "Tidak tersedia");
console.log("Token output:", usage?.candidatesTokenCount ?? "Tidak tersedia");
console.log("Total token:", usage?.totalTokenCount ?? "Tidak tersedia");
console.log("====================================");

    res.json(data);

  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      error: "Gagal menganalisis makanan",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`KaloriKu AI berjalan di port ${PORT}`);
});
