// Time Zone Converter

// DOM elements
const form = document.getElementById("timezoneForm");
const dateInput = document.getElementById("dateInput");
const timeInput = document.getElementById("timeInput");
const fromZone = document.getElementById("fromZone");
const toZone = document.getElementById("toZone");
const resultSubtitle = document.getElementById("resultSubtitle");
const summaryGrid = document.getElementById("summaryGrid");
const worldTable = document.getElementById("worldTable");

// IANA zones with Spanish labels
const ZONES = [
  { id: "UTC", name: "UTC (Tiempo Universal)" },
  { id: "America/Mexico_City", name: "Ciudad de México" },
  { id: "America/Bogota", name: "Bogotá" },
  { id: "America/Lima", name: "Lima" },
  { id: "America/Guayaquil", name: "Quito / Guayaquil" },
  { id: "America/Panama", name: "Panamá" },
  { id: "America/Guatemala", name: "Guatemala / Centroamérica" },
  { id: "America/Havana", name: "La Habana" },
  { id: "America/Santo_Domingo", name: "Santo Domingo" },
  { id: "America/Puerto_Rico", name: "San Juan (Puerto Rico)" },
  { id: "America/Caracas", name: "Caracas" },
  { id: "America/La_Paz", name: "La Paz" },
  { id: "America/Santiago", name: "Santiago de Chile" },
  { id: "America/Asuncion", name: "Asunción" },
  { id: "America/Argentina/Buenos_Aires", name: "Buenos Aires" },
  { id: "America/Montevideo", name: "Montevideo" },
  { id: "America/Sao_Paulo", name: "São Paulo" },
  { id: "America/New_York", name: "Nueva York / Miami" },
  { id: "America/Chicago", name: "Chicago / Houston" },
  { id: "America/Denver", name: "Denver" },
  { id: "America/Los_Angeles", name: "Los Ángeles" },
  { id: "America/Toronto", name: "Toronto" },
  { id: "Europe/Madrid", name: "Madrid" },
  { id: "Atlantic/Canary", name: "Islas Canarias" },
  { id: "Europe/London", name: "Londres" },
  { id: "Europe/Paris", name: "París" },
  { id: "Europe/Berlin", name: "Berlín" },
  { id: "Europe/Rome", name: "Roma" },
  { id: "Europe/Moscow", name: "Moscú" },
  { id: "Africa/Cairo", name: "El Cairo" },
  { id: "Asia/Dubai", name: "Dubái" },
  { id: "Asia/Kolkata", name: "India (Nueva Delhi)" },
  { id: "Asia/Shanghai", name: "Pekín / Shanghái" },
  { id: "Asia/Tokyo", name: "Tokio" },
  { id: "Asia/Seoul", name: "Seúl" },
  { id: "Australia/Sydney", name: "Sídney" },
  { id: "Pacific/Auckland", name: "Auckland" },
];

// Cities always shown in the comparison table
const WORLD_CLOCK = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "Europe/Madrid",
  "Europe/London",
  "Asia/Tokyo",
];

const zoneName = (id) => ZONES.find((zone) => zone.id === id)?.name || id;

// Time zone math based on the browser's Intl database
const TimeZoneUtils = {
  // Offset (minutes east of UTC) of a zone at a given instant
  offsetMinutes(timeZone, instant) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(instant));
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    return Math.round((asUtc - Math.floor(instant / 1000) * 1000) / 60000);
  },

  // Instant for a wall clock time in a zone (handles daylight saving time)
  toInstant(year, month, day, hour, minute, timeZone) {
    const guess = Date.UTC(year, month - 1, day, hour, minute);
    let instant = guess - this.offsetMinutes(timeZone, guess) * 60000;
    // Second pass in case the first guess crossed a DST change
    instant = guess - this.offsetMinutes(timeZone, instant) * 60000;
    return instant;
  },

  formatOffset(minutes) {
    const sign = minutes >= 0 ? "+" : "-";
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = abs % 60;
    return `UTC${sign}${hours}${mins ? `:${String(mins).padStart(2, "0")}` : ""}`;
  },

  formatTime(instant, timeZone) {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(instant));
  },

  formatDate(instant, timeZone) {
    return new Intl.DateTimeFormat("es-ES", {
      timeZone,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(instant));
  },

  // Calendar day number in a zone, to detect "next day" / "previous day"
  dayNumber(instant, timeZone) {
    const offset = this.offsetMinutes(timeZone, instant);
    return Math.floor((instant + offset * 60000) / 86400000);
  },
};

// Fill zone selectors, preselecting the device zone when it is in the list
function populateZones() {
  const options = ZONES.map((zone) => `<option value="${zone.id}">${zone.name}</option>`).join("");
  fromZone.innerHTML = options;
  toZone.innerHTML = options;

  const deviceZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  fromZone.value = ZONES.some((zone) => zone.id === deviceZone) ? deviceZone : "America/Bogota";
  toZone.value = fromZone.value === "Europe/Madrid" ? "America/Mexico_City" : "Europe/Madrid";
}

// Fill date and time with the current moment in the origin zone
function setNow() {
  const now = Date.now();
  const offset = TimeZoneUtils.offsetMinutes(fromZone.value, now);
  const local = new Date(now + offset * 60000).toISOString();
  dateInput.value = local.slice(0, 10);
  timeInput.value = local.slice(11, 16);
  CalculatorUtils.clearResults();
}

// Swap origin and destination zones
function swapZones() {
  [fromZone.value, toZone.value] = [toZone.value, fromZone.value];
  CalculatorUtils.clearResults();
}

// Describe a day shift
function dayShiftLabel(shift) {
  if (shift === 0) return "mismo día";
  if (shift === 1) return "día siguiente";
  if (shift === -1) return "día anterior";
  return `${shift > 0 ? "+" : ""}${shift} días`;
}

// Load example
function loadExample(time, from, to) {
  if (!dateInput.value) setNow();
  timeInput.value = time;
  fromZone.value = from;
  toZone.value = to;
  CalculatorUtils.submitForm(form);
}

// Calculation callback for form submission
async function performCalculation() {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput.value);
  const timeMatch = /^(\d{2}):(\d{2})/.exec(timeInput.value);
  if (!dateMatch) throw new Error("Selecciona una fecha válida");
  if (!timeMatch) throw new Error("Selecciona una hora válida");

  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hour, minute] = timeMatch.slice(1).map(Number);
  const from = fromZone.value;
  const to = toZone.value;

  const instant = TimeZoneUtils.toInstant(year, month, day, hour, minute, from);
  const fromOffset = TimeZoneUtils.offsetMinutes(from, instant);
  const toOffset = TimeZoneUtils.offsetMinutes(to, instant);
  const difference = (toOffset - fromOffset) / 60;
  const shift = TimeZoneUtils.dayNumber(instant, to) - TimeZoneUtils.dayNumber(instant, from);

  // Warn when the entered time does not exist (skipped by a DST change)
  const roundTrip = TimeZoneUtils.formatTime(instant, from);
  const entered = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  CalculatorUtils.displayResultValue(TimeZoneUtils.formatTime(instant, to));
  resultSubtitle.textContent = `${zoneName(to)} · ${TimeZoneUtils.formatDate(instant, to)} (${dayShiftLabel(shift)})`;

  const differenceText =
    difference === 0
      ? "Misma hora"
      : `${difference > 0 ? "+" : ""}${CalculatorUtils.formatNumber(difference, 2)} h`;

  summaryGrid.innerHTML = [
    { label: `Origen (${zoneName(from)})`, value: `${entered} · ${TimeZoneUtils.formatOffset(fromOffset)}` },
    { label: `Destino (${zoneName(to)})`, value: `${TimeZoneUtils.formatTime(instant, to)} · ${TimeZoneUtils.formatOffset(toOffset)}` },
    { label: "Diferencia horaria", value: differenceText },
  ]
    .map(
      (item) => `
      <div class="result-item">
        <div class="result-item-label">${item.label}</div>
        <div class="result-item-value">${item.value}</div>
      </div>`
    )
    .join("");

  const tableZones = [...new Set([from, to, ...WORLD_CLOCK])];
  worldTable.innerHTML = tableZones
    .map((zone) => {
      const zoneShift = TimeZoneUtils.dayNumber(instant, zone) - TimeZoneUtils.dayNumber(instant, from);
      return `
      <tr class="${zone === to ? "highlight" : ""}">
        <td>${zoneName(zone)}</td>
        <td>${TimeZoneUtils.formatTime(instant, zone)}${zoneShift ? ` <small>(${dayShiftLabel(zoneShift)})</small>` : ""}</td>
        <td>${TimeZoneUtils.formatOffset(TimeZoneUtils.offsetMinutes(zone, instant))}</td>
      </tr>`;
    })
    .join("");

  const steps = [
    {
      number: 1,
      content: `Convertimos la hora de ${zoneName(from)} a UTC:`,
      formula: `${entered} (${TimeZoneUtils.formatOffset(fromOffset)}) → ${TimeZoneUtils.formatTime(instant, "UTC")} UTC`,
    },
    {
      number: 2,
      content: `Aplicamos la diferencia de ${zoneName(to)}:`,
      formula: `${TimeZoneUtils.formatTime(instant, "UTC")} UTC ${toOffset >= 0 ? "+" : "-"} ${CalculatorUtils.formatNumber(Math.abs(toOffset) / 60, 2)} h = ${TimeZoneUtils.formatTime(instant, to)}`,
    },
  ];
  if (roundTrip !== entered) {
    steps.push({
      number: 3,
      content: `⚠️ La hora ${entered} no existe en ${zoneName(from)} ese día por el cambio al horario de verano; se usó ${roundTrip}.`,
      formula: null,
    });
  }
  CalculatorUtils.displaySteps(steps);
  CalculatorUtils.showResults();
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  populateZones();
  setNow();
  CalculatorUtils.handleFormSubmission(form, performCalculation);
  CalculatorUtils.setupKeyboardShortcuts(form);
  CalculatorUtils.setupInputChangeListeners([dateInput, timeInput]);
  [fromZone, toZone].forEach((select) =>
    select.addEventListener("change", () => CalculatorUtils.clearResults())
  );
});

// Make functions globally available for onclick handlers
window.loadExample = loadExample;
window.setNow = setNow;
window.swapZones = swapZones;
