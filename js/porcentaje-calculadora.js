// Percentage Calculator

// Calculator state
let calculatorType = "percentage";

// DOM elements
const form = document.getElementById("percentageForm");
const inputsContainer = document.getElementById("inputsContainer");
const helpText = document.getElementById("helpText");
const schemaFormula = document.getElementById("schemaFormula");
const schemaDescription = document.getElementById("schemaDescription");

// Short aliases for formatting
const fmt = (value) => CalculatorUtils.formatNumber(value, 4);
const money = (value) => CalculatorUtils.formatCurrency(value);

// Calculator configurations
const calculatorConfigs = {
  percentage: {
    formula: "X% de Y = ?",
    description: "Calcula el porcentaje de un número",
    inputs: [
      { id: "percent", label: "Porcentaje (%)", placeholder: "25" },
      { id: "number", label: "Número", placeholder: "200" },
    ],
    helpText: "Ejemplo: 25% de 200 = 50",
  },
  whatPercent: {
    formula: "X de Y = ?%",
    description: "Calcula qué porcentaje representa un número",
    inputs: [
      { id: "part", label: "Número (parte)", placeholder: "45" },
      { id: "total", label: "Total", placeholder: "180" },
    ],
    helpText: "Ejemplo: 45 de 180 = 25%",
  },
  discount: {
    formula: "Precio - X% = ?",
    description: "Calcula el precio final con descuento",
    inputs: [
      { id: "price", label: "Precio original", placeholder: "200" },
      { id: "discount", label: "Descuento (%)", placeholder: "25" },
    ],
    helpText: "Ejemplo: $200 con 25% descuento = $150",
  },
  increase: {
    formula: "Valor + X% = ?",
    description: "Calcula el valor final con aumento",
    inputs: [
      { id: "price", label: "Valor original", placeholder: "1500" },
      { id: "increase", label: "Aumento (%)", placeholder: "12" },
    ],
    helpText: "Ejemplo: $1500 con 12% aumento = $1680",
  },
  change: {
    formula: "De A a B = ?%",
    description: "Calcula la variación porcentual entre dos valores",
    inputs: [
      { id: "from", label: "Valor inicial (A)", placeholder: "80" },
      { id: "to", label: "Valor final (B)", placeholder: "100" },
    ],
    helpText: "Ejemplo: de 80 a 100 hay un aumento del 25%",
  },
  original: {
    formula: "X es el Y% de ?",
    description: "Encuentra el valor total a partir de una parte y su porcentaje",
    inputs: [
      { id: "part", label: "Valor conocido (parte)", placeholder: "30" },
      { id: "percent", label: "Porcentaje que representa (%)", placeholder: "20" },
    ],
    helpText: "Ejemplo: 30 es el 20% de 150",
  },
};

// Change calculator type
function changeType(type) {
  calculatorType = type;

  // Update button states
  CalculatorUtils.updateTypeButtons(type);

  // Update visual schema
  const config = calculatorConfigs[type];
  schemaFormula.textContent = config.formula;
  schemaDescription.textContent = config.description;
  helpText.textContent = config.helpText;

  // Update inputs
  updateInputs();

  // Clear results
  CalculatorUtils.clearResults();
}

// Update inputs based on calculator type
function updateInputs() {
  const config = calculatorConfigs[calculatorType];
  inputsContainer.innerHTML = "";

  config.inputs.forEach((input) => {
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";
    inputGroup.innerHTML = `
      <label for="${input.id}">${input.label}:</label>
      <input
        type="number"
        class="input-field"
        id="${input.id}"
        placeholder="${input.placeholder}"
        step="any"
        required
      />
    `;
    inputsContainer.appendChild(inputGroup);
  });

  setupInputListeners();
}

// Calculate based on type
function calculate(values, type) {
  switch (type) {
    case "percentage":
      return (values.percent / 100) * values.number;
    case "whatPercent":
      return (values.part / values.total) * 100;
    case "discount":
      return values.price - (values.price * values.discount) / 100;
    case "increase":
      return values.price + (values.price * values.increase) / 100;
    case "change":
      return ((values.to - values.from) / Math.abs(values.from)) * 100;
    case "original":
      return (values.part * 100) / values.percent;
    default:
      return 0;
  }
}

// Generate step by step explanation
function generateSteps(values, result, type) {
  const steps = [];

  switch (type) {
    case "percentage":
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Porcentaje: ${fmt(values.percent)}%\nNúmero: ${fmt(values.number)}`,
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula del porcentaje:",
        formula: `(${fmt(values.percent)} ÷ 100) × ${fmt(values.number)}`,
      });
      steps.push({
        number: 3,
        content: "Realizamos las operaciones:",
        formula: `${fmt(values.percent / 100)} × ${fmt(values.number)} = ${fmt(result)}`,
      });
      break;

    case "whatPercent":
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Parte: ${fmt(values.part)}\nTotal: ${fmt(values.total)}`,
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula del porcentaje:",
        formula: `(${fmt(values.part)} ÷ ${fmt(values.total)}) × 100`,
      });
      steps.push({
        number: 3,
        content: "Realizamos las operaciones:",
        formula: `${fmt(values.part / values.total)} × 100 = ${fmt(result)}%`,
      });
      break;

    case "discount": {
      const discountAmount = (values.price * values.discount) / 100;
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Precio original: ${money(values.price)}\nDescuento: ${fmt(values.discount)}%`,
      });
      steps.push({
        number: 2,
        content: "Calculamos el monto del descuento:",
        formula: `${money(values.price)} × ${fmt(values.discount)}% = ${money(discountAmount)}`,
      });
      steps.push({
        number: 3,
        content: "Restamos el descuento del precio original:",
        formula: `${money(values.price)} - ${money(discountAmount)} = ${money(result)}`,
      });
      steps.push({
        number: 4,
        content: "Ahorro total:",
        formula: `Ahorras ${money(discountAmount)}`,
      });
      break;
    }

    case "increase": {
      const increaseAmount = (values.price * values.increase) / 100;
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Valor original: ${money(values.price)}\nAumento: ${fmt(values.increase)}%`,
      });
      steps.push({
        number: 2,
        content: "Calculamos el monto del aumento:",
        formula: `${money(values.price)} × ${fmt(values.increase)}% = ${money(increaseAmount)}`,
      });
      steps.push({
        number: 3,
        content: "Sumamos el aumento al valor original:",
        formula: `${money(values.price)} + ${money(increaseAmount)} = ${money(result)}`,
      });
      break;
    }

    case "change": {
      const difference = values.to - values.from;
      steps.push({
        number: 1,
        content: "Calculamos la diferencia entre el valor final y el inicial:",
        formula: `${fmt(values.to)} - ${fmt(values.from)} = ${fmt(difference)}`,
      });
      steps.push({
        number: 2,
        content: "Dividimos la diferencia entre el valor inicial y multiplicamos por 100:",
        formula: `(${fmt(difference)} ÷ ${fmt(Math.abs(values.from))}) × 100 = ${fmt(result)}%`,
      });
      steps.push({
        number: 3,
        content: "Interpretación:",
        formula:
          result > 0
            ? `Hubo un aumento del ${fmt(result)}%`
            : result < 0
            ? `Hubo una disminución del ${fmt(Math.abs(result))}%`
            : "No hubo variación",
      });
      break;
    }

    case "original":
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Parte: ${fmt(values.part)}\nPorcentaje: ${fmt(values.percent)}%`,
      });
      steps.push({
        number: 2,
        content: "Despejamos el total de: Parte = Total × Porcentaje ÷ 100",
        formula: `Total = (${fmt(values.part)} × 100) ÷ ${fmt(values.percent)}`,
      });
      steps.push({
        number: 3,
        content: "Realizamos las operaciones:",
        formula: `Total = ${fmt(values.part * 100)} ÷ ${fmt(values.percent)} = ${fmt(result)}`,
      });
      break;
  }

  return steps;
}

// Display results
function displayResults(values, result) {
  // Show result value
  let resultText;
  if (calculatorType === "whatPercent") {
    resultText = `${fmt(result)}%`;
  } else if (calculatorType === "change") {
    resultText = `${result > 0 ? "+" : ""}${fmt(result)}%`;
  } else if (calculatorType === "discount" || calculatorType === "increase") {
    resultText = money(result);
  } else {
    resultText = fmt(result);
  }
  CalculatorUtils.displayResultValue(resultText);

  // Generate and display steps
  const steps = generateSteps(values, result, calculatorType);
  CalculatorUtils.displaySteps(steps);

  // Show results section
  CalculatorUtils.showResults();
}

// Load example
function loadExample(exampleId) {
  const examples = {
    percentage1: {
      type: "discount",
      values: { price: 200, discount: 25 },
    },
    percentage2: {
      type: "whatPercent",
      values: { part: 45, total: 180 },
    },
    increase1: {
      type: "increase",
      values: { price: 1500, increase: 12 },
    },
    whatPercent1: { type: "whatPercent", values: { part: 8, total: 10 } },
    change1: { type: "change", values: { from: 80, to: 100 } },
    original1: { type: "original", values: { part: 30, percent: 20 } },
  };

  const example = examples[exampleId];
  if (example) {
    changeType(example.type);

    Object.keys(example.values).forEach((key) => {
      const input = document.getElementById(key);
      if (input) {
        input.value = example.values[key];
      }
    });

    // Auto calculate
    CalculatorUtils.submitForm(form);
  }
}

// Input field setup
function setupInputListeners() {
  const inputs = inputsContainer.querySelectorAll("input");
  CalculatorUtils.setupInputChangeListeners(inputs);
}

// Calculation callback for form submission
async function performCalculation() {
  // Get values from inputs
  const values = {};
  const config = calculatorConfigs[calculatorType];

  config.inputs.forEach((input) => {
    const element = document.getElementById(input.id);
    if (element) {
      values[input.id] =
        calculatorType === "change"
          ? CalculatorUtils.parseNumber(element.value, input.label)
          : CalculatorUtils.validateInput(element.value, input.label);
    }
  });

  // Additional validation
  if (calculatorType === "whatPercent" && values.total === 0) {
    throw new Error("El total no puede ser cero");
  }
  if (calculatorType === "discount" && values.discount > 100) {
    throw new Error("El descuento no puede ser mayor al 100%");
  }
  if (calculatorType === "change" && values.from === 0) {
    throw new Error("El valor inicial no puede ser cero (no se puede dividir entre cero)");
  }
  if (calculatorType === "original" && values.percent === 0) {
    throw new Error("El porcentaje no puede ser cero");
  }

  // Calculate result
  const result = calculate(values, calculatorType);

  // Display results
  displayResults(values, result);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with percentage calculator
  changeType("percentage");

  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);

  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);

  // Focus first input
  const firstInput = inputsContainer.querySelector("input");
  if (firstInput) firstInput.focus();

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const exampleParam = urlParams.get("example");
  if (exampleParam) {
    loadExample(exampleParam);
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
