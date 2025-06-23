// Rule of Three Calculator

// Calculator state
let calculatorType = "direct";

// DOM elements
const form = document.getElementById("ruleOfThreeForm");
const valueA = document.getElementById("valueA");
const valueB = document.getElementById("valueB");
const valueC = document.getElementById("valueC");
const valueX = document.getElementById("valueX");
const helpText = document.getElementById("helpText");

// Change calculator type
function changeType(type) {
  calculatorType = type;

  // Update button states
  CalculatorUtils.updateTypeButtons(type);

  // Update help text
  if (type === "direct") {
    helpText.textContent =
      "En la regla de tres directa, cuando una cantidad aumenta, la otra también aumenta proporcionalmente.";
  } else {
    helpText.textContent =
      "En la regla de tres inversa, cuando una cantidad aumenta, la otra disminuye proporcionalmente.";
  }

  // Clear results
  CalculatorUtils.clearResults();
}

// Calculate rule of three
function calculate(a, b, c, type) {
  if (type === "direct") {
    return (b * c) / a;
  } else {
    return (a * b) / c;
  }
}

// Generate step by step explanation
function generateSteps(a, b, c, x, type) {
  const steps = [];

  if (type === "direct") {
    steps.push({
      number: 1,
      content:
        "Identificamos que es una regla de tres directa porque las magnitudes son directamente proporcionales.",
      formula: null,
    });
    steps.push({
      number: 2,
      content: "Planteamos la proporción:",
      formula: `${a} → ${b}\n${c} → X`,
    });
    steps.push({
      number: 3,
      content: "Aplicamos la fórmula de regla de tres directa:",
      formula: `X = (${b} × ${c}) ÷ ${a}`,
    });
    steps.push({
      number: 4,
      content: "Realizamos las operaciones:",
      formula: `X = ${b * c} ÷ ${a} = ${x.toFixed(2)}`,
    });
  } else {
    steps.push({
      number: 1,
      content:
        "Identificamos que es una regla de tres inversa porque las magnitudes son inversamente proporcionales.",
      formula: null,
    });
    steps.push({
      number: 2,
      content: "Planteamos la proporción inversa:",
      formula: `${a} → ${b}\n${c} → X`,
    });
    steps.push({
      number: 3,
      content: "Aplicamos la fórmula de regla de tres inversa:",
      formula: `X = (${a} × ${b}) ÷ ${c}`,
    });
    steps.push({
      number: 4,
      content: "Realizamos las operaciones:",
      formula: `X = ${a * b} ÷ ${c} = ${x.toFixed(2)}`,
    });
  }

  return steps;
}

// Display results
function displayResults(a, b, c, x) {
  // Update schema values
  document.getElementById("schema-a").textContent = a;
  document.getElementById("schema-b").textContent = b;
  document.getElementById("schema-c").textContent = c;
  document.getElementById("schema-x").textContent = x.toFixed(2);

  // Show result value
  CalculatorUtils.displayResultValue(x.toFixed(2));

  // Generate and display steps
  const steps = generateSteps(a, b, c, x, calculatorType);
  CalculatorUtils.displaySteps(steps);

  // Show results section
  CalculatorUtils.showResults();
}

// Validate input specific to rule of three
function validateInput(value, fieldName) {
  if (isNaN(value) || value === "") {
    throw new Error(`Por favor ingresa un número válido en ${fieldName}`);
  }
  if (value === 0) {
    throw new Error(`El valor de ${fieldName} no puede ser cero`);
  }
  return parseFloat(value);
}

// Load example
function loadExample(exampleId) {
  const examples = {
    direct1: { a: 3, b: 12, c: 5, type: "direct" },
    direct2: { a: 20, b: 300, c: 30, type: "direct" },
    inverse1: { a: 4, b: 6, c: 8, type: "inverse" },
    inverse2: { a: 60, b: 2, c: 80, type: "inverse" },
  };

  const example = examples[exampleId];
  if (example) {
    changeType(example.type);
    valueA.value = example.a;
    valueB.value = example.b;
    valueC.value = example.c;

    // Auto calculate
    form.dispatchEvent(new Event("submit"));
  }
}

// Calculation callback for form submission
async function performCalculation() {
  // Validate inputs
  const a = validateInput(valueA.value, "A");
  const b = validateInput(valueB.value, "B");
  const c = validateInput(valueC.value, "C");

  // Calculate result
  const x = calculate(a, b, c, calculatorType);

  // Update X field
  valueX.value = x.toFixed(2);

  // Display results
  displayResults(a, b, c, x);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);

  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);

  // Setup input listeners
  CalculatorUtils.setupInputChangeListeners([valueA, valueB, valueC]);

  // Focus first input
  valueA.focus();

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