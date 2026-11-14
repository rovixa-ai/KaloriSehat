export function openFoodEditModal({
  mode = "edit",
  food = null,
  pangankuFoods,
  findFoodSuggestions,
  onSave,
  onDelete
}) {
  const t = key => window.t?.(`foodEditModal.${key}`) ?? key;

  const isEdit = mode === "edit";

  const originalName = food
    ? food.originalName || food.name
    : "";

  let selectedFoodName = isEdit
    ? Object.keys(pangankuFoods)
        .find(name => name === food.name)
    : "";

  let selectedFood = selectedFoodName
    ? pangankuFoods[selectedFoodName]
    : null;

  const overlay = document.createElement("div");
  overlay.className = "food-edit-overlay";

  const modal = document.createElement("div");
  modal.className = "food-edit-modal";

  modal.innerHTML = `
    <div class="food-edit-header">
      <h3>${isEdit ? t("editTitle") : t("addTitle")}</h3>
      <button type="button" class="food-edit-close">&times;</button>
    </div>

    <div class="food-edit-body">
      <label for="editFoodName">${t("foodName")}</label>

      <input
        type="text"
        id="editFoodName"
        placeholder="${t("foodNamePlaceholder")}"
        autocomplete="off"
      >

      <div class="food-edit-suggestions"></div>

      <label for="editFoodWeight">${t("foodWeight")}</label>

      <div class="food-edit-weight">
        <input
          type="number"
          id="editFoodWeight"
          min="1"
          step="1"
          placeholder="${t("weightPlaceholder")}"
        >
        <span>${t("gram")}</span>
      </div>

      <p class="food-edit-hint">
        ${t("hint")}
      </p>
    </div>

    <div class="food-edit-footer">
      ${isEdit ? `
        <button type="button" class="food-edit-delete">
          ${t("delete")}
        </button>
      ` : ""}

      <button type="button" class="food-edit-cancel">
        ${t("cancel")}
      </button>

      <button type="button" class="food-edit-save" disabled>
        ${isEdit ? t("saveChanges") : t("addFood")}
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const nameInput = modal.querySelector("#editFoodName");
  const weightInput = modal.querySelector("#editFoodWeight");

  const suggestionsBox = modal.querySelector(
    ".food-edit-suggestions"
  );

  const saveButton = modal.querySelector(".food-edit-save");

  nameInput.value = selectedFoodName || (food?.name || "");
  weightInput.value = Number(food?.estimatedWeight) || 100;

  function updateSaveButton() {
    const weight = Number(weightInput.value);

    saveButton.disabled = !(
      selectedFood &&
      selectedFoodName &&
      Number.isFinite(weight) &&
      weight > 0
    );
  }

  function renderSuggestions(query) {
    suggestionsBox.innerHTML = "";

    if (!query.trim()) return;

    const suggestions = findFoodSuggestions(
      query,
      pangankuFoods,
      10
    );

    if (!suggestions.length) {
      const message = document.createElement("p");
      message.className = "food-edit-no-result";
      message.textContent = t("notFound");

      suggestionsBox.appendChild(message);
      return;
    }

    suggestions.forEach(suggestion => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "food-edit-option";

      button.textContent =
        `${suggestion.name} — ${suggestion.food.kcal ?? "—"} ${t("calories")} / ${t("per100g")}`;

      button.addEventListener("click", () => {
        selectedFood = suggestion.food;
        selectedFoodName = suggestion.name;

        nameInput.value = suggestion.name;
        suggestionsBox.innerHTML = "";

        const message = document.createElement("p");
        message.className = "food-edit-selected";
        message.textContent =
          `${t("selected")} ${suggestion.name}`;

        suggestionsBox.appendChild(message);

        updateSaveButton();
      });

      suggestionsBox.appendChild(button);
    });
  }

  nameInput.addEventListener("input", () => {
    selectedFood = null;
    selectedFoodName = "";

    updateSaveButton();
    renderSuggestions(nameInput.value);
  });

  weightInput.addEventListener("input", updateSaveButton);

  if (!selectedFood) {
    renderSuggestions(nameInput.value);
  }

  function closeModal() {
    overlay.remove();
  }

  modal.querySelector(".food-edit-close")
    .addEventListener("click", closeModal);

  modal.querySelector(".food-edit-cancel")
    .addEventListener("click", closeModal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  // Fungsi hapus makanan
  if (isEdit) {
    const deleteButton = modal.querySelector(".food-edit-delete");

    deleteButton.addEventListener("click", () => {
      const confirmed = confirm(
        `${t("confirmDelete")} "${food.name}" ${t("fromAnalysis")}`
      );

      if (!confirmed) return;

      if (typeof onDelete === "function") {
        onDelete(food);
      }

      closeModal();
    });
  }

  // Fungsi simpan
  saveButton.addEventListener("click", () => {
    const weight = Number(weightInput.value);

    if (
      !selectedFood ||
      !selectedFoodName ||
      !Number.isFinite(weight) ||
      weight <= 0
    ) {
      return;
    }

    if (typeof onSave === "function") {
      onSave({
        food,
        originalName,
        selectedFoodName,
        weight
      });
    }

    closeModal();
  });

  updateSaveButton();
}