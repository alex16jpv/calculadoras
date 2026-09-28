// Number Base Converter

// DOM elements
const form = document.getElementById("basesForm");
const numberInput = document.getElementById("numberInput");
const fromBase = document.getElementById("fromBase");
const customBaseGroup = document.getElementById("customBaseGroup");
const customBase = document.getElementById("customBase");
const targetBase = document.getElementById("targetBase");
const baseResults = document.getElementById("baseResults");

const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE_NAMES = { 2: "Binario", 8: "Octal", 10: "Decimal", 16: "Hexadecimal" };
const PREFIXES = { "0b": 2, "0o": 8, "0x": 16 };

// Base conversion using BigInt so any length of integer is exact
const BaseConverter = {
  // Parse a string in the given base into a BigInt
  parse(text, base) {
    const bigBase = BigInt(base);
    let value = 0n;
    for (const char of text) {
      const digit = DIGITS.indexOf(char);
      if (digit === -1 || digit >= base) {
        throw new Error(`El dígito "${char}" no es válido en base ${base}`);
      }
      value = value * bigBase + BigInt(digit);
    }
    return value;
  },

  // Convert a non-negative BigInt to a string in the given base
  toBase(value, base) {
    if (value === 0n) return "0";
    const bigBase = BigInt(base);
    let result = "";
    while (value > 0n) {
      result = DIGITS[Number(value % bigBase)] + result;
      value /= bigBase;
    }
    return result;
  },

  // Group digits for readability (binary in nibbles, others in thousands)
  group(text, base) {
    const size = base === 2 ? 4 : base === 10 ? 3 : base === 16 ? 2 : 0;
    if (!size || text.length <= size) return text;
    const separator = base === 10 ? "," : " ";
    const firstLength = text.length % size || size;
    const parts = [text.slice(0, firstLength)];
    for (let i = firstLength; i < text.length; i += size) {
      parts.push(text.slice(i, i + size));
    }
    return parts.join(separator);
  },
};

// Read the origin base from the selector
function getSourceBase() {
  if (fromBase.value !== "custom") return Number(fromBase.value);
  return CalculatorUtils.parseInteger(customBase.value, "La base de origen", 2);
}

// Generate step by step explanation
function generateSteps(digits, base, value, negative) {
  const steps = [];
  const sign = negative ? "-" : "";

  if (base !== 10) {
    const terms = [...digits].map((char, i) => {
      const power = digits.length - 1 - i;
      return `${DIGITS.indexOf(char)}×${base}^${power}`;
    });
    steps.push({
      number: 1,
      content: `Convertimos de base ${base} a decimal multiplicando cada dígito por la base elevada a su posición:`,
      formula:
        digits.length <= 16
          ? `${sign}${digits}₍${base}₎ = ${sign}(${terms.join(" + ")})\n= ${sign}${CalculatorUtils.formatNumber(value)}`
          : `${sign}${digits}₍${base}₎ = ${sign}${CalculatorUtils.formatNumber(value)} (número largo: se omite la expansión)`,
    });
  } else {
    steps.push({
      number: 1,
      content: "El número ya está en base 10 (decimal):",
      formula: `${sign}${CalculatorUtils.formatNumber(value)}`,
    });
  }

  // Successive divisions to binary (only for manageable numbers)
  if (value > 0n && value < 100000n && base !== 2) {
    const lines = [];
    let current = value;
    while (current > 0n) {
      lines.push(`${current} ÷ 2 = ${current / 2n}, residuo ${current % 2n}`);
      current /= 2n;
    }
    steps.push({
      number: steps.length + 1,
      content: "Para pasar a binario dividimos entre 2 y leemos los residuos de abajo hacia arriba:",
      formula: `${lines.join("\n")}\n→ ${sign}${BaseConverter.toBase(value, 2)}`,
    });
  }

  steps.push({
    number: steps.length + 1,
    content: "Para hexadecimal agrupamos el binario de 4 en 4 bits (cada grupo es un dígito de 0 a F):",
    formula: `${sign}${BaseConverter.group(BaseConverter.toBase(value, 2), 2)} → ${sign}${BaseConverter.toBase(value, 16)}`,
  });

  return steps;
}

// Display results
function displayResults(digits, base, value, negative, extraBase) {
  const sign = negative ? "-" : "";
  CalculatorUtils.displayResultValue(sign + BaseConverter.group(value.toString(), 10));

  const bases = [2, 8, 10, 16];
  if (extraBase && !bases.includes(extraBase)) bases.push(extraBase);

  baseResults.innerHTML = bases
    .map((b) => {
      const converted = sign + BaseConverter.toBase(value, b);
      const label = BASE_NAMES[b] ? `${BASE_NAMES[b]} (base ${b})` : `Base ${b}`;
      return `
        <div class="base-row${b === base ? " source" : ""}">
          <div class="base-label">${label}</div>
          <div class="base-value">${BaseConverter.group(converted, b)}</div>
          <button type="button" class="copy-btn" data-copy="${converted}" aria-label="Copiar ${label}">Copiar</button>
        </div>`;
    })
    .join("");

  CalculatorUtils.displaySteps(generateSteps(digits, base, value, negative));
  CalculatorUtils.showResults();
}

// Copy a converted value to the clipboard
function handleCopy(event) {
  const button = event.target.closest(".copy-btn");
  if (!button) return;
  navigator.clipboard?.writeText(button.dataset.copy).then(() => {
    button.textContent = "¡Copiado!";
    setTimeout(() => (button.textContent = "Copiar"), 1500);
  });
}

// Load example
function loadExample(number, base) {
  numberInput.value = number;
  fromBase.value = base;
  customBaseGroup.hidden = true;
  targetBase.value = "";
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  let text = numberInput.value.trim().toUpperCase().replace(/[\s_,]/g, "");
  if (text === "") {
    throw new Error("Por favor ingresa un número");
  }

  let base = getSourceBase();
  if (base > 36) {
    throw new Error("La base de origen debe estar entre 2 y 36");
  }

  const negative = text.startsWith("-");
  if (negative) text = text.slice(1);

  // Auto detect 0b / 0o / 0x prefixes (unless the letter is a real digit, e.g. "0B" in hex)
  const prefix = text.slice(0, 2).toLowerCase();
  if (PREFIXES[prefix] && DIGITS.indexOf(text[1]) >= base) {
    base = PREFIXES[prefix];
    text = text.slice(2);
    fromBase.value = String(base);
    customBaseGroup.hidden = true;
  }

  if (text === "" || text.includes(".")) {
    throw new Error("Solo se admiten números enteros (sin punto decimal)");
  }
  if (text.length > 2000) {
    throw new Error("El número es demasiado largo (máximo 2000 dígitos)");
  }

  let extraBase = null;
  if (targetBase.value.trim() !== "") {
    extraBase = CalculatorUtils.parseInteger(targetBase.value, "La base de destino", 2);
    if (extraBase > 36) throw new Error("La base de destino debe estar entre 2 y 36");
  }

  const value = BaseConverter.parse(text, base);
  displayResults(text, base, value, negative && value !== 0n, extraBase);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([numberInput, customBase, targetBase]);

  fromBase.addEventListener("change", () => {
    customBaseGroup.hidden = fromBase.value !== "custom";
    CalculatorUtils.clearResults();
  });

  baseResults.addEventListener("click", handleCopy);
  numberInput.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
