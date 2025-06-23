// Prime Number Checker

// DOM elements
const form = document.getElementById("primeForm");
const numberInput = document.getElementById("numberInput");
const numberDisplay = document.getElementById("numberDisplay");
const resultBadge = document.getElementById("resultBadge");
const resultNumber = document.getElementById("resultNumber");
const resultStatus = document.getElementById("resultStatus");
const factorizationSection = document.getElementById("factorizationSection");
const factorizationDisplay = document.getElementById("factorizationDisplay");
const factorsSection = document.getElementById("factorsSection");
const factorsList = document.getElementById("factorsList");

// Prime checking algorithms
const PrimeChecker = {
  // Check if a number is prime
  isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  },

  // Get all factors of a number
  getFactors(n) {
    const factors = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        factors.push(i);
        if (i !== n / i) {
          factors.push(n / i);
        }
      }
    }
    return factors.sort((a, b) => a - b);
  },

  // Get prime factorization
  getPrimeFactorization(n) {
    if (n < 2) return [];
    
    const factors = [];
    let current = n;
    
    // Check for factor 2
    while (current % 2 === 0) {
      factors.push(2);
      current = current / 2;
    }
    
    // Check for odd factors
    for (let i = 3; i <= Math.sqrt(current); i += 2) {
      while (current % i === 0) {
        factors.push(i);
        current = current / i;
      }
    }
    
    // If current is still > 2, it's a prime factor
    if (current > 2) {
      factors.push(current);
    }
    
    return factors;
  },

  // Format prime factorization for display
  formatPrimeFactorization(factors) {
    if (factors.length === 0) return "1";
    if (factors.length === 1) return factors[0].toString();
    
    const factorCounts = {};
    factors.forEach(factor => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });
    
    return Object.entries(factorCounts)
      .map(([factor, count]) => {
        if (count === 1) return factor;
        return `${factor}${this.toSuperscript(count)}`;
      })
      .join(" × ");
  },

  // Convert number to superscript
  toSuperscript(num) {
    const superscripts = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
    };
    return num.toString().split('').map(digit => superscripts[digit]).join('');
  }
};

// Update visual schema display
function updateVisualSchema(number, status = null) {
  numberDisplay.textContent = number || "?";
  
  // Reset classes
  numberDisplay.className = "number-display";
  resultBadge.className = "result-badge";
  
  if (status === "analyzing") {
    numberDisplay.classList.add("analyzing");
    resultBadge.querySelector('.badge-text').textContent = "Analizando...";
  } else if (status) {
    numberDisplay.classList.add(status);
    resultBadge.classList.add(status);
    
    const badgeText = resultBadge.querySelector('.badge-text');
    switch (status) {
      case "prime":
        badgeText.textContent = "¡Es Primo!";
        break;
      case "composite":
        badgeText.textContent = "No es Primo";
        break;
      case "special":
        badgeText.textContent = "Caso Especial";
        break;
    }
  } else {
    resultBadge.querySelector('.badge-text').textContent = "Ingresa un número";
  }
}

// Generate explanation steps
function generateSteps(number, isPrime, factors, primeFactors) {
  const steps = [];
  
  if (number === 1) {
    steps.push({
      number: 1,
      content: "El número 1 es un caso especial:",
      formula: "1 no es considerado primo ni compuesto por definición"
    });
    steps.push({
      number: 2,
      content: "Por convención matemática:",
      formula: "Los números primos deben tener exactamente dos divisores distintos"
    });
  } else if (number === 2) {
    steps.push({
      number: 1,
      content: "El número 2 es especial:",
      formula: "Es el único número primo par"
    });
    steps.push({
      number: 2,
      content: "Sus únicos divisores son:",
      formula: "1 y 2 (exactamente dos divisores)"
    });
  } else if (isPrime) {
    steps.push({
      number: 1,
      content: "Verificamos divisibilidad:",
      formula: `Probamos divisores desde 2 hasta √${number} ≈ ${Math.floor(Math.sqrt(number))}`
    });
    steps.push({
      number: 2,
      content: "Resultado del análisis:",
      formula: `${number} no es divisible por ningún número excepto 1 y ${number}`
    });
    steps.push({
      number: 3,
      content: "Conclusión:",
      formula: `${number} es un número primo`
    });
  } else {
    steps.push({
      number: 1,
      content: "Encontramos divisores:",
      formula: `Los factores de ${number} son: ${factors.join(", ")}`
    });
    steps.push({
      number: 2,
      content: "Factorización prima:",
      formula: `${number} = ${PrimeChecker.formatPrimeFactorization(primeFactors)}`
    });
    steps.push({
      number: 3,
      content: "Conclusión:",
      formula: `${number} es un número compuesto (tiene más de dos divisores)`
    });
  }
  
  return steps;
}

// Display results
function displayResults(number) {
  const isPrime = PrimeChecker.isPrime(number);
  const factors = PrimeChecker.getFactors(number);
  const primeFactors = PrimeChecker.getPrimeFactorization(number);
  
  // Determine status
  let status;
  if (number === 1) {
    status = "special";
  } else if (isPrime) {
    status = "prime";
  } else {
    status = "composite";
  }
  
  // Update visual schema
  updateVisualSchema(number, status);
  
  // Display main result
  resultNumber.textContent = number;
  resultStatus.className = `result-status ${status}`;
  
  if (number === 1) {
    resultStatus.textContent = "Caso Especial";
  } else if (isPrime) {
    resultStatus.textContent = "Número Primo";
  } else {
    resultStatus.textContent = "Número Compuesto";
  }
  
  // Display factorization
  if (number === 1) {
    factorizationSection.style.display = "none";
  } else if (isPrime) {
    factorizationSection.style.display = "block";
    factorizationDisplay.textContent = `${number} = ${number} × 1`;
  } else {
    factorizationSection.style.display = "block";
    factorizationDisplay.textContent = `${number} = ${PrimeChecker.formatPrimeFactorization(primeFactors)}`;
  }
  
  // Display all factors
  factorsList.innerHTML = "";
  factors.forEach(factor => {
    const factorElement = document.createElement("span");
    factorElement.className = "factor-item";
    if (PrimeChecker.isPrime(factor) && factor > 1) {
      factorElement.classList.add("prime");
    }
    factorElement.textContent = factor;
    factorsList.appendChild(factorElement);
  });
  
  // Generate and display steps
  const steps = generateSteps(number, isPrime, factors, primeFactors);
  CalculatorUtils.displaySteps(steps);
  
  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(number) {
  numberInput.value = number;
  updateVisualSchema(number);
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  const number = parseInt(numberInput.value);
  
  // Validate input
  if (isNaN(number) || number < 1) {
    throw new Error("Por favor ingresa un número entero positivo");
  }
  
  if (number > 1000000) {
    throw new Error("Por favor ingresa un número menor o igual a 1,000,000");
  }
  
  // Update visual schema to show analyzing state
  updateVisualSchema(number, "analyzing");
  
  // Small delay for visual feedback on larger numbers
  if (number > 1000) {
    await CalculatorUtils.delay(500);
  }
  
  // Display results
  displayResults(number);
}

// Input change handler
function handleInputChange() {
  const value = numberInput.value;
  if (value && !isNaN(value) && parseInt(value) > 0) {
    updateVisualSchema(parseInt(value));
  } else {
    updateVisualSchema();
  }
  CalculatorUtils.clearResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  
  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);
  
  // Setup input listeners
  numberInput.addEventListener("input", handleInputChange);
  
  // Focus input
  numberInput.focus();
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const numberParam = urlParams.get("number");
  if (numberParam && !isNaN(numberParam)) {
    loadExample(parseInt(numberParam));
  }
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;