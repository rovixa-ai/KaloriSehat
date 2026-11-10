
const API_URL = "http://localhost:3000";

// Kompres foto sebelum dikirim ke backend
async function compressFoodPhoto(file) {
  const bitmap = await createImageBitmap(file);

  const maxSize = 1280;
  const scale = Math.min(
    1,
    maxSize / Math.max(bitmap.width, bitmap.height)
  );

  const canvas = document.createElement("canvas");

  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    bitmap,
    0,
    0,
    canvas.width,
    canvas.height
  );

  bitmap.close();

  const compressedBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.75);
  });

  if (!compressedBlob) {
    throw new Error("Gagal mengompresi foto.");
  }

  // Gunakan foto asli jika hasil kompresi justru lebih besar
  if (compressedBlob.size >= file.size) {
    return file;
  }

  return new File(
    [compressedBlob],
    "food-photo.jpg",
    {
      type: "image/jpeg",
      lastModified: Date.now()
    }
  );
}

// Menganalisis foto makanan menggunakan backend Gemini AI
export async function analyzeFoodPhoto(file) {
  if (!file) {
    throw new Error("Pilih foto makanan terlebih dahulu.");
  }

 const compressedPhoto = await compressFoodPhoto(file);

const formData = new FormData();
formData.append("photo", compressedPhoto);

  const response = await fetch(
    `${API_URL}/analyze-food`,
    {
      method: "POST",
      body: formData
    }
  );

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Respons backend tidak valid.");
  }

  if (!response.ok) {
    throw new Error(
      data.error || "Gagal menganalisis foto."
    );
  }

  if (!Array.isArray(data.foods) || data.foods.length === 0) {
    throw new Error("AI tidak menemukan makanan.");
  }

  return data.foods;
}
