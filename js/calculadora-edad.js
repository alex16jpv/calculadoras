// Age Calculator

// DOM elements
const form = document.getElementById("ageForm");
const birthDate = document.getElementById("birthDate");
const referenceDate = document.getElementById("referenceDate");
const resultSubtitle = document.getElementById("resultSubtitle");
const birthdayCard = document.getElementById("birthdayCard");
const summaryGrid = document.getElementById("summaryGrid");

const DAY_MS = 86400000;
const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const num = (value) => CalculatorUtils.formatNumber(value);

// Date helpers in UTC so daylight saving time never shifts a day
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

  // Birthday in a given year. 29 Feb rolls over to 1 Mar in common years, which is
  // also the day calendarDifference() reports the new year of age.
  birthdayInYear(birth, year) {
    return new Date(Date.UTC(year, birth.getUTCMonth(), birth.getUTCDate()));
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
};

// Plural helper: 1 año / 2 años
function plural(value, singular, pluralForm) {
  return `${num(value)} ${value === 1 ? singular : pluralForm}`;
}

// Load example
function loadExample(birth, reference) {
  birthDate.value = birth;
  referenceDate.value = reference || DateUtils.toInputValue(DateUtils.today());
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const birth = DateUtils.parse(birthDate.value, "fecha de nacimiento");
  const reference = DateUtils.parse(referenceDate.value, "fecha de referencia");

  if (reference < birth) {
    throw new Error("La fecha de referencia debe ser posterior a la fecha de nacimiento");
  }

  const age = DateUtils.calendarDifference(birth, reference);
  const totalDays = Math.round((reference - birth) / DAY_MS);
  const totalMonths = age.years * 12 + age.months;

  // Next birthday on or after the reference date
  let nextBirthday = DateUtils.birthdayInYear(birth, reference.getUTCFullYear());
  if (nextBirthday < reference) {
    nextBirthday = DateUtils.birthdayInYear(birth, reference.getUTCFullYear() + 1);
  }
  const daysToBirthday = Math.round((nextBirthday - reference) / DAY_MS);
  const turning = nextBirthday.getUTCFullYear() - birth.getUTCFullYear();

  CalculatorUtils.displayResultValue(plural(age.years, "año", "años"));
  resultSubtitle.textContent = `${plural(age.years, "año", "años")}, ${plural(age.months, "mes", "meses")} y ${plural(age.days, "día", "días")}`;

  birthdayCard.innerHTML =
    daysToBirthday === 0
      ? `🎉 <strong>¡Feliz cumpleaños!</strong> Hoy cumple ${turning} años.`
      : `🎂 Faltan <strong>${plural(daysToBirthday, "día", "días")}</strong> para cumplir ${turning} años (${DateUtils.format(nextBirthday)}).`;

  summaryGrid.innerHTML = [
    { label: "Meses vividos", value: num(totalMonths) },
    { label: "Semanas vividas", value: num(Math.floor(totalDays / 7)) },
    { label: "Días vividos", value: num(totalDays) },
    { label: "Horas aproximadas", value: num(totalDays * 24) },
    { label: "Día de nacimiento", value: WEEKDAYS[birth.getUTCDay()] },
  ]
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  CalculatorUtils.displaySteps([
    {
      number: 1,
      content: "Fechas del cálculo:",
      formula: `Nacimiento: ${DateUtils.format(birth)}\nReferencia: ${DateUtils.format(reference)}`,
    },
    {
      number: 2,
      content: "Contamos años completos, luego meses completos y después los días restantes:",
      formula: `${plural(age.years, "año", "años")} + ${plural(age.months, "mes", "meses")} + ${plural(age.days, "día", "días")}`,
    },
    {
      number: 3,
      content: "Total de días entre ambas fechas (incluye años bisiestos):",
      formula: `${num(totalDays)} días`,
    },
  ]);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  referenceDate.value = DateUtils.toInputValue(DateUtils.today());
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([birthDate, referenceDate]);
  birthDate.focus();
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
