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

  // Common validation (non-negative numbers)
  validateInput(value, fieldName) {
    const number = this.parseNumber(value, fieldName);
    if (number < 0) {
      throw new Error(`El valor de ${fieldName} no puede ser negativo`);
    }
    return number;
  },

  // Parse any finite number (negatives allowed)
  parseNumber(value, fieldName) {
    const text = String(value ?? "").trim();
    const number = Number(text);
    if (text === "" || !Number.isFinite(number)) {
      throw new Error(`Por favor ingresa un número válido en ${fieldName}`);
    }
    return number;
  },

  // Parse an integer, optionally enforcing a minimum value
  parseInteger(value, fieldName, min = -Infinity) {
    const number = this.parseNumber(value, fieldName);
    if (!Number.isInteger(number)) {
      throw new Error(`${fieldName} debe ser un número entero`);
    }
    if (number < min) {
      throw new Error(`${fieldName} debe ser mayor o igual a ${min}`);
    }
    return number;
  },

  // Remove floating point noise (0.1 + 0.2 -> 0.3)
  round(value, significantDigits = 12) {
    if (!Number.isFinite(value) || value === 0) return value;
    return Number(value.toPrecision(significantDigits));
  },

  // Human friendly number: thousands separators, trimmed decimals
  formatNumber(value, maxDecimals = 6) {
    if (typeof value === "bigint") {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    if (!Number.isFinite(value)) return String(value);
    const abs = Math.abs(value);
    if (abs !== 0 && (abs >= 1e15 || abs < 1e-6)) {
      return this.round(value).toExponential(6).replace(/\.?0+e/, "e");
    }
    return this.round(value).toLocaleString("en-US", {
      maximumFractionDigits: maxDecimals,
    });
  },

  // Currency with two decimals: $1,234.50
  formatCurrency(value) {
    const sign = value < 0 ? "-" : "";
    return (
      sign +
      "$" +
      Math.abs(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
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
    return new Promise((resolve) => setTimeout(resolve, ms));
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
      const isActive = btn.dataset.type === activeType;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
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
        // Hide stale results only: clearResults() would also hide the error
        this.hideResults();
        this.showError(error.message);
      } finally {
        this.hideCalculating();
      }
    });
  },
};

// Make it globally available
window.CalculatorUtils = CalculatorUtils;
