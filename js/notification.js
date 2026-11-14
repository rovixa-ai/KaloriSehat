
// =========================================
// KALORIKU - GLOBAL MODAL
// =========================================

const appModal = document.getElementById("appModal");
const appModalIcon = document.getElementById("appModalIcon");
const appModalTitle = document.getElementById("appModalTitle");
const appModalMessage = document.getElementById("appModalMessage");
const appModalCancel = document.getElementById("appModalCancel");
const appModalConfirm = document.getElementById("appModalConfirm");
const appModalBackdrop = appModal?.querySelector(".app-modal-backdrop");

const modalTypes = {
  success: {
    icon: "✓",
    title: () => window.t("modal.success")
  },
  error: {
    icon: "✕",
    title: () => window.t("modal.error")
  },
  warning: {
    icon: "⚠",
    title: () => window.t("modal.warning")
  },
  info: {
    icon: "i",
    title: () => window.t("modal.info")
  }
};

let pendingResolve = null;
let previousOverflow = "";

// =========================================
// TUTUP MODAL
// =========================================

export function closeAppModal(result = false) {
  if (!appModal) return;

  appModal.hidden = true;
  document.body.style.overflow = previousOverflow;

  if (pendingResolve) {
    const resolve = pendingResolve;
    pendingResolve = null;
    resolve(result);
  }
}

// =========================================
// TAMPILKAN NOTIFIKASI
// =========================================

export function showAppModal({
  type = "info",
  title,
  message = "",
  confirmText,
  onConfirm
} = {}) {

  if (!appModal) {
    console.warn("Global modal tidak ditemukan.");
    return;
  }

  closeAppModal(false);

  const modalType = modalTypes[type] || modalTypes.info;

  appModal.dataset.type = type;
  appModalIcon.textContent = modalType.icon;
  appModalTitle.textContent = title || modalType.title();
  appModalMessage.textContent = message;

  appModalCancel.hidden = true;
  appModalConfirm.textContent = confirmText || window.t("modal.ok");

  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  appModal.hidden = false;

  appModalConfirm.onclick = () => {
    closeAppModal();

    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };
}

// =========================================
// TAMPILKAN KONFIRMASI
// =========================================

export function confirmAppModal({
  type = "warning",
  title,
  message = "",
  confirmText,
  cancelText
} = {}) {

  if (!appModal) {
    console.warn("Global modal tidak ditemukan.");
    return Promise.resolve(false);
  }

  closeAppModal(false);

  const modalType = modalTypes[type] || modalTypes.warning;

  appModal.dataset.type = type;
  appModalIcon.textContent = modalType.icon;
  appModalTitle.textContent = title || modalType.title();
  appModalMessage.textContent = message;

  appModalCancel.hidden = false;
  appModalCancel.textContent = cancelText || window.t("modal.cancel");
  appModalConfirm.textContent = confirmText || window.t("modal.yes");

  previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  appModal.hidden = false;

  return new Promise((resolve) => {
    pendingResolve = resolve;

    appModalConfirm.onclick = () => {
      closeAppModal(true);
    };

    appModalCancel.onclick = () => {
      closeAppModal(false);
    };
  });
}

// =========================================
// TUTUP MELALUI BACKDROP / ESCAPE
// =========================================

appModalBackdrop?.addEventListener("click", () => {
  closeAppModal(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && appModal && !appModal.hidden) {
    closeAppModal(false);
  }
});

// =========================================
// AKSES GLOBAL
// =========================================

window.showAppModal = showAppModal;
window.confirmAppModal = confirmAppModal;
window.closeAppModal = closeAppModal;
