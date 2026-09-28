// Fraction <-> Decimal Converter

// Calculator state
let calculatorType = "toDecimal";

// DOM elements
const form = document.getElementById("fractionForm");
const fractionInputs = document.getElementById("fractionInputs");
const decimalInputs = document.getElementById("decimalInputs");
const numeratorInput = document.getElementById("numeratorInput");
const denominatorInput = document.getElementById("denominatorInput");
const decimalInput = document.getElementById("decimalInput");
const periodInput = document.getElementById("periodInput");
const helpText = document.getElementById("helpText");
const resultSubtitle = document.getElementById("resultSubtitle");
const summaryGrid = document.getElementById("summaryGrid");

// Maximum digits examined when searching for a repeating period
const MAX_DIGITS = 1000;

const helpTexts = {
  toDecimal:
    "Una fracción da un decimal exacto solo si su denominador (simplificado) tiene únicamente los factores 2 y 5.",
  toFraction:
    "Si el decimal es periódico (se repite indefinidamente), escribe la parte que se repite en el segundo campo.",
};

// Exact fraction arithmetic with BigInt
const FractionMath = {
  gcd(a, b) {
    a = a < 0n ? -a : a;
    b = b < 0n ? -b : b;
    while (b) [a, b] = [b, a % b];
    return a;
  },

  simplify(numerator, denominator) {
    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }
    const divisor = this.gcd(numerator, denominator) || 1n;
    return { numerator: numerator / divisor, denominator: denominator / divisor, divisor };
  },

  // Long division that detects the repeating block of digits
  toDecimal(numerator, denominator) {
    const negative = numerator < 0n !== denominator < 0n && numerator !== 0n;
    const num = numerator < 0n ? -numerator : numerator;
    const den = denominator < 0n ? -denominator : denominator;

    const integerPart = num / den;
    let remainder = num % den;
    const digits = [];
    const seen = new Map();
    let periodStart = -1;

    while (remainder !== 0n && digits.length < MAX_DIGITS) {
      if (seen.has(remainder)) {
        periodStart = seen.get(remainder);
        break;
      }
      seen.set(remainder, digits.length);
      remainder *= 10n;
      digits.push((remainder / den).toString());
      remainder %= den;
    }

    const nonRepeating = periodStart === -1 ? digits.join("") : digits.slice(0, periodStart).join("");
    const repeating = periodStart === -1 ? "" : digits.slice(periodStart).join("");
    const truncated = periodStart === -1 && remainder !== 0n;

    return { negative, integerPart, nonRepeating, repeating, truncated };
  },

  // Format "0.1(6)" style notation
  formatDecimal({ negative, integerPart, nonRepeating, repeating, truncated }) {
    const sign = negative ? "-" : "";
    if (!nonRepeating && !repeating) return `${sign}${integerPart}`;
    return `${sign}${integerPart}.${nonRepeating}${repeating ? `(${repeating})` : ""}${truncated ? "..." : ""}`;
  },

  // Format "0.16666..." expanded notation
  expandDecimal({ negative, integerPart, nonRepeating, repeating }) {
    const sign = negative ? "-" : "";
    if (!repeating) return null;
    let expanded = nonRepeating;
    while (expanded.length < nonRepeating.length + Math.max(12, repeating.length * 2)) {
      expanded += repeating;
    }
    return `${sign}${integerPart}.${expanded.slice(0, nonRepeating.length + Math.max(12, repeating.length * 2))}...`;
  },

  // Whole part and remainder for a mixed number
  mixedNumber(numerator, denominator) {
    const negative = numerator < 0n;
    const abs = negative ? -numerator : numerator;
    const whole = abs / denominator;
    const rest = abs % denominator;
    if (whole === 0n || rest === 0n) return null;
    return `${negative ? "-" : ""}${whole} ${rest}/${denominator}`;
  },
};

// Change conversion type
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  fractionInputs.hidden = type !== "toDecimal";
  decimalInputs.hidden = type !== "toFraction";
  helpText.textContent = helpTexts[type];
  CalculatorUtils.clearResults();
}

// Render the summary cards
function renderSummary(items) {
  summaryGrid.innerHTML = items
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");
}

// Fraction -> decimal
function convertToDecimal() {
  const numerator = CalculatorUtils.parseInteger(numeratorInput.value, "El numerador");
  const denominator = CalculatorUtils.parseInteger(denominatorInput.value, "El denominador");
  if (denominator === 0) {
    throw new Error("El denominador no puede ser cero");
  }

  const bigNum = BigInt(numerator);
  const bigDen = BigInt(denominator);
  const simple = FractionMath.simplify(bigNum, bigDen);
  const decimal = FractionMath.toDecimal(bigNum, bigDen);
  const notation = FractionMath.formatDecimal(decimal);
  const expanded = FractionMath.expandDecimal(decimal);

  CalculatorUtils.displayResultValue(expanded || notation);
  resultSubtitle.textContent = decimal.repeating
    ? `Decimal periódico: ${notation} (las cifras entre paréntesis se repiten)`
    : decimal.truncated
    ? `Se muestran los primeros ${MAX_DIGITS} decimales`
    : "Decimal exacto";

  const summary = [
    { label: "Fracción simplificada", value: `${simple.numerator}/${simple.denominator}` },
    { label: "Porcentaje", value: `${CalculatorUtils.formatNumber((numerator / denominator) * 100, 6)}%` },
  ];
  const mixed = FractionMath.mixedNumber(simple.numerator, simple.denominator);
  if (mixed) summary.push({ label: "Número mixto", value: mixed });
  if (decimal.repeating) summary.push({ label: "Periodo", value: `${decimal.repeating.length} cifra(s)` });
  renderSummary(summary);

  const steps = [
    {
      number: 1,
      content: "Dividimos el numerador entre el denominador:",
      formula: `${numerator} ÷ ${denominator}`,
    },
  ];
  if (simple.divisor > 1n) {
    steps.push({
      number: 2,
      content: `Simplificamos dividiendo ambos términos entre su MCD (${simple.divisor}):`,
      formula: `${numerator}/${denominator} = ${simple.numerator}/${simple.denominator}`,
    });
  }
  steps.push({
    number: steps.length + 1,
    content: decimal.repeating
      ? "Al dividir, un residuo se repite, así que las cifras decimales se repiten a partir de ahí:"
      : "La división termina (residuo 0), por lo que el decimal es exacto:",
    formula: `${numerator}/${denominator} = ${notation}`,
  });
  steps.push({
    number: steps.length + 1,
    content: "¿Por qué? Factores primos del denominador simplificado:",
    formula: onlyTwosAndFives(simple.denominator)
      ? `${simple.denominator} solo tiene factores 2 y/o 5 → decimal exacto`
      : `${simple.denominator} tiene factores distintos de 2 y 5 → decimal periódico`,
  });

  return steps;
}

// Check if n = 2^a × 5^b
function onlyTwosAndFives(n) {
  while (n % 2n === 0n) n /= 2n;
  while (n % 5n === 0n) n /= 5n;
  return n === 1n;
}

// Decimal -> fraction
function convertToFraction() {
  const text = decimalInput.value.trim().replace(",", ".");
  const period = periodInput.value.trim();

  const match = text.match(/^([-+]?)(\d*)(?:\.(\d*))?$/);
  if (!text || !match || (match[2] === "" && !match[3])) {
    throw new Error("Ingresa un número decimal válido, por ejemplo 0.75 o -2.5");
  }
  if (period && !/^\d+$/.test(period)) {
    throw new Error("La parte periódica solo puede contener dígitos");
  }
  if ((match[3] || "").length + period.length > 30) {
    throw new Error("Demasiados decimales (máximo 30 cifras)");
  }

  const negative = match[1] === "-";
  const integerDigits = match[2] || "0";
  const decimalDigits = match[3] || "";
  const sign = negative ? "-" : "";
  const shown = `${sign}${integerDigits}.${decimalDigits}${period ? `(${period})` : ""}`;

  let numerator;
  let denominator;
  const steps = [];

  if (!period) {
    numerator = BigInt(integerDigits + decimalDigits);
    denominator = 10n ** BigInt(decimalDigits.length);
    steps.push({
      number: 1,
      content: `El número tiene ${decimalDigits.length} decimal(es): lo escribimos sobre 1 seguido de ${decimalDigits.length} cero(s):`,
      formula: `${sign}${integerDigits}.${decimalDigits || "0"} = ${sign}${numerator}/${denominator}`,
    });
  } else {
    const full = BigInt(integerDigits + decimalDigits + period);
    const nonPeriodic = BigInt(integerDigits + decimalDigits);
    numerator = full - nonPeriodic;
    denominator = (10n ** BigInt(period.length) - 1n) * 10n ** BigInt(decimalDigits.length);
    steps.push({
      number: 1,
      content: "Numerador: el número completo (sin punto) menos la parte que no se repite:",
      formula: `${full} - ${nonPeriodic} = ${numerator}`,
    });
    steps.push({
      number: 2,
      content: `Denominador: ${period.length} nueve(s) por las cifras periódicas y ${decimalDigits.length} cero(s) por las no periódicas:`,
      formula: `${denominator}`,
    });
  }

  if (negative) numerator = -numerator;
  const simple = FractionMath.simplify(numerator, denominator);

  steps.push({
    number: steps.length + 1,
    content:
      simple.divisor > 1n
        ? `Simplificamos dividiendo entre el MCD (${simple.divisor}):`
        : "La fracción ya es irreducible:",
    formula: `${numerator}/${denominator} = ${simple.numerator}/${simple.denominator}`,
  });

  const fractionText =
    simple.denominator === 1n ? `${simple.numerator}` : `${simple.numerator}/${simple.denominator}`;
  CalculatorUtils.displayResultValue(fractionText);
  resultSubtitle.textContent = `${shown} en forma de fracción irreducible`;

  const summary = [
    { label: "Numerador", value: simple.numerator.toString() },
    { label: "Denominador", value: simple.denominator.toString() },
  ];
  const mixed = FractionMath.mixedNumber(simple.numerator, simple.denominator);
  if (mixed) summary.push({ label: "Número mixto", value: mixed });
  renderSummary(summary);

  return steps;
}

// Load example
function loadExample(type, values) {
  changeType(type);
  if (type === "toDecimal") {
    numeratorInput.value = values.numerator;
    denominatorInput.value = values.denominator;
  } else {
    decimalInput.value = values.decimal;
    periodInput.value = values.period || "";
  }
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const steps = calculatorType === "toDecimal" ? convertToDecimal() : convertToFraction();
  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([numeratorInput, denominatorInput, decimalInput, periodInput]);
  numeratorInput.focus();
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
