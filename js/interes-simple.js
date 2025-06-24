// Simple Interest Calculator

// Calculator state
let calculatorType = "interest";

// DOM elements
const form = document.getElementById("calculatorForm");
const principalInput = document.getElementById("principalInput");
const rateInput = document.getElementById("rateInput");
const timeInput = document.getElementById("timeInput");
const timeUnitSelect = document.getElementById("timeUnitSelect");
const interestInput = document.getElementById("interestInput");
const helpText = document.getElementById("helpText");
const formulaDisplay = document.getElementById("formulaDisplay");
const schemaDescription = document.getElementById("schemaDescription");
const calculationInfo = document.getElementById("calculationInfo");
const calculationText = document.getElementById("calculationText");
const calculationSummary = document.getElementById("calculationSummary");
const breakdownGrid = document.getElementById("breakdownGrid");
const growthChart = document.getElementById("growthChart");
const formulaBreakdown = document.getElementById("formulaBreakdown");

// Input groups
const principalGroup = document.getElementById("principalGroup");
const rateGroup = document.getElementById("rateGroup");
const timeGroup = document.getElementById("timeGroup");
const interestGroup = document.getElementById("interestGroup");

// Calculator configurations
const calculatorConfigs = {
  "interest": {
    formula: "I = P × r × t",
    description: "Calcular el interés ganado o pagado sobre un capital",
    calculationText: "Interés simple ganado",
    helpText: "El interés simple se calcula sobre el capital inicial y no se capitaliza.",
    hiddenInput: "interest",
    requiredInputs: ["principal", "rate", "time"]
  },
  "principal": {
    formula: "P = I ÷ (r × t)",
    description: "Calcular el capital inicial necesario",
    calculationText: "Capital inicial requerido",
    helpText: "Determina cuánto dinero necesitas invertir para obtener un interés específico.",
    hiddenInput: "principal",
    requiredInputs: ["interest", "rate", "time"]
  },
  "rate": {
    formula: "r = I ÷ (P × t)",
    description: "Calcular la tasa de interés anual",
    calculationText: "Tasa de interés anual",
    helpText: "Encuentra qué tasa de interés necesitas para alcanzar tu objetivo financiero.",
    hiddenInput: "rate",
    requiredInputs: ["principal", "interest", "time"]
  },
  "time": {
    formula: "t = I ÷ (P × r)",
    description: "Calcular el tiempo de inversión necesario",
    calculationText: "Tiempo de inversión",
    helpText: "Determina cuánto tiempo necesitas para alcanzar tu meta de interés.",
    hiddenInput: "time",
    requiredInputs: ["principal", "interest", "rate"]
  }
};

// Simple Interest Calculator utilities
const SimpleInterestCalculator = {
  // Convert time to years based on unit
  convertTimeToYears(time, unit) {
    switch (unit) {
      case "years":
        return time;
      case "months":
        return time / 12;
      case "days":
        return time / 365;
      default:
        return time;
    }
  },

  // Convert years to specified unit
  convertYearsToUnit(years, unit) {
    switch (unit) {
      case "years":
        return years;
      case "months":
        return years * 12;
      case "days":
        return years * 365;
      default:
        return years;
    }
  },

  // Calculate simple interest: I = P × r × t
  calculateInterest(principal, rate, timeInYears) {
    const rateDecimal = rate / 100;
    return principal * rateDecimal * timeInYears;
  },

  // Calculate principal: P = I ÷ (r × t)
  calculatePrincipal(interest, rate, timeInYears) {
    const rateDecimal = rate / 100;
    return interest / (rateDecimal * timeInYears);
  },

  // Calculate rate: r = I ÷ (P × t)
  calculateRate(interest, principal, timeInYears) {
    return (interest / (principal * timeInYears)) * 100;
  },

  // Calculate time: t = I ÷ (P × r)
  calculateTime(interest, principal, rate) {
    const rateDecimal = rate / 100;
    return interest / (principal * rateDecimal);
  },

  // Format currency
  formatCurrency(amount, decimals = 2) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  },

  // Format percentage
  formatPercentage(rate, decimals = 2) {
    return new Intl.NumberFormat('es-ES', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(rate / 100);
  },

  // Format time with appropriate unit
  formatTime(time, unit, decimals = 2) {
    const value = Number(time.toFixed(decimals));
    const unitNames = {
      years: value === 1 ? "año" : "años",
      months: value === 1 ? "mes" : "meses",
      days: value === 1 ? "día" : "días"
    };
    return `${value} ${unitNames[unit]}`;
  },

  // Generate growth timeline for visualization
  generateGrowthTimeline(principal, interest, timeInYears) {
    const totalAmount = principal + interest;
    const timeline = [];
    
    // Generate points for visualization
    const points = Math.min(10, Math.ceil(timeInYears) + 1);
    for (let i = 0; i <= points; i++) {
      const currentTime = (timeInYears * i) / points;
      const currentInterest = (interest * i) / points;
      const currentTotal = principal + currentInterest;
      
      timeline.push({
        time: currentTime,
        principal: principal,
        interest: currentInterest,
        total: currentTotal,
        percentage: (currentTotal / totalAmount) * 100
      });
    }
    
    return timeline;
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
  calculationText.textContent = config.calculationText;
  helpText.textContent = config.helpText;

  // Update input visibility
  updateInputVisibility();

  // Clear results
  CalculatorUtils.clearResults();
}

// Update input visibility based on calculator type
function updateInputVisibility() {
  const config = calculatorConfigs[calculatorType];
  
  // Show all groups first
  [principalGroup, rateGroup, timeGroup, interestGroup].forEach(group => {
    group.style.display = 'block';
    group.classList.remove('calculated');
  });
  
  // Hide the input being calculated
  const hiddenInput = config.hiddenInput;
  switch (hiddenInput) {
    case "principal":
      principalGroup.style.display = 'none';
      break;
    case "rate":
      rateGroup.style.display = 'none';
      break;
    case "time":
      timeGroup.style.display = 'none';
      break;
    case "interest":
      interestGroup.style.display = 'none';
      break;
  }
  
  // Mark required inputs
  config.requiredInputs.forEach(inputType => {
    const group = document.getElementById(inputType + "Group");
    if (group) {
      group.classList.add('required');
    }
  });
}

// Generate step by step explanation
function generateSteps(values, result, type) {
  const steps = [];
  const config = calculatorConfigs[type];
  
  // Introduction step
  steps.push({
    number: 1,
    content: "Identificamos los valores conocidos:",
    formula: generateKnownValuesFormula(values, type)
  });
  
  // Formula step
  steps.push({
    number: 2,
    content: "Aplicamos la fórmula del interés simple:",
    formula: config.formula
  });
  
  // Substitution step
  steps.push({
    number: 3,
    content: "Sustituimos los valores en la fórmula:",
    formula: generateSubstitutionFormula(values, type)
  });
  
  // Calculation step
  steps.push({
    number: 4,
    content: "Realizamos el cálculo:",
    formula: generateCalculationFormula(values, result, type)
  });
  
  // Result interpretation
  steps.push({
    number: 5,
    content: "Interpretamos el resultado:",
    formula: generateResultInterpretation(values, result, type)
  });
  
  return steps;
}

// Generate known values formula
function generateKnownValuesFormula(values, type) {
  const parts = [];
  
  if (type !== "principal") {
    parts.push(`P = ${SimpleInterestCalculator.formatCurrency(values.principal)}`);
  }
  if (type !== "rate") {
    parts.push(`r = ${values.rate}%`);
  }
  if (type !== "time") {
    parts.push(`t = ${SimpleInterestCalculator.formatTime(values.timeOriginal, values.timeUnit)}`);
  }
  if (type !== "interest") {
    parts.push(`I = ${SimpleInterestCalculator.formatCurrency(values.interest)}`);
  }
  
  return parts.join('\\n');
}

// Generate substitution formula
function generateSubstitutionFormula(values, type) {
  const timeDisplay = values.timeUnit !== "years" 
    ? `${values.timeOriginal} ${values.timeUnit} = ${values.timeInYears.toFixed(4)} años`
    : `${values.timeInYears} años`;
    
  switch (type) {
    case "interest":
      return `I = ${SimpleInterestCalculator.formatCurrency(values.principal)} × ${values.rate}% × ${timeDisplay}`;
    case "principal":
      return `P = ${SimpleInterestCalculator.formatCurrency(values.interest)} ÷ (${values.rate}% × ${timeDisplay})`;
    case "rate":
      return `r = ${SimpleInterestCalculator.formatCurrency(values.interest)} ÷ (${SimpleInterestCalculator.formatCurrency(values.principal)} × ${timeDisplay})`;
    case "time":
      return `t = ${SimpleInterestCalculator.formatCurrency(values.interest)} ÷ (${SimpleInterestCalculator.formatCurrency(values.principal)} × ${values.rate}%)`;
    default:
      return "";
  }
}

// Generate calculation formula
function generateCalculationFormula(values, result, type) {
  const rateDecimal = values.rate / 100;
  
  switch (type) {
    case "interest":
      return `I = ${values.principal} × ${rateDecimal} × ${values.timeInYears.toFixed(4)} = ${SimpleInterestCalculator.formatCurrency(result.value)}`;
    case "principal":
      return `P = ${values.interest} ÷ ${(rateDecimal * values.timeInYears).toFixed(6)} = ${SimpleInterestCalculator.formatCurrency(result.value)}`;
    case "rate":
      return `r = ${values.interest} ÷ ${(values.principal * values.timeInYears).toFixed(2)} = ${(result.value / 100).toFixed(6)} = ${SimpleInterestCalculator.formatPercentage(result.value)}`;
    case "time":
      return `t = ${values.interest} ÷ ${(values.principal * rateDecimal).toFixed(2)} = ${result.value.toFixed(4)} años`;
    default:
      return "";
  }
}

// Generate result interpretation
function generateResultInterpretation(values, result, type) {
  switch (type) {
    case "interest":
      const totalAmount = values.principal + result.value;
      return `Ganarás ${SimpleInterestCalculator.formatCurrency(result.value)} de interés.\\nMonto total: ${SimpleInterestCalculator.formatCurrency(totalAmount)}`;
    case "principal":
      return `Necesitas invertir ${SimpleInterestCalculator.formatCurrency(result.value)} para ganar ${SimpleInterestCalculator.formatCurrency(values.interest)} de interés.`;
    case "rate":
      return `Necesitas una tasa de ${SimpleInterestCalculator.formatPercentage(result.value)} anual para alcanzar tu objetivo.`;
    case "time":
      const timeInUnit = SimpleInterestCalculator.convertYearsToUnit(result.value, values.timeUnit);
      return `Necesitas ${SimpleInterestCalculator.formatTime(timeInUnit, values.timeUnit)} para alcanzar tu objetivo.`;
    default:
      return "";
  }
}

// Display financial breakdown
function displayFinancialBreakdown(values, result) {
  const config = calculatorConfigs[calculatorType];
  breakdownGrid.innerHTML = "";
  
  // Determine all values
  let principal, rate, time, interest, timeUnit;
  
  switch (calculatorType) {
    case "interest":
      principal = values.principal;
      rate = values.rate;
      time = values.timeInYears;
      timeUnit = values.timeUnit;
      interest = result.value;
      break;
    case "principal":
      principal = result.value;
      rate = values.rate;
      time = values.timeInYears;
      timeUnit = values.timeUnit;
      interest = values.interest;
      break;
    case "rate":
      principal = values.principal;
      rate = result.value;
      time = values.timeInYears;
      timeUnit = values.timeUnit;
      interest = values.interest;
      break;
    case "time":
      principal = values.principal;
      rate = values.rate;
      time = result.value;
      timeUnit = values.timeUnit;
      interest = values.interest;
      break;
  }
  
  const totalAmount = principal + interest;
  const effectiveRate = (interest / principal) * 100;
  
  // Create breakdown items
  const breakdownItems = [
    {
      label: "Capital inicial",
      value: SimpleInterestCalculator.formatCurrency(principal),
      class: "breakdown-currency"
    },
    {
      label: "Tasa de interés",
      value: SimpleInterestCalculator.formatPercentage(rate),
      class: "breakdown-percentage"
    },
    {
      label: "Tiempo",
      value: SimpleInterestCalculator.formatTime(
        calculatorType === "time" ? 
        SimpleInterestCalculator.convertYearsToUnit(time, timeUnit) : 
        values.timeOriginal, 
        timeUnit
      ),
      class: "breakdown-time"
    },
    {
      label: "Interés ganado",
      value: SimpleInterestCalculator.formatCurrency(interest),
      class: "breakdown-currency"
    },
    {
      label: "Monto total",
      value: SimpleInterestCalculator.formatCurrency(totalAmount),
      class: "breakdown-currency"
    },
    {
      label: "Rendimiento efectivo",
      value: SimpleInterestCalculator.formatPercentage(effectiveRate),
      class: "breakdown-percentage"
    }
  ];
  
  breakdownItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'breakdown-item';
    itemElement.innerHTML = `
      <div class="breakdown-label">${item.label}</div>
      <div class="breakdown-value ${item.class}">${item.value}</div>
    `;
    breakdownGrid.appendChild(itemElement);
  });
}

// Display growth visualization
function displayGrowthVisualization(values, result) {
  let principal, interest, timeInYears;
  
  switch (calculatorType) {
    case "interest":
      principal = values.principal;
      interest = result.value;
      timeInYears = values.timeInYears;
      break;
    case "principal":
      principal = result.value;
      interest = values.interest;
      timeInYears = values.timeInYears;
      break;
    case "rate":
      principal = values.principal;
      interest = values.interest;
      timeInYears = values.timeInYears;
      break;
    case "time":
      principal = values.principal;
      interest = values.interest;
      timeInYears = result.value;
      break;
  }
  
  const timeline = SimpleInterestCalculator.generateGrowthTimeline(principal, interest, timeInYears);
  const totalAmount = principal + interest;
  
  growthChart.innerHTML = "";
  
  // Create growth bars
  timeline.forEach((point, index) => {
    if (index === 0 || index === timeline.length - 1 || index % 2 === 0) {
      const barContainer = document.createElement('div');
      barContainer.className = 'growth-bar-container';
      
      const timeLabel = point.time === 0 ? "Inicio" : 
                       point.time === timeInYears ? "Final" :
                       `${point.time.toFixed(1)} años`;
      
      barContainer.innerHTML = `
        <div class="growth-bar-label">
          <span>${timeLabel}</span>
          <span>${SimpleInterestCalculator.formatCurrency(point.total)}</span>
        </div>
        <div class="growth-bar">
          <div class="growth-bar-fill" style="width: ${point.percentage}%">
            <div class="growth-bar-text">${point.percentage.toFixed(1)}%</div>
          </div>
        </div>
      `;
      
      growthChart.appendChild(barContainer);
    }
  });
}

// Display formula breakdown
function displayFormulaBreakdown(values, result) {
  const config = calculatorConfigs[calculatorType];
  formulaBreakdown.innerHTML = "";
  
  const steps = [
    {
      title: "Fórmula aplicada",
      content: config.formula,
      final: false
    },
    {
      title: "Valores conocidos",
      content: generateKnownValuesFormula(values, calculatorType).replace(/\\n/g, '<br>'),
      final: false
    },
    {
      title: "Sustitución",
      content: generateSubstitutionFormula(values, calculatorType),
      final: false
    },
    {
      title: "Resultado",
      content: getResultDisplayText(result, calculatorType, values),
      final: true
    }
  ];
  
  steps.forEach(step => {
    const stepElement = document.createElement('div');
    stepElement.className = `formula-step ${step.final ? 'formula-final' : ''}`;
    stepElement.innerHTML = `
      <div class="formula-step-title">${step.title}:</div>
      <div class="formula-step-content">${step.content}</div>
    `;
    formulaBreakdown.appendChild(stepElement);
  });
}

// Get result display text
function getResultDisplayText(result, type, values) {
  switch (type) {
    case "interest":
      return `I = ${SimpleInterestCalculator.formatCurrency(result.value)}`;
    case "principal":
      return `P = ${SimpleInterestCalculator.formatCurrency(result.value)}`;
    case "rate":
      return `r = ${SimpleInterestCalculator.formatPercentage(result.value)}`;
    case "time":
      const timeInUnit = SimpleInterestCalculator.convertYearsToUnit(result.value, values.timeUnit);
      return `t = ${SimpleInterestCalculator.formatTime(timeInUnit, values.timeUnit)}`;
    default:
      return "";
  }
}

// Display results
function displayResults(values, result) {
  const config = calculatorConfigs[calculatorType];
  
  // Update calculation summary
  calculationSummary.textContent = config.calculationText;
  
  // Show result value
  const resultText = getResultDisplayText(result, calculatorType, values);
  CalculatorUtils.displayResultValue(resultText);
  
  // Display financial breakdown
  displayFinancialBreakdown(values, result);
  
  // Display growth visualization
  displayGrowthVisualization(values, result);
  
  // Display formula breakdown
  displayFormulaBreakdown(values, result);
  
  // Generate and display explanation steps
  const steps = generateSteps(values, result, calculatorType);
  CalculatorUtils.displaySteps(steps);
  
  // Show results
  CalculatorUtils.showResults();
}

// Load example
function loadExample(type, exampleValues) {
  changeType(type);
  
  // Wait for inputs to be updated
  setTimeout(() => {
    if (exampleValues.principal !== undefined) {
      principalInput.value = exampleValues.principal;
    }
    if (exampleValues.rate !== undefined) {
      rateInput.value = exampleValues.rate;
    }
    if (exampleValues.time !== undefined) {
      timeInput.value = exampleValues.time;
    }
    if (exampleValues.timeUnit !== undefined) {
      timeUnitSelect.value = exampleValues.timeUnit;
    }
    if (exampleValues.interest !== undefined) {
      interestInput.value = exampleValues.interest;
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
  const config = calculatorConfigs[calculatorType];
  const values = {};
  
  // Get time unit
  values.timeUnit = timeUnitSelect.value;
  
  // Get values from visible inputs
  if (config.requiredInputs.includes("principal")) {
    values.principal = CalculatorUtils.validateInput(principalInput.value, "Capital inicial");
    if (values.principal <= 0) {
      throw new Error("El capital inicial debe ser mayor que cero");
    }
  }
  
  if (config.requiredInputs.includes("rate")) {
    values.rate = CalculatorUtils.validateInput(rateInput.value, "Tasa de interés");
    if (values.rate <= 0) {
      throw new Error("La tasa de interés debe ser mayor que cero");
    }
  }
  
  if (config.requiredInputs.includes("time")) {
    values.timeOriginal = CalculatorUtils.validateInput(timeInput.value, "Tiempo");
    if (values.timeOriginal <= 0) {
      throw new Error("El tiempo debe ser mayor que cero");
    }
    values.timeInYears = SimpleInterestCalculator.convertTimeToYears(values.timeOriginal, values.timeUnit);
  }
  
  if (config.requiredInputs.includes("interest")) {
    values.interest = CalculatorUtils.validateInput(interestInput.value, "Interés");
    if (values.interest <= 0) {
      throw new Error("El interés debe ser mayor que cero");
    }
  }
  
  // Additional validations
  if (calculatorType === "rate" && values.interest >= values.principal) {
    throw new Error("El interés no puede ser mayor o igual al capital inicial para períodos normales");
  }
  
  // Add delay for better UX
  await CalculatorUtils.delay(300);
  
  let result;
  
  // Perform calculation based on type
  switch (calculatorType) {
    case "interest":
      result = {
        value: SimpleInterestCalculator.calculateInterest(values.principal, values.rate, values.timeInYears)
      };
      break;
    case "principal":
      result = {
        value: SimpleInterestCalculator.calculatePrincipal(values.interest, values.rate, values.timeInYears)
      };
      break;
    case "rate":
      result = {
        value: SimpleInterestCalculator.calculateRate(values.interest, values.principal, values.timeInYears)
      };
      break;
    case "time":
      result = {
        value: SimpleInterestCalculator.calculateTime(values.interest, values.principal, values.rate)
      };
      break;
  }
  
  // Validate result
  if (!isFinite(result.value) || result.value <= 0) {
    throw new Error("Los valores ingresados producen un resultado inválido. Verifica los datos.");
  }
  
  // Check for unrealistic results
  if (calculatorType === "rate" && result.value > 1000) {
    throw new Error("La tasa de interés calculada es demasiado alta. Verifica los valores.");
  }
  
  if (calculatorType === "time" && result.value > 1000) {
    throw new Error("El tiempo calculado es demasiado largo. Verifica los valores.");
  }
  
  // Display results
  displayResults(values, result);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Initialize with interest calculator
  changeType("interest");
  
  // Setup form submission
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  
  // Setup keyboard shortcuts
  CalculatorUtils.setupKeyboardShortcuts(form);
  
  // Setup input listeners
  principalInput.addEventListener("input", handleInputChange);
  rateInput.addEventListener("input", handleInputChange);
  timeInput.addEventListener("input", handleInputChange);
  timeUnitSelect.addEventListener("change", handleInputChange);
  interestInput.addEventListener("input", handleInputChange);
  
  // Focus first visible input
  setTimeout(() => {
    const firstVisibleInput = document.querySelector('.input-group:not([style*="none"]) .input-field');
    if (firstVisibleInput) firstVisibleInput.focus();
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
      loadExample(typeParam || "interest", example);
    } catch (e) {
      console.warn("Invalid example parameter");
    }
  }
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;