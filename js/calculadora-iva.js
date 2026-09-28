// VAT (IVA) Calculator

// Calculator state
let calculatorType = "add";

// DOM elements
const form = document.getElementById("vatForm");
const amountInput = document.getElementById("amountInput");
const amountLabel = document.getElementById("amountLabel");
const countrySelect = document.getElementById("countrySelect");
const rateInput = document.getElementById("rateInput");
const resultSubtitle = document.getElementById("resultSubtitle");
const summaryGrid = document.getElementById("summaryGrid");

// General (standard) VAT rates. Reduced rates and exemptions are not included.
const COUNTRIES = [
  { code: "CO", name: "Colombia", rate: 19, tax: "IVA" },
  { code: "MX", name: "México", rate: 16, tax: "IVA" },
  { code: "ES", name: "España", rate: 21, tax: "IVA" },
  { code: "AR", name: "Argentina", rate: 21, tax: "IVA" },
  { code: "CL", name: "Chile", rate: 19, tax: "IVA" },
  { code: "PE", name: "Perú", rate: 18, tax: "IGV" },
  { code: "EC", name: "Ecuador", rate: 15, tax: "IVA" },
  { code: "VE", name: "Venezuela", rate: 16, tax: "IVA" },
  { code: "UY", name: "Uruguay", rate: 22, tax: "IVA" },
  { code: "PY", name: "Paraguay", rate: 10, tax: "IVA" },
  { code: "BO", name: "Bolivia", rate: 13, tax: "IVA" },
  { code: "CR", name: "Costa Rica", rate: 13, tax: "IVA" },
  { code: "GT", name: "Guatemala", rate: 12, tax: "IVA" },
  { code: "SV", name: "El Salvador", rate: 13, tax: "IVA" },
  { code: "HN", name: "Honduras", rate: 15, tax: "ISV" },
  { code: "NI", name: "Nicaragua", rate: 15, tax: "IVA" },
  { code: "PA", name: "Panamá", rate: 7, tax: "ITBMS" },
  { code: "DO", name: "República Dominicana", rate: 18, tax: "ITBIS" },
  { code: "custom", name: "Otra tasa", rate: null, tax: "IVA" },
];

// Short aliases for formatting
const money = (value) => CalculatorUtils.formatCurrency(value);
const fmt = (value) => CalculatorUtils.formatNumber(value, 4);

// Fill the country selector
function populateCountries() {
  countrySelect.innerHTML = COUNTRIES.map(
    (country) =>
      `<option value="${country.code}">${country.name}${country.rate !== null ? ` (${country.rate}%)` : ""}</option>`
  ).join("");
  countrySelect.value = "CO";
  rateInput.value = 19;
}

// Name of the tax for the selected country (IVA, IGV, ITBIS...)
function taxName() {
  return COUNTRIES.find((country) => country.code === countrySelect.value)?.tax || "IVA";
}

// Change calculation type
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  updateLabels();
  CalculatorUtils.clearResults();
}

function updateLabels() {
  amountLabel.textContent =
    calculatorType === "add" ? `Precio sin ${taxName()} ($):` : `Precio con ${taxName()} incluido ($):`;
}

// Load example
function loadExample(type, amount, country) {
  countrySelect.value = country;
  rateInput.value = COUNTRIES.find((c) => c.code === country).rate;
  changeType(type);
  amountInput.value = amount;
  CalculatorUtils.submitForm(form);
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

// Calculation callback for form submission
async function performCalculation() {
  const amount = CalculatorUtils.validateInput(amountInput.value, "Precio");
  const ratePercent = CalculatorUtils.validateInput(rateInput.value, "Tasa de IVA");
  if (ratePercent > 100) throw new Error("La tasa de IVA no puede superar el 100%");

  const rate = ratePercent / 100;
  const tax = taxName();
  let net;
  let gross;
  let steps;

  if (calculatorType === "add") {
    net = amount;
    gross = net * (1 + rate);
    steps = [
      {
        number: 1,
        content: `Calculamos el ${tax} multiplicando el precio neto por la tasa:`,
        formula: `${tax} = ${money(net)} × ${fmt(ratePercent)}% = ${money(gross - net)}`,
      },
      {
        number: 2,
        content: "Sumamos el impuesto al precio neto:",
        formula: `Total = ${money(net)} + ${money(gross - net)} = ${money(gross)}\n(equivale a ${money(net)} × ${fmt(1 + rate)})`,
      },
    ];
    CalculatorUtils.displayResultValue(money(gross));
    resultSubtitle.textContent = `precio con ${tax} incluido`;
  } else {
    gross = amount;
    net = gross / (1 + rate);
    steps = [
      {
        number: 1,
        content: `Dividimos el precio final entre (1 + tasa) para obtener la base sin ${tax}:`,
        formula: `Neto = ${money(gross)} ÷ ${fmt(1 + rate)} = ${money(net)}`,
      },
      {
        number: 2,
        content: `El ${tax} es la diferencia entre el precio final y el neto:`,
        formula: `${tax} = ${money(gross)} - ${money(net)} = ${money(gross - net)}`,
      },
      {
        number: 3,
        content: "⚠️ Error común: restar el porcentaje directamente al precio final da un resultado incorrecto:",
        formula: `${money(gross)} - ${fmt(ratePercent)}% = ${money(gross * (1 - rate))} ✗`,
      },
    ];
    CalculatorUtils.displayResultValue(money(net));
    resultSubtitle.textContent = `precio sin ${tax} (base imponible)`;
  }

  renderSummary([
    { label: `Precio sin ${tax}`, value: money(net) },
    { label: `${tax} (${fmt(ratePercent)}%)`, value: money(gross - net) },
    { label: `Precio con ${tax}`, value: money(gross) },
  ]);

  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateCountries();
  updateLabels();

  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([amountInput]);

  countrySelect.addEventListener("change", () => {
    const country = COUNTRIES.find((c) => c.code === countrySelect.value);
    if (country.rate !== null) rateInput.value = country.rate;
    else rateInput.focus();
    updateLabels();
    CalculatorUtils.clearResults();
  });

  // Typing a rate that doesn't match the country switches to "Otra tasa"
  rateInput.addEventListener("input", () => {
    const country = COUNTRIES.find((c) => c.code === countrySelect.value);
    if (country.rate !== null && Number(rateInput.value) !== country.rate) {
      countrySelect.value = "custom";
      updateLabels();
    }
    CalculatorUtils.clearResults();
  });

  amountInput.focus();
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
