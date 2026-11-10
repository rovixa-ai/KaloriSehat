
/*
 * NAVIGATION
 * Mengatur perpindahan antarhalaman KaloriKu.
 */

const availablePages = [
  "homePage",
  "historyPage",
  "profilePage",
  "statisticsPage"
];

function initializeNavigation() {
  const navButtons = document.querySelectorAll(".nav-item");

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
