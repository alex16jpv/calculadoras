// Daily Calories Calculator (Mifflin-St Jeor)

// Calculator state
let calculatorType = "male";

// DOM elements
const form = document.getElementById("caloriesForm");
const ageInput = document.getElementById("ageInput");
const weightInput = document.getElementById("weightInput");
const heightInput = document.getElementById("heightInput");
const activitySelect = document.getElementById("activitySelect");
const summaryGrid = document.getElementById("summaryGrid");
const goalsTable = document.getElementById("goalsTable");
const floorNote = document.getElementById("floorNote");

// Commonly cited minimum intakes without medical supervision
const MINIMUM_CALORIES = { male: 1500, female: 1200 };

const GOALS = [
  { label: "Perder peso rápido (≈ -1 kg/semana)", delta: -1000 },
  { label: "Perder peso (≈ -0.5 kg/semana)", delta: -500 },
  { label: "Perder peso suave (≈ -0.25 kg/semana)", delta: -250 },
  { label: "Mantener peso", delta: 0 },
  { label: "Ganar peso suave (≈ +0.25 kg/semana)", delta: 250 },
  { label: "Ganar peso (≈ +0.5 kg/semana)", delta: 500 },
];

const kcal = (value) => `${CalculatorUtils.formatNumber(Math.round(value))} kcal`;

// Change sex
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  CalculatorUtils.clearResults();
}

// Mifflin-St Jeor basal metabolic rate
function basalMetabolicRate(sex, age, weight, height) {
  return 10 * weight + 6.25 * height - 5 * age + (sex === "male" ? 5 : -161);
}

// Load example
function loadExample(sex, age, weight, height, activity) {
  changeType(sex);
  ageInput.value = age;
  weightInput.value = weight;
  heightInput.value = height;
  activitySelect.value = activity;
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  const age = CalculatorUtils.parseInteger(ageInput.value, "La edad", 0);
  const weight = CalculatorUtils.validateInput(weightInput.value, "Peso");
  const height = CalculatorUtils.validateInput(heightInput.value, "Estatura");
  const activity = Number(activitySelect.value);

  if (age < 15 || age > 100) {
    throw new Error("La fórmula es válida para edades entre 15 y 100 años");
  }
  if (weight < 30 || weight > 300) {
    throw new Error("Ingresa un peso entre 30 y 300 kg");
  }
  if (height < 120 || height > 250) {
    throw new Error("Ingresa una estatura entre 120 y 250 cm");
  }

  const sexConstant = calculatorType === "male" ? 5 : -161;
  const bmr = basalMetabolicRate(calculatorType, age, weight, height);
  const tdee = bmr * activity;
  const minimum = MINIMUM_CALORIES[calculatorType];

  CalculatorUtils.displayResultValue(kcal(tdee));

  summaryGrid.innerHTML = [
    { label: "Metabolismo basal", value: kcal(bmr) },
    { label: "Factor de actividad", value: `× ${activity}` },
  ]
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  let belowMinimum = false;
  goalsTable.innerHTML = GOALS.map((goal) => {
    const value = tdee + goal.delta;
    const low = value < minimum;
    if (low) belowMinimum = true;
    return `
      <tr class="${goal.delta === 0 ? "highlight" : ""}${low ? " below-minimum" : ""}">
        <td>${goal.label}</td>
        <td>${kcal(value)}${low ? " ⚠️" : ""}</td>
      </tr>`;
  }).join("");

  floorNote.hidden = !belowMinimum;
  floorNote.textContent = belowMinimum
    ? `⚠️ Los objetivos marcados quedan por debajo de ${kcal(minimum)}, un mínimo recomendado sin supervisión profesional.`
    : "";

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: `Metabolismo basal con Mifflin-St Jeor (${calculatorType === "male" ? "hombre" : "mujer"}):`,
      formula: `TMB = 10 × ${weight} + 6.25 × ${height} - 5 × ${age} ${sexConstant > 0 ? "+" : "-"} ${Math.abs(sexConstant)}\nTMB = ${CalculatorUtils.formatNumber(10 * weight)} + ${CalculatorUtils.formatNumber(6.25 * height)} - ${5 * age} ${sexConstant > 0 ? "+" : "-"} ${Math.abs(sexConstant)} = ${kcal(bmr)}`,
    },
    {
      number: 2,
      content: "Multiplicamos por el factor de actividad:",
      formula: `${kcal(bmr)} × ${activity} = ${kcal(tdee)}`,
    },
    {
      number: 3,
      content: "Ajustamos según el objetivo (≈ 7,700 kcal equivalen a 1 kg de grasa):",
      formula: `Déficit de 500 kcal/día × 7 días ≈ 3,500 kcal ≈ 0.5 kg por semana`,
    },
  ]);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([ageInput, weightInput, heightInput]);
  activitySelect.addEventListener("change", () => CalculatorUtils.clearResults());
  ageInput.focus();
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
