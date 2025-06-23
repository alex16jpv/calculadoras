// Root and Power Calculator

// Calculator state
let calculatorType = "square-root";

// DOM elements
const form = document.getElementById("calculatorForm");
const inputsContainer = document.getElementById("inputsContainer");
const helpText = document.getElementById("helpText");
const formulaDisplay = document.getElementById("formulaDisplay");
const schemaDescription = document.getElementById("schemaDescription");
const operationFormula = document.getElementById("operationFormula");
const approximationSection = document.getElementById("approximationSection");
const approximationGrid = document.getElementById("approximationGrid");

// Calculator configurations
const calculatorConfigs = {
  "square-root": {
    formula: "√x = ?",
    description: "Calcula la raíz cuadrada de un número",
    inputs: [
      { id: "number", label: "Número", placeholder: "144", type: "number", min: "0" }
    ],
    helpText: "La raíz cuadrada de un número es el valor que multiplicado por sí mismo da el número original."
  },
  "cube-root": {
    formula: "∛x = ?",
    description: "Calcula la raíz cúbica de un número",
    inputs: [
      { id: "number", label: "Número", placeholder: "64", type: "number" }
    ],
    helpText: "La raíz cúbica de un número es el valor que elevado al cubo da el número original."
  },
  "nth-root": {
    formula: "ⁿ√x = ?",
    description: "Calcula la raíz enésima de un número",
    inputs: [
      { id: "index", label: "Índice de la raíz (n)", placeholder: "5", type: "number", min: "2" },
      { id: "number", label: "Número", placeholder: "32", type: "number" }
    ],
    helpText: "La raíz enésima es la operación inversa de elevar a la potencia n."
  },
  "power": {
    formula: "x^n = ?",
    description: "Calcula la potencia de un número",
    inputs: [
      { id: "base", label: "Base", placeholder: "3", type: "number" },
      { id: "exponent", label: "Exponente", placeholder: "4", type: "number" }
    ],
    helpText: "Una potencia representa la multiplicación repetida de la base por sí misma n veces."
  }
};

// Mathematical operations
const MathOperations = {
  // Square root
  squareRoot(number) {
    if (number < 0) {
      throw new Error("No se puede calcular la raíz cuadrada de un número negativo");
    }
    return Math.sqrt(number);
  },

  // Cube root
  cubeRoot(number) {
    return number >= 0 ? Math.pow(number, 1/3) : -Math.pow(-number, 1/3);
  },

  // Nth root
  nthRoot(number, index) {
    if (index <= 0) {
      throw new Error("El índice debe ser mayor que cero");
    }
    if (index % 2 === 0 && number < 0) {
      throw new Error("No se puede calcular la raíz de índice par de un número negativo");
    }
    
    if (number >= 0) {
      return Math.pow(number, 1/index);
    } else {
      return -Math.pow(-number, 1/index);
    }
  },

  // Power
  power(base, exponent) {
    if (base === 0 && exponent < 0) {
      throw new Error("No se puede elevar cero a una potencia negativa");
    }
    return Math.pow(base, exponent);
  },

  // Check if number is perfect square
  isPerfectSquare(number) {
    const sqrt = Math.sqrt(number);
    return sqrt === Math.floor(sqrt);
  },

  // Check if number is perfect cube
  isPerfectCube(number) {
    const cbrt = Math.round(Math.cbrt(Math.abs(number)));
    return cbrt * cbrt * cbrt === Math.abs(number);
  },

  // Check if number is perfect nth power
  isPerfectNthPower(number, index) {
    const result = this.nthRoot(number, index);
    const rounded = Math.round(result);
    return Math.abs(Math.pow(rounded, index) - number) < 1e-10;
  }
};

// Change calculator type
function changeType(type) {
  calculatorType = type;

  // Update button states
  CalculatorUtils.updateTypeButtons(type);

  // Update visual schema
  const config = calculatorConfigs[type];
  formulaDisplay.textContent = config.formula;
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

  if (calculatorType === "power") {
    // Special layout for powers
    const powerGroup = document.createElement("div");
    powerGroup.className = "complex-input-group";
    powerGroup.innerHTML = `
      <label>Potencia a calcular:</label>
      <div class="power-inputs">
        <input
          type="number"
          class="input-field base-input"
          id="base"
          placeholder="3"
          step="any"
          required
        />
        <div class="power-symbol">^</div>
        <input
          type="number"
          class="input-field exponent-input"
          id="exponent"
          placeholder="4"
          step="any"
          required
        />
      </div>
    `;
    inputsContainer.appendChild(powerGroup);
  } else if (calculatorType === "nth-root") {
    // Special layout for nth root
    const rootGroup = document.createElement("div");
    rootGroup.className = "complex-input-group";
    rootGroup.innerHTML = `
      <label>Raíz a calcular:</label>
      <div class="nth-root-inputs">
        <div class="root-symbol-container">
          <span class="root-index" id="rootIndex">n</span>
          <span class="root-symbol">√</span>
        </div>
        <input
          type="number"
          class="input-field"
          id="number"
          placeholder="32"
          step="any"
          required
        />
      </div>
      <div class="input-group">
        <label for="index">Índice de la raíz (n):</label>
        <input
          type="number"
          class="input-field index-input"
          id="index"
          placeholder="5"
          min="2"
          step="1"
          required
        />
      </div>
    `;
    inputsContainer.appendChild(rootGroup);
    
    // Update root index display dynamically
    const indexInput = document.getElementById("index");
    const rootIndexDisplay = document.getElementById("rootIndex");
    indexInput.addEventListener("input", () => {
      rootIndexDisplay.textContent = indexInput.value || "n";
    });
  } else {
    // Standard layout for square and cube roots
    config.inputs.forEach((input) => {
      const inputGroup = document.createElement("div");
      inputGroup.className = "input-group";
      inputGroup.innerHTML = `
        <label for="${input.id}">${input.label}:</label>
        <input
          type="${input.type}"
          class="input-field"
          id="${input.id}"
          placeholder="${input.placeholder}"
          ${input.min ? `min="${input.min}"` : ""}
          step="any"
          required
        />
      `;
      inputsContainer.appendChild(inputGroup);
    });
  }

  // Re-setup listeners
  setTimeout(setupInputListeners, 50);
}

// Generate step by step explanation
function generateSteps(values, result, type) {
  const steps = [];

  switch (type) {
    case "square-root":
      const { number } = values;
      steps.push({
        number: 1,
        content: "Identificamos la operación:",
        formula: `√${number} = ?`
      });
      
      if (MathOperations.isPerfectSquare(number)) {
        steps.push({
          number: 2,
          content: "Reconocemos que es un cuadrado perfecto:",
          formula: `${Math.sqrt(number)}² = ${number}`
        });
        steps.push({
          number: 3,
          content: "Por lo tanto:",
          formula: `√${number} = ${result}`
        });
      } else {
        steps.push({
          number: 2,
          content: "No es un cuadrado perfecto, calculamos la aproximación:",
          formula: `√${number} ≈ ${result.toFixed(6)}`
        });
        steps.push({
          number: 3,
          content: "Verificación:",
          formula: `${result.toFixed(6)}² ≈ ${Math.pow(result, 2).toFixed(6)}`
        });
      }
      break;

    case "cube-root":
      const cubeNumber = values.number;
      steps.push({
        number: 1,
        content: "Identificamos la operación:",
        formula: `∛${cubeNumber} = ?`
      });
      
      if (MathOperations.isPerfectCube(cubeNumber)) {
        const cubeRoot = Math.round(Math.cbrt(Math.abs(cubeNumber)));
        steps.push({
          number: 2,
          content: "Reconocemos que es un cubo perfecto:",
          formula: `${cubeNumber >= 0 ? cubeRoot : -cubeRoot}³ = ${cubeNumber}`
        });
        steps.push({
          number: 3,
          content: "Por lo tanto:",
          formula: `∛${cubeNumber} = ${result}`
        });
      } else {
        steps.push({
          number: 2,
          content: "No es un cubo perfecto, calculamos la aproximación:",
          formula: `∛${cubeNumber} ≈ ${result.toFixed(6)}`
        });
        steps.push({
          number: 3,
          content: "Verificación:",
          formula: `${result.toFixed(6)}³ ≈ ${Math.pow(result, 3).toFixed(6)}`
        });
      }
      break;

    case "nth-root":
      const { number: nthNumber, index } = values;
      steps.push({
        number: 1,
        content: "Identificamos la operación:",
        formula: `${index}√${nthNumber} = ?`
      });
      
      if (MathOperations.isPerfectNthPower(nthNumber, index)) {
        steps.push({
          number: 2,
          content: `Reconocemos que es una potencia perfecta de índice ${index}:`,
          formula: `${Math.round(result)}^${index} = ${nthNumber}`
        });
        steps.push({
          number: 3,
          content: "Por lo tanto:",
          formula: `${index}√${nthNumber} = ${Math.round(result)}`
        });
      } else {
        steps.push({
          number: 2,
          content: `No es una potencia perfecta de índice ${index}, calculamos:`,
          formula: `${index}√${nthNumber} = ${nthNumber}^(1/${index})`
        });
        steps.push({
          number: 3,
          content: "Resultado aproximado:",
          formula: `${index}√${nthNumber} ≈ ${result.toFixed(6)}`
        });
      }
      break;

    case "power":
      const { base, exponent } = values;
      steps.push({
        number: 1,
        content: "Identificamos la operación:",
        formula: `${base}^${exponent} = ?`
      });
      
      if (exponent === 0) {
        steps.push({
          number: 2,
          content: "Aplicamos la regla de exponente cero:",
          formula: `Cualquier número elevado a 0 es igual a 1`
        });
        steps.push({
          number: 3,
          content: "Por lo tanto:",
          formula: `${base}^0 = 1`
        });
      } else if (exponent === 1) {
        steps.push({
          number: 2,
          content: "Aplicamos la regla de exponente uno:",
          formula: `Cualquier número elevado a 1 es igual a sí mismo`
        });
        steps.push({
          number: 3,
          content: "Por lo tanto:",
          formula: `${base}^1 = ${base}`
        });
      } else if (exponent > 0 && Number.isInteger(exponent) && exponent <= 10) {
        steps.push({
          number: 2,
          content: "Expandimos la multiplicación:",
          formula: `${base}^${exponent} = ${Array(exponent).fill(base).join(' × ')}`
        });
        steps.push({
          number: 3,
          content: "Calculamos el resultado:",
          formula: `${base}^${exponent} = ${result}`
        });
      } else {
        steps.push({
          number: 2,
          content: "Calculamos la potencia:",
          formula: `${base}^${exponent} = ${result}`
        });
      }
      break;
  }

  return steps;
}

// Generate approximations
function generateApproximations(result, type, values) {
  const approximations = [];

  // Exact value (when applicable)
  if (type === "square-root" && MathOperations.isPerfectSquare(values.number)) {
    approximations.push({
      label: "Valor Exacto",
      value: Math.sqrt(values.number).toString()
    });
  } else if (type === "cube-root" && MathOperations.isPerfectCube(values.number)) {
    approximations.push({
      label: "Valor Exacto",
      value: Math.round(Math.cbrt(Math.abs(values.number))) * Math.sign(values.number)
    });
  } else {
    // Decimal approximations
    approximations.push({
      label: "2 decimales",
      value: result.toFixed(2)
    });
    
    approximations.push({
      label: "4 decimales",
      value: result.toFixed(4)
    });
    
    approximations.push({
      label: "6 decimales",
      value: result.toFixed(6)
    });
  }

  // Fraction approximation (for some cases)
  if (type !== "power" && Math.abs(result) < 10) {
    const fraction = decimalToFraction(result);
    if (fraction) {
      approximations.push({
        label: "Fracción aprox.",
        value: fraction
      });
    }
  }

  return approximations;
}

// Convert decimal to simple fraction approximation
function decimalToFraction(decimal) {
  const tolerance = 1e-6;
  let numerator = 1;
  let denominator = 1;
  let bestError = Math.abs(decimal - numerator / denominator);

  for (let d = 2; d <= 100; d++) {
    const n = Math.round(decimal * d);
    const error = Math.abs(decimal - n / d);
    
    if (error < bestError) {
      bestError = error;
      numerator = n;
      denominator = d;
    }
    
    if (error < tolerance) break;
  }

  if (bestError < 0.01 && denominator !== 1) {
    return `${numerator}/${denominator}`;
  }
  
  return null;
}

// Display results
function displayResults(values, result) {
  // Update operation formula
  let formulaText = "";
  switch (calculatorType) {
    case "square-root":
      formulaText = `√${values.number} = ${result.toFixed(6)}`;
      break;
    case "cube-root":
      formulaText = `∛${values.number} = ${result.toFixed(6)}`;
      break;
    case "nth-root":
      formulaText = `${values.index}√${values.number} = ${result.toFixed(6)}`;
      break;
    case "power":
      formulaText = `${values.base}^${values.exponent} = ${result}`;
      break;
  }
  operationFormula.textContent = formulaText;

  // Show result value
  CalculatorUtils.displayResultValue(result.toString());

  // Generate and display approximations
  const approximations = generateApproximations(result, calculatorType, values);
  approximationGrid.innerHTML = "";
  
  approximations.forEach(approx => {
    const approxElement = document.createElement("div");
    approxElement.className = "approximation-item";
    approxElement.innerHTML = `
      <div class="approximation-label">${approx.label}</div>
      <div class="approximation-value">${approx.value}</div>
    `;
    approximationGrid.appendChild(approxElement);
  });

  // Generate and display steps
  const steps = generateSteps(values, result, calculatorType);
  CalculatorUtils.displaySteps(steps);

  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(type, exampleValues) {
  changeType(type);

  // Wait for inputs to be created
  setTimeout(() => {
    Object.keys(exampleValues).forEach((key) => {
      const input = document.getElementById(key);
      if (input) {
        input.value = exampleValues[key];
        
        // Update root index display for nth-root
        if (type === "nth-root" && key === "index") {
          const rootIndexDisplay = document.getElementById("rootIndex");
          if (rootIndexDisplay) {
            rootIndexDisplay.textContent = exampleValues[key];
          }
        }
      }
    });

    // Auto calculate
    form.dispatchEvent(new Event("submit"));
  }, 100);
}

// Input field setup
function setupInputListeners() {
  const inputs = inputsContainer.querySelectorAll("input");
  CalculatorUtils.setupInputChangeListeners(inputs);
}

// Calculation callback for form submission
async function performCalculation() {
  const config = calculatorConfigs[calculatorType];
  const values = {};

  // Get values from inputs
  config.inputs.forEach((input) => {
    const element = document.getElementById(input.id);
    if (element) {
      values[input.id] = CalculatorUtils.validateInput(element.value, input.label);
    }
  });

  let result;

  // Perform calculation based on type
  switch (calculatorType) {
    case "square-root":
      result = MathOperations.squareRoot(values.number);
      break;
    case "cube-root":
      result = MathOperations.cubeRoot(values.number);
      break;
    case "nth-root":
      result = MathOperations.nthRoot(values.number, values.index);
      break;
    case "power":
      result = MathOperations.power(values.base, values.exponent);
      if (!Number.isFinite(result)) {
        throw new Error("El resultado es demasiado grande para mostrarse");
      }
      break;
  }

  // Display results
  displayResults(values, result);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with square root calculator
  changeType("square-root");

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
  const typeParam = urlParams.get("type");
  const exampleParam = urlParams.get("example");
  
  if (typeParam && calculatorConfigs[typeParam]) {
    changeType(typeParam);
  }
  
  if (exampleParam) {
    try {
      const example = JSON.parse(decodeURIComponent(exampleParam));
      loadExample(typeParam || "square-root", example);
    } catch (e) {
      console.warn("Invalid example parameter");
    }
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;