// Average Calculator (mean, median, mode, weighted average)

// Calculator state
let calculatorType = "simple";

// DOM elements
const form = document.getElementById("averageForm");
const simpleInputs = document.getElementById("simpleInputs");
const weightedInputs = document.getElementById("weightedInputs");
const numbersInput = document.getElementById("numbersInput");
const weightedRows = document.getElementById("weightedRows");
const helpText = document.getElementById("helpText");
const resultSubtitle = document.getElementById("resultSubtitle");
const summaryGrid = document.getElementById("summaryGrid");
const neededNote = document.getElementById("neededNote");

const MAX_VALUES = 10000;
const fmt = (value) => CalculatorUtils.formatNumber(value, 4);

const helpTexts = {
  simple:
    "La mediana es más representativa que la media cuando hay valores extremos (por ejemplo, en salarios o precios de vivienda).",
  weighted:
    "Los pesos pueden ser porcentajes (30, 30, 40) o créditos. Si los porcentajes suman menos de 100, te diremos cuánto necesitas en lo que falta.",
};

// Descriptive statistics
const Stats = {
  sum: (values) => values.reduce((acc, v) => acc + v, 0),

  mean(values) {
    return this.sum(values) / values.length;
  },

  median(sorted) {
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  },

  // All values with the highest frequency (empty when every value repeats equally)
  modes(values) {
    const counts = new Map();
    values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    const max = Math.max(...counts.values());
    const modes = [...counts].filter(([, c]) => c === max).map(([v]) => v);
    // No mode when nothing repeats, or when several values all repeat equally
    if (max === 1 || (modes.length === counts.size && counts.size > 1)) return { values: [], count: max };
    return { values: modes.sort((a, b) => a - b), count: max };
  },

  variance(values, mean, sample) {
    const squares = values.reduce((acc, v) => acc + (v - mean) ** 2, 0);
    return squares / (values.length - (sample ? 1 : 0));
  },
};

// Parse a free-form list of numbers ("7, 8.5; 9 10")
function parseNumbers(text) {
  const tokens = text
    .trim()
    .split(/[\s;,]+/)
    .filter(Boolean);
  if (tokens.length === 0) throw new Error("Ingresa al menos un número");
  if (tokens.length > MAX_VALUES) throw new Error(`Se admiten hasta ${MAX_VALUES} números`);

  return tokens.map((token) => {
    const value = Number(token);
    if (!Number.isFinite(value)) throw new Error(`"${token}" no es un número válido`);
    return value;
  });
}

// Add an input row for the weighted average
function addRow(value = "", weight = "") {
  const row = document.createElement("div");
  row.className = "weighted-row";
  row.innerHTML = `
    <input type="number" class="input-field value-input" step="any" placeholder="Nota" aria-label="Valor" value="${value}" />
    <input type="number" class="input-field weight-input" step="any" min="0" placeholder="Peso" aria-label="Peso" value="${weight}" />
    <button type="button" class="remove-row-btn" aria-label="Eliminar fila" onclick="removeRow(this)">×</button>
  `;
  weightedRows.appendChild(row);
  CalculatorUtils.setupInputChangeListeners(row.querySelectorAll("input"));
}

function removeRow(button) {
  if (weightedRows.children.length > 1) {
    button.closest(".weighted-row").remove();
    CalculatorUtils.clearResults();
  }
}

function resetRows(rows) {
  weightedRows.innerHTML = "";
  rows.forEach(([value, weight]) => addRow(value, weight));
}

// Change calculation type
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  simpleInputs.hidden = type !== "simple";
  weightedInputs.hidden = type !== "weighted";
  helpText.textContent = helpTexts[type];
  CalculatorUtils.clearResults();
}

// Render summary cards
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

// Simple average with descriptive statistics
function calculateSimple() {
  const values = parseNumbers(numbersInput.value);
  const sorted = [...values].sort((a, b) => a - b);
  const sum = Stats.sum(values);
  const mean = sum / values.length;
  const median = Stats.median(sorted);
  const modes = Stats.modes(values);
  const populationSd = Math.sqrt(Stats.variance(values, mean, false));
  const sampleSd = values.length > 1 ? Math.sqrt(Stats.variance(values, mean, true)) : null;

  CalculatorUtils.displayResultValue(fmt(mean));
  resultSubtitle.textContent = `media aritmética de ${values.length} ${values.length === 1 ? "valor" : "valores"}`;
  neededNote.hidden = true;

  renderSummary([
    { label: "Mediana", value: fmt(median) },
    {
      label: "Moda",
      value: modes.values.length ? `${modes.values.map(fmt).join(", ")} (${modes.count} veces)` : "Sin moda",
    },
    { label: "Suma", value: fmt(sum) },
    { label: "Mínimo / Máximo", value: `${fmt(sorted[0])} / ${fmt(sorted[sorted.length - 1])}` },
    { label: "Rango", value: fmt(sorted[sorted.length - 1] - sorted[0]) },
    { label: "Desv. estándar (poblacional)", value: fmt(populationSd) },
    { label: "Desv. estándar (muestral)", value: sampleSd === null ? "—" : fmt(sampleSd) },
  ]);

  const listed = values.length <= 20 ? values.map(fmt).join(" + ") : `${values.slice(0, 10).map(fmt).join(" + ")} + ...`;
  const middle = Math.floor(sorted.length / 2);

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: "Sumamos todos los valores:",
      formula: `${listed} = ${fmt(sum)}`,
    },
    {
      number: 2,
      content: "Dividimos la suma entre la cantidad de valores:",
      formula: `Media = ${fmt(sum)} ÷ ${values.length} = ${fmt(mean)}`,
    },
    {
      number: 3,
      content: "Ordenamos los datos para encontrar la mediana:",
      formula:
        (sorted.length <= 30 ? `${sorted.map(fmt).join(", ")}\n` : "") +
        (sorted.length % 2
          ? `Valor central (posición ${middle + 1}) = ${fmt(median)}`
          : `Promedio de las posiciones ${middle} y ${middle + 1}: (${fmt(sorted[middle - 1])} + ${fmt(sorted[middle])}) ÷ 2 = ${fmt(median)}`),
    },
  ]);
}

// Weighted average
function calculateWeighted() {
  const rows = [...weightedRows.querySelectorAll(".weighted-row")]
    .map((row, index) => ({
      index: index + 1,
      valueText: row.querySelector(".value-input").value.trim(),
      weightText: row.querySelector(".weight-input").value.trim(),
    }))
    .filter((row) => row.valueText !== "" || row.weightText !== "");

  if (rows.length === 0) throw new Error("Completa al menos una fila con valor y peso");

  const items = rows.map((row) => ({
    value: CalculatorUtils.parseNumber(row.valueText, `el valor de la fila ${row.index}`),
    weight: CalculatorUtils.validateInput(row.weightText, `el peso de la fila ${row.index}`),
  }));

  const totalWeight = Stats.sum(items.map((item) => item.weight));
  if (totalWeight === 0) throw new Error("La suma de los pesos no puede ser cero");

  const weightedSum = Stats.sum(items.map((item) => item.value * item.weight));
  const average = weightedSum / totalWeight;

  CalculatorUtils.displayResultValue(fmt(average));
  resultSubtitle.textContent = "promedio ponderado";

  renderSummary([
    { label: "Suma de productos", value: fmt(weightedSum) },
    { label: "Suma de pesos", value: fmt(totalWeight) },
    { label: "Promedio simple (sin pesos)", value: fmt(Stats.mean(items.map((item) => item.value))) },
  ]);

  // When weights look like percentages that don't reach 100, show what has been earned so far
  const looksLikePercent = totalWeight < 100 && items.every((item) => item.weight <= 100);
  neededNote.hidden = !looksLikePercent;
  if (looksLikePercent) {
    neededNote.innerHTML = `Si los pesos son porcentajes, llevas evaluado el <strong>${fmt(totalWeight)}%</strong> y has acumulado <strong>${fmt(weightedSum / 100)}</strong> puntos de la nota final. Falta el ${fmt(100 - totalWeight)}%. Para alcanzar una nota final <em>N</em> necesitas sacar (N - ${fmt(weightedSum / 100)}) ÷ ${fmt((100 - totalWeight) / 100)} en lo que resta.`;
  }

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: "Multiplicamos cada valor por su peso:",
      formula: items.map((item) => `${fmt(item.value)} × ${fmt(item.weight)} = ${fmt(item.value * item.weight)}`).join("\n"),
    },
    {
      number: 2,
      content: "Sumamos los productos y los pesos:",
      formula: `Σ(valor × peso) = ${fmt(weightedSum)}\nΣ(pesos) = ${fmt(totalWeight)}`,
    },
    {
      number: 3,
      content: "Dividimos ambas sumas:",
      formula: `Promedio ponderado = ${fmt(weightedSum)} ÷ ${fmt(totalWeight)} = ${fmt(average)}`,
    },
  ]);
}

// Load example
function loadExample(exampleId) {
  switch (exampleId) {
    case "grades":
      changeType("simple");
      numbersInput.value = "7, 8.5, 9, 6, 8.5";
      break;
    case "salaries":
      changeType("simple");
      numbersInput.value = "1200, 1300, 1250, 1400, 1350, 15000";
      break;
    case "course":
      changeType("weighted");
      resetRows([[4.0, 30], [3.5, 30], [4.5, 40]]);
      break;
    case "credits":
      changeType("weighted");
      resetRows([[4.2, 3], [3.8, 4], [4.6, 2], [3.5, 3]]);
      break;
    default:
      return;
  }
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  if (calculatorType === "simple") calculateSimple();
  else calculateWeighted();
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  resetRows([["", ""], ["", ""], ["", ""]]);
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([numbersInput]);
  numbersInput.focus();
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
window.addRow = addRow;
window.removeRow = removeRow;
