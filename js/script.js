// Calculator Hub JavaScript - Main functionality

// DOM Elements
const searchInput = document.getElementById("searchInput");
// const categoriesContainer = document.getElementById("categoriesContainer");
const categories = document.querySelectorAll(".category");
// const calculatorCards = document.querySelectorAll(".calculator-card");
const noResults = document.querySelector(".no-results");
// const loadingElement = document.querySelector(".loading");

// Calculator data structure for enhanced search
const calculatorData = [
  // Mathematics
  {
    category: "matematicas",
    title: "Regla de Tres",
    keywords: ["proporcion", "directa", "inversa", "regla", "tres"],
    url: "/regla-de-tres.html",
  },
  {
    category: "matematicas",
    title: "Calculadora de Porcentajes",
    keywords: ["porcentaje", "descuento", "aumento", "porciento", "%"],
    url: "/porcentaje-calculadora.html",
  },
  {
    category: "matematicas",
    title: "Verificador de Números Primos",
    keywords: ["primo", "numero", "divisor", "compuesto"],
    url: "/numero-primo.html",
  },
  {
    category: "matematicas",
    title: "Aritmética Básica",
    keywords: ["suma", "resta", "multiplicacion", "division", "calculadora"],
    url: "/aritmetica-basica.html",
  },
  {
    category: "matematicas",
    title: "Raíz Cuadrada y Potencias",
    keywords: ["raiz", "cuadrada", "potencia", "exponente", "sqrt"],
    url: "/raiz-potencia.html",
  },
  {
    category: "matematicas",
    title: "Cálculo de Factorial",
    keywords: ["factorial", "permutacion", "matematica"],
    url: "/factorial.html",
  },
  {
    category: "matematicas",
    title: "MCM y MCD",
    keywords: [
      "mcm",
      "mcd",
      "minimo",
      "comun",
      "multiplo",
      "divisor",
      "maximo",
    ],
    url: "/mcm-mcd.html",
  },
  {
    category: "matematicas",
    title: "Combinaciones y Permutaciones",
    keywords: ["combinacion", "permutacion", "combinatoria", "probabilidad"],
    url: "/combinaciones-permutaciones.html",
  },
  // Finance
  {
    category: "finanzas",
    title: "Impuesto 4x1000",
    keywords: [
      "4x1000",
      "impuesto",
      "colombia",
      "transaccion",
      "financiera",
      "gravamen",
    ],
    url: "https://calculadora4x1000.alexpiral.com",
    external: true,
  },
  {
    category: "finanzas",
    title: "Interés Simple",
    keywords: ["interes", "simple", "prestamo", "inversion", "tasa"],
    url: "/interes-simple.html",
  },
  {
    category: "finanzas",
    title: "Interés Compuesto",
    keywords: ["interes", "compuesto", "inversion", "ahorro", "rendimiento"],
    url: "/interes-compuesto.html",
  },
  // Conversions
  {
    category: "conversiones",
    title: "Conversión de Bases",
    keywords: [
      "binario",
      "decimal",
      "hexadecimal",
      "octal",
      "conversion",
      "base",
    ],
    url: "/conversion-bases.html",
  },
  {
    category: "conversiones",
    title: "Fracciones a Decimales",
    keywords: ["fraccion", "decimal", "conversion", "quebrado"],
    url: "/fracciones-decimales.html",
  },
  {
    category: "conversiones",
    title: "Conversión de Temperatura",
    keywords: ["temperatura", "celsius", "fahrenheit", "kelvin", "grados"],
    url: "/conversion-temperatura.html",
  },
  {
    category: "conversiones",
    title: "Conversión de Longitud",
    keywords: [
      "longitud",
      "metros",
      "pies",
      "pulgadas",
      "kilometros",
      "millas",
    ],
    url: "/conversion-longitud.html",
  },
  // Health
  {
    category: "salud",
    title: "Índice de Masa Corporal (IMC)",
    keywords: [
      "imc",
      "peso",
      "altura",
      "masa",
      "corporal",
      "salud",
      "obesidad",
    ],
    url: "/calculadora-imc.html",
  },
  {
    category: "salud",
    title: "Calorías Diarias",
    keywords: ["calorias", "dieta", "nutricion", "metabolismo", "tmb"],
    url: "/calorias-diarias.html",
  },
  {
    category: "salud",
    title: "Frecuencia Cardíaca Ideal",
    keywords: ["frecuencia", "cardiaca", "pulso", "ejercicio", "corazon"],
    url: "/frecuencia-cardiaca.html",
  },
  // Date and Time
  {
    category: "fechas",
    title: "Días Entre Fechas",
    keywords: ["dias", "fecha", "diferencia", "calendario", "tiempo"],
    url: "/dias-entre-fechas.html",
  },
  {
    category: "fechas",
    title: "Calculadora de Edad",
    keywords: ["edad", "años", "nacimiento", "cumpleaños", "fecha"],
    url: "/calculadora-edad.html",
  },
  {
    category: "fechas",
    title: "Conversor de Zona Horaria",
    keywords: ["zona", "horaria", "tiempo", "reloj", "mundial", "utc"],
    url: "/zona-horaria.html",
  },
];

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initializeSearch();
  //   initializeSmoothScroll();
  initializeKeyboardNavigation();
  //   initializeAnalytics();
  checkUrlParameters();
});

// Search functionality
function initializeSearch() {
  if (!searchInput) return;

  // Debounce function for search
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value);
    }, 300);
  });

  // Clear search on Escape
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      performSearch("");
      searchInput.blur();
    }
  });
}

function performSearch(query) {
  const normalizedQuery = normalizeText(query);

  if (normalizedQuery === "") {
    showAllContent();
    return;
  }

  let hasResults = false;
  const searchTerms = normalizedQuery
    .split(" ")
    .filter((term) => term.length > 0);

  // Search through categories
  categories.forEach((category) => {
    const categoryCards = category.querySelectorAll(".calculator-card");
    let categoryHasResults = false;

    categoryCards.forEach((card) => {
      const cardData = getCardData(card);
      const matchScore = calculateMatchScore(cardData, searchTerms);

      if (matchScore > 0) {
        card.style.display = "block";
        card.dataset.matchScore = matchScore;
        categoryHasResults = true;
        hasResults = true;
      } else {
        card.style.display = "none";
      }
    });

    // Show/hide category
    category.style.display = categoryHasResults ? "block" : "none";

    // Sort cards by match score within category
    if (categoryHasResults) {
      sortCardsByRelevance(category);
    }
  });

  // Show no results message
  if (noResults) {
    if (!hasResults) {
      noResults.innerHTML = `
                <h3>No se encontraron resultados</h3>
                <p>No encontramos calculadoras que coincidan con "<strong>${query}</strong>"</p>
                <p>Intenta con otros términos o navega por las categorías.</p>
            `;
      noResults.classList.add("active");
    } else {
      noResults.classList.remove("active");
    }
  }
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim();
}

function getCardData(card) {
  const title = card.querySelector(".calculator-title")?.textContent || "";
  const description =
    card.querySelector(".calculator-description")?.textContent || "";
  const tag = card.querySelector(".calculator-tag")?.textContent || "";
  const href = card.getAttribute("href") || "";

  // Find additional keywords from our data
  const calculatorInfo = calculatorData.find(
    (calc) =>
      calc.url === href || normalizeText(calc.title) === normalizeText(title)
  );

  return {
    title: normalizeText(title),
    description: normalizeText(description),
    tag: normalizeText(tag),
    keywords: calculatorInfo
      ? calculatorInfo.keywords.map((k) => normalizeText(k))
      : [],
  };
}

function calculateMatchScore(cardData, searchTerms) {
  let score = 0;

  searchTerms.forEach((term) => {
    // Title match (highest priority)
    if (cardData.title.includes(term)) {
      score += 10;
    }

    // Keyword match (high priority)
    if (cardData.keywords.some((keyword) => keyword.includes(term))) {
      score += 8;
    }

    // Tag match
    if (cardData.tag.includes(term)) {
      score += 5;
    }

    // Description match
    if (cardData.description.includes(term)) {
      score += 3;
    }
  });

  return score;
}

function sortCardsByRelevance(category) {
  const grid = category.querySelector(".calculator-grid");
  const cards = Array.from(
    grid.querySelectorAll('.calculator-card[style*="block"]')
  );

  cards.sort((a, b) => {
    const scoreA = parseInt(a.dataset.matchScore) || 0;
    const scoreB = parseInt(b.dataset.matchScore) || 0;
    return scoreB - scoreA;
  });

  cards.forEach((card) => grid.appendChild(card));
}

function showAllContent() {
  categories.forEach((category) => {
    category.style.display = "block";
    const cards = category.querySelectorAll(".calculator-card");
    cards.forEach((card) => {
      card.style.display = "block";
      delete card.dataset.matchScore;
    });
  });

  if (noResults) {
    noResults.classList.remove("active");
  }
}

// Smooth scroll
// function initializeSmoothScroll() {
//   document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
//     anchor.addEventListener("click", function (e) {
//       e.preventDefault();
//       const targetId = this.getAttribute("href");
//       const target = document.querySelector(targetId);

//       if (target) {
//         target.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         });
//       }
//     });
//   });
// }

// Keyboard navigation
function initializeKeyboardNavigation() {
  //   let focusableElements = [];

  //   // Update focusable elements list
  //   function updateFocusableElements() {
  //     focusableElements = Array.from(
  //       document.querySelectorAll(
  //         'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  //       )
  //     ).filter((el) => el.offsetParent !== null);
  //   }

  //   updateFocusableElements();

  // Handle keyboard navigation
  document.addEventListener("keydown", (e) => {
    // if (e.key === "Tab") {
    //   updateFocusableElements();
    // }

    // Quick search shortcut (Ctrl/Cmd + K)
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      searchInput?.focus();
    }
  });
}

// Analytics placeholder
// function initializeAnalytics() {
//   // Track calculator clicks
//   document.addEventListener("click", (e) => {
//     const card = e.target.closest(".calculator-card");
//     if (card) {
//       const calculatorName =
//         card.querySelector(".calculator-title")?.textContent;
//       const category = card.closest(".category")?.dataset.category;

//       // Analytics tracking placeholder
//       console.log("Calculator accessed:", {
//         name: calculatorName,
//         category: category,
//         timestamp: new Date().toISOString(),
//       });

//       // Store in sessionStorage for usage stats
//       updateUsageStats(calculatorName);
//     }
//   });
// }

// function updateUsageStats(calculatorName) {
//   const stats = JSON.parse(sessionStorage.getItem("calculatorStats") || "{}");
//   stats[calculatorName] = (stats[calculatorName] || 0) + 1;
//   sessionStorage.setItem("calculatorStats", JSON.stringify(stats));
// }

// Check URL parameters for direct navigation
function checkUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q");
  const categoryFilter = urlParams.get("category");

  if (searchQuery && searchInput) {
    searchInput.value = searchQuery;
    performSearch(searchQuery);
  }

  if (categoryFilter) {
    scrollToCategory(categoryFilter);
  }
}

function scrollToCategory(categoryName) {
  const category = document.querySelector(`[data-category="${categoryName}"]`);
  if (category) {
    category.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Progressive enhancement for external links
document.querySelectorAll('a[target="_blank"]').forEach((link) => {
  link.setAttribute("rel", "noopener noreferrer");

  // Add external link indicator
  const externalIcon = document.createElement("span");
  externalIcon.textContent = " ↗";
  externalIcon.setAttribute("aria-label", "Se abre en una nueva ventana");
  link.appendChild(externalIcon);
});

// Export functions for testing
// if (typeof module !== "undefined" && module.exports) {
//   module.exports = {
//     performSearch,
//     normalizeText,
//     calculateMatchScore,
//   };
// }
