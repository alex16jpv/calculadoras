// Factorial Calculator

// DOM elements
const form = document.getElementById("factorialForm");
const numberInput = document.getElementById("numberInput");
const factorialNotation = document.getElementById("factorialNotation");
const factorialExpression = document.getElementById("factorialExpression");
const breakdownDisplay = document.getElementById("breakdownDisplay");
const propertiesGrid = document.getElementById("propertiesGrid");

// Factorial calculation utilities
const FactorialCalculator = {
  // Calculate factorial using BigInt for large numbers
  calculate(n) {
    if (n < 0) {
      throw new Error("El factorial no está definido para números negativos");
    }
    
    if (n === 0 || n === 1) {
      return { result: BigInt(1), steps: [`${n}! = 1`] };
    }
    
    let result = BigInt(1);
    const steps = [];
    const factors = [];
    
    for (let i = 1; i <= n; i++) {
      result *= BigInt(i);
      factors.push(i);
    }
    
    // Create step-by-step breakdown
    steps.push(`${n}! = ${factors.join(' × ')}`);
    
    // Add intermediate calculations for smaller numbers
    if (n <= 10) {
      let intermediate = BigInt(1);
      for (let i = 1; i <= n; i++) {
        intermediate *= BigInt(i);
        steps.push(`${factors.slice(0, i).join(' × ')} = ${intermediate}`);
      }
    }
    
    return { result, steps };
  },

  // Format large numbers with commas
  formatNumber(number) {
    const str = number.toString();
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Convert to scientific notation for very large numbers
  toScientificNotation(number) {
    const str = number.toString();
    if (str.length <= 15) return null;
    
    const exponent = str.length - 1;
    const mantissa = str[0] + '.' + str.slice(1, 6);
    return `${mantissa} × 10^${exponent}`;
  },

  // Get factorial properties
  getProperties(n, result) {
    const properties = [];
    
    // Number of digits
    properties.push({
      label: "Número de dígitos",
      value: result.toString().length.toLocaleString()
    });
    
    // Growth factor (if n > 1)
    if (n > 1) {
      const previous = this.calculate(n - 1).result;
      properties.push({
        label: "Factor de crecimiento",
        value: `×${n}`
      });
    }
    
    // Special properties based on the number
    if (n === 0) {
      properties.push({
        label: "Propiedad especial",
        value: "0! = 1 por definición"
      });
    }
    
    if (n >= 5 && result.toString().endsWith('0')) {
      const zeros = (result.toString().match(/0+$/)[0] || '').length;
      properties.push({
        label: "Ceros al final",
        value: zeros.toString()
      });
    }
    
    // Approximate value comparison
    if (n >= 10) {
      properties.push({
        label: "Notación científica",
        value: this.toScientificNotation(result) || "< 10^15"
      });
    }
    
    return properties;
  },

  // Check if result is too large for certain operations
  isVeryLarge(result) {
    return result.toString().length > 50;
  },

  // Generate factorial applications
  getApplications(n) {
    const applications = [];
    
    if (n <= 10) {
      applications.push({
        type: "Permutaciones",
        description: `${n} objetos se pueden ordenar de ${this.formatNumber(this.calculate(n).result)} formas diferentes`
      });
    }
    
    if (n >= 2) {
      applications.push({
        type: "Combinaciones",
        description: `Se usa en la fórmula C(n,r) = n! / (r!(n-r)!)`
      });
    }
    
    return applications;
  }
};

// Update factorial notation display
function updateFactorialNotation(n) {
  if (n !== null && !isNaN(n) && n >= 0) {
    factorialNotation.textContent = `${n}! = ?`;
  } else {
    factorialNotation.textContent = "n! = ?";
  }
}

// Generate step by step explanation
function generateSteps(n, calculation) {
  const steps = [];
  
  if (n === 0) {
    steps.push({
      number: 1,
      content: "Caso especial del factorial de cero:",
      formula: "0! = 1 (por definición matemática)"
    });
    steps.push({
      number: 2,
      content: "Justificación:",
      formula: "Esto hace que las fórmulas combinatorias funcionen correctamente"
    });
  } else if (n === 1) {
    steps.push({
      number: 1,
      content: "Factorial de uno:",
      formula: "1! = 1"
    });
    steps.push({
      number: 2,
      content: "Por definición:",
      formula: "El producto de números desde 1 hasta 1 es simplemente 1"
    });
  } else {
    steps.push({
      number: 1,
      content: "Definición del factorial:",
      formula: `${n}! = 1 × 2 × 3 × ... × ${n}`
    });
    
    if (n <= 10) {
      steps.push({
        number: 2,
        content: "Expandimos la multiplicación:",
        formula: calculation.steps[0]
      });
      
      steps.push({
        number: 3,
        content: "Calculamos paso a paso:",
        formula: calculation.steps.slice(1).join('\n')
      });
      
      steps.push({
        number: 4,
        content: "Resultado final:",
        formula: `${n}! = ${FactorialCalculator.formatNumber(calculation.result)}`
      });
    } else {
      steps.push({
        number: 2,
        content: "Para números grandes, calculamos directamente:",
        formula: `${n}! = ${FactorialCalculator.formatNumber(calculation.result)}`
      });
      
      const scientific = FactorialCalculator.toScientificNotation(calculation.result);
      if (scientific) {
        steps.push({
          number: 3,
          content: "En notación científica:",
          formula: scientific
        });
      }
      
      steps.push({
        number: 4,
        content: "Propiedades del resultado:",
        formula: `Tiene ${calculation.result.toString().length} dígitos`
      });
    }
  }
  
  return steps;
}

// Display factorial breakdown
function displayBreakdown(n, calculation) {
  if (n <= 10) {
    // Show detailed breakdown for small numbers
    let breakdownHTML = `<div class="breakdown-step">`;
    breakdownHTML += `<strong>${n}!</strong> = ${Array.from({length: n}, (_, i) => i + 1).join(' × ')}`;
    breakdownHTML += `</div>`;
    
    if (calculation.steps.length > 1) {
      calculation.steps.slice(1).forEach(step => {
        breakdownHTML += `<div class="breakdown-step">${step}</div>`;
      });
    }
    
    breakdownHTML += `<div class="breakdown-result">`;
    breakdownHTML += `<strong>Resultado:</strong> ${FactorialCalculator.formatNumber(calculation.result)}`;
    breakdownHTML += `</div>`;
    
    breakdownDisplay.innerHTML = breakdownHTML;
  } else {
    // Show simplified breakdown for large numbers
    const scientific = FactorialCalculator.toScientificNotation(calculation.result);
    let breakdownHTML = `<div class="breakdown-step">`;
    breakdownHTML += `<strong>${n}!</strong> = 1 × 2 × 3 × ... × ${n}`;
    breakdownHTML += `</div>`;
    
    breakdownHTML += `<div class="breakdown-result">`;
    if (scientific) {
      breakdownHTML += `<strong>Resultado:</strong> ${scientific}<br>`;
      breakdownHTML += `<strong>Valor exacto:</strong> ${FactorialCalculator.formatNumber(calculation.result)}`;
    } else {
      breakdownHTML += `<strong>Resultado:</strong> ${FactorialCalculator.formatNumber(calculation.result)}`;
    }
    breakdownHTML += `</div>`;
    
    breakdownDisplay.innerHTML = breakdownHTML;
  }
}

// Display factorial properties
function displayProperties(n, result) {
  const properties = FactorialCalculator.getProperties(n, result);
  
  propertiesGrid.innerHTML = '';
  properties.forEach(property => {
    const propertyElement = document.createElement('div');
    propertyElement.className = 'property-item';
    propertyElement.innerHTML = `
      <div class="property-label">${property.label}</div>
      <div class="property-value">${property.value}</div>
    `;
    propertiesGrid.appendChild(propertyElement);
  });
}

// Display results
function displayResults(n) {
  try {
    const calculation = FactorialCalculator.calculate(n);
    
    // Update expression
    factorialExpression.textContent = `${n}! = ${FactorialCalculator.formatNumber(calculation.result)}`;
    
    // Show result value
    const scientific = FactorialCalculator.toScientificNotation(calculation.result);
    CalculatorUtils.displayResultValue(
      scientific || FactorialCalculator.formatNumber(calculation.result)
    );
    
    // Display breakdown
    displayBreakdown(n, calculation);
    
    // Display properties
    displayProperties(n, calculation.result);
    
    // Generate and display steps
    const steps = generateSteps(n, calculation);
    CalculatorUtils.displaySteps(steps);
    
    // Show results
    CalculatorUtils.showResults();
    
  } catch (error) {
    throw error;
  }
}

// Load example
function loadExample(number) {
  numberInput.value = number;
  updateFactorialNotation(number);
  form.dispatchEvent(new Event("submit"));
}

// Input change handler
function handleInputChange() {
  const value = numberInput.value;
  const number = parseInt(value);
  
  if (value && !isNaN(number) && number >= 0) {
    updateFactorialNotation(number);
  } else {
    updateFactorialNotation(null);
  }
  
  CalculatorUtils.clearResults();
}

// Calculation callback for form submission
async function performCalculation() {
  const value = numberInput.value;
  const number = parseInt(value);
  
  // Validate input
  if (isNaN(number) || value === "") {
    throw new Error("Por favor ingresa un número entero válido");
  }
  
  if (number < 0) {
    throw new Error("El factorial no está definido para números negativos");
  }
  
  if (!Number.isInteger(parseFloat(value))) {
    throw new Error("El factorial solo está definido para números enteros");
  }
  
  if (number > 170) {
    throw new Error("Número demasiado grande. El límite es 170 para evitar desbordamiento");
  }
  
  // Add delay for large numbers
  if (number > 50) {
    await CalculatorUtils.delay(1000);
  } else if (number > 20) {
    await CalculatorUtils.delay(500);
  }
  
  // Display results
  displayResults(number);
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
  if (numberParam && !isNaN(numberParam) && parseInt(numberParam) >= 0) {
    loadExample(parseInt(numberParam));
  }
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;