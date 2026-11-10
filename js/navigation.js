
/*
 * NAVIGATION
 * Mengatur perpindahan halaman dan Liquid Motion Indicator.
 */

const availablePages = [
  "homePage",
  "historyPage",
  "profilePage",
  "statisticsPage"
];

function initializeNavigation() {
  const nav = document.querySelector(".bottom-nav");
  const navButtons = document.querySelectorAll(".nav-item");
  const indicator = nav?.querySelector(".nav-indicator");

  if (!nav || !navButtons.length) return;

  // Memindahkan indikator ke menu yang aktif.
  function updateIndicator(button, animate = true) {
    const index = Array.from(navButtons).indexOf(button);

    if (index < 0) return;

    if (animate && indicator) {
      nav.classList.add("is-moving");
    }

    nav.style.setProperty("--active-index", index);

    if (indicator && animate) {
      indicator.addEventListener("transitionend", function handler(event) {
        if (event.propertyName === "transform") {
          nav.classList.remove("is-moving");
          indicator.removeEventListener("transitionend", handler);
        }
      });
    }
  }

  // Tentukan posisi awal berdasarkan menu aktif.
  const initialActive =
    document.querySelector(".nav-item.active") || navButtons[0];

  updateIndicator(initialActive, false);

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const pageId = button.dataset.page;

      // Pastikan halaman tersedia.
      if (!availablePages.includes(pageId)) {
        return;
      }

      // Tampilkan halaman yang dipilih.
availablePages.forEach((id) => {
  const page = document.getElementById(id);

  if (page) {
    page.hidden = id !== pageId;

    // Animasi halaman yang baru dibuka.
    if (id === pageId) {
      page.classList.remove("page-enter");

      // Memulai ulang animasi setiap kali halaman dibuka.
      void page.offsetWidth;

      page.classList.add("page-enter");
    }
  }
});

      // Perbarui status menu aktif.
      navButtons.forEach((item) => {
        item.classList.toggle("active", item === button);

        if (item === button) {
          item.setAttribute("aria-current", "page");
        } else {
          item.removeAttribute("aria-current");
        }
      });

      // Jalankan Liquid Motion Indicator.
      updateIndicator(button);

      // Beri tahu modul halaman bahwa halaman telah dibuka.
      document.dispatchEvent(
        new CustomEvent("kaloriku:pagechange", {
          detail: { pageId }
        })
      );

      window.scrollTo(0, 0);
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeNavigation
  );
} else {
  initializeNavigation();
}
