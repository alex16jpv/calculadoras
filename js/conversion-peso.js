// Weight / Mass Converter

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

// Kilograms per unit (international avoirdupois definitions, exact)
const UNITS = {
  mg: { name: "Miligramos", symbol: "mg", kilograms: 0.000001 },
  g: { name: "Gramos", symbol: "g", kilograms: 0.001 },
  kg: { name: "Kilogramos", symbol: "kg", kilograms: 1 },
  t: { name: "Toneladas", symbol: "t", kilograms: 1000 },
  oz: { name: "Onzas", symbol: "oz", kilograms: 0.028349523125 },
  lb: { name: "Libras", symbol: "lb", kilograms: 0.45359237 },
  st: { name: "Stones", symbol: "st", kilograms: 6.35029318 },
};

// Fill the unit selectors
function populateSelects() {
  const options = Object.entries(UNITS)
    .map(([key, unit]) => `<option value="${key}">${unit.name} (${unit.symbol})</option>`)
    .join("");
  fromUnit.innerHTML = options;
  toUnit.innerHTML = options;
  fromUnit.value = "kg";
  toUnit.value = "lb";
}

// Convert between two units
function convert(value, from, to) {
  return (value * UNITS[from].kilograms) / UNITS[to].kilograms;
}

// Pounds + ounces (e.g. 154 lb 5.1 oz)
function poundsAndOunces(kilograms) {
  const totalOunces = kilograms / UNITS.oz.kilograms;
  let pounds = Math.floor(totalOunces / 16);
  let ounces = CalculatorUtils.round(totalOunces - pounds * 16, 3);
  if (ounces >= 16) {
    pounds += 1;
    ounces = 0;
  }
  return `${CalculatorUtils.formatNumber(pounds)} lb ${fmt(ounces)} oz`;
}

// Swap source and target units
function swapUnits() {
  [fromUnit.value, toUnit.value] = [toUnit.value, fromUnit.value];
  if (valueInput.value.trim() !== "") form.dispatchEvent(new Event("submit"));
}

// Load example
function loadExample(value, from, to) {
  valueInput.value = value;
  fromUnit.value = from;
  toUnit.value = to;
  form.dispatchEvent(new Event("submit"));
}

// Calculation callback for form submission
async function performCalculation() {
  const value = CalculatorUtils.validateInput(valueInput.value, "Valor");
  const from = fromUnit.value;
  const to = toUnit.value;
  const result = convert(value, from, to);
  const factor = UNITS[from].kilograms / UNITS[to].kilograms;
  const kilograms = value * UNITS[from].kilograms;

  CalculatorUtils.displayResultValue(`${fmt(result)} ${UNITS[to].symbol}`);
  resultSubtitle.textContent = `${fmt(value)} ${UNITS[from].name.toLowerCase()} equivalen a`;

  const showOunces = (to === "lb" || from === "lb") && kilograms < 100000;
  extraNote.hidden = !showOunces;
  extraNote.textContent = showOunces ? `En libras y onzas: ${poundsAndOunces(kilograms)}` : "";

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
      content: `Pasamos ${UNITS[from].name.toLowerCase()} a kilogramos (unidad base):`,
      formula: `${fmt(value)} ${UNITS[from].symbol} × ${fmt(UNITS[from].kilograms)} = ${fmt(kilograms)} kg`,
    },
    {
      number: 2,
      content: `Pasamos de kilogramos a ${UNITS[to].name.toLowerCase()}:`,
      formula: `${fmt(kilograms)} kg ÷ ${fmt(UNITS[to].kilograms)} = ${fmt(result)} ${UNITS[to].symbol}`,
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
