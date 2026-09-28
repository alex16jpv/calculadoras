// Heart Rate Zones Calculator

// DOM elements
const form = document.getElementById("heartForm");
const ageInput = document.getElementById("ageInput");
const restingInput = document.getElementById("restingInput");
const formulaSelect = document.getElementById("formulaSelect");
const resultSubtitle = document.getElementById("resultSubtitle");
const zonesList = document.getElementById("zonesList");

const ZONES = [
  { name: "Zona 1 · Recuperación", min: 0.5, max: 0.6, description: "Calentamiento y recuperación activa" },
  { name: "Zona 2 · Quema de grasa", min: 0.6, max: 0.7, description: "Resistencia aeróbica básica" },
  { name: "Zona 3 · Aeróbica", min: 0.7, max: 0.8, description: "Mejora cardiovascular" },
  { name: "Zona 4 · Umbral", min: 0.8, max: 0.9, description: "Umbral anaeróbico, alta intensidad" },
  { name: "Zona 5 · Máxima", min: 0.9, max: 1.0, description: "Esfuerzo máximo, intervalos cortos" },
];

const FORMULAS = {
  tanaka: { label: "208 - 0.7 × edad", compute: (age) => 208 - 0.7 * age },
  classic: { label: "220 - edad", compute: (age) => 220 - age },
};

// Target heart rate for an intensity (Karvonen when resting HR is known)
function targetRate(intensity, maxRate, restingRate) {
  if (restingRate === null) return maxRate * intensity;
  return restingRate + (maxRate - restingRate) * intensity;
}

// Load example
function loadExample(age, resting) {
  ageInput.value = age;
  restingInput.value = resting;
  formulaSelect.value = "tanaka";
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  const age = CalculatorUtils.parseInteger(ageInput.value, "La edad", 0);
  if (age < 10 || age > 100) {
    throw new Error("Ingresa una edad entre 10 y 100 años");
  }

  let resting = null;
  if (restingInput.value.trim() !== "") {
    resting = CalculatorUtils.parseInteger(restingInput.value, "El pulso en reposo", 0);
    if (resting < 30 || resting > 120) {
      throw new Error("El pulso en reposo debe estar entre 30 y 120 latidos por minuto");
    }
  }

  const formula = FORMULAS[formulaSelect.value];
  const maxRate = formula.compute(age);
  if (resting !== null && resting >= maxRate * 0.5) {
    throw new Error("El pulso en reposo es demasiado alto en relación con la frecuencia máxima estimada");
  }

  CalculatorUtils.displayResultValue(`${Math.round(maxRate)} lpm`);
  resultSubtitle.textContent =
    resting === null
      ? "frecuencia cardíaca máxima estimada · zonas por % de la máxima"
      : "frecuencia cardíaca máxima estimada · zonas con método de Karvonen";

  zonesList.innerHTML = ZONES.map((zone, index) => {
    const low = Math.round(targetRate(zone.min, maxRate, resting));
    const high = Math.round(targetRate(zone.max, maxRate, resting));
    return `
      <div class="zone zone-${index + 1}">
        <div class="zone-info">
          <div class="zone-name">${zone.name}</div>
          <div class="zone-description">${zone.description} · ${Math.round(zone.min * 100)}-${Math.round(zone.max * 100)}%</div>
        </div>
        <div class="zone-range">${low}-${high} <small>lpm</small></div>
      </div>`;
  }).join("");

  const steps = [
    {
      number: 1,
      content: "Estimamos la frecuencia cardíaca máxima (FCmáx):",
      formula: `FCmáx = ${formula.label.replace("edad", age)} = ${Math.round(maxRate)} lpm`,
    },
  ];

  if (resting === null) {
    steps.push({
      number: 2,
      content: "Cada zona es un porcentaje de la FCmáx. Por ejemplo, la zona 2 (60-70%):",
      formula: `${Math.round(maxRate)} × 0.60 = ${Math.round(maxRate * 0.6)} lpm\n${Math.round(maxRate)} × 0.70 = ${Math.round(maxRate * 0.7)} lpm`,
    });
  } else {
    const reserve = maxRate - resting;
    steps.push({
      number: 2,
      content: "Calculamos la frecuencia cardíaca de reserva (FCR):",
      formula: `FCR = FCmáx - FC reposo = ${Math.round(maxRate)} - ${resting} = ${Math.round(reserve)} lpm`,
    });
    steps.push({
      number: 3,
      content: "Método de Karvonen: FC objetivo = FC reposo + FCR × intensidad. Zona 2 (60-70%):",
      formula: `${resting} + ${Math.round(reserve)} × 0.60 = ${Math.round(resting + reserve * 0.6)} lpm\n${resting} + ${Math.round(reserve)} × 0.70 = ${Math.round(resting + reserve * 0.7)} lpm`,
    });
  }

  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([ageInput, restingInput]);
  formulaSelect.addEventListener("change", () => CalculatorUtils.clearResults());
  ageInput.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
