
/* ==========================================
   KALORIKU — FOOD EDIT GUIDED TOUR
========================================== */

let tourActive = false;

function getTourStorageKey() {
  try {
    const user = JSON.parse(
      localStorage.getItem("kaloriku_user") || "{}"
    );

    const uid = user.uid || "guest";

    return `kaloriku_food_edit_tour_v1_${uid}`;
  } catch {
    return "kaloriku_food_edit_tour_v1_guest";
  }
}

function isTourCompleted() {
  return localStorage.getItem(getTourStorageKey()) === "true";
}

function markTourCompleted() {
  localStorage.setItem(getTourStorageKey(), "true");
}


/* ==========================================
   TERJEMAHAN TOUR
========================================== */

function getTourLanguage() {
  return window.getLanguage?.() || "id";
}

function tourText(key) {
  const translations = {
    id: {
      editTitle: "Edit makanan",
      editDescription:
        "Tekan tombol Edit untuk mengubah nama makanan dan berat porsinya.",

      nameTitle: "Ubah nama makanan",
      nameDescription:
        "Kamu bisa mengganti nama makanan. Ketik nama baru, lalu pilih rekomendasi yang sesuai dari database KaloriKu.",

      weightTitle: "Atur berat makanan",
      weightDescription:
        "Masukkan berat makanan dalam gram. Perhitungan kalori dan nutrisi akan menyesuaikan berat ini.",

      saveTitle: "Simpan perubahan",
      saveDescription:
        "Setelah memilih makanan dan mengatur beratnya, tekan Simpan Perubahan untuk memperbarui hasil nutrisi.",

      step: "Langkah",
      of: "dari",
      next: "Lanjutkan",
      open: "Coba Edit",
      finish: "Selesai",
      skip: "Lewati"
    },

    en: {
      editTitle: "Edit your food",
      editDescription:
        "Press Edit to change the food name and serving weight.",

      nameTitle: "Change food name",
      nameDescription:
        "You can change the food name. Type a new name and select a matching suggestion from the KaloriKu database.",

      weightTitle: "Adjust food weight",
      weightDescription:
        "Enter the food weight in grams. Calories and nutrition will adjust automatically.",

      saveTitle: "Save your changes",
      saveDescription:
        "After selecting the food and setting its weight, press Save Changes to update the nutrition results.",

      step: "Step",
      of: "of",
      next: "Continue",
      open: "Try Editing",
      finish: "Finish",
      skip: "Skip"
    }
  };

  const language = getTourLanguage();

  return translations[language]?.[key] ||
    translations.id[key] ||
    key;
}


/* ==========================================
   CSS DINAMIS
========================================== */

function injectTourStyles() {
  if (document.getElementById("food-edit-tour-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "food-edit-tour-styles";

  style.textContent = `
    .food-edit-tour-overlay {
      position: fixed;
      inset: 0;
      z-index: 200000;
      pointer-events: none;
    }

    .food-edit-tour-highlight {
      position: fixed;
      border: 2px solid #16a085;
      border-radius: 12px;
      box-shadow:
        0 0 0 9999px rgba(10, 15, 25, .68),
        0 0 24px rgba(22, 160, 133, .28);
      pointer-events: none;
      transition:
        top .25s ease,
        left .25s ease,
        width .25s ease,
        height .25s ease;
    }

    .food-edit-tour-tooltip {
      position: fixed;
      width: min(340px, calc(100vw - 32px));
      padding: 19px;
      background: var(--card-bg, #fff);
      color: var(--text-color, #20252d);
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 17px;
      box-shadow: 0 14px 45px rgba(0,0,0,.22);
      pointer-events: auto;
      z-index: 200001;
      font-family: inherit;
    }

    .food-edit-tour-progress {
      font-size: 11px;
      font-weight: 700;
      color: #16a085;
      margin-bottom: 9px;
      letter-spacing: .5px;
    }

    .food-edit-tour-tooltip h3 {
      font-size: 17px;
      margin: 0 0 9px;
      font-weight: 700;
    }

    .food-edit-tour-tooltip p {
      font-size: 13px;
      line-height: 1.65;
      margin: 0;
      opacity: .8;
    }

    .food-edit-tour-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 19px;
    }

    .food-edit-tour-actions button {
      border: 0;
      border-radius: 9px;
      padding: 10px 15px;
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .food-edit-tour-skip {
      background: transparent;
      color: inherit;
      opacity: .65;
    }

    .food-edit-tour-next {
      background: #16a085;
      color: white;
    }

    @media (max-width: 480px) {
      .food-edit-tour-tooltip {
        padding: 16px;
      }
    }
  `;

  document.head.appendChild(style);
}


/* ==========================================
   MEMULAI TOUR
========================================== */

export async function maybeStartFoodEditTour() {
  if (tourActive || isTourCompleted()) return;

  const editButton = document.querySelector(
    '[data-food-edit-tour="trigger"]'
  );

  if (!editButton) return;

  tourActive = true;

  injectTourStyles();

  const overlay = document.createElement("div");
  overlay.className = "food-edit-tour-overlay";

  const highlight = document.createElement("div");
  highlight.className = "food-edit-tour-highlight";

  const tooltip = document.createElement("div");
  tooltip.className = "food-edit-tour-tooltip";

  overlay.append(highlight, tooltip);
  document.body.appendChild(overlay);

  let currentStep = 0;
  let currentTarget = null;
  let closing = false;

  const steps = [
    {
      selector: '[data-food-edit-tour="trigger"]',
      title: "editTitle",
      description: "editDescription",
      button: "open"
    },
    {
      selector: "#editFoodName",
      title: "nameTitle",
      description: "nameDescription",
      button: "next"
    },
    {
      selector: "#editFoodWeight",
      title: "weightTitle",
      description: "weightDescription",
      button: "next"
    },
    {
      selector: ".food-edit-save",
      title: "saveTitle",
      description: "saveDescription",
      button: "finish"
    }
  ];

  function finishTour() {
    if (closing) return;

    closing = true;

    markTourCompleted();

    overlay.remove();

    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
    document.removeEventListener("click", handleModalClose, true);
    document.removeEventListener("keydown", handleEscape);

    tourActive = false;
  }

  function updatePosition() {
    if (!currentTarget || !currentTarget.isConnected) {
      return;
    }

    const rect = currentTarget.getBoundingClientRect();

    highlight.style.top = `${rect.top - 5}px`;
    highlight.style.left = `${rect.left - 5}px`;
    highlight.style.width = `${rect.width + 10}px`;
    highlight.style.height = `${rect.height + 10}px`;

    const tooltipWidth = Math.min(340, window.innerWidth - 32);

    const left = Math.max(
      16,
      Math.min(
        rect.left,
        window.innerWidth - tooltipWidth - 16
      )
    );

    let top = rect.bottom + 16;

    if (top + tooltip.offsetHeight > window.innerHeight - 16) {
      top = rect.top - tooltip.offsetHeight - 16;
    }

    top = Math.max(
      12,
      Math.min(top, window.innerHeight - tooltip.offsetHeight - 12)
    );

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }

  function handleModalClose(event) {
    if (
      event.target.closest?.(
        ".food-edit-close, .food-edit-cancel"
      ) ||
      event.target.classList?.contains("food-edit-overlay")
    ) {
      finishTour();
    }
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      finishTour();
    }
  }

  function waitForTarget(selector, attempts = 30) {
    return new Promise(resolve => {
      let count = 0;

      function check() {
        const target = document.querySelector(selector);

        if (target && target.getClientRects().length) {
          resolve(target);
          return;
        }

        if (++count >= attempts) {
          resolve(null);
          return;
        }

        setTimeout(check, 100);
      }

      check();
    });
  }

  async function showStep(index) {
    if (closing) return;

    currentStep = index;

    const step = steps[index];

    const target = await waitForTarget(step.selector);

    if (!target) {
      finishTour();
      return;
    }

    currentTarget = target;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    tooltip.innerHTML = `
      <div class="food-edit-tour-progress">
        ${tourText("step")} ${index + 1} ${tourText("of")} ${steps.length}
      </div>

      <h3>${tourText(step.title)}</h3>

      <p>${tourText(step.description)}</p>

      <div class="food-edit-tour-actions">
        <button type="button" class="food-edit-tour-skip">
          ${tourText("skip")}
        </button>

        <button type="button" class="food-edit-tour-next">
          ${tourText(step.button)}
        </button>
      </div>
    `;

    const nextButton = tooltip.querySelector(
      ".food-edit-tour-next"
    );

    tooltip.querySelector(
      ".food-edit-tour-skip"
    ).addEventListener("click", finishTour);

    nextButton.addEventListener("click", async () => {
      if (index === 0) {
        // Buka modal edit makanan.
        editButton.click();

        await showStep(1);
        return;
      }

      if (index === steps.length - 1) {
        finishTour();
        return;
      }

      await showStep(index + 1);
    });

    requestAnimationFrame(updatePosition);
  }

  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);

  document.addEventListener("click", handleModalClose, true);
  document.addEventListener("keydown", handleEscape);

  await showStep(0);
}
