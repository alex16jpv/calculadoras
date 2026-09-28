// Combinations and Permutations Calculator

// Calculator state
let calculatorType = "combinations";

// Limits: BigInt keeps results exact, these only keep the page responsive
const MAX_N = 1000;
const MAX_VARIATION_DIGITS = 5000;

// DOM elements
const form = document.getElementById("calculatorForm");
const inputsContainer = document.getElementById("inputsContainer");
const nInput = document.getElementById("nInput");
const rInput = document.getElementById("rInput");
const helpText = document.getElementById("helpText");
const formulaDisplay = document.getElementById("formulaDisplay");
const schemaDescription = document.getElementById("schemaDescription");
const binomialNotation = document.getElementById("binomialNotation");
const constraintText = document.getElementById("constraintText");
const calculationSummary = document.getElementById("calculationSummary");
const formulaDetailed = document.getElementById("formulaDetailed");
const stepsDisplay = document.getElementById("stepsDisplay");
const interpretationText = document.getElementById("interpretationText");

// Calculator configurations
const calculatorConfigs = {
  "combinations": {
    symbol: "C",
    formula: "C(n,r) = ?",
    description: "Número de formas de elegir r elementos de n elementos sin importar el orden",
    binomial: "También conocido como coeficiente binomial",
    constraint: "0 ≤ r ≤ n",
    helpText: "Las combinaciones no consideran el orden: elegir {A,B,C} es igual que elegir {C,A,B}.",
    inputs: ["n", "r"]
  },
  "permutations": {
    symbol: "P",
    formula: "P(n,r) = ?",
    description: "Número de formas de ordenar r elementos tomados de n elementos",
    binomial: "También conocido como arreglos o variaciones sin repetición",
    constraint: "0 ≤ r ≤ n",
    helpText: "Las permutaciones sí consideran el orden: ABC es diferente de BAC.",
    inputs: ["n", "r"]
  },
  "variations": {
    symbol: "VR",
    formula: "VR(n,r) = ?",
    description: "Número de secuencias de r elementos elegidos de n, con repetición y con orden",
    binomial: "También conocido como variaciones con repetición",
    constraint: "n ≥ 1, r ≥ 0",
    helpText: "Permite repetición y el orden importa: por ejemplo, un PIN de 4 dígitos (10⁴).",
    inputs: ["n", "r"]
  },
  "combinations-repetition": {
    symbol: "CR",
    formula: "CR(n,r) = ?",
    description: "Número de formas de elegir r elementos de n tipos, con repetición y sin orden",
    binomial: "Equivale a C(n + r - 1, r)",
    constraint: "n ≥ 1, r ≥ 0",
    helpText: "Ejemplo: elegir 3 bolas de helado entre 5 sabores, pudiendo repetir sabor.",
    inputs: ["n", "r"]
  },
  "circular": {
    symbol: "PC",
    formula: "PC(n) = ?",
    description: "Número de formas de ordenar n elementos en círculo",
    binomial: "Las rotaciones del mismo arreglo se consideran iguales",
    constraint: "n ≥ 1",
    helpText: "En permutaciones circulares, las rotaciones del mismo arreglo son idénticas.",
    inputs: ["n"]
  }
};

// Mathematical operations for combinatorics (exact, using BigInt)
const CombinatoricsCalculator = {
  factorial(n) {
    let result = 1n;
    for (let i = 2n; i <= BigInt(n); i++) {
      result *= i;
    }
    return result;
  },

  // Product n × (n-1) × ... × (n-k+1)
  fallingProduct(n, k) {
    let result = 1n;
    for (let i = 0; i < k; i++) {
      result *= BigInt(n - i);
    }
    return result;
  },

  // C(n,r) = n! / (r!(n-r)!)
  combinations(n, r) {
    // Symmetry C(n,r) = C(n,n-r) keeps the loop short
    const k = Math.min(r, n - r);
    let result = 1n;
    const steps = [];

    // Each partial value is itself a binomial coefficient, so it is always an integer
    for (let i = 0; i < k; i++) {
      result = (result * BigInt(n - i)) / BigInt(i + 1);
      steps.push({
        text: `× ${n - i} ÷ ${i + 1}`,
        partial: result
      });
    }

    return { result, steps, symmetric: k !== r ? k : null };
  },

  // P(n,r) = n! / (n-r)!
  permutations(n, r) {
    let result = 1n;
    const steps = [];

    for (let i = 0; i < r; i++) {
      result *= BigInt(n - i);
      steps.push({
        text: `× ${n - i}`,
        partial: result
      });
    }

    return { result, steps };
  },

  // VR(n,r) = n^r
  variations(n, r) {
    const result = BigInt(n) ** BigInt(r);
    const steps = [];
    let partial = 1n;

    for (let i = 1; i <= Math.min(r, 20); i++) {
      partial *= BigInt(n);
      steps.push({
        text: `${n}^${i}`,
        partial
      });
    }

    return { result, steps };
  },

  // CR(n,r) = C(n+r-1, r)
  combinationsWithRepetition(n, r) {
    const inner = this.combinations(n + r - 1, r);
    return { ...inner, equivalent: { n: n + r - 1, r } };
  },

  // PC(n) = (n-1)!
  circular(n) {
    const result = this.factorial(n - 1);
    return { result, steps: [] };
  },

  // Readable product expansion, abbreviated when long
  expansion(from, count) {
    if (count <= 0) return "1";
    if (count <= 8) {
      return Array.from({ length: count }, (_, i) => from - i).join(" × ");
    }
    return `${from} × ${from - 1} × ${from - 2} × ... × ${from - count + 1}`;
  },

  formatNumber(number) {
    return CalculatorUtils.formatNumber(number);
  },

  // Scientific notation for big results: 1.234 × 10^25
  toScientificNotation(number) {
    const digits = number.toString();
    if (digits.length <= 15) return null;
    const mantissa = `${digits[0]}.${digits.slice(1, 5)}`;
    return `${mantissa} × 10^${digits.length - 1}`;
  },

  // Generate interpretation text
  generateInterpretation(type, n, r, result) {
    const value = `<span class="interpretation-highlight">${this.formatNumber(result)}</span>`;
    switch (type) {
      case "combinations":
        return `Hay ${value} formas diferentes de elegir ${r} elementos de un total de ${n} elementos, donde el orden no importa. Por ejemplo, elegir {A,B,C} es lo mismo que elegir {C,A,B}.`;
      case "permutations":
        return `Hay ${value} formas diferentes de ordenar ${r} elementos tomados de un total de ${n} elementos. Aquí el orden sí importa: ABC es diferente de BAC.`;
      case "variations":
        return `Hay ${value} secuencias diferentes de ${r} posiciones, donde cada posición puede ser cualquiera de los ${n} elementos (se permite repetir y el orden importa).`;
      case "combinations-repetition":
        return `Hay ${value} formas diferentes de elegir ${r} elementos entre ${n} tipos, pudiendo repetir tipos y sin importar el orden.`;
      case "circular":
        return `Hay ${value} formas diferentes de ordenar ${n} elementos en círculo. Las rotaciones del mismo arreglo se consideran idénticas.`;
      default:
        return "";
    }
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
  binomialNotation.textContent = config.binomial;
  constraintText.textContent = config.constraint;
  helpText.textContent = config.helpText;

  // Update input visibility
  updateInputs();

  // Clear results
  CalculatorUtils.clearResults();
}

// Update inputs based on calculator type
function updateInputs() {
  const config = calculatorConfigs[calculatorType];

  // Show/hide r input based on type (and keep "required" in sync so hidden inputs don't block submit)
  const rInputGroup = rInput.closest('.input-group');
  const usesR = config.inputs.includes("r");
  rInputGroup.style.display = usesR ? 'block' : 'none';
  rInput.required = usesR;
  inputsContainer.style.gridTemplateColumns = usesR ? '1fr 1fr' : '1fr';

  // Update placeholders
  if (calculatorType === "variations") {
    nInput.placeholder = "10";
    rInput.placeholder = "4";
  } else if (calculatorType === "combinations-repetition") {
    nInput.placeholder = "5";
    rInput.placeholder = "3";
  } else if (calculatorType === "circular") {
    nInput.placeholder = "6";
  } else {
    nInput.placeholder = "10";
    rInput.placeholder = "3";
  }
}

// Generate step by step explanation
function generateSteps(n, r, calculation, type) {
  const steps = [];
  const fmt = (value) => CombinatoricsCalculator.formatNumber(value);

  switch (type) {
    case "combinations":
      steps.push({
        number: 1,
        content: "Identificamos el problema de combinaciones (el orden no importa, sin repetición):",
        formula: `C(${n},${r}) = "elegir ${r} de ${n}"`
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula de combinaciones:",
        formula: `C(n,r) = n! / (r! × (n-r)!)`
      });
      steps.push({
        number: 3,
        content: "Sustituimos los valores:",
        formula: `C(${n},${r}) = ${n}! / (${r}! × ${n - r}!)`
      });
      if (calculation.symmetric !== null) {
        steps.push({
          number: 4,
          content: "Usamos la simetría para simplificar el cálculo:",
          formula: `C(${n},${r}) = C(${n},${n - r})`
        });
      }
      break;

    case "permutations":
      steps.push({
        number: 1,
        content: "Identificamos el problema de permutaciones (el orden importa, sin repetición):",
        formula: `P(${n},${r}) = "ordenar ${r} elementos de ${n}"`
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula de permutaciones:",
        formula: `P(n,r) = n! / (n-r)!`
      });
      steps.push({
        number: 3,
        content: "Sustituimos y simplificamos:",
        formula: `P(${n},${r}) = ${n}! / ${n - r}! = ${CombinatoricsCalculator.expansion(n, r)}`
      });
      break;

    case "variations":
      steps.push({
        number: 1,
        content: "Identificamos variaciones con repetición (el orden importa, se puede repetir):",
        formula: `VR(${n},${r}) = "${r} posiciones con ${n} opciones cada una"`
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula:",
        formula: `VR(n,r) = n^r`
      });
      steps.push({
        number: 3,
        content: "Sustituimos y calculamos:",
        formula: `VR(${n},${r}) = ${n}^${r}`
      });
      break;

    case "combinations-repetition":
      steps.push({
        number: 1,
        content: "Identificamos combinaciones con repetición (el orden no importa, se puede repetir):",
        formula: `CR(${n},${r}) = "elegir ${r} entre ${n} tipos"`
      });
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula:",
        formula: `CR(n,r) = C(n + r - 1, r) = (n + r - 1)! / (r! × (n - 1)!)`
      });
      steps.push({
        number: 3,
        content: "Sustituimos los valores:",
        formula: `CR(${n},${r}) = C(${n + r - 1},${r})`
      });
      break;

    case "circular":
      steps.push({
        number: 1,
        content: "Identificamos permutaciones circulares:",
        formula: `PC(${n}) = "ordenar ${n} elementos en círculo"`
      });
      steps.push({
        number: 2,
        content: "Fijamos un elemento y ordenamos el resto:",
        formula: `PC(n) = (n-1)!`
      });
      steps.push({
        number: 3,
        content: "Sustituimos y calculamos:",
        formula: `PC(${n}) = (${n}-1)! = ${n - 1}!`
      });
      break;
  }

  // Final result step
  const config = calculatorConfigs[type];
  steps.push({
    number: steps.length + 1,
    content: "Resultado final:",
    formula: config.formula.replace('?', fmt(calculation.result))
  });

  return steps;
}

// Display detailed formula breakdown
function displayFormulaBreakdown(n, r, calculation, type) {
  const fmt = (value) => CombinatoricsCalculator.formatNumber(value);
  const fact = (value) => fmt(CombinatoricsCalculator.factorial(value));
  let formulaHTML = "";

  switch (type) {
    case "combinations":
      formulaHTML = `
        <div class="formula-main">C(${n},${r}) = ${n}! / (${r}! × ${n - r}!)</div>
        ${n <= 20 ? `<div class="formula-substitution">= ${fact(n)} / (${fact(r)} × ${fact(n - r)})</div>` : ""}
        <div class="formula-substitution">= ${fmt(calculation.result)}</div>
        <div class="formula-explanation">${n <= 20 ? "Dividimos factoriales para obtener combinaciones" : "Calculado de forma exacta sin expandir factoriales grandes"}</div>
      `;
      break;

    case "permutations":
      formulaHTML = `
        <div class="formula-main">P(${n},${r}) = ${n}! / ${n - r}!</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.expansion(n, r)}</div>
        <div class="formula-substitution">= ${fmt(calculation.result)}</div>
        <div class="formula-explanation">Multiplicamos ${r} factores consecutivos desde ${n}</div>
      `;
      break;

    case "variations":
      formulaHTML = `
        <div class="formula-main">VR(${n},${r}) = ${n}^${r}</div>
        <div class="formula-substitution">= ${n} × ${n} × ... × ${n} (${r} veces)</div>
        <div class="formula-substitution">= ${fmt(calculation.result)}</div>
        <div class="formula-explanation">Cada una de las ${r} posiciones tiene ${n} opciones</div>
      `;
      break;

    case "combinations-repetition":
      formulaHTML = `
        <div class="formula-main">CR(${n},${r}) = C(${n + r - 1},${r})</div>
        <div class="formula-substitution">= ${n + r - 1}! / (${r}! × ${n - 1}!)</div>
        <div class="formula-substitution">= ${fmt(calculation.result)}</div>
        <div class="formula-explanation">Método de "estrellas y barras": ${r} elementos y ${n - 1} separadores</div>
      `;
      break;

    case "circular":
      formulaHTML = `
        <div class="formula-main">PC(${n}) = (${n}-1)!</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.expansion(n - 1, n - 1)}</div>
        <div class="formula-substitution">= ${fmt(calculation.result)}</div>
        <div class="formula-explanation">Fijamos un elemento y permutamos los ${n - 1} restantes</div>
      `;
      break;
  }

  formulaDetailed.innerHTML = formulaHTML;
}

// Display calculation steps
function displayCalculationSteps(calculation) {
  stepsDisplay.innerHTML = "";

  const steps = calculation.steps || [];
  if (steps.length === 0) {
    stepsDisplay.innerHTML = '<div class="calculation-step step-final"><span class="step-description">Resultado directo</span><span class="step-calculation">Sin pasos intermedios</span></div>';
    return;
  }

  // Show at most 12 intermediate steps
  const visible = steps.length > 12 ? [...steps.slice(0, 6), null, ...steps.slice(-5)] : steps;

  visible.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'calculation-step';

    if (step === null) {
      stepDiv.innerHTML = `<span class="step-description">...</span><span class="step-calculation">${steps.length - 11} pasos más</span>`;
    } else {
      if (index === visible.length - 1) stepDiv.classList.add('step-final');
      stepDiv.innerHTML = `
        <span class="step-description">${step.text}</span>
        <span class="step-calculation">${CombinatoricsCalculator.formatNumber(step.partial)}</span>
      `;
    }

    stepsDisplay.appendChild(stepDiv);
  });
}

// Display results
function displayResults(n, r, calculation) {
  // Update calculation summary
  const config = calculatorConfigs[calculatorType];
  calculationSummary.textContent = config.inputs.includes("r")
    ? `${config.symbol}(n,r) con n=${n}, r=${r}`
    : `${config.symbol}(n) con n=${n}`;

  // Show result value (scientific notation for very long numbers)
  const scientific = CombinatoricsCalculator.toScientificNotation(calculation.result);
  CalculatorUtils.displayResultValue(
    scientific || CombinatoricsCalculator.formatNumber(calculation.result)
  );

  // Display formula breakdown
  displayFormulaBreakdown(n, r, calculation, calculatorType);

  // Display calculation steps
  displayCalculationSteps(calculation);

  // Display interpretation
  interpretationText.innerHTML = CombinatoricsCalculator.generateInterpretation(
    calculatorType, n, r, calculation.result
  );

  // Generate and display explanation steps
  const steps = generateSteps(n, r, calculation, calculatorType);
  CalculatorUtils.displaySteps(steps);

  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(type, values) {
  changeType(type);

  nInput.value = values.n;
  if (values.r !== undefined) {
    rInput.value = values.r;
  }

  // Auto calculate
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  const config = calculatorConfigs[calculatorType];
  const n = CalculatorUtils.parseInteger(nInput.value, "n (total de elementos)", 0);
  const r = config.inputs.includes("r")
    ? CalculatorUtils.parseInteger(rInput.value, "r (elementos a elegir)", 0)
    : null;

  if ((calculatorType === "combinations" || calculatorType === "permutations") && r > n) {
    throw new Error("r no puede ser mayor que n cuando no se permite repetición");
  }

  if (calculatorType !== "combinations" && calculatorType !== "permutations" && n < 1) {
    throw new Error("n debe ser mayor o igual a 1");
  }

  if (n > MAX_N || (r !== null && r > MAX_N)) {
    throw new Error(`Los valores de n y r deben ser menores o iguales a ${MAX_N}`);
  }

  if (calculatorType === "variations" && r * Math.log10(n) > MAX_VARIATION_DIGITS) {
    throw new Error("El resultado tendría demasiados dígitos para mostrarse");
  }

  let calculation;

  switch (calculatorType) {
    case "combinations":
      calculation = CombinatoricsCalculator.combinations(n, r);
      break;
    case "permutations":
      calculation = CombinatoricsCalculator.permutations(n, r);
      break;
    case "variations":
      calculation = CombinatoricsCalculator.variations(n, r);
      break;
    case "combinations-repetition":
      calculation = CombinatoricsCalculator.combinationsWithRepetition(n, r);
      break;
    case "circular":
      calculation = CombinatoricsCalculator.circular(n);
      break;
  }

  displayResults(n, r, calculation);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with combinations calculator
  changeType("combinations");

  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);

  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);

  // Setup input listeners
  CalculatorUtils.setupInputChangeListeners([nInput, rInput]);

  // Focus first input
  nInput.focus();

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const typeParam = urlParams.get("type");
  const exampleParam = urlParams.get("example");

  if (typeParam && calculatorConfigs[typeParam]) {
    changeType(typeParam);
  }

  if (exampleParam) {
    try {
      const example = JSON.parse(exampleParam);
      loadExample(calculatorConfigs[typeParam] ? typeParam : "combinations", example);
    } catch (e) {
      console.warn("Invalid example parameter");
    }
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
