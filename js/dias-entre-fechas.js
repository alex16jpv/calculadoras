// Days Between Dates Calculator

// Calculator state
let calculatorType = "difference";

// DOM elements
const form = document.getElementById("datesForm");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const includeEnd = document.getElementById("includeEnd");
const differenceInputs = document.getElementById("differenceInputs");
const addInputs = document.getElementById("addInputs");
const operationSelect = document.getElementById("operationSelect");
const amountInput = document.getElementById("amountInput");
const unitSelect = document.getElementById("unitSelect");
const resultSubtitle = document.getElementById("resultSubtitle");
const summaryGrid = document.getElementById("summaryGrid");

const DAY_MS = 86400000;
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const num = (value) => CalculatorUtils.formatNumber(value);

// Date helpers working in UTC so daylight saving time never shifts a day
const DateUtils = {
  parse(value, fieldName) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) throw new Error(`Selecciona una ${fieldName} válida`);
    return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  },

  toInputValue(date) {
    return date.toISOString().slice(0, 10);
  },

  today() {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  },

  format(date) {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  },

  daysInMonth(year, month) {
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  },

  addDays(date, days) {
    return new Date(date.getTime() + days * DAY_MS);
  },

  // Add months keeping the day, clamped to the last day of the target month
  addMonths(date, months) {
    const totalMonths = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
    const year = Math.floor(totalMonths / 12);
    const month = totalMonths - year * 12;
    const day = Math.min(date.getUTCDate(), this.daysInMonth(year, month));
    return new Date(Date.UTC(year, month, day));
  },

  // Calendar difference in years, months and days (from <= to)
  calendarDifference(from, to) {
    let years = to.getUTCFullYear() - from.getUTCFullYear();
    let months = to.getUTCMonth() - from.getUTCMonth();
    let days = to.getUTCDate() - from.getUTCDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = (to.getUTCMonth() + 11) % 12;
      const previousYear = to.getUTCMonth() === 0 ? to.getUTCFullYear() - 1 : to.getUTCFullYear();
      days += this.daysInMonth(previousYear, previousMonth);
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years, months, days };
  },

  isWeekend(date) {
    const day = date.getUTCDay();
    return day === 0 || day === 6;
  },

  // Monday-Friday days in [from, to)
  businessDaysBetween(from, to) {
    const totalDays = Math.round((to - from) / DAY_MS);
    const fullWeeks = Math.floor(totalDays / 7);
    let count = fullWeeks * 5;
    for (let i = fullWeeks * 7; i < totalDays; i++) {
      if (!this.isWeekend(this.addDays(from, i))) count++;
    }
    return count;
  },

  // Move a number of Monday-Friday days forward or backward
  addBusinessDays(date, amount, direction) {
    let current = date;
    let remaining = amount;
    while (remaining > 0) {
      current = this.addDays(current, direction);
      if (!this.isWeekend(current)) remaining--;
    }
    return current;
  },
};

// Plural helper: 1 día / 2 días
function plural(value, singular, pluralForm) {
  return `${num(value)} ${Math.abs(value) === 1 ? singular : pluralForm}`;
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

// Change calculation type
function changeType(type) {
  calculatorType = type;
  CalculatorUtils.updateTypeButtons(type);
  differenceInputs.hidden = type !== "difference";
  addInputs.hidden = type !== "add";
  CalculatorUtils.clearResults();
}

// Days between two dates
function calculateDifference() {
  const start = DateUtils.parse(startDate.value, "fecha inicial");
  const end = DateUtils.parse(endDate.value, "fecha final");

  const reversed = end < start;
  const from = reversed ? end : start;
  let to = reversed ? start : end;
  if (includeEnd.checked) to = DateUtils.addDays(to, 1);

  const days = Math.round((to - from) / DAY_MS);
  const calendar = DateUtils.calendarDifference(from, to);
  const businessDays = DateUtils.businessDaysBetween(from, to);
  const weeks = Math.floor(days / 7);

  CalculatorUtils.displayResultValue(plural(days, "día", "días"));
  resultSubtitle.textContent = reversed
    ? "La fecha final es anterior a la inicial; se muestra la diferencia absoluta"
    : includeEnd.checked
    ? "Incluyendo la fecha inicial y la final"
    : "Diferencia entre las dos fechas";

  const calendarParts = [];
  if (calendar.years) calendarParts.push(plural(calendar.years, "año", "años"));
  if (calendar.months) calendarParts.push(plural(calendar.months, "mes", "meses"));
  if (calendar.days || calendarParts.length === 0) calendarParts.push(plural(calendar.days, "día", "días"));

  renderSummary([
    { label: "Años, meses y días", value: calendarParts.join(", ") },
    { label: "Semanas", value: `${plural(weeks, "semana", "semanas")}${days % 7 ? ` y ${plural(days % 7, "día", "días")}` : ""}` },
    { label: "Días hábiles (L-V)", value: num(businessDays) },
    { label: "Fines de semana", value: plural(days - businessDays, "día", "días") },
    { label: "Horas", value: num(days * 24) },
    { label: "Minutos", value: num(days * 1440) },
  ]);

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: "Fechas del cálculo:",
      formula: `Desde: ${DateUtils.format(from)}\nHasta: ${DateUtils.format(reversed ? start : end)}`,
    },
    {
      number: 2,
      content: "Restamos las fechas y convertimos la diferencia a días:",
      formula: includeEnd.checked
        ? `${num(days - 1)} días de diferencia + 1 (día final incluido) = ${num(days)} días`
        : `${num(days)} días`,
    },
    {
      number: 3,
      content: "Días hábiles: contamos solo de lunes a viernes:",
      formula: `${num(weeks)} semanas completas × 5 + días sueltos = ${num(businessDays)} días hábiles`,
    },
  ]);
}

// Add or subtract a period
function calculateAddition() {
  const start = DateUtils.parse(startDate.value, "fecha inicial");
  const amount = CalculatorUtils.parseInteger(amountInput.value, "La cantidad", 0);
  const direction = Number(operationSelect.value);
  const unit = unitSelect.value;

  if (amount > 100000) {
    throw new Error("La cantidad máxima es 100,000");
  }

  let result;
  let description;
  switch (unit) {
    case "days":
      result = DateUtils.addDays(start, direction * amount);
      description = plural(amount, "día", "días");
      break;
    case "business":
      if (amount > 10000) throw new Error("La cantidad máxima de días hábiles es 10,000");
      result = DateUtils.addBusinessDays(start, amount, direction);
      description = plural(amount, "día hábil", "días hábiles");
      break;
    case "weeks":
      result = DateUtils.addDays(start, direction * amount * 7);
      description = plural(amount, "semana", "semanas");
      break;
    case "months":
      result = DateUtils.addMonths(start, direction * amount);
      description = plural(amount, "mes", "meses");
      break;
    case "years":
      result = DateUtils.addMonths(start, direction * amount * 12);
      description = plural(amount, "año", "años");
      break;
  }

  if (Number.isNaN(result.getTime()) || result.getUTCFullYear() < 1 || result.getUTCFullYear() > 9999) {
    throw new Error("La fecha resultante está fuera del rango permitido");
  }

  const calendarDays = Math.round((result - start) / DAY_MS);

  CalculatorUtils.displayResultValue(result.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
  resultSubtitle.textContent = DateUtils.format(result);

  renderSummary([
    { label: "Operación", value: `${direction > 0 ? "+" : "-"} ${description}` },
    { label: "Día de la semana", value: WEEKDAYS[result.getUTCDay()] },
    { label: "Días naturales", value: `${calendarDays > 0 ? "+" : ""}${num(calendarDays)}` },
  ]);

  const steps = [
    {
      number: 1,
      content: "Fecha de partida:",
      formula: DateUtils.format(start),
    },
    {
      number: 2,
      content: `${direction > 0 ? "Sumamos" : "Restamos"} ${description}:`,
      formula: `${DateUtils.toInputValue(start)} ${direction > 0 ? "+" : "-"} ${description} = ${DateUtils.toInputValue(result)}`,
    },
  ];
  if (unit === "business") {
    steps.push({
      number: 3,
      content: "Los sábados y domingos se saltan al contar días hábiles:",
      formula: `Equivale a ${plural(Math.abs(calendarDays), "día natural", "días naturales")}`,
    });
  }
  if (unit === "months" || unit === "years") {
    steps.push({
      number: steps.length + 1,
      content: "Si el día no existe en el mes resultante, se usa el último día de ese mes.",
      formula: null,
    });
  }
  CalculatorUtils.displaySteps(steps);
}

// Load example
function loadExample(exampleId) {
  const today = DateUtils.today();
  const year = today.getUTCFullYear();

  switch (exampleId) {
    case "newYear":
      changeType("difference");
      startDate.value = DateUtils.toInputValue(today);
      endDate.value = `${year + 1}-01-01`;
      includeEnd.checked = false;
      break;
    case "vacation":
      changeType("difference");
      startDate.value = `${year}-07-15`;
      endDate.value = `${year}-07-30`;
      includeEnd.checked = true;
      break;
    case "deadline":
      changeType("add");
      startDate.value = DateUtils.toInputValue(today);
      operationSelect.value = "1";
      amountInput.value = 15;
      unitSelect.value = "business";
      break;
    case "pregnancy":
      changeType("add");
      startDate.value = DateUtils.toInputValue(today);
      operationSelect.value = "1";
      amountInput.value = 280;
      unitSelect.value = "days";
      break;
    default:
      return;
  }
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  if (calculatorType === "difference") calculateDifference();
  else calculateAddition();
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const today = DateUtils.toInputValue(DateUtils.today());
  startDate.value = today;

  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([startDate, endDate, amountInput]);
  [includeEnd, operationSelect, unitSelect].forEach((el) =>
    el.addEventListener("change", () => CalculatorUtils.clearResults())
  );
});

// Make functions globally available for onclick handlers
window.changeType = changeType;
window.loadExample = loadExample;
