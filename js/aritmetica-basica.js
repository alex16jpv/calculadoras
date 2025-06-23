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

// Calculator operations
const Operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => b !== 0 ? a / b : null
};

// Update display
function updateDisplay() {
  display.textContent = calculator.display;
  
  // Update operation indicator
  if (calculator.operator && calculator.firstOperand !== null) {
    operationIndicator.textContent = `${calculator.firstOperand} ${calculator.operator}`;
  } else {
    operationIndicator.textContent = '';
  }
}

// Input number
function inputNumber(number) {
  if (calculator.waitingForOperand) {
    calculator.display = number;
    calculator.waitingForOperand = false;
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

// Clear all
function clearAll() {
  calculator.display = '0';
  calculator.firstOperand = null;
  calculator.operator = null;
  calculator.waitingForOperand = false;
  calculator.lastOperation = null;
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
  if (calculator.display.length > 1) {
    calculator.display = calculator.display.slice(0, -1);
  } else {
    calculator.display = '0';
  }
  updateDisplay();
}

// Set operation
function setOperation(nextOperator) {
  const inputValue = parseFloat(calculator.display);

  if (calculator.firstOperand === null) {
    calculator.firstOperand = inputValue;
  } else if (calculator.operator) {
    const currentValue = calculator.firstOperand || 0;
    const newValue = Operations[calculator.operator](currentValue, inputValue);

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
  
  // Visual feedback for active operator
  document.querySelectorAll('.key-operator').forEach(key => {
    key.classList.remove('active');
  });
  
  event.target.classList.add('active');
}

// Calculate result
function calculate() {
  const inputValue = parseFloat(calculator.display);

  if (calculator.firstOperand !== null && calculator.operator) {
    const currentValue = calculator.firstOperand || 0;
    const result = Operations[calculator.operator](currentValue, inputValue);

    if (result === null) {
      showError('No se puede dividir por cero');
      return;
    }

    // Store operation for history and explanation
    const operation = {
      operand1: currentValue,
      operator: calculator.operator,
      operand2: inputValue,
      result: result,
      expression: `${currentValue} ${calculator.operator} ${inputValue}`,
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
    document.querySelectorAll('.key-operator').forEach(key => {
      key.classList.remove('active');
    });
  }
}

// Show error
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-display';
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
  
  steps.push({
    number: 1,
    content: "Identificamos la operación:",
    formula: `${operand1} ${operator} ${operand2}`
  });

  switch (operator) {
    case '+':
      steps.push({
        number: 2,
        content: "Realizamos la suma:",
        formula: `${operand1} + ${operand2} = ${result}`
      });
      if (operand1 > 10 && operand2 > 10) {
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
        formula: `${operand1} - ${operand2} = ${result}`
      });
      if (operand1 > operand2 && operand1 > 10) {
        steps.push({
          number: 3,
          content: "Proceso de resta por columnas:",
          formula: "Restamos unidades, decenas, centenas... pidiendo prestado cuando es necesario"
        });
      }
      break;
      
    case '×':
      steps.push({
        number: 2,
        content: "Realizamos la multiplicación:",
        formula: `${operand1} × ${operand2} = ${result}`
      });
      if (operand2 > 1) {
        steps.push({
          number: 3,
          content: "Interpretación:",
          formula: `Sumamos ${operand1} un total de ${operand2} veces`
        });
      }
      break;
      
    case '÷':
      steps.push({
        number: 2,
        content: "Realizamos la división:",
        formula: `${operand1} ÷ ${operand2} = ${result}`
      });
      steps.push({
        number: 3,
        content: "Interpretación:",
        formula: `¿Cuántas veces cabe ${operand2} en ${operand1}? ${result} veces`
      });
      if (result % 1 !== 0) {
        steps.push({
          number: 4,
          content: "Resultado decimal:",
          formula: `La división no es exacta, el resultado es ${result}`
        });
      }
      break;
  }

  return steps;
}

// Show explanation
function showExplanation(operation) {
  // Update operation display
  document.getElementById('operationDisplay').textContent = 
    `${operation.expression} = ${operation.result}`;
  
  // Update result value
  CalculatorUtils.displayResultValue(operation.result.toString());
  
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
        <span class="history-result">= ${operation.result}</span>
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
  if (parts.length === 3) {
    const [operand1, operator, operand2] = parts;
    
    // Clear calculator
    clearAll();
    
    // Input first operand
    calculator.display = operand1;
    calculator.firstOperand = parseFloat(operand1);
    updateDisplay();
    
    // Set operation
    calculator.operator = operator;
    calculator.waitingForOperand = true;
    updateDisplay();
    
    // Input second operand
    calculator.display = operand2;
    updateDisplay();
    
    // Calculate
    setTimeout(() => {
      calculate();
    }, 500);
  }
}

// Keyboard support
function handleKeyPress(event) {
  const key = event.key;
  
  // Add visual feedback
  document.body.classList.add('keyboard-active');
  setTimeout(() => {
    document.body.classList.remove('keyboard-active');
  }, 100);
  
  if (key >= '0' && key <= '9') {
    inputNumber(key);
  } else if (key === '.') {
    inputDecimal();
  } else if (key === '+') {
    setOperation('+');
  } else if (key === '-') {
    setOperation('-');
  } else if (key === '*') {
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
  
  // Focus on the calculator for keyboard input
  document.body.tabIndex = 0;
  document.body.focus();
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const exampleParam = urlParams.get('example');
  if (exampleParam) {
    loadExample(decodeURIComponent(exampleParam));
  }
});

// Make functions globally available for onclick handlers
window.inputNumber = inputNumber;
window.inputDecimal = inputDecimal;
window.setOperation = setOperation;
window.calculate = calculate;
window.clearAll = clearAll;
window.clearEntry = clearEntry;
window.deleteLast = deleteLast;
window.clearHistory = clearHistory;
window.loadExample = loadExample;