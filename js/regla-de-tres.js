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

// Short alias for number formatting
const fmt = (value) => CalculatorUtils.formatNumber(value);

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
  resetSchema();
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
      formula: `${fmt(a)} → ${fmt(b)}\n${fmt(c)} → X`,
    });
    steps.push({
      number: 3,
      content: "Aplicamos la fórmula de regla de tres directa (multiplicamos en cruz):",
      formula: `X = (${fmt(b)} × ${fmt(c)}) ÷ ${fmt(a)}`,
    });
    steps.push({
      number: 4,
      content: "Realizamos las operaciones:",
      formula: `X = ${fmt(b * c)} ÷ ${fmt(a)} = ${fmt(x)}`,
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
      formula: `${fmt(a)} → ${fmt(b)}\n${fmt(c)} → X`,
    });
    steps.push({
      number: 3,
      content: "Aplicamos la fórmula de regla de tres inversa (multiplicamos en línea):",
      formula: `X = (${fmt(a)} × ${fmt(b)}) ÷ ${fmt(c)}`,
    });
    steps.push({
      number: 4,
      content: "Realizamos las operaciones:",
      formula: `X = ${fmt(a * b)} ÷ ${fmt(c)} = ${fmt(x)}`,
    });
  }

  return steps;
}

// Reset the visual schema placeholders
function resetSchema() {
  document.getElementById("schema-a").textContent = "A";
  document.getElementById("schema-b").textContent = "B";
  document.getElementById("schema-c").textContent = "C";
  document.getElementById("schema-x").textContent = "X";
  valueX.value = "";
}

// Display results
function displayResults(a, b, c, x) {
  // Update schema values
  document.getElementById("schema-a").textContent = fmt(a);
  document.getElementById("schema-b").textContent = fmt(b);
  document.getElementById("schema-c").textContent = fmt(c);
  document.getElementById("schema-x").textContent = fmt(x);

  // Show result value
  CalculatorUtils.displayResultValue(fmt(x));

  // Generate and display steps
  const steps = generateSteps(a, b, c, x, calculatorType);
  CalculatorUtils.displaySteps(steps);

  // Show results section
  CalculatorUtils.showResults();
}

// Load example
function loadExample(exampleId) {
  const examples = {
    direct1: { a: 3, b: 12, c: 5, type: "direct" },
    // 300 km -> 20 L, 450 km -> X L
    direct2: { a: 300, b: 20, c: 450, type: "direct" },
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
    CalculatorUtils.submitForm(form);
  }
}

// Calculation callback for form submission
async function performCalculation() {
  // Validate inputs (negative values are valid in a proportion)
  const a = CalculatorUtils.parseNumber(valueA.value, "A");
  const b = CalculatorUtils.parseNumber(valueB.value, "B");
  const c = CalculatorUtils.parseNumber(valueC.value, "C");

  // The divisor differs per type: A for direct, C for inverse
  if (calculatorType === "direct" && a === 0) {
    throw new Error("El valor de A no puede ser cero (se divide entre A)");
  }
  if (calculatorType === "inverse" && c === 0) {
    throw new Error("El valor de C no puede ser cero (se divide entre C)");
  }

  // Calculate result
  const x = calculate(a, b, c, calculatorType);

  // Update X field
  valueX.value = CalculatorUtils.round(x);

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
