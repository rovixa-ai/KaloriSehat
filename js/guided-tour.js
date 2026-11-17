
/*
 * KALORIKU — INTERACTIVE GUIDED TOUR
 * Panduan interaktif untuk fitur utama aplikasi.
 */

const TOUR_STEPS = [
  {
    page: "homePage",
    target: ".dashboard-calorie",
    title: "calorieTitle",
    description: "calorieDescription",
    placement: "bottom"
  },
  {
    page: "homePage",
    target: ".dashboard-nutrition",
    title: "nutritionTitle",
    description: "nutritionDescription",
    placement: "bottom"
  },
  {
    page: "homePage",
    target: ".dashboard-scan",
    title: "scanTitle",
    description: "scanDescription",
    placement: "top"
  },
  {
    page: "historyPage",
    target: "#fullHistoryList",
    title: "historyTitle",
    description: "historyDescription",
    placement: "bottom"
  },
  {
    page: "statisticsPage",
    target: "#calorieChart",
    title: "statisticsTitle",
    description: "statisticsDescription",
    placement: "top"
  },
  {
    page: "profilePage",
    target: ".profile-identity",
    title: "profileTitle",
    description: "profileDescription",
    placement: "bottom"
  }
];

const tourText = key =>
  window.t?.(`onboarding.tour.${key}`) ?? key;

let currentStep = 0;
let tourOverlay = null;
let highlightElement = null;
let tooltipElement = null;
let tourCallbacks = {};

let currentTarget = null;
let resizeHandler = null;
let scrollHandler = null;
let languageHandler = null;

let navigationInProgress = false;

// ==========================================
// MEMBUAT OVERLAY TOUR
// ==========================================

function createTourOverlay() {
  const overlay = document.createElement("div");

  overlay.id = "kalorikuGuidedTour";
  overlay.className = "guided-tour-overlay";

  overlay.innerHTML = `
    <div
      class="guided-tour-highlight"
      id="guidedTourHighlight"
    ></div>

    <section
      class="guided-tour-tooltip"
      id="guidedTourTooltip"
      role="dialog"
      aria-modal="false"
      aria-live="polite"
      aria-labelledby="guidedTourTitle"
    >
      <div class="guided-tour-header">
        <span class="guided-tour-brand">
          KALORIKU GUIDE
        </span>

        <button
          type="button"
          class="guided-tour-close"
          id="guidedTourClose"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div class="guided-tour-counter">
        <span id="guidedTourStep"></span>

        <div class="guided-tour-progress">
          <div
            id="guidedTourProgress"
            class="guided-tour-progress-fill"
          ></div>
        </div>
      </div>

      <h3 id="guidedTourTitle"></h3>

      <p id="guidedTourDescription"></p>

      <div class="guided-tour-actions">

        <button
          type="button"
          id="guidedTourBack"
          class="guided-tour-back"
        ></button>

        <button
          type="button"
          id="guidedTourNext"
          class="guided-tour-next"
        ></button>

      </div>
    </section>
  `;

  return overlay;
}

// ==========================================
// MENCARI TARGET
// ==========================================

function findTarget(selector) {
  const element = document.querySelector(selector);

  if (!element) return null;

  // Target harus berada pada halaman yang sedang aktif.
  if (
    element.closest("main")?.hidden === true ||
    element.getClientRects().length === 0
  ) {
    return null;
  }

  return element;
}

// ==========================================
// MENUNGGU TARGET TERSEDIA
// ==========================================

function waitForTarget(selector, timeout = 5000) {
  return new Promise(resolve => {
    const startedAt = Date.now();

    function check() {
      const target = findTarget(selector);

      if (target) {
        resolve(target);
        return;
      }

      if (Date.now() - startedAt >= timeout) {
        resolve(null);
        return;
      }

      requestAnimationFrame(check);
    }

    check();
  });
}

// ==========================================
// PINDAH HALAMAN
// ==========================================

async function navigateToPage(pageId) {
  const currentPage = document.getElementById(pageId);

  if (
    currentPage &&
    !currentPage.hidden &&
    currentPage.getClientRects().length > 0
  ) {
    return true;
  }

  const navButton = document.querySelector(
    `.nav-item[data-page="${pageId}"]`
  );

  if (!navButton) {
    console.warn(
      "Tombol navigasi tidak ditemukan:",
      pageId
    );

    return false;
  }

  navigationInProgress = true;

  navButton.click();

  // navigation.js mengirim event setelah perpindahan halaman.
  await new Promise(resolve => {
    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;

      window.removeEventListener(
        "kaloriku:pagechange",
        finish
      );

      resolve();
    };

    window.addEventListener(
      "kaloriku:pagechange",
      finish
    );

    // Fallback jika event tidak diterima.
    setTimeout(finish, 1200);
  });

  navigationInProgress = false;

  await new Promise(resolve => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });

  return true;
}

// ==========================================
// MENGATUR POSISI HIGHLIGHT
// ==========================================

function positionHighlight(target) {
  if (!target || !highlightElement) return;

  const rect = target.getBoundingClientRect();

  const padding = 8;

  const top = Math.max(4, rect.top - padding);
  const left = Math.max(4, rect.left - padding);

  const width = Math.min(
    rect.width + padding * 2,
    window.innerWidth - left - 4
  );

  const height = Math.min(
    rect.height + padding * 2,
    window.innerHeight - top - 4
  );

  highlightElement.style.top = `${top}px`;
  highlightElement.style.left = `${left}px`;
  highlightElement.style.width = `${width}px`;
  highlightElement.style.height = `${height}px`;

  highlightElement.style.borderRadius =
    getComputedStyle(target).borderRadius || "14px";

  positionTooltip(rect);
}

// ==========================================
// MENGATUR POSISI TOOLTIP
// ==========================================

function positionTooltip(rect) {
  if (!tooltipElement) return;

  const margin = 16;
  const gap = 18;

  const tooltipWidth = Math.min(
    350,
    window.innerWidth - margin * 2
  );

  tooltipElement.style.width =
    `${tooltipWidth}px`;

  // Ukur tinggi setelah konten dirender.
  const tooltipHeight =
    tooltipElement.offsetHeight || 220;

  const step = TOUR_STEPS[currentStep];

  const availableBelow =
    window.innerHeight - rect.bottom - gap - margin;

  const availableAbove =
    rect.top - gap - margin;

  let placement = step.placement;

  if (
    placement === "bottom" &&
    availableBelow < tooltipHeight &&
    availableAbove > availableBelow
  ) {
    placement = "top";
  }

  if (
    placement === "top" &&
    availableAbove < tooltipHeight &&
    availableBelow > availableAbove
  ) {
    placement = "bottom";
  }

  let top = placement === "top"
    ? rect.top - tooltipHeight - gap
    : rect.bottom + gap;

  // Jika ruang vertikal terbatas, tampilkan di tengah layar.
  if (
    top < margin ||
    top + tooltipHeight > window.innerHeight - margin
  ) {
    top = Math.max(
      margin,
      (window.innerHeight - tooltipHeight) / 2
    );
  }

  let left =
    rect.left + rect.width / 2 - tooltipWidth / 2;

  left = Math.max(
    margin,
    Math.min(
      left,
      window.innerWidth - tooltipWidth - margin
    )
  );

  tooltipElement.style.top = `${top}px`;
  tooltipElement.style.left = `${left}px`;
}

// ==========================================
// MEMPERBARUI ISI TOOLTIP
// ==========================================

function updateTooltip() {
  if (!tooltipElement) return;

  const step = TOUR_STEPS[currentStep];

  const title = tooltipElement.querySelector(
    "#guidedTourTitle"
  );

  const description = tooltipElement.querySelector(
    "#guidedTourDescription"
  );

  const counter = tooltipElement.querySelector(
    "#guidedTourStep"
  );

  const progress = tooltipElement.querySelector(
    "#guidedTourProgress"
  );

  const backButton = tooltipElement.querySelector(
    "#guidedTourBack"
  );

  const nextButton = tooltipElement.querySelector(
    "#guidedTourNext"
  );

  if (title) {
    title.textContent = tourText(step.title);
  }

  if (description) {
    description.textContent =
      tourText(step.description);
  }

  if (counter) {
    counter.textContent =
      `${tourText("step")} ${currentStep + 1} ` +
      `${tourText("of")} ${TOUR_STEPS.length}`;
  }

  if (progress) {
    progress.style.width =
      `${((currentStep + 1) / TOUR_STEPS.length) * 100}%`;
  }

  if (backButton) {
    backButton.textContent = tourText("back");

    backButton.hidden = currentStep === 0;
  }

  if (nextButton) {
    nextButton.textContent =
      currentStep === TOUR_STEPS.length - 1
        ? tourText("finish")
        : tourText("next");
  }
}

// ==========================================
// MENAMPILKAN LANGKAH TOUR
// ==========================================

async function showTourStep(index) {
  if (!tourOverlay) return;

  if (
    index < 0 ||
    index >= TOUR_STEPS.length
  ) {
    return;
  }

  currentStep = index;

  const step = TOUR_STEPS[currentStep];

  updateTooltip();

  // Berpindah halaman jika diperlukan.
  await navigateToPage(step.page);

  if (!tourOverlay) return;

  // Menunggu target tampil.
  let target = await waitForTarget(step.target);

  if (!tourOverlay) return;

  if (!target) {
    console.warn(
      "Target guided tour tidak ditemukan:",
      step.target
    );

    // Lewati langkah yang targetnya tidak tersedia.
    if (currentStep < TOUR_STEPS.length - 1) {
      await showTourStep(currentStep + 1);
    } else {
      finishGuidedTour();
    }

    return;
  }

  currentTarget = target;

  // Scroll ke target tanpa menutup tour.
  target.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest"
  });

  await new Promise(resolve => {
    setTimeout(resolve, 350);
  });

  if (!tourOverlay) return;

  positionHighlight(target);

  tooltipElement.classList.add("visible");
}

// ==========================================
// LANGKAH SELANJUTNYA
// ==========================================

async function nextTourStep() {
  if (currentStep < TOUR_STEPS.length - 1) {
    tooltipElement.classList.remove("visible");

    await showTourStep(currentStep + 1);

    return;
  }

  finishGuidedTour();
}

// ==========================================
// LANGKAH SEBELUMNYA
// ==========================================

async function previousTourStep() {
  if (currentStep <= 0) return;

  tooltipElement.classList.remove("visible");

  await showTourStep(currentStep - 1);
}

// ==========================================
// MENYELESAIKAN TOUR
// ==========================================

async function finishGuidedTour() {
  if (!tourOverlay) return;

  const homeButton = document.querySelector(
    '.nav-item[data-page="homePage"]'
  );

  // Kembali ke dashboard setelah tour selesai.
  if (homeButton) {
    homeButton.click();

    await new Promise(resolve => {
      setTimeout(resolve, 400);
    });
  }

  tourCallbacks.onComplete?.();

  closeGuidedTour();
}

// ==========================================
// MELEWATI TOUR
// ==========================================

function skipGuidedTour() {
  if (!tourOverlay) return;

  tourCallbacks.onSkip?.();

  closeGuidedTour();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function bindTourEvents() {
  const nextButton = tourOverlay.querySelector(
    "#guidedTourNext"
  );

  const backButton = tourOverlay.querySelector(
    "#guidedTourBack"
  );

  const closeButton = tourOverlay.querySelector(
    "#guidedTourClose"
  );

  nextButton.addEventListener(
    "click",
    nextTourStep
  );

  backButton.addEventListener(
    "click",
    previousTourStep
  );

  closeButton.addEventListener(
    "click",
    skipGuidedTour
  );

  resizeHandler = () => {
    if (currentTarget) {
      positionHighlight(currentTarget);
    }
  };

  scrollHandler = () => {
    if (currentTarget) {
      positionHighlight(currentTarget);
    }
  };

  languageHandler = () => {
    updateTooltip();

    if (currentTarget) {
      positionHighlight(currentTarget);
    }
  };

  window.addEventListener(
    "resize",
    resizeHandler
  );

  window.addEventListener(
    "scroll",
    scrollHandler,
    true
  );

  window.addEventListener(
    "languageChanged",
    languageHandler
  );

  // Mencegah klik navigasi selama proses perpindahan
  // tour berlangsung agar tidak terjadi konflik.
}

// ==========================================
// MEMULAI GUIDED TOUR
// ==========================================

export async function startGuidedTour({
  onComplete,
  onSkip
} = {}) {
  if (tourOverlay) return;

  tourCallbacks = {
    onComplete,
    onSkip
  };

  currentStep = 0;

  tourOverlay = createTourOverlay();

  highlightElement = tourOverlay.querySelector(
    "#guidedTourHighlight"
  );

  tooltipElement = tourOverlay.querySelector(
    "#guidedTourTooltip"
  );

  document.body.appendChild(tourOverlay);

  bindTourEvents();

  requestAnimationFrame(() => {
    tourOverlay?.classList.add("visible");
  });

  await showTourStep(0);
}

// ==========================================
// MENUTUP GUIDED TOUR
// ==========================================

export function closeGuidedTour() {
  if (!tourOverlay) return;

  const overlay = tourOverlay;

  overlay.classList.remove("visible");

  window.removeEventListener(
    "resize",
    resizeHandler
  );

  window.removeEventListener(
    "scroll",
    scrollHandler,
    true
  );

  window.removeEventListener(
    "languageChanged",
    languageHandler
  );

  setTimeout(() => {
    overlay.remove();

    tourOverlay = null;
    highlightElement = null;
    tooltipElement = null;
    currentTarget = null;

    resizeHandler = null;
    scrollHandler = null;
    languageHandler = null;

    tourCallbacks = {};
    navigationInProgress = false;
  }, 300);
}
