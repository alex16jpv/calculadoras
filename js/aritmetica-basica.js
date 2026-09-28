// Basic Arithmetic Calculator

// Calculator state
let calculator = {
  display: '0',
  firstOperand: null,
  operator: null,
  waitingForOperand: false,
  lastOperation: null
};

// History storage
let operationHistory = [];

// DOM elements
const display = document.getElementById('display');
const operationIndicator = document.getElementById('operationIndicator');
const historyList = document.getElementById('historyList');

// Calculator operations (rounded to remove floating point noise: 0.1 + 0.2 = 0.3)
const Operations = {
  '+': (a, b) => CalculatorUtils.round(a + b),
  '-': (a, b) => CalculatorUtils.round(a - b),
  '×': (a, b) => CalculatorUtils.round(a * b),
  '÷': (a, b) => b !== 0 ? CalculatorUtils.round(a / b) : null
};

// Short alias for number formatting
const fmt = (value) => CalculatorUtils.formatNumber(value, 10);

// Update display
function updateDisplay() {
  display.textContent = calculator.display;

  // Update operation indicator
  if (calculator.operator && calculator.firstOperand !== null) {
    operationIndicator.textContent = `${fmt(calculator.firstOperand)} ${calculator.operator}`;
  } else {
    operationIndicator.textContent = '';
  }
}

// Highlight the active operator key
function highlightOperator(operator) {
  document.querySelectorAll('.key-operator').forEach(key => {
    key.classList.toggle('active', key.textContent.trim() === operator);
  });
}

// Input number
function inputNumber(number) {
  if (calculator.waitingForOperand) {
    calculator.display = number;
    calculator.waitingForOperand = false;
  } else if (calculator.display.replace(/[-.]/g, '').length >= 15) {
    // Avoid digits beyond double precision
    return;
  } else {
    calculator.display = calculator.display === '0' ? number : calculator.display + number;
  }
  updateDisplay();
}

// Input decimal point
function inputDecimal() {
  if (calculator.waitingForOperand) {
    calculator.display = '0.';
    calculator.waitingForOperand = false;
  } else if (calculator.display.indexOf('.') === -1) {
    calculator.display += '.';
  }
  updateDisplay();
}

// Toggle sign of the current entry
function toggleSign() {
  if (calculator.display === '0') return;
  calculator.display = calculator.display.startsWith('-')
    ? calculator.display.slice(1)
    : '-' + calculator.display;
  if (calculator.waitingForOperand && calculator.operator === null) {
    // Toggling a previous result keeps it as the current entry
    calculator.waitingForOperand = false;
  }
  updateDisplay();
}

// Clear all
function clearAll() {
  calculator.display = '0';
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForOperand = false;
  calculator.lastOperation = null;
  highlightOperator(null);
  updateDisplay();
  CalculatorUtils.clearResults();
}

// Clear entry
function clearEntry() {
  calculator.display = '0';
  updateDisplay();
}

// Delete last character
function deleteLast() {
  if (calculator.waitingForOperand) return;
  const trimmed = calculator.display.slice(0, -1);
  calculator.display = trimmed === '' || trimmed === '-' ? '0' : trimmed;
  updateDisplay();
}

// Set operation
function setOperation(nextOperator) {
  const inputValue = parseFloat(calculator.display);

  // Pressing another operator right after one just replaces it
  if (calculator.operator && calculator.waitingForOperand) {
    calculator.operator = nextOperator;
    highlightOperator(nextOperator);
    updateDisplay();
    return;
  }

  if (calculator.firstOperand === null) {
    calculator.firstOperand = inputValue;
  } else if (calculator.operator) {
    const newValue = Operations[calculator.operator](calculator.firstOperand, inputValue);

    if (newValue === null) {
      showError('No se puede dividir por cero');
      return;
    }

    calculator.display = String(newValue);
    calculator.firstOperand = newValue;
  }

  calculator.waitingForOperand = true;
  calculator.operator = nextOperator;
  updateDisplay();
  highlightOperator(nextOperator);
}

// Calculate result
function calculate() {
  const inputValue = parseFloat(calculator.display);

  if (calculator.firstOperand !== null && calculator.operator) {
    const currentValue = calculator.firstOperand;
    const result = Operations[calculator.operator](currentValue, inputValue);

    if (result === null) {
      showError('No se puede dividir por cero');
      return;
    }

    if (!Number.isFinite(result)) {
      showError('El resultado es demasiado grande');
      return;
    }

    // Store operation for history and explanation
    const operation = {
      operand1: currentValue,
      operator: calculator.operator,
      operand2: inputValue,
      result: result,
      expression: `${fmt(currentValue)} ${calculator.operator} ${fmt(inputValue)}`,
      timestamp: new Date()
    };

    calculator.lastOperation = operation;
    calculator.display = String(result);
    calculator.firstOperand = null;
    calculator.operator = null;
    calculator.waitingForOperand = true;

    // Add to history
    addToHistory(operation);

    // Show explanation
    showExplanation(operation);

    updateDisplay();

    // Remove active operator styling
    highlightOperator(null);
  }
}

// Show error
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-display';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = message;

  const calculatorCard = document.querySelector('.calculator-card');
  calculatorCard.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

// Generate explanation steps
function generateSteps(operation) {
  const steps = [];
  const { operand1, operator, operand2, result } = operation;
  const a = fmt(operand1);
  const b = fmt(operand2);
  const r = fmt(result);

  steps.push({
    number: 1,
    content: "Identificamos la operación:",
    formula: `${a} ${operator} ${b}`
  });

  switch (operator) {
    case '+':
      steps.push({
        number: 2,
        content: "Realizamos la suma:",
        formula: `${a} + ${b} = ${r}`
      });
      if (Math.abs(operand1) >= 10 && Math.abs(operand2) >= 10) {
        steps.push({
          number: 3,
          content: "Proceso de suma por columnas:",
          formula: "Sumamos unidades, decenas, centenas... llevando cuando es necesario"
        });
      }
      break;

    case '-':
      steps.push({
        number: 2,
        content: "Realizamos la resta:",
        formula: `${a} - ${b} = ${r}`
      });
      if (operand1 > operand2 && operand1 >= 10) {
        steps.push({
          number: 3,
          content: "Proceso de resta por columnas:",
          formula: "Restamos unidades, decenas, centenas... pidiendo prestado cuando es necesario"
        });
      } else if (operand2 > operand1) {
        steps.push({
          number: 3,
          content: "Resultado negativo:",
          formula: `Como ${b} es mayor que ${a}, el resultado es negativo`
        });
      }
      break;

    case '×':
      steps.push({
        number: 2,
        content: "Realizamos la multiplicación:",
        formula: `${a} × ${b} = ${r}`
      });
      if (Number.isInteger(operand2) && operand2 > 1 && operand2 <= 1000) {
        steps.push({
          number: 3,
          content: "Interpretación:",
          formula: `Sumamos ${a} un total de ${b} veces`
        });
      }
      break;

    case '÷': {
      steps.push({
        number: 2,
        content: "Realizamos la división:",
        formula: `${a} ÷ ${b} = ${r}`
      });
      steps.push({
        number: 3,
        content: "Interpretación:",
        formula: `¿Cuántas veces cabe ${b} en ${a}? ${r} veces`
      });
      if (Number.isInteger(operand1) && Number.isInteger(operand2) && result % 1 !== 0) {
        const quotient = Math.trunc(operand1 / operand2);
        const remainder = operand1 - quotient * operand2;
        steps.push({
          number: 4,
          content: "División entera (cociente y residuo):",
          formula: `${a} = ${b} × ${fmt(quotient)} + ${fmt(remainder)}`
        });
      }
      break;
    }
  }

  return steps;
}

// Show explanation
function showExplanation(operation) {
  // Update operation display
  document.getElementById('operationDisplay').textContent =
    `${operation.expression} = ${fmt(operation.result)}`;

  // Update result value
  CalculatorUtils.displayResultValue(fmt(operation.result));

  // Generate and display steps
  const steps = generateSteps(operation);
  CalculatorUtils.displaySteps(steps);

  // Show results
  CalculatorUtils.showResults();
}

// Add to history
function addToHistory(operation) {
  operationHistory.unshift(operation);

  // Limit history to 50 items
  if (operationHistory.length > 50) {
    operationHistory = operationHistory.slice(0, 50);
  }

  updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
  if (operationHistory.length === 0) {
    historyList.innerHTML = `
      <p style="text-align: center; color: #6b7280; padding: 2rem">
        No hay operaciones en el historial
      </p>
    `;
    return;
  }

  historyList.innerHTML = '';

  operationHistory.forEach(operation => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.onclick = () => loadFromHistory(operation);

    historyItem.innerHTML = `
      <div>
        <span class="history-operation">${operation.expression}</span>
        <span class="history-result">= ${fmt(operation.result)}</span>
      </div>
      <span class="history-time">${formatTime(operation.timestamp)}</span>
    `;

    historyList.appendChild(historyItem);
  });
}

// Format time for history
function formatTime(timestamp) {
  return timestamp.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Load from history
function loadFromHistory(operation) {
  calculator.display = operation.result.toString();
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForOperand = true;
  updateDisplay();

  // Show explanation for the selected operation
  showExplanation(operation);
}

// Clear history
function clearHistory() {
  operationHistory = [];
  updateHistoryDisplay();
}

// Load example
function loadExample(expression) {
  // Parse expression like "125 + 87"
  const parts = expression.split(' ');
  if (parts.length === 3 && Operations[parts[1]]) {
    const [operand1, operator, operand2] = parts;
    if (isNaN(parseFloat(operand1)) || isNaN(parseFloat(operand2))) return;

    // Clear calculator
    clearAll();

    // Input first operand and operation
    calculator.firstOperand = parseFloat(operand1);
    calculator.operator = operator;
    highlightOperator(operator);

    // Input second operand
    calculator.display = operand2;
    calculator.waitingForOperand = false;
    updateDisplay();

    // Calculate
    setTimeout(() => {
      calculate();
    }, 500);
  }
}

// Keyboard support
function handleKeyPress(event) {
  // Leave browser shortcuts (Ctrl+C, Ctrl+R...) untouched
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  const key = event.key;

  if (key >= '0' && key <= '9') {
    inputNumber(key);
  } else if (key === '.' || key === ',') {
    inputDecimal();
  } else if (key === '+') {
    setOperation('+');
  } else if (key === '-') {
    setOperation('-');
  } else if (key === '*' || key === 'x') {
    setOperation('×');
  } else if (key === '/') {
    event.preventDefault();
    setOperation('÷');
  } else if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
  } else if (key === 'Escape' || key.toLowerCase() === 'c') {
    clearAll();
  } else if (key === 'Backspace') {
    event.preventDefault();
    deleteLast();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  updateDisplay();
  updateHistoryDisplay();

  // Setup keyboard events
  document.addEventListener('keydown', handleKeyPress);

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const exampleParam = urlParams.get('example');
  if (exampleParam) {
    loadExample(exampleParam);
  }
});

// Make functions globally available for onclick handlers
window.inputNumber = inputNumber;
window.inputDecimal = inputDecimal;
window.toggleSign = toggleSign;
window.setOperation = setOperation;
window.calculate = calculate;
window.clearAll = clearAll;
window.clearEntry = clearEntry;
window.deleteLast = deleteLast;
window.clearHistory = clearHistory;
window.loadExample = loadExample;
