
/*
 * KALORIKU — PREMIUM PAGE NAVIGATION
 * Mengatur perpindahan halaman, page reveal,
 * dan Liquid Motion Indicator.
 */

const availablePages = [
  "homePage",
  "historyPage",
  "profilePage",
  "statisticsPage"
];

function initializeNavigation() {
  const nav = document.querySelector(".bottom-nav");
  const navButtons = Array.from(
    document.querySelectorAll(".nav-item")
  );
  const indicator = nav?.querySelector(".nav-indicator");

  if (!nav || !navButtons.length) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let currentPageId =
    availablePages.find((id) => {
      const page = document.getElementById(id);
      return page && !page.hidden;
    }) || "homePage";

  // ==========================================
  // LIQUID MOTION INDICATOR
  // ==========================================

  function updateIndicator(button, animate = true) {
    const index = navButtons.indexOf(button);

    if (index < 0) return;

    nav.style.setProperty("--active-index", index);

    if (!indicator) return;

    if (animate && !reducedMotion.matches) {
      nav.classList.add("is-moving");
    } else {
      nav.classList.remove("is-moving");
    }
  }

  // ==========================================
  // PAGE TRANSITION
  // ==========================================

  function showPage(pageId) {
    const selectedPage = document.getElementById(pageId);

    if (!selectedPage) return;

    // Tidak mengulang animasi jika halaman sama diklik.
    if (pageId === currentPageId) return;

    currentPageId = pageId;

    availablePages.forEach((id) => {
      const page = document.getElementById(id);

      if (!page) return;

      if (id === pageId) {
        // Tampilkan halaman terlebih dahulu.
        page.hidden = false;

        // Hapus animasi sebelumnya.
        page.classList.remove("page-enter");

        // Paksa browser menghitung ulang layout
        // agar animasi bisa dimulai kembali.
        void page.offsetWidth;

        // Jalankan animasi masuk.
        if (!reducedMotion.matches) {
          page.classList.add("page-enter");
        }
      } else {
        page.hidden = true;
        page.classList.remove("page-enter");
      }
    });

    // Bersihkan class setelah animasi selesai.
    if (!reducedMotion.matches) {
      selectedPage.addEventListener(
        "animationend",
        function removePageAnimation(event) {
          if (event.target !== selectedPage) return;

          selectedPage.classList.remove("page-enter");

          selectedPage.removeEventListener(
            "animationend",
            removePageAnimation
          );
        }
      );
    }

    // Beritahu modul halaman lainnya.
    document.dispatchEvent(
      new CustomEvent("kaloriku:pagechange", {
        detail: { pageId }
      })
    );

    // Kembali ke bagian atas halaman.
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  }

  // ==========================================
  // INITIAL STATE
  // ==========================================

  const initialActive =
    nav.querySelector(".nav-item.active") || navButtons[0];

  navButtons.forEach((button) => {
    const isActive = button.dataset.page === currentPageId;

    button.classList.toggle("active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  updateIndicator(initialActive, false);

  // ==========================================
  // NAVIGATION CLICK
  // ==========================================

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const pageId = button.dataset.page;

      if (!availablePages.includes(pageId)) return;

      const targetPage = document.getElementById(pageId);

      if (!targetPage) return;

      // Update menu aktif.
      navButtons.forEach((item) => {
        const isActive = item === button;

        item.classList.toggle("active", isActive);

        if (isActive) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });

      // Pindahkan indikator.
      updateIndicator(button);

      // Tampilkan halaman.
      showPage(pageId);
    });
  });
}

// ==========================================
// INITIALIZE
// ==========================================

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeNavigation,
    { once: true }
  );
} else {
  initializeNavigation();
}
