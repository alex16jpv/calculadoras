// BMI (IMC) Calculator

// Calculator state
let calculatorType = "metric";

// DOM elements
const form = document.getElementById("bmiForm");
const metricInputs = document.getElementById("metricInputs");
const imperialInputs = document.getElementById("imperialInputs");
const weightKg = document.getElementById("weightKg");
const heightCm = document.getElementById("heightCm");
const weightLb = document.getElementById("weightLb");
const heightFt = document.getElementById("heightFt");
const heightIn = document.getElementById("heightIn");
const bmiCategory = document.getElementById("bmiCategory");
const bmiMarker = document.getElementById("bmiMarker");
const summaryGrid = document.getElementById("summaryGrid");

const KG_PER_LB = 0.45359237;
const M_PER_IN = 0.0254;

// WHO adult categories
const CATEGORIES = [
  { max: 18.5, name: "Bajo peso", className: "under" },
  { max: 25, name: "Peso normal", className: "normal" },
  { max: 30, name: "Sobrepeso", className: "over" },
  { max: 35, name: "Obesidad grado I", className: "obese" },
  { max: 40, name: "Obesidad grado II", className: "obese" },
  { max: Infinity, name: "Obesidad grado III", className: "obese" },
];

// Short alias for number formatting
const fmt = (value, decimals = 1) =>
  CalculatorUtils.formatNumber(Number(value.toFixed(decimals)), decimals);

// Change unit system
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  metricInputs.hidden = type !== "metric";
  imperialInputs.hidden = type !== "imperial";
  CalculatorUtils.clearResults();
}

// Read weight (kg) and height (m) from the active unit system
function readMeasurements() {
  if (calculatorType === "metric") {
    const kg = CalculatorUtils.validateInput(weightKg.value, "Peso");
    const cm = CalculatorUtils.validateInput(heightCm.value, "Estatura");
    return { kg, meters: cm / 100 };
  }

  const lb = CalculatorUtils.validateInput(weightLb.value, "Peso");
  const feet = CalculatorUtils.validateInput(heightFt.value, "Pies");
  const inches = heightIn.value.trim() === "" ? 0 : CalculatorUtils.validateInput(heightIn.value, "Pulgadas");
  if (inches >= 12) {
    throw new Error("Las pulgadas deben ser menores a 12 (usa los pies para el resto)");
  }
  return { kg: lb * KG_PER_LB, meters: (feet * 12 + inches) * M_PER_IN };
}

// Format a weight in the active unit system
function formatWeight(kg) {
  return calculatorType === "metric" ? `${fmt(kg)} kg` : `${fmt(kg / KG_PER_LB)} lb`;
}

// Load example
function loadExample(type, values) {
  changeType(type);
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(id).value = value;
  });
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const { kg, meters } = readMeasurements();

  if (meters < 0.5 || meters > 2.72) {
    throw new Error("Ingresa una estatura válida (entre 50 cm y 272 cm)");
  }
  if (kg < 10 || kg > 650) {
    throw new Error("Ingresa un peso válido (entre 10 kg y 650 kg)");
  }

  const bmi = kg / (meters * meters);
  const category = CATEGORIES.find((c) => bmi < c.max);
  const minHealthy = 18.5 * meters * meters;
  const maxHealthy = 24.9 * meters * meters;

  CalculatorUtils.displayResultValue(fmt(bmi));
  bmiCategory.textContent = category.name;
  bmiCategory.className = `bmi-category ${category.className}`;

  // Scale spans IMC 15 to 40
  const position = Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
  bmiMarker.style.left = `${position}%`;

  let difference;
  if (kg < minHealthy) difference = `Te faltan ${formatWeight(minHealthy - kg)} para el rango normal`;
  else if (kg > maxHealthy) difference = `Estás ${formatWeight(kg - maxHealthy)} por encima del rango normal`;
  else difference = "Estás dentro del rango normal";

  summaryGrid.innerHTML = [
    { label: "Rango de peso normal", value: `${formatWeight(minHealthy)} – ${formatWeight(maxHealthy)}` },
    { label: "Tu situación", value: difference },
  ]
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  const steps = [];
  if (calculatorType === "imperial") {
    steps.push({
      number: 1,
      content: "Convertimos a unidades métricas:",
      formula: `Peso: ${fmt(kg / KG_PER_LB)} lb × 0.4536 = ${fmt(kg, 2)} kg\nEstatura: ${fmt(meters / M_PER_IN)} in × 0.0254 = ${fmt(meters, 2)} m`,
    });
  }
  steps.push({
    number: steps.length + 1,
    content: "Elevamos la estatura al cuadrado:",
    formula: `${fmt(meters, 2)} m × ${fmt(meters, 2)} m = ${fmt(meters * meters, 4)} m²`,
  });
  steps.push({
    number: steps.length + 1,
    content: "Dividimos el peso entre la estatura al cuadrado:",
    formula: `IMC = ${fmt(kg, 2)} ÷ ${fmt(meters * meters, 4)} = ${fmt(bmi)}`,
  });
  steps.push({
    number: steps.length + 1,
    content: "Clasificamos según la OMS:",
    formula: `IMC ${fmt(bmi)} → ${category.name}`,
  });
  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([weightKg, heightCm, weightLb, heightFt, heightIn]);
  weightKg.focus();
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
