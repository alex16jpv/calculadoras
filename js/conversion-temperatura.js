// Temperature Converter

// DOM elements
const form = document.getElementById("temperatureForm");
const valueInput = document.getElementById("valueInput");
const unitSelect = document.getElementById("unitSelect");
const resultSubtitle = document.getElementById("resultSubtitle");
const conversionGrid = document.getElementById("conversionGrid");
const thermometerNote = document.getElementById("thermometerNote");

// Short alias for number formatting
const fmt = (value) => CalculatorUtils.formatNumber(value, 2);

// Every scale is converted through Kelvin
const SCALES = {
  C: {
    name: "Celsius",
    symbol: "°C",
    toKelvin: (v) => v + 273.15,
    fromKelvin: (k) => k - 273.15,
  },
  F: {
    name: "Fahrenheit",
    symbol: "°F",
    toKelvin: (v) => ((v - 32) * 5) / 9 + 273.15,
    fromKelvin: (k) => ((k - 273.15) * 9) / 5 + 32,
  },
  K: {
    name: "Kelvin",
    symbol: "K",
    toKelvin: (v) => v,
    fromKelvin: (k) => k,
  },
  R: {
    name: "Rankine",
    symbol: "°R",
    toKelvin: (v) => (v * 5) / 9,
    fromKelvin: (k) => (k * 9) / 5,
  },
};

// Human readable formula from one scale to another
const FORMULAS = {
  "C-F": (v) => `°F = ${fmt(v)} × 9/5 + 32`,
  "C-K": (v) => `K = ${fmt(v)} + 273.15`,
  "C-R": (v) => `°R = (${fmt(v)} + 273.15) × 9/5`,
  "F-C": (v) => `°C = (${fmt(v)} - 32) × 5/9`,
  "F-K": (v) => `K = (${fmt(v)} - 32) × 5/9 + 273.15`,
  "F-R": (v) => `°R = ${fmt(v)} + 459.67`,
  "K-C": (v) => `°C = ${fmt(v)} - 273.15`,
  "K-F": (v) => `°F = (${fmt(v)} - 273.15) × 9/5 + 32`,
  "K-R": (v) => `°R = ${fmt(v)} × 9/5`,
  "R-C": (v) => `°C = (${fmt(v)} - 491.67) × 5/9`,
  "R-F": (v) => `°F = ${fmt(v)} - 459.67`,
  "R-K": (v) => `K = ${fmt(v)} × 5/9`,
};

// Describe the temperature in everyday terms (based on Celsius)
function describe(celsius) {
  if (celsius <= -273.15 + 1e-9) return "Cero absoluto: no existe una temperatura más baja.";
  if (celsius < 0) return "Por debajo del punto de congelación del agua.";
  if (celsius < 15) return "Frío.";
  if (celsius < 25) return "Temperatura templada o ambiente.";
  if (celsius < 36) return "Calor.";
  if (celsius < 38) return "Rango de la temperatura corporal normal.";
  if (celsius < 100) return "Muy caliente.";
  if (celsius < 101) return "Punto de ebullición del agua a nivel del mar.";
  return "Por encima del punto de ebullición del agua.";
}

// Load example
function loadExample(value, unit) {
  valueInput.value = value;
  unitSelect.value = unit;
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const value = CalculatorUtils.parseNumber(valueInput.value, "Valor");
  const from = unitSelect.value;
  const kelvin = SCALES[from].toKelvin(value);

  // Tolerance avoids rejecting -273.15 °C due to rounding
  if (kelvin < -1e-9) {
    throw new Error(
      `${fmt(value)} ${SCALES[from].symbol} está por debajo del cero absoluto (0 K = -273.15 °C = -459.67 °F)`
    );
  }

  const targets = Object.keys(SCALES).filter((key) => key !== from);
  const converted = {};
  Object.keys(SCALES).forEach((key) => {
    converted[key] = CalculatorUtils.round(SCALES[key].fromKelvin(Math.max(0, kelvin)), 10);
  });

  // Main result: the most common counterpart
  const main = from === "C" ? "F" : "C";
  CalculatorUtils.displayResultValue(`${fmt(converted[main])} ${SCALES[main].symbol}`);
  resultSubtitle.textContent = `${fmt(value)} ${SCALES[from].symbol} equivale a`;

  conversionGrid.innerHTML = Object.keys(SCALES)
    .map(
      (key) => `
      <div class="result-item${key === from ? " source" : ""}">
        <div class="result-item-label">${SCALES[key].name}</div>
        <div class="result-item-value">${fmt(converted[key])} ${SCALES[key].symbol}</div>
      </div>`
    )
    .join("");

  thermometerNote.textContent = describe(converted.C);

  const steps = targets.map((key, index) => ({
    number: index + 1,
    content: `De ${SCALES[from].name} a ${SCALES[key].name}:`,
    formula: `${FORMULAS[`${from}-${key}`](value)} = ${fmt(converted[key])} ${SCALES[key].symbol}`,
  }));
  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([valueInput]);
  unitSelect.addEventListener("change", () => CalculatorUtils.clearResults());
  valueInput.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
