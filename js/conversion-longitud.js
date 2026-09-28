// Length Converter

// DOM elements
const form = document.getElementById("unitForm");
const valueInput = document.getElementById("valueInput");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");
const resultSubtitle = document.getElementById("resultSubtitle");
const extraNote = document.getElementById("extraNote");
const allUnitsTable = document.getElementById("allUnitsTable");

// Short alias for number formatting
const fmt = (value) => CalculatorUtils.formatNumber(value, 6);

// Meters per unit (international definitions, exact)
const UNITS = {
  mm: { name: "Milímetros", symbol: "mm", meters: 0.001 },
  cm: { name: "Centímetros", symbol: "cm", meters: 0.01 },
  m: { name: "Metros", symbol: "m", meters: 1 },
  km: { name: "Kilómetros", symbol: "km", meters: 1000 },
  in: { name: "Pulgadas", symbol: "in", meters: 0.0254 },
  ft: { name: "Pies", symbol: "ft", meters: 0.3048 },
  yd: { name: "Yardas", symbol: "yd", meters: 0.9144 },
  mi: { name: "Millas", symbol: "mi", meters: 1609.344 },
  nmi: { name: "Millas náuticas", symbol: "nmi", meters: 1852 },
};

// Fill the unit selectors
function populateSelects() {
  const options = Object.entries(UNITS)
    .map(([key, unit]) => `<option value="${key}">${unit.name} (${unit.symbol})</option>`)
    .join("");
  fromUnit.innerHTML = options;
  toUnit.innerHTML = options;
  fromUnit.value = "m";
  toUnit.value = "ft";
}

// Convert between two units
function convert(value, from, to) {
  return (value * UNITS[from].meters) / UNITS[to].meters;
}

// Feet + inches (e.g. 5 ft 8.9 in) for heights
function feetAndInches(meters) {
  const totalInches = meters / UNITS.in.meters;
  let feet = Math.floor(totalInches / 12);
  let inches = CalculatorUtils.round(totalInches - feet * 12, 3);
  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet} ft ${fmt(inches)} in`;
}

// Swap source and target units
function swapUnits() {
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  if (valueInput.value.trim() !== "") CalculatorUtils.submitForm(form);
}

// Load example
function loadExample(value, from, to) {
  valueInput.value = value;
  fromUnit.value = from;
  toUnit.value = to;
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const value = CalculatorUtils.validateInput(valueInput.value, "Valor");
  const from = fromUnit.value;
  const to = toUnit.value;
  const result = convert(value, from, to);
  const factor = UNITS[from].meters / UNITS[to].meters;

  CalculatorUtils.displayResultValue(`${fmt(result)} ${UNITS[to].symbol}`);
  resultSubtitle.textContent = `${fmt(value)} ${UNITS[from].name.toLowerCase()} equivalen a`;

  const meters = value * UNITS[from].meters;
  const showFeet = (to === "ft" || from === "ft" || to === "in") && meters < 1000;
  extraNote.hidden = !showFeet;
  extraNote.textContent = showFeet ? `En pies y pulgadas: ${feetAndInches(meters)}` : "";

  allUnitsTable.innerHTML = Object.entries(UNITS)
    .map(
      ([key, unit]) => `
      <tr class="${key === to ? "highlight" : ""}">
        <td>${unit.name}</td>
        <td>${fmt(convert(value, from, key))} ${unit.symbol}</td>
      </tr>`
    )
    .join("");

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: `Pasamos ${UNITS[from].name.toLowerCase()} a metros (unidad base):`,
      formula: `${fmt(value)} ${UNITS[from].symbol} × ${fmt(UNITS[from].meters)} = ${fmt(meters)} m`,
    },
    {
      number: 2,
      content: `Pasamos de metros a ${UNITS[to].name.toLowerCase()}:`,
      formula: `${fmt(meters)} m ÷ ${fmt(UNITS[to].meters)} = ${fmt(result)} ${UNITS[to].symbol}`,
    },
    {
      number: 3,
      content: "Factor de conversión directo:",
      formula: `1 ${UNITS[from].symbol} = ${fmt(factor)} ${UNITS[to].symbol}`,
    },
  ]);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([valueInput]);
  [fromUnit, toUnit].forEach((select) =>
    select.addEventListener("change", () => CalculatorUtils.clearResults())
  );
  valueInput.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
window.swapUnits = swapUnits;
