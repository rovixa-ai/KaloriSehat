
import {
  isOnboardingCompleted,
  completeOnboarding
} from "./onboarding-sync.js";

import {
  showOnboardingSlides,
  closeOnboardingSlides
} from "./onboarding-slides.js";

import {
  startGuidedTour,
  closeGuidedTour
} from "./guided-tour.js";


/* ==========================================
   KALORIKU — ONBOARDING CONTROLLER
========================================== */

let onboardingStarted = false;
let tourStarted = false;
let onboardingFinished = false;


/* ==========================================
   MENUNGGU AUTH GUARD
========================================== */

function waitForAuthReady() {
  if (window.__kalorikuAuthState?.ready) {
    return Promise.resolve(window.__kalorikuAuthState);
  }

  return new Promise(resolve => {
    window.addEventListener(
      "kaloriku:authready",
      event => resolve(event.detail),
      { once: true }
    );
  });
}


/* ==========================================
   MENYELESAIKAN ONBOARDING
========================================== */

async function finishOnboarding() {
  if (onboardingFinished) return;

  onboardingFinished = true;

  closeOnboardingSlides();
  closeGuidedTour();

  try {
    await completeOnboarding();
    console.log("KaloriKu onboarding selesai.");
  } catch (error) {
    console.error(
      "Gagal menyimpan status onboarding:",
      error
    );
  }
}


/* ==========================================
   MEMULAI GUIDED TOUR
========================================== */

function launchGuidedTour() {
  if (tourStarted || onboardingFinished) return;

  tourStarted = true;

  startGuidedTour({
    onComplete: finishOnboarding,
    onSkip: finishOnboarding
  });
}


/* ==========================================
   MEMULAI INTRO SLIDES
========================================== */

function launchIntroSlides() {
  showOnboardingSlides({
    onComplete: () => {
      closeOnboardingSlides();
      launchGuidedTour();
    },

    onSkip: () => {
      closeOnboardingSlides();
      launchGuidedTour();
    }
  });
}


/* ==========================================
   INISIALISASI ONBOARDING
========================================== */

async function initializeOnboarding() {
  if (onboardingStarted) return;

  onboardingStarted = true;

  try {
    // Tunggu proses autentikasi selesai.
    await waitForAuthReady();

    // Periksa status onboarding pengguna.
    const completed = await isOnboardingCompleted();

    if (completed) {
      console.log("Onboarding sudah pernah diselesaikan.");
      return;
    }

    // Berikan sedikit waktu agar dashboard siap.
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    // Mulai pengenalan aplikasi.
    launchIntroSlides();

  } catch (error) {
    console.error(
      "Inisialisasi onboarding gagal:",
      error
    );
  }
}


/* ==========================================
   JALANKAN
========================================== */

initializeOnboarding();
