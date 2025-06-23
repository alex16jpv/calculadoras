// Shared Calculator Functionality

// Common DOM elements and utilities
const CalculatorUtils = {
  // Common DOM selectors
  getCalculating: () => document.querySelector(".calculating"),
  getErrorMessage: () => document.getElementById("errorMessage"),
  getResultSection: () => document.getElementById("resultSection"),
  getEmptyResult: () => document.getElementById("emptyResult"),
  getResultValue: () => document.getElementById("resultValue"),
  getStepsContainer: () => document.getElementById("stepsContainer"),

  // Common validation
  validateInput(value, fieldName) {
    if (isNaN(value) || value === "") {
      throw new Error(`Por favor ingresa un número válido en ${fieldName}`);
    }
    if (value < 0) {
      throw new Error(`El valor de ${fieldName} no puede ser negativo`);
    }
    return parseFloat(value);
  },

  // Common UI state management
  showCalculating() {
    const calculating = this.getCalculating();
    if (calculating) calculating.classList.add("active");
  },

  hideCalculating() {
    const calculating = this.getCalculating();
    if (calculating) calculating.classList.remove("active");
  },

  showError(message) {
    const errorMessage = this.getErrorMessage();
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.add("active");
    }
  },

  hideError() {
    const errorMessage = this.getErrorMessage();
    if (errorMessage) {
      errorMessage.classList.remove("active");
    }
  },

  // Common results display
  showResults() {
    const resultSection = this.getResultSection();
    const emptyResult = this.getEmptyResult();
    
    if (resultSection) resultSection.style.display = "block";
    if (emptyResult) emptyResult.style.display = "none";
    
    // Smooth scroll to results
    if (resultSection) {
      resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  hideResults() {
    const resultSection = this.getResultSection();
    const emptyResult = this.getEmptyResult();
    
    if (resultSection) resultSection.style.display = "none";
    if (emptyResult) emptyResult.style.display = "block";
  },

  clearResults() {
    this.hideResults();
    this.hideError();
  },

  // Common step generation helper
  createStepElement(step) {
    const stepElement = document.createElement("div");
    stepElement.className = "step";
    stepElement.innerHTML = `
      <div class="step-number">${step.number}</div>
      <div class="step-content">
        <p>${step.content}</p>
        ${step.formula ? `<div class="formula">${step.formula}</div>` : ""}
      </div>
    `;
    return stepElement;
  },

  // Common steps display
  displaySteps(steps) {
    const stepsContainer = this.getStepsContainer();
    if (!stepsContainer) return;

    stepsContainer.innerHTML = "";
    steps.forEach((step) => {
      const stepElement = this.createStepElement(step);
      stepsContainer.appendChild(stepElement);
    });
  },

  // Common result value display
  displayResultValue(value, suffix = "") {
    const resultValue = this.getResultValue();
    if (resultValue) {
      resultValue.textContent = value + suffix;
    }
  },

  // Common delay utility for UX
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Common keyboard shortcuts setup
  setupKeyboardShortcuts(form) {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + Enter to calculate
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        form.dispatchEvent(new Event("submit"));
      }

      // Escape to clear
      if (e.key === "Escape") {
        form.reset();
        this.clearResults();
      }
    });
  },

  // Common input field change handlers
  setupInputChangeListeners(inputs) {
    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        this.clearResults();
      });
    });
  },

  // Common type button state management
  updateTypeButtons(activeType) {
    document.querySelectorAll(".type-button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.type === activeType);
    });
  },

  // Common form submission wrapper
  async handleFormSubmission(form, calculationCallback) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        this.hideError();
        this.showCalculating();

        // Small delay for UX
        await this.delay(300);

        // Execute the calculation callback
        await calculationCallback();

      } catch (error) {
        this.showError(error.message);
        this.clearResults();
      } finally {
        this.hideCalculating();
      }
    });
  }
};

// Make it globally available
window.CalculatorUtils = CalculatorUtils;