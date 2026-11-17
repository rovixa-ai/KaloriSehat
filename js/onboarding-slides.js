
/*
 * KALORIKU — PREMIUM ONBOARDING SLIDES
 * Mengatur 4 slide pengenalan aplikasi.
 */

const SLIDES = [
  {
    icon: "🥗",
    title: "welcomeTitle",
    description: "welcomeDescription",
    visual: "nutrition"
  },
  {
    icon: "🍱",
    title: "foodTitle",
    description: "foodDescription",
    visual: "food"
  },
  {
    icon: "📸",
    title: "aiTitle",
    description: "aiDescription",
    visual: "ai"
  },
  {
    icon: "🎯",
    title: "goalTitle",
    description: "goalDescription",
    visual: "goal"
  }
];

let currentSlide = 0;
let slideContainer = null;
let slideOverlay = null;
let slideCallbacks = {};

const slideText = key => {
  return window.t?.(`onboarding.slides.${key}`) ??
    key;
};

// ==========================================
// MEMBUAT ELEMEN SLIDE
// ==========================================

function createSlideElement(slide, index) {
  const article = document.createElement("article");

  article.className = "onboarding-slide";

  article.dataset.slide = index;

  article.innerHTML = `
    <div class="onboarding-illustration onboarding-${slide.visual}">
      <div class="onboarding-illustration-glow"></div>
      <div class="onboarding-illustration-icon">
        ${slide.icon}
      </div>
    </div>

    <div class="onboarding-slide-content">
      <h1 class="onboarding-slide-title">
        ${slideText(slide.title)}
      </h1>

      <p class="onboarding-slide-description">
        ${slideText(slide.description)}
      </p>
    </div>
  `;

  return article;
}

// ==========================================
// MEMPERBARUI TAMPILAN SLIDE
// ==========================================

function renderCurrentSlide() {
  if (!slideContainer) return;

  const slides = slideContainer.querySelectorAll(
    ".onboarding-slide"
  );

  slides.forEach((slide, index) => {
    slide.classList.toggle(
      "active",
      index === currentSlide
    );

    slide.setAttribute(
      "aria-hidden",
      index !== currentSlide
    );
  });

  updateSlideControls();
}

// ==========================================
// MEMPERBARUI KONTROL
// ==========================================

function updateSlideControls() {
  if (!slideOverlay) return;

  const backButton = slideOverlay.querySelector(
    "#onboardingBack"
  );

  const nextButton = slideOverlay.querySelector(
    "#onboardingNext"
  );

  const skipButton = slideOverlay.querySelector(
    "#onboardingSkip"
  );

  const dots = slideOverlay.querySelectorAll(
    ".onboarding-dot"
  );

  if (backButton) {
    backButton.disabled = currentSlide === 0;
    backButton.hidden = currentSlide === 0;
  }

  if (nextButton) {
    nextButton.textContent =
      currentSlide === SLIDES.length - 1
        ? slideText("start")
        : slideText("next");
  }

  if (skipButton) {
    skipButton.textContent = slideText("skip");
  }

  dots.forEach((dot, index) => {
    dot.classList.toggle(
      "active",
      index === currentSlide
    );

    dot.setAttribute(
      "aria-current",
      index === currentSlide ? "step" : "false"
    );
  });

  const counter = slideOverlay.querySelector(
    "#onboardingCounter"
  );

  if (counter) {
    counter.textContent =
      `${currentSlide + 1} / ${SLIDES.length}`;
  }
}

// ==========================================
// PINDAH SLIDE
// ==========================================

function nextSlide() {
  if (currentSlide < SLIDES.length - 1) {
    currentSlide++;
    renderCurrentSlide();
    return;
  }

  slideCallbacks.onComplete?.();
}

function previousSlide() {
  if (currentSlide > 0) {
    currentSlide--;
    renderCurrentSlide();
  }
}

function skipSlides() {
  slideCallbacks.onSkip?.();
}

// ==========================================
// MEMBUAT OVERLAY
// ==========================================

function createSlideOverlay() {
  const overlay = document.createElement("div");

  overlay.id = "kalorikuOnboarding";
  overlay.className = "onboarding-overlay";

  overlay.innerHTML = `
    <div class="onboarding-shell">

      <header class="onboarding-header">
        <div class="onboarding-brand">
  <div class="onboarding-brand-mark">
    <img src="./assets/rovixa-icon.png" alt="Rovixa" />
  </div>
  <span>Kalori SehatKu</span>
</div>

        <button
          type="button"
          class="onboarding-skip"
          id="onboardingSkip"
        ></button>
      </header>

      <main class="onboarding-main">

        <div
          class="onboarding-slides"
          id="onboardingSlides"
        ></div>

        <div class="onboarding-progress">

          <div
            class="onboarding-dots"
            id="onboardingDots"
          >
            ${SLIDES.map((_, index) => `
              <button
                type="button"
                class="onboarding-dot"
                data-slide-target="${index}"
                aria-label="${slideText("slide")} ${index + 1}"
              ></button>
            `).join("")}
          </div>

          <span id="onboardingCounter">
            1 / ${SLIDES.length}
          </span>

        </div>

      </main>

      <footer class="onboarding-footer">

        <button
          type="button"
          id="onboardingBack"
          class="onboarding-back"
        ></button>

        <button
          type="button"
          id="onboardingNext"
          class="onboarding-next"
        ></button>

      </footer>

    </div>
  `;

  return overlay;
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function bindSlideEvents() {
  const backButton = slideOverlay.querySelector(
    "#onboardingBack"
  );

  const nextButton = slideOverlay.querySelector(
    "#onboardingNext"
  );

  const skipButton = slideOverlay.querySelector(
    "#onboardingSkip"
  );

  backButton.addEventListener(
    "click",
    previousSlide
  );

  nextButton.addEventListener(
    "click",
    nextSlide
  );

  skipButton.addEventListener(
    "click",
    skipSlides
  );

  slideOverlay
    .querySelectorAll(".onboarding-dot")
    .forEach(dot => {
      dot.addEventListener("click", () => {
        currentSlide = Number(
          dot.dataset.slideTarget
        );

        renderCurrentSlide();
      });
    });

  // Navigasi keyboard
  slideOverlay.addEventListener(
    "keydown",
    event => {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
      }
    }
  );
}

// ==========================================
// MEMPERBARUI BAHASA
// ==========================================

function refreshSlideLanguage() {
  if (!slideOverlay) return;

  const slides = slideOverlay.querySelector(
    "#onboardingSlides"
  );

  if (!slides) return;

  slides.innerHTML = "";

  SLIDES.forEach((slide, index) => {
    slides.appendChild(
      createSlideElement(slide, index)
    );
  });

  renderCurrentSlide();
}

// ==========================================
// MEMULAI ONBOARDING
// ==========================================

export function showOnboardingSlides({
  onComplete,
  onSkip
} = {}) {
  if (slideOverlay) {
    return;
  }

  currentSlide = 0;

  slideCallbacks = {
    onComplete,
    onSkip
  };

  slideOverlay = createSlideOverlay();

  slideContainer = slideOverlay.querySelector(
    "#onboardingSlides"
  );

  SLIDES.forEach((slide, index) => {
    slideContainer.appendChild(
      createSlideElement(slide, index)
    );
  });

  document.body.appendChild(slideOverlay);

  bindSlideEvents();
  renderCurrentSlide();

  requestAnimationFrame(() => {
    slideOverlay.classList.add("visible");
  });

  window.addEventListener(
    "languageChanged",
    refreshSlideLanguage
  );
}

// ==========================================
// MENUTUP ONBOARDING
// ==========================================

export function closeOnboardingSlides() {
  if (!slideOverlay) return;

  const overlay = slideOverlay;

  overlay.classList.remove("visible");

  window.removeEventListener(
    "languageChanged",
    refreshSlideLanguage
  );

  setTimeout(() => {
    overlay.remove();

    slideOverlay = null;
    slideContainer = null;
    slideCallbacks = {};
  }, 350);
}
