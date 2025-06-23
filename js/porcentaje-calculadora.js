// Percentage Calculator

// Calculator state
let calculatorType = "percentage";

// DOM elements
const form = document.getElementById("percentageForm");
const inputsContainer = document.getElementById("inputsContainer");
const helpText = document.getElementById("helpText");
const schemaFormula = document.getElementById("schemaFormula");
const schemaDescription = document.getElementById("schemaDescription");

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
    formula: "Precio + X% = ?",
    description: "Calcula el valor final con aumento",
    inputs: [
      { id: "price", label: "Valor original", placeholder: "1500" },
      { id: "increase", label: "Aumento (%)", placeholder: "12" },
    ],
    helpText: "Ejemplo: $1500 con 12% aumento = $1680",
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

  // Re-setup listeners
  setTimeout(setupInputListeners, 50);
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
        formula: `Porcentaje: ${values.percent}%\nNúmero: ${values.number}`,
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula del porcentaje:",
        formula: `(${values.percent} ÷ 100) × ${values.number}`,
      });
      steps.push({
        number: 3,
        content: "Realizamos las operaciones:",
        formula: `${values.percent / 100} × ${
          values.number
        } = ${result.toFixed(2)}`,
      });
      break;

    case "whatPercent":
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Parte: ${values.part}\nTotal: ${values.total}`,
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula del porcentaje:",
        formula: `(${values.part} ÷ ${values.total}) × 100`,
      });
      steps.push({
        number: 3,
        content: "Realizamos las operaciones:",
        formula: `${(values.part / values.total).toFixed(
          4
        )} × 100 = ${result.toFixed(2)}%`,
      });
      break;

    case "discount":
      const discountAmount = (values.price * values.discount) / 100;
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Precio original: $${values.price}\nDescuento: ${values.discount}%`,
      });
      steps.push({
        number: 2,
        content: "Calculamos el monto del descuento:",
        formula: `$${values.price} × ${
          values.discount
        }% = $${discountAmount.toFixed(2)}`,
      });
      steps.push({
        number: 3,
        content: "Restamos el descuento del precio original:",
        formula: `$${values.price} - $${discountAmount.toFixed(
          2
        )} = $${result.toFixed(2)}`,
      });
      break;

    case "increase":
      const increaseAmount = (values.price * values.increase) / 100;
      steps.push({
        number: 1,
        content: "Identificamos los valores:",
        formula: `Valor original: $${values.price}\nAumento: ${values.increase}%`,
      });
      steps.push({
        number: 2,
        content: "Calculamos el monto del aumento:",
        formula: `$${values.price} × ${
          values.increase
        }% = $${increaseAmount.toFixed(2)}`,
      });
      steps.push({
        number: 3,
        content: "Sumamos el aumento al valor original:",
        formula: `$${values.price} + $${increaseAmount.toFixed(
          2
        )} = $${result.toFixed(2)}`,
      });
      break;
  }

  return steps;
}

// Display results
function displayResults(values, result) {
  // Show result value
  let resultText = result.toFixed(2);
  if (calculatorType === "whatPercent") {
    resultText += "%";
  } else if (
    calculatorType === "discount" ||
    calculatorType === "increase"
  ) {
    resultText = "$" + resultText;
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
  };

  const example = examples[exampleId];
  if (example) {
    changeType(example.type);

    // Wait for inputs to be created
    setTimeout(() => {
      Object.keys(example.values).forEach((key) => {
        const input = document.getElementById(key);
        if (input) {
          input.value = example.values[key];
        }
      });

      // Auto calculate
      form.dispatchEvent(new Event("submit"));
    }, 100);
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
      values[input.id] = CalculatorUtils.validateInput(element.value, input.label);
    }
  });

  // Additional validation
  if (calculatorType === "whatPercent" && values.total === 0) {
    throw new Error("El total no puede ser cero");
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

  // Setup input listeners
  setTimeout(setupInputListeners, 100);

  // Focus first input
  setTimeout(() => {
    const firstInput = inputsContainer.querySelector("input");
    if (firstInput) firstInput.focus();
  }, 100);

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