// MCM and MCD Calculator

// Calculator state
let calculatorType = "gcd";
let numbers = [];

// DOM elements
const form = document.getElementById("calculatorForm");
const numbersContainer = document.getElementById("numbersContainer");
const helpText = document.getElementById("helpText");
const formulaDisplay = document.getElementById("formulaDisplay");
const schemaDescription = document.getElementById("schemaDescription");
const calculationSummary = document.getElementById("calculationSummary");
const resultValues = document.getElementById("resultValues");
const factorizationSection = document.getElementById("factorizationSection");
const factorizationDisplay = document.getElementById("factorizationDisplay");
const algorithmSection = document.getElementById("algorithmSection");
const algorithmSteps = document.getElementById("algorithmSteps");

// Calculator configurations
const calculatorConfigs = {
  "gcd": {
    formula: "MCD(a, b) = ?",
    description: "Encuentra el mayor número que divide exactamente a ambos números",
    helpText: "El MCD es el mayor número que divide exactamente a todos los números dados."
  },
  "lcm": {
    formula: "MCM(a, b) = ?",
    description: "Encuentra el menor número que es múltiplo de todos los números dados",
    helpText: "El MCM es el menor número positivo que es múltiplo de todos los números dados."
  },
  "both": {
    formula: "MCD y MCM = ?",
    description: "Calcula tanto el máximo común divisor como el mínimo común múltiplo",
    helpText: "Calcula ambos valores usando la relación: MCD(a,b) × MCM(a,b) = a × b"
  }
};

// Mathematical operations
const MathOperations = {
  // Calculate GCD using Euclidean algorithm
  gcd(a, b) {
    const steps = [];
    let original_a = a, original_b = b;
    
    // Ensure positive numbers
    a = Math.abs(a);
    b = Math.abs(b);
    
    if (a === 0) return { result: b, steps: [`MCD(0, ${b}) = ${b}`] };
    if (b === 0) return { result: a, steps: [`MCD(${a}, 0) = ${a}`] };
    
    // Euclidean algorithm steps
    while (b !== 0) {
      const quotient = Math.floor(a / b);
      const remainder = a % b;
      
      steps.push({
        equation: `${a} = ${b} × ${quotient} + ${remainder}`,
        operation: `MCD(${a}, ${b}) = MCD(${b}, ${remainder})`
      });
      
      a = b;
      b = remainder;
    }
    
    steps.push({
      equation: `${a} = ${0} × ? + ${a}`,
      operation: `MCD(${original_a}, ${original_b}) = ${a}`,
      final: true
    });
    
    return { result: a, steps };
  },

  // Calculate GCD for multiple numbers
  gcdMultiple(numbers) {
    if (numbers.length === 0) return { result: 0, steps: [] };
    if (numbers.length === 1) return { result: Math.abs(numbers[0]), steps: [] };
    
    let result = Math.abs(numbers[0]);
    const allSteps = [];
    
    for (let i = 1; i < numbers.length; i++) {
      const gcdResult = this.gcd(result, numbers[i]);
      allSteps.push(...gcdResult.steps);
      result = gcdResult.result;
      
      if (result === 1) {
        allSteps.push({
          equation: "MCD = 1",
          operation: "Los números son coprimos (no tienen factores comunes)",
          final: true
        });
        break;
      }
    }
    
    return { result, steps: allSteps };
  },

  // Calculate LCM using the relationship: LCM(a,b) = (a * b) / GCD(a,b)
  lcm(a, b) {
    if (a === 0 || b === 0) return { result: 0, steps: [] };
    
    const gcdResult = this.gcd(a, b);
    const result = Math.abs(a * b) / gcdResult.result;
    
    const steps = [
      {
        equation: `MCM(${a}, ${b}) = (${a} × ${b}) / MCD(${a}, ${b})`,
        operation: "Usamos la relación fundamental"
      },
      {
        equation: `MCM(${a}, ${b}) = ${Math.abs(a * b)} / ${gcdResult.result}`,
        operation: "Sustituimos los valores"
      },
      {
        equation: `MCM(${a}, ${b}) = ${result}`,
        operation: "Resultado final",
        final: true
      }
    ];
    
    return { result, steps, gcdSteps: gcdResult.steps };
  },

  // Calculate LCM for multiple numbers
  lcmMultiple(numbers) {
    if (numbers.length === 0) return { result: 0, steps: [] };
    if (numbers.length === 1) return { result: Math.abs(numbers[0]), steps: [] };
    
    let result = Math.abs(numbers[0]);
    const allSteps = [];
    
    for (let i = 1; i < numbers.length; i++) {
      const lcmResult = this.lcm(result, numbers[i]);
      allSteps.push(...lcmResult.steps);
      result = lcmResult.result;
    }
    
    return { result, steps: allSteps };
  },

  // Prime factorization
  primeFactorization(n) {
    n = Math.abs(n);
    if (n <= 1) return [];
    
    const factors = [];
    let divisor = 2;
    
    while (divisor * divisor <= n) {
      while (n % divisor === 0) {
        factors.push(divisor);
        n /= divisor;
      }
      divisor++;
    }
    
    if (n > 1) {
      factors.push(n);
    }
    
    return factors;
  },

  // Format prime factorization with powers
  formatPrimeFactorization(n) {
    const factors = this.primeFactorization(n);
    if (factors.length === 0) return "";
    
    const factorCount = {};
    factors.forEach(factor => {
      factorCount[factor] = (factorCount[factor] || 0) + 1;
    });
    
    return Object.entries(factorCount)
      .map(([prime, count]) => count === 1 ? prime : `${prime}^${count}`)
      .join(' × ');
  },

  // Check if number is prime
  isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
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

  // Clear results
  CalculatorUtils.clearResults();
}

// Add new number input
function addNumber() {
  const currentInputs = numbersContainer.querySelectorAll('.number-input-group');
  const newIndex = currentInputs.length + 1;
  
  const numberGroup = document.createElement('div');
  numberGroup.className = 'number-input-group';
  numberGroup.innerHTML = `
    <label>Número ${newIndex}:</label>
    <input
      type="number"
      class="input-field number-input"
      placeholder="${12 + newIndex * 6}"
      min="1"
      step="1"
      required
    />
    <button type="button" class="remove-number-btn" onclick="removeNumber(this)">×</button>
  `;
  
  numbersContainer.appendChild(numberGroup);
  
  // Show remove buttons when there are more than 2 inputs
  updateRemoveButtons();
  
  // Focus the new input
  const newInput = numberGroup.querySelector('input');
  newInput.focus();
  
  // Setup listeners for the new input
  CalculatorUtils.setupInputChangeListeners([newInput]);
}

// Remove number input
function removeNumber(button) {
  const numberGroup = button.closest('.number-input-group');
  numberGroup.remove();
  
  // Update labels and remove buttons
  updateNumberLabels();
  updateRemoveButtons();
  
  // Clear results
  CalculatorUtils.clearResults();
}

// Update number labels
function updateNumberLabels() {
  const inputs = numbersContainer.querySelectorAll('.number-input-group');
  inputs.forEach((group, index) => {
    const label = group.querySelector('label');
    label.textContent = `Número ${index + 1}:`;
  });
}

// Update remove button visibility
function updateRemoveButtons() {
  const inputs = numbersContainer.querySelectorAll('.number-input-group');
  const removeButtons = numbersContainer.querySelectorAll('.remove-number-btn');
  
  removeButtons.forEach(button => {
    button.style.display = inputs.length > 2 ? 'flex' : 'none';
  });
}

// Get numbers from inputs
function getNumbers() {
  const inputs = numbersContainer.querySelectorAll('.number-input');
  const numbers = [];
  
  inputs.forEach((input, index) => {
    const value = CalculatorUtils.validateInput(input.value, `Número ${index + 1}`);
    if (value <= 0) {
      throw new Error(`El número ${index + 1} debe ser un entero positivo`);
    }
    numbers.push(value);
  });
  
  return numbers;
}

// Generate step by step explanation
function generateSteps(numbers, results, type) {
  const steps = [];
  
  if (numbers.length < 2) {
    return steps;
  }
  
  // Introduction step
  switch (type) {
    case "gcd":
      steps.push({
        number: 1,
        content: "Calculamos el MCD usando el algoritmo de Euclides:",
        formula: `MCD(${numbers.join(', ')}) = ?`
      });
      break;
    case "lcm":
      steps.push({
        number: 1,
        content: "Calculamos el MCM usando la relación con el MCD:",
        formula: `MCM(${numbers.join(', ')}) = ?`
      });
      break;
    case "both":
      steps.push({
        number: 1,
        content: "Calculamos ambos valores paso a paso:",
        formula: `MCD y MCM de ${numbers.join(', ')}`
      });
      break;
  }
  
  // Prime factorization step
  if (numbers.length <= 4) {
    steps.push({
      number: 2,
      content: "Factorización prima de cada número:",
      formula: numbers.map(n => `${n} = ${MathOperations.formatPrimeFactorization(n)}`).join('\\n')
    });
  }
  
  // Algorithm steps
  if (type === "gcd" || type === "both") {
    const gcdSteps = results.gcdSteps || [];
    if (gcdSteps.length > 0) {
      steps.push({
        number: 3,
        content: "Aplicamos el algoritmo de Euclides:",
        formula: gcdSteps.slice(0, 3).map(step => step.equation).join('\\n')
      });
    }
  }
  
  if (type === "lcm" || type === "both") {
    steps.push({
      number: type === "both" ? 4 : 3,
      content: "Usamos la relación fundamental:",
      formula: `MCM × MCD = producto de los números\\nMCM = producto / MCD`
    });
  }
  
  // Final result
  const finalStepNumber = steps.length + 1;
  if (type === "both") {
    steps.push({
      number: finalStepNumber,
      content: "Resultados finales:",
      formula: `MCD = ${results.gcd}\\nMCM = ${results.lcm}`
    });
  } else if (type === "gcd") {
    steps.push({
      number: finalStepNumber,
      content: "Resultado final:",
      formula: `MCD(${numbers.join(', ')}) = ${results.gcd}`
    });
  } else {
    steps.push({
      number: finalStepNumber,
      content: "Resultado final:",
      formula: `MCM(${numbers.join(', ')}) = ${results.lcm}`
    });
  }
  
  return steps;
}

// Display factorization
function displayFactorization(numbers) {
  factorizationDisplay.innerHTML = '';
  
  numbers.forEach(number => {
    const factorization = MathOperations.formatPrimeFactorization(number);
    const factors = MathOperations.primeFactorization(number);
    
    const factorDiv = document.createElement('div');
    factorDiv.className = 'number-factorization';
    factorDiv.innerHTML = `
      <div class="factorization-title">${number} =</div>
      <div class="factorization-value">${factorization}</div>
      <div class="prime-factors">
        ${factors.map(factor => `<span class="prime-factor">${factor}</span>`).join('')}
      </div>
    `;
    
    factorizationDisplay.appendChild(factorDiv);
  });
}

// Display algorithm steps
function displayAlgorithmSteps(steps) {
  algorithmSteps.innerHTML = '';
  
  steps.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.className = `algorithm-step${step.final ? ' step-final' : ''}`;
    stepDiv.innerHTML = `
      <span class="step-equation">${step.equation}</span>
      <span class="step-result">${step.operation}</span>
    `;
    
    algorithmSteps.appendChild(stepDiv);
  });
}

// Display results
function displayResults(numbers, results) {
  // Update calculation summary
  calculationSummary.textContent = `Números: ${numbers.join(', ')}`;
  
  // Update result values
  let resultText = "";
  if (calculatorType === "gcd") {
    resultText = `MCD = ${results.gcd}`;
  } else if (calculatorType === "lcm") {
    resultText = `MCM = ${results.lcm}`;
  } else {
    resultText = `MCD = ${results.gcd}, MCM = ${results.lcm}`;
  }
  resultValues.textContent = resultText;
  
  // Show result value in main display
  CalculatorUtils.displayResultValue(resultText);
  
  // Display factorization
  displayFactorization(numbers);
  
  // Display algorithm steps
  const algorithmStepsData = results.algorithmSteps || [];
  if (algorithmStepsData.length > 0) {
    displayAlgorithmSteps(algorithmStepsData);
  }
  
  // Generate and display explanation steps
  const steps = generateSteps(numbers, results, calculatorType);
  CalculatorUtils.displaySteps(steps);
  
  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(type, exampleNumbers) {
  changeType(type);
  
  // Clear current inputs
  numbersContainer.innerHTML = '';
  
  // Add inputs for example numbers
  exampleNumbers.forEach((number, index) => {
    const numberGroup = document.createElement('div');
    numberGroup.className = 'number-input-group';
    numberGroup.innerHTML = `
      <label>Número ${index + 1}:</label>
      <input
        type="number"
        class="input-field number-input"
        value="${number}"
        min="1"
        step="1"
        required
      />
      <button type="button" class="remove-number-btn" onclick="removeNumber(this)" style="display: ${exampleNumbers.length > 2 ? 'flex' : 'none'};">×</button>
    `;
    
    numbersContainer.appendChild(numberGroup);
  });
  
  // Setup listeners for inputs
  const inputs = numbersContainer.querySelectorAll('.number-input');
  CalculatorUtils.setupInputChangeListeners(inputs);
  
  // Auto calculate
  setTimeout(() => {
    form.dispatchEvent(new Event("submit"));
  }, 100);
}

// Calculation callback for form submission
async function performCalculation() {
  const numbers = getNumbers();
  
  if (numbers.length < 2) {
    throw new Error("Se necesitan al menos dos números para calcular MCD o MCM");
  }
  
  // Check for very large numbers
  const maxNumber = Math.max(...numbers);
  if (maxNumber > 1e12) {
    throw new Error("Los números son demasiado grandes para procesar eficientemente");
  }
  
  // Add delay for complex calculations
  if (numbers.length > 5 || maxNumber > 1e6) {
    await CalculatorUtils.delay(1000);
  }
  
  let results = {};
  
  // Perform calculations based on type
  switch (calculatorType) {
    case "gcd":
      const gcdResult = MathOperations.gcdMultiple(numbers);
      results = {
        gcd: gcdResult.result,
        algorithmSteps: gcdResult.steps,
        gcdSteps: gcdResult.steps
      };
      break;
      
    case "lcm":
      const lcmResult = MathOperations.lcmMultiple(numbers);
      results = {
        lcm: lcmResult.result,
        algorithmSteps: lcmResult.steps
      };
      break;
      
    case "both":
      const gcdBoth = MathOperations.gcdMultiple(numbers);
      const lcmBoth = MathOperations.lcmMultiple(numbers);
      results = {
        gcd: gcdBoth.result,
        lcm: lcmBoth.result,
        algorithmSteps: [...gcdBoth.steps, ...lcmBoth.steps],
        gcdSteps: gcdBoth.steps
      };
      break;
  }
  
  // Display results
  displayResults(numbers, results);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with GCD calculator
  changeType("gcd");
  
  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  
  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);
  
  // Setup initial input listeners
  const inputs = numbersContainer.querySelectorAll('.number-input');
  CalculatorUtils.setupInputChangeListeners(inputs);
  
  // Update remove button visibility
  updateRemoveButtons();
  
  // Focus first input
  const firstInput = numbersContainer.querySelector('.number-input');
  if (firstInput) firstInput.focus();
  
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
      loadExample(typeParam || "gcd", example);
    } catch (e) {
      console.warn("Invalid example parameter");
    }
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
window.addNumber = addNumber;
window.removeNumber = removeNumber;