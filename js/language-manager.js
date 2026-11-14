
import { translations } from "./languages.js";

const LANGUAGE_KEY = "app_language";

let currentLanguage =
  localStorage.getItem(LANGUAGE_KEY) || "id";

if (!translations[currentLanguage]) {
  currentLanguage = "id";
}

function getLanguage() {
  return currentLanguage;
}

function t(key) {
  const value = key.split(".").reduce(
    (result, part) => result?.[part],
    translations[currentLanguage]
  );

  return value ?? key;
}

function setLanguage(language) {
  if (!translations[language]) return;

  currentLanguage = language;
  localStorage.setItem(LANGUAGE_KEY, language);

  applyTranslations();

  window.dispatchEvent(
    new CustomEvent("languageChanged", {
      detail: { language }
    })
  );
}

function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  root.querySelectorAll("[data-i18n-title]").forEach(element => {
    element.title = t(element.dataset.i18nTitle);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
    element.setAttribute(
      "aria-label",
      t(element.dataset.i18nAriaLabel)
    );
  });

  root.querySelectorAll("[data-i18n-alt]").forEach(element => {
    element.alt = t(element.dataset.i18nAlt);
  });

}

function initializeLanguage() {
  applyTranslations();
}

window.getLanguage = getLanguage;
window.t = t;
window.setLanguage = setLanguage;
window.applyTranslations = applyTranslations;
window.initializeLanguage = initializeLanguage;

// =========================================
// PENGATURAN BAHASA
// =========================================

function setupLanguageSelector() {
  initializeLanguage();

  const selector = document.getElementById("languageSelect");

  if (!selector) return;

  selector.value = currentLanguage;

  selector.addEventListener("change", () => {
    setLanguage(selector.value);
  });
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    setupLanguageSelector
  );
} else {
  setupLanguageSelector();
}
