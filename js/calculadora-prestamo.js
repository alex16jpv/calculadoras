// Loan Calculator (fixed installment / French amortization)

// DOM elements
const form = document.getElementById("loanForm");
const amountInput = document.getElementById("amountInput");
const rateInput = document.getElementById("rateInput");
const rateTypeSelect = document.getElementById("rateTypeSelect");
const termInput = document.getElementById("termInput");
const termUnitSelect = document.getElementById("termUnitSelect");
const summaryGrid = document.getElementById("summaryGrid");
const amortizationTable = document.getElementById("amortizationTable");

const MAX_MONTHS = 600;

// Short aliases for formatting
const money = (value) => CalculatorUtils.formatCurrency(value);
const pct = (value, decimals = 4) => `${CalculatorUtils.formatNumber(value * 100, decimals)}%`;

// Loan math
const LoanCalculator = {
  // Monthly rate from an annual rate
  monthlyRate(annualRate, type) {
    return type === "effective" ? Math.pow(1 + annualRate, 1 / 12) - 1 : annualRate / 12;
  },

  // Fixed installment: P × i / (1 - (1 + i)^-n)
  payment(principal, monthlyRate, months) {
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  },

  schedule(principal, monthlyRate, months, payment) {
    const rows = [];
    let balance = principal;
    for (let month = 1; month <= months; month++) {
      const interest = balance * monthlyRate;
      // Last row absorbs rounding so the balance ends exactly at zero
      const principalPart = month === months ? balance : payment - interest;
      balance -= principalPart;
      rows.push({ month, payment: principalPart + interest, interest, principal: principalPart, balance: Math.max(0, balance) });
    }
    return rows;
  },
};

// Load example
function loadExample(exampleId) {
  const examples = {
    consumer: { amount: 10000, rate: 24, type: "effective", term: 24, unit: "months" },
    car: { amount: 25000, rate: 12, type: "nominal", term: 5, unit: "years" },
    mortgage: { amount: 150000, rate: 9, type: "nominal", term: 20, unit: "years" },
    zero: { amount: 1200, rate: 0, type: "nominal", term: 12, unit: "months" },
  };
  const example = examples[exampleId];
  if (!example) return;

  amountInput.value = example.amount;
  rateInput.value = example.rate;
  rateTypeSelect.value = example.type;
  termInput.value = example.term;
  termUnitSelect.value = example.unit;
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const amount = CalculatorUtils.validateInput(amountInput.value, "Monto del préstamo");
  const ratePercent = CalculatorUtils.validateInput(rateInput.value, "Tasa de interés");
  const term = CalculatorUtils.parseInteger(termInput.value, "El plazo", 1);
  const months = termUnitSelect.value === "years" ? term * 12 : term;
  const rateType = rateTypeSelect.value;

  if (amount <= 0) throw new Error("El monto del préstamo debe ser mayor que cero");
  if (ratePercent > 200) throw new Error("La tasa anual no puede superar el 200%");
  if (months > MAX_MONTHS) throw new Error("El plazo máximo es de 50 años (600 meses)");

  const annualRate = ratePercent / 100;
  const monthlyRate = LoanCalculator.monthlyRate(annualRate, rateType);
  const payment = LoanCalculator.payment(amount, monthlyRate, months);
  const rows = LoanCalculator.schedule(amount, monthlyRate, months, payment);
  const totalPaid = payment * months;
  const totalInterest = totalPaid - amount;
  const effectiveAnnual = Math.pow(1 + monthlyRate, 12) - 1;

  CalculatorUtils.displayResultValue(money(payment));

  summaryGrid.innerHTML = [
    { label: "Total a pagar", value: money(totalPaid) },
    { label: "Total intereses", value: money(totalInterest) },
    { label: "Número de cuotas", value: CalculatorUtils.formatNumber(months) },
    { label: "Tasa mensual", value: pct(monthlyRate) },
    { label: "Tasa efectiva anual", value: pct(effectiveAnnual, 2) },
  ]
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  const principalShare = (amount / totalPaid) * 100;
  document.getElementById("barPrincipal").style.width = `${principalShare}%`;
  document.getElementById("barInterest").style.width = `${100 - principalShare}%`;

  amortizationTable.innerHTML = rows
    .map(
      (row) => `
      <tr>
        <td>${row.month}</td>
        <td>${money(row.payment)}</td>
        <td>${money(row.interest)}</td>
        <td>${money(row.principal)}</td>
        <td>${money(row.balance)}</td>
      </tr>`
    )
    .join("");

  const steps = [
    {
      number: 1,
      content: "Convertimos la tasa anual en tasa mensual:",
      formula:
        rateType === "effective"
          ? `i = (1 + ${CalculatorUtils.formatNumber(annualRate, 6)})^(1/12) - 1 = ${pct(monthlyRate)}`
          : `i = ${CalculatorUtils.formatNumber(ratePercent, 4)}% ÷ 12 = ${pct(monthlyRate)}`,
    },
  ];

  if (monthlyRate === 0) {
    steps.push({
      number: 2,
      content: "Sin intereses, la cuota es el monto dividido entre el número de cuotas:",
      formula: `Cuota = ${money(amount)} ÷ ${months} = ${money(payment)}`,
    });
  } else {
    steps.push({
      number: 2,
      content: "Aplicamos la fórmula de cuota fija (sistema francés):",
      formula: `Cuota = P × i ÷ (1 - (1 + i)^-n)\nCuota = ${money(amount)} × ${CalculatorUtils.formatNumber(monthlyRate, 6)} ÷ (1 - (1 + ${CalculatorUtils.formatNumber(monthlyRate, 6)})^-${months})\nCuota = ${money(payment)}`,
    });
  }

  steps.push({
    number: 3,
    content: "Primer mes: la cuota se divide entre intereses y abono a capital:",
    formula: `Interés = ${money(amount)} × ${pct(monthlyRate)} = ${money(rows[0].interest)}\nCapital = ${money(payment)} - ${money(rows[0].interest)} = ${money(rows[0].principal)}`,
  });
  steps.push({
    number: 4,
    content: "Costo total del crédito:",
    formula: `${money(payment)} × ${months} cuotas = ${money(totalPaid)}\nIntereses = ${money(totalPaid)} - ${money(amount)} = ${money(totalInterest)}`,
  });

  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([amountInput, rateInput, termInput]);
  [rateTypeSelect, termUnitSelect].forEach((select) =>
    select.addEventListener("change", () => CalculatorUtils.clearResults())
  );
  amountInput.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
