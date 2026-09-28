# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Spanish-language calculator hub website built with vanilla HTML, CSS, and JavaScript. The site serves as a portal for various online calculator tools organized by categories.

### Core Components

- **index.html**: Main hub page with category navigation and search functionality

Every calculator is a page `<name>.html` with a matching `css/<name>.css` and `js/<name>.js`:

| Page | Category | Description |
| --- | --- | --- |
| regla-de-tres | Matemáticas | Direct and inverse rule of three with step-by-step explanation |
| porcentaje-calculadora | Matemáticas | Percentage of a number, what percent, discount, increase, percentage change, total from part |
| numero-primo | Matemáticas | Prime checker with factorization (up to 10^12) |
| aritmetica-basica | Matemáticas | Keypad calculator with operation history |
| raiz-potencia | Matemáticas | Square, cube and nth roots, powers (negative bases/exponents allowed) |
| factorial | Matemáticas | Exact factorial with BigInt (up to 1000!) |
| mcm-mcd | Matemáticas | LCM and GCD of several numbers, Euclidean algorithm |
| combinaciones-permutaciones | Matemáticas | C(n,r), P(n,r), variations and combinations with repetition, circular (BigInt) |
| calculadora-promedio | Matemáticas | Mean, median, mode, standard deviation and weighted average |
| interes-simple | Finanzas | Simple interest solving for interest, principal, rate or time |
| interes-compuesto | Finanzas | Compound interest with monthly contributions and yearly table |
| calculadora-prestamo | Finanzas | Fixed installment loan (nominal or effective annual rate) with amortization table |
| calculadora-iva | Finanzas | Add or remove VAT with standard rates per country |
| conversion-bases | Conversiones | Binary, octal, decimal, hexadecimal and bases 2-36 (BigInt) |
| fracciones-decimales | Conversiones | Fraction to decimal (repeating period detection) and back |
| conversion-temperatura | Conversiones | Celsius, Fahrenheit, Kelvin, Rankine |
| conversion-longitud | Conversiones | Metric and imperial length units |
| conversion-peso | Conversiones | Metric and imperial mass units |
| calculadora-imc | Salud | BMI with WHO categories (metric and imperial) |
| calorias-diarias | Salud | Mifflin-St Jeor BMR and daily calories by goal |
| frecuencia-cardiaca | Salud | Max heart rate and training zones (Karvonen) |
| dias-entre-fechas | Fechas | Days between dates, business days, add/subtract periods |
| calculadora-edad | Fechas | Exact age and next birthday |
| zona-horaria | Fechas | Time zone conversion using the browser Intl API (DST aware) |

The 4x1000 tax calculator is external (https://calculadora4x1000.alexpiral.com).

#### Shared files

- **css/shared.css**: Common styles for all calculator pages (header, footer, forms, type selector, result grid, data tables, responsive rules)
- **css/style.css**: Main hub page specific styles
- **js/shared-calculator.js**: `CalculatorUtils` (validation, number formatting, UI states, steps rendering, form submission)
- **js/script.js**: Hub search and `calculatorData` keywords
### Key Features

1. **Search System**: Real-time search with debouncing, keyword matching, and relevance scoring
2. **Category Organization**: Calculators grouped into Mathematics, Finance, Conversions, Health, and Date/Time categories
3. **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
4. **SEO Optimization**: Structured data, Open Graph tags, and semantic HTML
5. **Accessibility**: ARIA labels, keyboard navigation, and focus management

### Calculator Structure

Each calculator follows a consistent pattern:

- Meta tags for SEO and social sharing
- Structured data (JSON-LD) for search engines
- External CSS files (shared.css + calculator-specific CSS)
- External JavaScript files (shared-calculator.js + calculator-specific JS)
- Visual schema representation for user understanding
- Step-by-step calculation explanations
- Example scenarios for practical application
- Mobile-responsive interface

### Development Notes

- No build system or package manager - pure vanilla web technologies
- Modular CSS architecture with shared and specific stylesheets
- Modular JavaScript architecture with shared utilities and calculator-specific logic
- CSS uses custom properties (CSS variables) for theming
- JavaScript is ES6+ with no external dependencies
- External links include security attributes (noopener, noreferrer)
- Progressive enhancement approach for JavaScript features

### URL Structure

- `/` - Main hub page
- `/<name>.html` - Each calculator from the table above
- `sitemap.xml` lists every calculator page and is referenced from `robots.txt`

### Styling Conventions

- BEM-like class naming for components
- CSS Grid for layout, Flexbox for components
- Color scheme defined in CSS custom properties in shared.css
- Consistent spacing using rem units
- Hover and focus states for all interactive elements
- Shared components (header, footer, buttons, forms) use classes defined in shared.css
- Calculator-specific styles go in separate CSS files

### Footer Conventions

- All calculator pages use consistent footer structure with shared.css styling
- Footer contains copyright notice and single "Volver al Hub" link
- No cross-links between calculators in footer - users navigate via main hub
- Footer uses `.footer-content` and `.footer-links` classes for consistent styling

### JavaScript Conventions

- All calculator pages include shared-calculator.js first, then their specific JavaScript file
- Common functionality (validation, error handling, UI states) uses CalculatorUtils object
- Calculator-specific logic is isolated in separate files
- Global functions for onclick handlers are explicitly exported to window object
- DOM manipulation uses modern JavaScript (ES6+) features
- Input parsing: `CalculatorUtils.validateInput` rejects negatives; use `parseNumber` when negatives are valid and `parseInteger(value, name, min)` for integers (never `parseInt`, which silently truncates decimals)
- Output formatting: `CalculatorUtils.formatNumber` (thousands separators, trims float noise such as 0.30000000000000004) and `formatCurrency` (`$1,234.50`); do not use bare `toFixed` for displayed results
- Use BigInt when results can exceed `Number.MAX_SAFE_INTEGER` (factorials, combinatorics, base conversion)
- Step formulas are rendered with `white-space: pre-line`: use a real `"\n"` for line breaks, never `"\\n"`
- Inputs hidden by a type selector must have `required` removed, otherwise the browser blocks the submit button
- Errors thrown inside the `handleFormSubmission` callback are shown in `#errorMessage`
- Anything that can come from the URL or user text must not be inserted with `innerHTML` unescaped

### Adding New Calculators

When adding new calculators or features:

1. **HTML Structure**: Follow the existing pattern with external CSS/JS links
2. **CSS**: Use shared.css for common components, create specific CSS file for unique styling
3. **JavaScript**: Use CalculatorUtils for common operations, create specific JS file for calculator logic
4. **Consistency**: Maintain Spanish language content and mobile-first responsive approach
5. **SEO**: Include proper meta tags, structured data, and semantic HTML
6. **Hub**: Add a card in `index.html`, an entry in `calculatorData` in `js/script.js` and a URL in `sitemap.xml`
7. **Claude Guidance**: Update this file with any new architecture changes or conventions
