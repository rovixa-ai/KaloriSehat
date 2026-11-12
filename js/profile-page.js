import {
  loadProfileFromCloud,
  syncProfileToCloud
} from "./firestore-sync.js";

const PROFILE_STORAGE_KEY = "kaloriku_profile";

function loadProfile() {
  try {
    return JSON.parse(
      localStorage.getItem(PROFILE_STORAGE_KEY) || "{}"
    );
  } catch (error) {
    console.error("Gagal membaca profil:", error);
    return {};
  }
}



function saveProfile(profile) {
  // Simpan lokal terlebih dahulu.
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );

  // Sinkronisasi cloud berjalan di latar belakang.
  syncProfileToCloud(profile);
}

async function initializeProfilePage() {
  const profilePage = document.getElementById("profilePage");

  if (!profilePage) {
    console.warn("Halaman Profil tidak ditemukan.");
    return;
  }

  // Muat profil cloud sebelum mengisi formulir.
await loadProfileFromCloud();
 
const fields = {
  name: profilePage.querySelector("#profileName"),
  age: profilePage.querySelector("#profileAge"),
  gender: profilePage.querySelector("#profileGender"),
  weight: profilePage.querySelector("#profileWeight"),
  height: profilePage.querySelector("#profileHeight"),
  activity: profilePage.querySelector("#profileActivity"),
  goalWeight: profilePage.querySelector("#profileGoalWeight"),
  goalDuration: profilePage.querySelector("#profileGoalDuration")
};

// =====================================
// FOTO PROFIL
// =====================================

const photoButton = profilePage.querySelector("#profilePhotoButton");
const photoInput = profilePage.querySelector("#profilePhotoInput");
const photoPreview = profilePage.querySelector("#profilePhotoPreview");
const avatarInitial = profilePage.querySelector("#profileAvatarInitial");

function renderProfilePhoto() {
  const profile = loadProfile();
  const photo = profile.photo || "";

  if (photo && photoPreview) {
    photoPreview.src = photo;
    photoPreview.hidden = false;

    if (avatarInitial) {
      avatarInitial.hidden = true;
    }
  } else {
    if (photoPreview) {
      photoPreview.removeAttribute("src");
      photoPreview.hidden = true;
    }

    if (avatarInitial) {
      avatarInitial.hidden = false;
      avatarInitial.textContent =
        profile.name?.trim().charAt(0).toUpperCase() || "K";
    }
  }
}

// Klik avatar untuk memilih foto.
photoButton?.addEventListener("click", () => {
  photoInput?.click();
});

// =====================================
// KOMPRES FOTO PROFIL
// =====================================

function compressProfilePhoto(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      image.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file foto."));
    };

    image.onload = () => {
      const MAX_SIZE = 500;
      let width = image.width;
      let height = image.height;

      // Mengecilkan foto sambil mempertahankan proporsi.
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        } else {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      // Background putih untuk foto PNG transparan.
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);

      context.drawImage(image, 0, 0, width, height);

      // Kompres menjadi JPEG kualitas 80%.
      const compressedPhoto = canvas.toDataURL(
        "image/jpeg",
        0.8
      );

      resolve(compressedPhoto);
    };

    image.onerror = () => {
      reject(new Error("File bukan gambar yang valid."));
    };

    reader.readAsDataURL(file);
  });
}

// =====================================
// UPLOAD FOTO PROFIL
// =====================================

photoInput?.addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Silakan pilih file gambar.");
    photoInput.value = "";
    return;
  }

  try {
    // Ubah tombol sementara agar pengguna tahu foto diproses.
    if (photoButton) {
      photoButton.style.opacity = "0.6";
      photoButton.style.pointerEvents = "none";
    }

    // Kompres foto sebelum disimpan.
    const compressedPhoto = await compressProfilePhoto(file);

    const profile = loadProfile();

    profile.photo = compressedPhoto;

    saveProfile(profile);

    // Perbarui tampilan foto di halaman profil.
    renderProfilePhoto();

    // Perbarui avatar Dashboard.
    window.dispatchEvent(new Event("profileUpdated"));

    alert("Foto profil berhasil diunggah dan dikompresi.");

  } catch (error) {
    console.error("Gagal memproses foto:", error);
    alert("Foto gagal diproses. Silakan coba foto lain.");

  } finally {
    // Aktifkan kembali tombol.
    if (photoButton) {
      photoButton.style.opacity = "";
      photoButton.style.pointerEvents = "";
    }

    photoInput.value = "";
  }
});

// Tampilkan foto yang sudah tersimpan.
renderProfilePhoto();

  function updateGoalSimulation() {
    const message = profilePage.querySelector("#goalSimulationMessage");
    const results = profilePage.querySelector(".goal-simulation-results");

    if (!message || !results) return;

    const age = Number(fields.age?.value);
    const weight = Number(fields.weight?.value);
    const height = Number(fields.height?.value);
    const goalWeight = Number(fields.goalWeight?.value);
    const duration = Number(fields.goalDuration?.value);
    const gender = fields.gender?.value;
    const activity = fields.activity?.value;

    // Memastikan data dasar dan target sudah lengkap.
    if (
      !age || !weight || !height ||
      !goalWeight || !duration ||
      !gender || !activity ||
      age <= 0 || weight <= 0 || height <= 0 ||
      goalWeight <= 0 || duration <= 0
    ) {
      message.textContent =
        "Lengkapi data profil, target berat badan, dan target waktu untuk melihat simulasi.";

      results.hidden = true;
      return;
    }

    // Faktor aktivitas.
    const activityFactors = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };

    const activityFactor = activityFactors[activity];

    if (!activityFactor) {
      message.textContent = "Pilihan aktivitas tidak valid.";
      results.hidden = true;
      return;
    }

    // Menghitung BMR dengan rumus Mifflin-St Jeor.
    const genderAdjustment = gender === "male" ? 5 : -161;

    const bmr =
      (10 * weight) +
      (6.25 * height) -
      (5 * age) +
      genderAdjustment;

    // Menghitung kebutuhan kalori harian.
    const tdee = bmr * activityFactor;

    // Menghitung perubahan berat dan durasi.
    const weightDifference = goalWeight - weight;
    const durationDays = duration * 30.4375;
    const weeklyChange = weightDifference / durationDays * 7;

    // Estimasi penyesuaian kalori harian.
    const dailyAdjustment =
      Math.abs(weightDifference) * 7700 / durationDays;

    let calorieTarget = tdee;
    let adjustmentLabel = "Pemeliharaan";
    let weeklyLabel = "Tidak ada perubahan";
    let status = "Pemeliharaan";
    let warning = "";

    if (weightDifference < 0) {
      calorieTarget = tdee - dailyAdjustment;
      adjustmentLabel = `Defisit ${Math.round(dailyAdjustment)} kkal/hari`;
      weeklyLabel = `Turun ${Math.abs(weeklyChange).toFixed(2)} kg`;

      const weeklyRate = Math.abs(weeklyChange) / weight * 100;

      if (weeklyRate <= 0.75) {
        status = "Realistis";
      } else if (weeklyRate <= 1) {
        status = "Agresif";
        warning = "Target tergolong agresif. Pertimbangkan pemantauan dan evaluasi berkala.";
      } else {
        status = "Tidak disarankan";
        warning = "Target penurunan terlalu cepat. Sebaiknya evaluasi kembali durasi target bersama tenaga kesehatan.";
      }

    } else if (weightDifference > 0) {
      calorieTarget = tdee + dailyAdjustment;
      adjustmentLabel = `Surplus ${Math.round(dailyAdjustment)} kkal/hari`;
      weeklyLabel = `Naik ${Math.abs(weeklyChange).toFixed(2)} kg`;

      const weeklyRate = Math.abs(weeklyChange) / weight * 100;

      if (weeklyRate <= 0.25) {
        status = "Realistis";
      } else if (weeklyRate <= 0.5) {
        status = "Agresif";
        warning = "Target kenaikan tergolong agresif. Pantau perubahan berat dan kondisi tubuh secara berkala.";
      } else {
        status = "Tidak disarankan";
        warning = "Target kenaikan terlalu cepat. Sebaiknya evaluasi kembali durasi target.";
      }
    }

    if (calorieTarget <= 0) {
      warning += " Hasil target kalori tidak layak dijadikan panduan konsumsi. Evaluasi kembali target dan durasinya.";
    } else if (calorieTarget < bmr) {
      warning += " Estimasi target kalori berada di bawah BMR. Jangan langsung menerapkannya tanpa evaluasi dengan tenaga kesehatan.";
    }

    // Simpan hasil target kalori untuk digunakan Dashboard.
const savedProfile = loadProfile();

savedProfile.dailyCalorieTarget =
  calorieTarget > 0 ? Math.round(calorieTarget) : 0;

saveProfile(savedProfile);

window.dispatchEvent(new Event("profileTargetUpdated"));

    // Format angka dengan format Indonesia.
    const formatNumber = (number) =>
      Math.round(number).toLocaleString("id-ID");

    // Menampilkan hasil ke kartu simulasi.
    profilePage.querySelector("#simCurrentWeight").textContent =
      `${weight} kg`;

    profilePage.querySelector("#simGoalWeight").textContent =
      `${goalWeight} kg`;

    profilePage.querySelector("#simWeightDifference").textContent =
      `${weightDifference > 0 ? "+" : ""}${weightDifference.toFixed(1)} kg`;

    profilePage.querySelector("#simDuration").textContent =
      `${duration} bulan`;

    profilePage.querySelector("#simBMR").textContent =
      `${formatNumber(bmr)} kkal/hari`;

    profilePage.querySelector("#simTDEE").textContent =
      `${formatNumber(tdee)} kkal/hari`;

    profilePage.querySelector("#simWeeklyChange").textContent =
      weeklyLabel;

    profilePage.querySelector("#simAdjustment").textContent =
      adjustmentLabel;

    profilePage.querySelector("#simCalorieTarget").textContent =
      `${formatNumber(calorieTarget)} kkal/hari`;

    profilePage.querySelector("#simGoalStatus").textContent =
      status;

    profilePage.querySelector("#simGoalWarning").textContent =
      warning;

    message.textContent = "Simulasi berdasarkan data profil Anda.";
    results.hidden = false;

    // Menghitung target nutrisi harian otomatis.
function updateDailyNutritionTargets() {
  const calorieInput = profilePage.querySelector("#dailyCalorieTarget");
  const proteinInput = profilePage.querySelector("#dailyProteinTarget");
  const carbInput = profilePage.querySelector("#dailyCarbTarget");
  const fatInput = profilePage.querySelector("#dailyFatTarget");

  if (!calorieInput || !proteinInput || !carbInput || !fatInput) {
    return;
  }

  if (calorieTarget <= 0) {
    calorieInput.value = "";
    proteinInput.value = "";
    carbInput.value = "";
    fatInput.value = "";
    return;
  }

  // Protein: 1,6 gram per kg berat tujuan.
  const protein = goalWeight * 1.6;

  // Lemak: 25% dari total kalori.
  const fatCalories = calorieTarget * 0.25;
  const fat = fatCalories / 9;

  // Karbohidrat: sisa kalori.
  const carbCalories =
    calorieTarget - (protein * 4) - fatCalories;

  const carbs = carbCalories / 4;

  // Simpan target nutrisi ke profil.
const savedProfile = loadProfile();

savedProfile.dailyProteinTarget = Math.round(protein);
savedProfile.dailyCarbTarget = Math.max(0, Math.round(carbs));
savedProfile.dailyFatTarget = Math.round(fat);

saveProfile(savedProfile);

// Beritahu Dashboard bahwa target nutrisi sudah diperbarui.
window.dispatchEvent(new Event("profileTargetUpdated"));

  calorieInput.value = Math.round(calorieTarget);
  proteinInput.value = Math.round(protein);
  fatInput.value = Math.round(fat);
  carbInput.value = Math.max(0, Math.round(carbs));
}

updateDailyNutritionTargets();
  }

  const saveButton = profilePage.querySelector(
    ".profile-save-button"
  );

  // Fungsi Reset Semua Data KaloriKu
const resetDataButton =
  profilePage.querySelector("#resetDataButton");

if (resetDataButton) {
  resetDataButton.addEventListener("click", () => {

    const confirmed = confirm(
      "Apakah Anda yakin ingin menghapus seluruh data KaloriKu?\n\n" +
      "Profil, riwayat makanan, dan target nutrisi akan dihapus permanen."
    );

    if (!confirmed) return;

    // Hapus data aplikasi
    localStorage.removeItem("kaloriku_profile");
    renderProfilePhoto();
    localStorage.removeItem("kaloriku_meals");
    localStorage.removeItem("kaloriku_target");
    localStorage.removeItem("kaloriku_food_aliases");

    // Kosongkan formulir profil
    Object.values(fields).forEach(input => {
      if (input) input.value = "";
    });

    // Kosongkan target nutrisi
    profilePage.querySelector("#dailyCalorieTarget").value = "";
    profilePage.querySelector("#dailyProteinTarget").value = "";
    profilePage.querySelector("#dailyCarbTarget").value = "";
    profilePage.querySelector("#dailyFatTarget").value = "";

    // Kosongkan hasil simulasi
    const simulationResults = profilePage.querySelector(
      ".goal-simulation-results"
    );

    if (simulationResults) {
      simulationResults.hidden = true;
    }

    const simulationMessage = profilePage.querySelector(
      "#goalSimulationMessage"
    );

    if (simulationMessage) {
      simulationMessage.textContent =
        "Lengkapi profil untuk melihat simulasi.";
    }

    // Beritahu halaman lain
    window.dispatchEvent(
      new Event("profileTargetUpdated")
    );

    document.dispatchEvent(
      new CustomEvent("kaloriku:datareset")
    );

    alert("Semua data KaloriKu berhasil dihapus.");

    // Kembali ke Beranda
    document.querySelector(
      '.nav-item[data-page="homePage"]'
    )?.click();

  });
}

  // Memuat profil tersimpan.
  const profile = loadProfile();

  Object.entries(fields).forEach(([key, input]) => {
    if (input && profile[key] !== undefined) {
      input.value = profile[key];
    }
  });

  updateGoalSimulation();

  Object.values(fields).forEach((input) => {
    if (input) {
      input.addEventListener("input", updateGoalSimulation);
      input.addEventListener("change", updateGoalSimulation);
    }
  });

  // Fungsi modal informasi BMR dan TDEE
const infoButton = profilePage.querySelector("#goalInfoButton");
const infoModal = profilePage.querySelector("#goalInfoModal");
const infoClose = profilePage.querySelector("#goalInfoClose");

if (infoButton && infoModal && infoClose) {

  // Membuka modal
  infoButton.addEventListener("click", () => {
    infoModal.hidden = false;
  });

  // Menutup melalui tombol X
  infoClose.addEventListener("click", () => {
    infoModal.hidden = true;
  });

  // Menutup ketika area gelap di luar modal ditekan
  infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      infoModal.hidden = true;
    }
  });

  // Menutup dengan tombol Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      infoModal.hidden = true;
    }
  });

} else {
  console.warn("Elemen tombol atau modal informasi tidak ditemukan.");
}

  if (!saveButton) {
    console.error("Tombol Simpan Profil tidak ditemukan.");
    return;
  }

  // Mencegah event tersimpan lebih dari satu kali.
  saveButton.addEventListener("click", () => {
    const updatedProfile = {};

    Object.entries(fields).forEach(([key, input]) => {
      if (input) {
        updatedProfile[key] = input.value.trim();
      }
    });

    // Validasi data dasar.
    if (
      !updatedProfile.name ||
      !updatedProfile.age ||
      !updatedProfile.gender ||
      !updatedProfile.weight ||
      !updatedProfile.height ||
      !updatedProfile.activity
    ) {
      alert("Mohon lengkapi seluruh data profil.");
      return;
    }

    if (
      Number(updatedProfile.age) <= 0 ||
      Number(updatedProfile.weight) <= 0 ||
      Number(updatedProfile.height) <= 0
    ) {
      alert("Usia, berat, dan tinggi harus lebih dari 0.");
      return;
    }

    try {
           const currentProfile = loadProfile();

saveProfile({
  ...currentProfile,
  ...updatedProfile
});

updateGoalSimulation();
renderProfilePhoto();
window.dispatchEvent(new Event("profileUpdated"));

alert("Profil berhasil disimpan.");


    } catch (error) {
      console.error("Gagal menyimpan profil:", error);
      alert("Profil gagal disimpan.");
    }
  });

  console.log("Profile Page berhasil diinisialisasi.");
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeProfilePage
  );
} else {
  initializeProfilePage();
}


