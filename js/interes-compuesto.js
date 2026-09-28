// Compound Interest Calculator

// DOM elements
const form = document.getElementById("compoundForm");
const principalInput = document.getElementById("principalInput");
const contributionInput = document.getElementById("contributionInput");
const rateInput = document.getElementById("rateInput");
const yearsInput = document.getElementById("yearsInput");
const frequencySelect = document.getElementById("frequencySelect");
const summaryGrid = document.getElementById("summaryGrid");
const yearTable = document.getElementById("yearTable");

// Short aliases for formatting
const money = (value) => CalculatorUtils.formatCurrency(value);
const fmt = (value, decimals = 4) => CalculatorUtils.formatNumber(value, decimals);

const frequencyNames = {
  1: "anual",
  2: "semestral",
  4: "trimestral",
  12: "mensual",
  365: "diaria",
};

// Compound interest engine
const CompoundInterest = {
  // Equivalent monthly rate for a nominal annual rate compounded n times per year
  monthlyRate(annualRate, compoundsPerYear) {
    return Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear / 12) - 1;
  },

  // Effective annual rate: (1 + r/n)^n - 1
  effectiveAnnualRate(annualRate, compoundsPerYear) {
    return Math.pow(1 + annualRate / compoundsPerYear, compoundsPerYear) - 1;
  },

  // Month by month simulation (contributions at the end of each month)
  project(principal, monthlyContribution, annualRate, compoundsPerYear, months) {
    const rate = this.monthlyRate(annualRate, compoundsPerYear);
    let balance = principal;
    let contributed = principal;
    const years = [];

    for (let month = 1; month <= months; month++) {
      balance = balance * (1 + rate) + monthlyContribution;
      contributed += monthlyContribution;

      if (month % 12 === 0 || month === months) {
        years.push({
          label: month % 12 === 0 ? String(month / 12) : `${fmt(month / 12, 2)}`,
          contributed,
          interest: balance - contributed,
          balance,
        });
      }
    }

    return {
      finalAmount: balance,
      totalContributed: contributed,
      totalInterest: balance - contributed,
      monthlyRate: rate,
      years,
    };
  },
};

// Generate step by step explanation
function generateSteps(data, result) {
  const { principal, contribution, rate, compounds, years } = data;
  const periods = compounds * years;
  const steps = [
    {
      number: 1,
      content: `Con capitalización ${frequencyNames[compounds]}, dividimos la tasa anual entre ${compounds} periodos:`,
      formula: `r/n = ${fmt(rate * 100)}% ÷ ${compounds} = ${fmt((rate / compounds) * 100, 6)}% por periodo`,
    },
    {
      number: 2,
      content: "Calculamos el crecimiento del capital inicial:",
      formula: `M = ${money(principal)} × (1 + ${fmt(rate / compounds, 6)})^${fmt(periods, 2)}\nM = ${money(principal * Math.pow(1 + rate / compounds, periods))}`,
    },
  ];

  if (contribution > 0) {
    steps.push({
      number: 3,
      content: "Sumamos el valor futuro de los aportes mensuales (cada aporte crece desde el mes en que se deposita):",
      formula: `Tasa mensual equivalente = ${fmt(result.monthlyRate * 100, 6)}%\nAportes: ${money(contribution)} × ${Math.round(years * 12)} meses = ${money(contribution * Math.round(years * 12))}`,
    });
  }

  steps.push({
    number: steps.length + 1,
    content: "Resultado:",
    formula: `Monto final = ${money(result.finalAmount)}\nIntereses ganados = ${money(result.finalAmount)} - ${money(result.totalContributed)} = ${money(result.totalInterest)}`,
  });

  steps.push({
    number: steps.length + 1,
    content: "Tasa efectiva anual equivalente:",
    formula: `TEA = (1 + ${fmt(rate / compounds, 6)})^${compounds} - 1 = ${fmt(CompoundInterest.effectiveAnnualRate(rate, compounds) * 100)}%`,
  });

  return steps;
}

// Display results
function displayResults(data, result) {
  CalculatorUtils.displayResultValue(money(result.finalAmount));

  const initialShare = result.finalAmount > 0 ? (data.principal / result.finalAmount) * 100 : 0;
  const contributionsShare =
    result.finalAmount > 0 ? ((result.totalContributed - data.principal) / result.finalAmount) * 100 : 0;
  const interestShare = Math.max(0, 100 - initialShare - contributionsShare);

  const summary = [
    { label: "Capital inicial", value: money(data.principal) },
    { label: "Total aportes", value: money(result.totalContributed - data.principal) },
    { label: "Intereses ganados", value: money(result.totalInterest) },
    {
      label: "Tasa efectiva anual",
      value: `${fmt(CompoundInterest.effectiveAnnualRate(data.rate, data.compounds) * 100, 2)}%`,
    },
  ];

  summaryGrid.innerHTML = summary
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  document.getElementById("barPrincipal").style.width = `${initialShare}%`;
  document.getElementById("barContributions").style.width = `${contributionsShare}%`;
  document.getElementById("barInterest").style.width = `${interestShare}%`;

  yearTable.innerHTML = result.years
    .map(
      (row) => `
      <tr>
        <td>${row.label}</td>
        <td>${money(row.contributed)}</td>
        <td>${money(row.interest)}</td>
        <td>${money(row.balance)}</td>
      </tr>`
    )
    .join("");

  CalculatorUtils.displaySteps(generateSteps(data, result));
  CalculatorUtils.showResults();
}

// Load example
function loadExample(exampleId) {
  const examples = {
    savings: { principal: 1000, contribution: 200, rate: 7, years: 20, compounds: 12 },
    cdt: { principal: 10000, contribution: 0, rate: 10, years: 3, compounds: 4 },
    retirement: { principal: 0, contribution: 300, rate: 8, years: 30, compounds: 12 },
    double: { principal: 5000, contribution: 0, rate: 6, years: 12, compounds: 1 },
  };

  const example = examples[exampleId];
  if (!example) return;

  principalInput.value = example.principal;
  contributionInput.value = example.contribution;
  rateInput.value = example.rate;
  yearsInput.value = example.years;
  frequencySelect.value = String(example.compounds);

  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const principal = CalculatorUtils.validateInput(principalInput.value, "Capital inicial");
  const contribution =
    contributionInput.value.trim() === ""
      ? 0
      : CalculatorUtils.validateInput(contributionInput.value, "Aporte mensual");
  const ratePercent = CalculatorUtils.validateInput(rateInput.value, "Tasa de interés");
  const years = CalculatorUtils.validateInput(yearsInput.value, "Plazo");
  const compounds = Number(frequencySelect.value);

  if (years <= 0 || years > 100) {
    throw new Error("El plazo debe estar entre 0 y 100 años");
  }
  if (principal === 0 && contribution === 0) {
    throw new Error("Ingresa un capital inicial o un aporte mensual mayor que cero");
  }
  if (ratePercent > 1000) {
    throw new Error("La tasa de interés no puede superar el 1000% anual");
  }

  const months = Math.max(1, Math.round(years * 12));
  const data = { principal, contribution, rate: ratePercent / 100, compounds, years };
  const result = CompoundInterest.project(principal, contribution, data.rate, compounds, months);

  if (!Number.isFinite(result.finalAmount)) {
    throw new Error("El resultado es demasiado grande. Revisa la tasa y el plazo.");
  }

  displayResults(data, result);
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([
    principalInput,
    contributionInput,
    rateInput,
    yearsInput,
  ]);
  frequencySelect.addEventListener("change", () => CalculatorUtils.clearResults());

  principalInput.focus();

  const exampleParam = new URLSearchParams(window.location.search).get("example");
  if (exampleParam) loadExample(exampleParam);
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
