// Combinations and Permutations Calculator

// Calculator state
let calculatorType = "combinations";

// DOM elements
const form = document.getElementById("calculatorForm");
const inputsContainer = document.getElementById("inputsContainer");
const nInput = document.getElementById("nInput");
const rInput = document.getElementById("rInput");
const helpText = document.getElementById("helpText");
const formulaDisplay = document.getElementById("formulaDisplay");
const schemaDescription = document.getElementById("schemaDescription");
const binomialNotation = document.getElementById("binomialNotation");
const constraintInfo = document.getElementById("constraintInfo");
const constraintText = document.getElementById("constraintText");
const calculationSummary = document.getElementById("calculationSummary");
const formulaDetailed = document.getElementById("formulaDetailed");
const stepsDisplay = document.getElementById("stepsDisplay");
const interpretationText = document.getElementById("interpretationText");

// Calculator configurations
const calculatorConfigs = {
  "combinations": {
    formula: "C(n,r) = ?",
    description: "Número de formas de elegir r elementos de n elementos sin importar el orden",
    binomial: "También conocido como coeficiente binomial",
    constraint: "r ≤ n",
    helpText: "Las combinaciones no consideran el orden: elegir {A,B,C} es igual que elegir {C,A,B}.",
    inputs: ["n", "r"]
  },
  "permutations": {
    formula: "P(n,r) = ?",
    description: "Número de formas de ordenar r elementos tomados de n elementos",
    binomial: "También conocido como arreglos o variaciones sin repetición",
    constraint: "r ≤ n",
    helpText: "Las permutaciones sí consideran el orden: ABC es diferente de BAC.",
    inputs: ["n", "r"]
  },
  "variations": {
    formula: "V(n,r) = ?",
    description: "Número de formas de elegir r elementos de n con repetición permitida",
    binomial: "También conocido como variaciones con repetición",
    constraint: "r ≥ 0, n ≥ 1",
    helpText: "Permite repetición: se puede elegir el mismo elemento múltiples veces.",
    inputs: ["n", "r"]
  },
  "circular": {
    formula: "PC(n) = ?",
    description: "Número de formas de ordenar n elementos en círculo",
    binomial: "Las rotaciones del mismo arreglo se consideran iguales",
    constraint: "n ≥ 1",
    helpText: "En permutaciones circulares, las rotaciones del mismo arreglo son idénticas.",
    inputs: ["n"]
  }
};

// Mathematical operations for combinatorics
const CombinatoricsCalculator = {
  // Calculate factorial with optimization
  factorial(n) {
    if (n < 0) return 0;
    if (n <= 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
      // Check for overflow
      if (result === Infinity) {
        throw new Error("El número es demasiado grande para calcular el factorial");
      }
    }
    return result;
  },

  // Calculate combinations C(n,r) = n! / (r!(n-r)!)
  combinations(n, r) {
    if (r > n || r < 0 || n < 0) {
      throw new Error("Valores inválidos: r debe estar entre 0 y n");
    }
    
    if (r === 0 || r === n) return { 
      result: 1, 
      steps: [], 
      formula: `C(${n},${r}) = 1`,
      efficient: true
    };
    
    // Use symmetry property: C(n,r) = C(n,n-r)
    if (r > n - r) {
      r = n - r;
    }
    
    // Calculate efficiently to avoid large factorials
    let result = 1;
    const steps = [];
    
    // Calculate C(n,r) = n × (n-1) × ... × (n-r+1) / (r × (r-1) × ... × 1)
    for (let i = 0; i < r; i++) {
      result = result * (n - i) / (i + 1);
      steps.push({
        numerator: n - i,
        denominator: i + 1,
        partial: result
      });
    }
    
    return {
      result: Math.round(result),
      steps,
      formula: `${n}! / (${r}! × ${n - r}!)`,
      efficient: true
    };
  },

  // Calculate permutations P(n,r) = n! / (n-r)!
  permutations(n, r) {
    if (r > n || r < 0 || n < 0) {
      throw new Error("Valores inválidos: r debe estar entre 0 y n");
    }
    
    if (r === 0) return { result: 1, steps: [], formula: "P(n,0) = 1" };
    
    let result = 1;
    const steps = [];
    
    // Calculate P(n,r) = n × (n-1) × ... × (n-r+1)
    for (let i = 0; i < r; i++) {
      const factor = n - i;
      result *= factor;
      steps.push({
        factor,
        partial: result,
        position: i + 1
      });
      
      if (result === Infinity) {
        throw new Error("El resultado es demasiado grande para calcularse");
      }
    }
    
    return {
      result,
      steps,
      formula: `${n}! / ${n - r}!`,
      expansion: this.generateFactorialExpansion(n, n - r)
    };
  },

  // Calculate variations with repetition V(n,r) = n^r
  variations(n, r) {
    if (n < 1 || r < 0) {
      throw new Error("Valores inválidos: n debe ser ≥ 1 y r ≥ 0");
    }
    
    if (r === 0) return { result: 1, steps: [], formula: "n^0 = 1" };
    
    const result = Math.pow(n, r);
    
    if (result === Infinity) {
      throw new Error("El resultado es demasiado grande para calcularse");
    }
    
    const steps = [];
    let partial = 1;
    
    for (let i = 1; i <= r; i++) {
      partial *= n;
      steps.push({
        step: i,
        operation: `${n}^${i}`,
        result: partial
      });
    }
    
    return {
      result,
      steps,
      formula: `${n}^${r}`,
      explanation: `Se multiplica ${n} consigo mismo ${r} veces`
    };
  },

  // Calculate circular permutations PC(n) = (n-1)!
  circular(n) {
    if (n < 1) {
      throw new Error("n debe ser mayor o igual a 1");
    }
    
    if (n === 1) return { result: 1, steps: [], formula: "PC(1) = 1" };
    
    const result = this.factorial(n - 1);
    
    return {
      result,
      steps: [],
      formula: `(${n}-1)! = ${n - 1}!`,
      explanation: `Las permutaciones circulares de ${n} elementos son (${n}-1)!`
    };
  },

  // Generate factorial expansion for display
  generateFactorialExpansion(n, stop = 0) {
    if (n <= stop) return "";
    
    const factors = [];
    for (let i = n; i > stop; i--) {
      factors.push(i.toString());
    }
    
    return factors.join(" × ");
  },

  // Format large numbers with commas
  formatNumber(number) {
    if (typeof number !== 'number') return number;
    return number.toLocaleString();
  },

  // Convert to scientific notation for very large numbers
  toScientificNotation(number) {
    if (number < 1e6) return null;
    return number.toExponential(3);
  },

  // Generate interpretation text
  generateInterpretation(type, n, r, result) {
    switch (type) {
      case "combinations":
        return `Hay <span class="interpretation-highlight">${this.formatNumber(result)}</span> formas diferentes de elegir ${r} elementos de un total de ${n} elementos, donde el orden no importa. Por ejemplo, elegir {A,B,C} es lo mismo que elegir {C,A,B}.`;
      
      case "permutations":
        return `Hay <span class="interpretation-highlight">${this.formatNumber(result)}</span> formas diferentes de ordenar ${r} elementos tomados de un total de ${n} elementos. Aquí el orden sí importa: ABC es diferente de BAC.`;
      
      case "variations":
        return `Hay <span class="interpretation-highlight">${this.formatNumber(result)}</span> formas diferentes de elegir ${r} elementos de ${n} opciones disponibles, permitiendo repeticiones. Cada posición puede ser cualquiera de los ${n} elementos.`;
      
      case "circular":
        return `Hay <span class="interpretation-highlight">${this.formatNumber(result)}</span> formas diferentes de ordenar ${n} elementos en círculo. Las rotaciones del mismo arreglo se consideran idénticas.`;
      
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
  
  // Show/hide r input based on type
  const rInputGroup = rInput.closest('.input-group');
  if (config.inputs.includes("r")) {
    rInputGroup.style.display = 'block';
    inputsContainer.style.gridTemplateColumns = '1fr 1fr';
  } else {
    rInputGroup.style.display = 'none';
    inputsContainer.style.gridTemplateColumns = '1fr';
  }
  
  // Update placeholders
  if (calculatorType === "variations") {
    nInput.placeholder = "4";
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
  
  // Introduction step
  switch (type) {
    case "combinations":
      steps.push({
        number: 1,
        content: "Identificamos el problema de combinaciones:",
        formula: `C(${n},${r}) = "elegir ${r} de ${n} sin importar orden"`
      });
      
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula de combinaciones:",
        formula: `C(n,r) = n! / (r!(n-r)!)`
      });
      
      steps.push({
        number: 3,
        content: "Sustituimos los valores:",
        formula: `C(${n},${r}) = ${n}! / (${r}! × ${n-r}!)`
      });
      break;
      
    case "permutations":
      steps.push({
        number: 1,
        content: "Identificamos el problema de permutaciones:",
        formula: `P(${n},${r}) = "ordenar ${r} elementos de ${n}"`
      });
      
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula de permutaciones:",
        formula: `P(n,r) = n! / (n-r)!`
      });
      
      steps.push({
        number: 3,
        content: "Sustituimos los valores:",
        formula: `P(${n},${r}) = ${n}! / ${n-r}! = ${calculation.expansion || calculation.formula}`
      });
      break;
      
    case "variations":
      steps.push({
        number: 1,
        content: "Identificamos variaciones con repetición:",
        formula: `V(${n},${r}) = "elegir ${r} de ${n} con repetición"`
      });
      
      steps.push({
        number: 2,
        content: "Aplicamos la fórmula:",
        formula: `V(n,r) = n^r`
      });
      
      steps.push({
        number: 3,
        content: "Sustituimos y calculamos:",
        formula: `V(${n},${r}) = ${n}^${r} = ${calculation.result}`
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
        content: "Aplicamos la fórmula circular:",
        formula: `PC(n) = (n-1)!`
      });
      
      steps.push({
        number: 3,
        content: "Sustituimos y calculamos:",
        formula: `PC(${n}) = (${n}-1)! = ${n-1}! = ${calculation.result}`
      });
      break;
  }
  
  // Final result step
  const finalStepNumber = steps.length + 1;
  const config = calculatorConfigs[type];
  steps.push({
    number: finalStepNumber,
    content: "Resultado final:",
    formula: `${config.formula.replace('?', calculation.result.toLocaleString())}`
  });
  
  return steps;
}

// Display detailed formula breakdown
function displayFormulaBreakdown(n, r, calculation, type) {
  let formulaHTML = "";
  
  switch (type) {
    case "combinations":
      if (n > 12) {
        // For large numbers, don't show factorial expansions
        formulaHTML = `
          <div class="formula-main">C(${n},${r}) = ${n}! / (${r}! × ${n-r}!)</div>
          <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(calculation.result)}</div>
          <div class="formula-explanation">Calculado eficientemente para evitar factoriales grandes</div>
        `;
      } else {
        formulaHTML = `
          <div class="formula-main">C(${n},${r}) = ${n}! / (${r}! × ${n-r}!)</div>
          <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(CombinatoricsCalculator.factorial(n))} / (${CombinatoricsCalculator.formatNumber(CombinatoricsCalculator.factorial(r))} × ${CombinatoricsCalculator.formatNumber(CombinatoricsCalculator.factorial(n-r))})</div>
          <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(calculation.result)}</div>
          <div class="formula-explanation">Dividimos factoriales para obtener combinaciones</div>
        `;
      }
      break;
      
    case "permutations":
      formulaHTML = `
        <div class="formula-main">P(${n},${r}) = ${n}! / (${n-r})!</div>
        <div class="formula-substitution">= ${calculation.expansion}</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(calculation.result)}</div>
        <div class="formula-explanation">Multiplicamos ${r} factores consecutivos desde ${n}</div>
      `;
      break;
      
    case "variations":
      formulaHTML = `
        <div class="formula-main">V(${n},${r}) = ${n}^${r}</div>
        <div class="formula-substitution">= ${n} × ${n} × ... × ${n} (${r} veces)</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(calculation.result)}</div>
        <div class="formula-explanation">${calculation.explanation}</div>
      `;
      break;
      
    case "circular":
      formulaHTML = `
        <div class="formula-main">PC(${n}) = (${n}-1)!</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.generateFactorialExpansion(n-1)}</div>
        <div class="formula-substitution">= ${CombinatoricsCalculator.formatNumber(calculation.result)}</div>
        <div class="formula-explanation">${calculation.explanation}</div>
      `;
      break;
  }
  
  formulaDetailed.innerHTML = formulaHTML;
}

// Display calculation steps
function displayCalculationSteps(calculation, type) {
  stepsDisplay.innerHTML = "";
  
  if (!calculation.steps || calculation.steps.length === 0) {
    stepsDisplay.innerHTML = '<div class="calculation-step step-final"><span class="step-description">Resultado directo</span><span class="step-calculation">Sin pasos intermedios</span></div>';
    return;
  }
  
  calculation.steps.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'calculation-step';
    
    if (index === calculation.steps.length - 1) {
      stepDiv.classList.add('step-final');
    }
    
    let stepDescription = "";
    let stepCalculation = "";
    
    switch (type) {
      case "combinations":
        stepDescription = `Paso ${index + 1}: Multiplicar y dividir`;
        stepCalculation = `${step.numerator}/${step.denominator} = ${step.partial.toFixed(2)}`;
        break;
        
      case "permutations":
        stepDescription = `Factor ${step.position}`;
        stepCalculation = `${step.factor} → ${CombinatoricsCalculator.formatNumber(step.partial)}`;
        break;
        
      case "variations":
        stepDescription = `Potencia ${step.step}`;
        stepCalculation = `${step.operation} = ${CombinatoricsCalculator.formatNumber(step.result)}`;
        break;
    }
    
    stepDiv.innerHTML = `
      <span class="step-description">${stepDescription}</span>
      <span class="step-calculation">${stepCalculation}</span>
    `;
    
    stepsDisplay.appendChild(stepDiv);
  });
}

// Display results
function displayResults(n, r, calculation) {
  // Update calculation summary
  const config = calculatorConfigs[calculatorType];
  if (config.inputs.includes("r")) {
    calculationSummary.textContent = `${config.formula.split('=')[0].trim()} con n=${n}, r=${r}`;
  } else {
    calculationSummary.textContent = `${config.formula.split('=')[0].trim()} con n=${n}`;
  }
  
  // Show result value
  const resultText = CombinatoricsCalculator.formatNumber(calculation.result);
  CalculatorUtils.displayResultValue(resultText);
  
  // Display formula breakdown
  displayFormulaBreakdown(n, r, calculation, calculatorType);
  
  // Display calculation steps
  displayCalculationSteps(calculation, calculatorType);
  
  // Display interpretation
  const interpretation = CombinatoricsCalculator.generateInterpretation(
    calculatorType, n, r, calculation.result
  );
  interpretationText.innerHTML = interpretation;
  
  // Generate and display explanation steps
  const steps = generateSteps(n, r, calculation, calculatorType);
  CalculatorUtils.displaySteps(steps);
  
  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(type, values) {
  changeType(type);
  
  // Wait for inputs to be updated
  setTimeout(() => {
    nInput.value = values.n;
    if (values.r !== undefined) {
      rInput.value = values.r;
    }
    
    // Auto calculate
    form.dispatchEvent(new Event("submit"));
  }, 100);
}

// Input change handlers
function handleInputChange() {
  CalculatorUtils.clearResults();
}

// Calculation callback for form submission
async function performCalculation() {
  const nValue = CalculatorUtils.validateInput(nInput.value, "n (total de elementos)");
  const n = parseInt(nValue);
  let r = null;
  
  const config = calculatorConfigs[calculatorType];
  
  if (config.inputs.includes("r")) {
    const rValue = CalculatorUtils.validateInput(rInput.value, "r (elementos a elegir)");
    r = parseInt(rValue);
    
    if (isNaN(r)) {
      throw new Error("r debe ser un número entero válido");
    }
  }
  
  if (isNaN(n)) {
    throw new Error("n debe ser un número entero válido");
  }
  
  // Validate constraints
  if (n < 0) {
    throw new Error("n debe ser un número entero no negativo");
  }
  
  if (r !== null && r < 0) {
    throw new Error("r debe ser un número entero no negativo");
  }
  
  if (calculatorType === "combinations" || calculatorType === "permutations") {
    if (r > n) {
      throw new Error(`Para ${calculatorType}, r no puede ser mayor que n`);
    }
  }
  
  if (calculatorType === "variations" && n < 1) {
    throw new Error("Para variaciones, n debe ser mayor o igual a 1");
  }
  
  if (calculatorType === "circular" && n < 1) {
    throw new Error("Para permutaciones circulares, n debe ser mayor o igual a 1");
  }
  
  // Check for very large numbers that might cause issues
  if (n > 170) {
    throw new Error("n es demasiado grande. El límite es 170 para evitar desbordamiento");
  }
  
  if (calculatorType === "variations" && r > 10 && n > 10) {
    throw new Error("Para variaciones, valores muy grandes de n y r pueden causar desbordamiento");
  }
  
  // Add delay for complex calculations
  if (n > 20 || (r && r > 10)) {
    await CalculatorUtils.delay(500);
  }
  
  let calculation;
  
  // Perform calculation based on type
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
    case "circular":
      calculation = CombinatoricsCalculator.circular(n);
      break;
  }
  
  // Display results
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
  nInput.addEventListener("input", handleInputChange);
  rInput.addEventListener("input", handleInputChange);
  
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
      const example = JSON.parse(decodeURIComponent(exampleParam));
      loadExample(typeParam || "combinations", example);
    } catch (e) {
      console.warn("Invalid example parameter");
    }
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;