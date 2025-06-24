# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a Spanish-language calculator hub website built with vanilla HTML, CSS, and JavaScript. The site serves as a portal for various online calculator tools organized by categories.

### Core Components

- **index.html**: Main hub page with category navigation and search functionality
- **regla-de-tres.html**: Full-featured rule of three calculator with step-by-step explanations
- **porcentaje-calculadora.html**: Multi-type percentage calculator (percentage, discount, increase, what percent)
- **numero-primo.html**: Prime number checker with factorization and mathematical analysis
- **aritmetica-basica.html**: Basic arithmetic calculator with keypad interface and operation history
- **raiz-potencia.html**: Root and power calculator for square roots, cube roots, nth roots, and exponential operations
- **factorial.html**: Factorial calculator with large number support and combinatorial applications
- **mcm-mcd.html**: LCM and GCD calculator for multiple numbers with Euclidean algorithm and prime factorization
- **combinaciones-permutaciones.html**: Combinations and permutations calculator with C(n,r), P(n,r), variations, and circular permutations
- **interes-simple.html**: Simple interest calculator for financial planning with multiple calculation modes

#### CSS Architecture

- **css/shared.css**: Common styles for all calculator pages (header, footer, form components, responsive design)
- **css/style.css**: Main hub page specific styles
- **css/regla-de-tres.css**: Rule of three calculator specific styles
- **css/porcentaje-calculadora.css**: Percentage calculator specific styles
- **css/numero-primo.css**: Prime number checker specific styles
- **css/aritmetica-basica.css**: Basic arithmetic calculator specific styles
- **css/raiz-potencia.css**: Root and power calculator specific styles
- **css/factorial.css**: Factorial calculator specific styles
- **css/mcm-mcd.css**: LCM and GCD calculator specific styles
- **css/combinaciones-permutaciones.css**: Combinations and permutations calculator specific styles
- **css/interes-simple.css**: Simple interest calculator specific styles

#### JavaScript Architecture

- **js/shared-calculator.js**: Common calculator utilities and shared functionality
- **js/script.js**: Main hub search functionality and calculator data management
- **js/regla-de-tres.js**: Rule of three calculator specific logic
- **js/porcentaje-calculadora.js**: Percentage calculator specific logic
- **js/numero-primo.js**: Prime number checker specific logic
- **js/aritmetica-basica.js**: Basic arithmetic calculator specific logic
- **js/raiz-potencia.js**: Root and power calculator specific logic
- **js/factorial.js**: Factorial calculator specific logic
- **js/mcm-mcd.js**: LCM and GCD calculator specific logic
- **js/combinaciones-permutaciones.js**: Combinations and permutations calculator specific logic
- **js/interes-simple.js**: Simple interest calculator specific logic

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
- `/regla-de-tres.html` - Rule of three calculator
- `/porcentaje-calculadora.html` - Percentage calculator
- `/numero-primo.html` - Prime number checker
- `/aritmetica-basica.html` - Basic arithmetic calculator
- `/raiz-potencia.html` - Root and power calculator
- `/factorial.html` - Factorial calculator
- `/mcm-mcd.html` - LCM and GCD calculator
- `/combinaciones-permutaciones.html` - Combinations and permutations calculator
- `/interes-simple.html` - Simple interest calculator
- External calculators link to separate domains (e.g., 4x1000 tax calculator)

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

### Adding New Calculators

When adding new calculators or features:

1. **HTML Structure**: Follow the existing pattern with external CSS/JS links
2. **CSS**: Use shared.css for common components, create specific CSS file for unique styling
3. **JavaScript**: Use CalculatorUtils for common operations, create specific JS file for calculator logic
4. **Consistency**: Maintain Spanish language content and mobile-first responsive approach
5. **SEO**: Include proper meta tags, structured data, and semantic HTML
6. **Claude Guidance**: Update this file with any new architecture changes or conventions
