# Swag Labs Playwright Automation

[![Playwright](https://img.shields.io/badge/Playwright-1.53-2EAD33?logo=playwright)](https://playwright.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![Cross-browser](https://img.shields.io/badge/Browsers-Chromium%20%7C%20Firefox%20%7C%20WebKit-blue)](playwright.config.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Proyecto de automatización E2E para [Swag Labs (SauceDemo)](https://www.saucedemo.com/), construido con Playwright y JavaScript moderno (ESM). Cubre los flujos críticos de una aplicación de e-commerce: autenticación, catálogo de productos, carrito y checkout completo.

---

## Contenido

- [Alcance de las pruebas](#alcance-de-las-pruebas)
- [Arquitectura](#arquitectura)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Casos de prueba](#casos-de-prueba)
- [AI-Assisted Development](#ai-assisted-development)
- [Stack tecnológico](#stack-tecnológico)
- [Próximas mejoras](#próximas-mejoras)
- [Contacto](#contacto)

---

## Alcance de las pruebas

### Autenticación
- Login exitoso con usuario estándar
- Login con usuario bloqueado → mensaje de error específico
- Validación de campos requeridos (username y password vacíos)

### Inventario / Catálogo
- Verificación de cantidad de productos listados
- Navegación al detalle de un producto y validación de nombre

### Carrito
- Agregar producto al carrito y validar contador
- Quitar producto del carrito y validar estado vacío

### Checkout (flujo completo)
- Alta de producto → carrito → formulario → resumen → confirmación de orden
- Cancelación de pedido desde el formulario de checkout

### Header y navegación
- Logout desde el menú lateral
- Navegación al inventario desde el header

### Sesión y acceso protegido
- Intento de acceso a URL protegida sin autenticación → redirección al login

---

## Arquitectura

```
proyect-swabslabs-playwright/
├── pages/                      # Page Objects
│   ├── LoginPage.js            # Autenticación
│   ├── InventoryPage.js        # Catálogo de productos
│   ├── ProductDetailPage.js    # Detalle de producto
│   ├── AddToCartPage.js        # Agregar/quitar del carrito
│   ├── CartPage.js             # Vista del carrito
│   ├── CheckoutPage.js         # Flujo de checkout
│   ├── HeaderPage.js           # Menú y navegación global
│   ├── SessionPage.js          # Validación de sesión/acceso
│   └── UrlPage.js              # Validación centralizada de URLs
├── tests/                      # Specs (casos de prueba)
│   ├── Login.spec.js
│   ├── Inventory.spec.js
│   ├── AddToCart.spec.js
│   ├── Cart.spec.js
│   ├── Checkout.spec.js
│   ├── ProductDetail.spec.js
│   ├── Header.spec.js
│   └── Session.spec.js
├── test-data/                  # Datos de prueba centralizados
│   ├── users.js                # Credenciales y datos de usuario
│   ├── messages.js             # Mensajes de error y éxito esperados
│   └── products.js             # Datos de productos
└── playwright.config.js        # Configuración del framework
```

### Decisiones de diseño

| Patrón | Implementación |
|--------|---------------|
| **Page Object Model** | Cada página encapsula sus locators y acciones |
| **Test data centralizado** | Constantes en `test-data/` — un solo punto de mantenimiento |
| **URL validation** | `UrlPage.js` centraliza validaciones de navegación |
| **CI-aware config** | `retries` y `workers` se ajustan automáticamente en entorno CI |
| **Evidencia condicional** | Screenshots, videos y traces solo en fallos, para no inflar el storage |

---

## Instalación y ejecución

### Requisitos

- Node.js >= 18
- npm >= 9

### Setup

```bash
git clone https://github.com/Vazquez-Ernesto/proyect-swabslabs-playwright.git
cd proyect-swabslabs-playwright
npm install
npx playwright install  # descarga los navegadores
```

### Comandos

```bash
# Ejecutar todos los tests (headless, multi-browser)
npm test

# Abrir la UI interactiva de Playwright
npm run test:ui

# Ejecutar con navegador visible
npm run test:headed

# Modo debug (paso a paso)
npm run test:debug

# Ver reporte HTML del último run
npm run report

# Ejecutar un spec específico
npx playwright test tests/Login.spec.js
npx playwright test tests/Checkout.spec.js

# Ejecutar en un solo navegador
npx playwright test --project=chromium
npx playwright test --project=firefox

# Apuntar a otro entorno
BASE_URL=https://staging.example.com/ npx playwright test
```

### Capa experimental agentic (`e2e` de TesterArmy)

Dos runners conviven: Playwright (`tests/`, principal y bloqueante) y
[`e2e`](https://github.com/tester-army/e2e) (`e2e/`, experimental, no bloqueante),
que combina `agent.act()` para objetivos en lenguaje natural con aserciones
determinísticas. Requiere Node 24 (`.nvmrc`) y `ANTHROPIC_API_KEY`.

```bash
npx @e2e-dev/web install chromium
npm run e2e        # local, cache de replay read-write
npm run e2e:ci     # como CI: read-only + --strict-cache
```

La evaluación completa (diagnóstico, métricas, cache, seguridad y recomendación)
está en [`docs/e2e-evaluation.md`](docs/e2e-evaluation.md).

---

## Casos de prueba

### Login (`Login.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Login exitoso con credenciales válidas | Redirección a `/inventory.html` |
| Login con usuario bloqueado | Mensaje "Sorry, this user has been locked out" |
| Login con campos vacíos | Mensaje "Username is required" |
| Login sin username | Mensaje "Username is required" |
| Login sin password | Mensaje "Password is required" |

### Inventario (`Inventory.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Validar productos listados y navegación al detalle | Al menos 1 producto, nombre coincide en detalle |

### Carrito (`AddToCart.spec.js`, `Cart.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Agregar un producto al carrito | Contador del carrito muestra 1 |
| Agregar y luego quitar producto | Contador vuelve a 0, carrito vacío |

### Checkout (`Checkout.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Finalizar pedido exitosamente | Mensaje "Thank you for your order!" |
| Cancelar pedido desde el formulario | Regreso a la vista del carrito |

### Header y navegación (`Header.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Logout desde el header | Redirección a la página de login |
| Navegar al inventario desde el menú | URL contiene `/inventory` |

### Sesión (`Session.spec.js`)

| Caso de prueba | Resultado esperado |
|----------------|-------------------|
| Acceso a URL protegida sin login | Redirección al login |

---

## AI-Assisted Development

Este proyecto fue desarrollado con un workflow de **pair programming asistido por IA**, usando GitHub Copilot como herramienta de apoyo, no como reemplazo del criterio de testing.

### Cómo se usó la IA

**Diseño de la arquitectura de datos**
La estructura de `test-data/` con constantes (`USERS`, `MESSAGES`, `PRODUCTS`) fue propuesta y refinada con asistencia de IA para evitar strings mágicos dispersos en los tests.

**Selección de locators robustos**
La IA ayudó a elegir locators basados en `data-test`, roles ARIA y texto semántico (`getByRole`, `getByText`) en lugar de selectores CSS frágiles basados en estructura DOM.

**Configuración CI-aware**
El patrón `process.env.CI ? 2 : 0` para retries y workers surgió de una discusión con la IA sobre cómo hacer que la suite funcione bien tanto localmente como en pipelines.

**Identificación de antipatrones**
La IA señaló el dynamic import dentro del test (`await import(...)`) como un antipatrón que dificulta el análisis estático — se reemplazó por un import estático al inicio del archivo.

### Lo que la IA NO reemplaza

- Definir qué flujos son críticos para el negocio
- Decidir el nivel de granularidad de los assertions
- Identificar edge cases propios del sistema bajo test
- Leer el comportamiento real del sitio y ajustar selectores

> La IA acelera la escritura. El criterio de QA sigue siendo humano.

---

## Stack tecnológico

| Herramienta | Versión | Uso |
|-------------|---------|-----|
| Playwright | ^1.53.0 | Framework E2E con soporte multi-browser |
| Node.js | >= 18 | Runtime |
| JavaScript ESM | ES2022 | Módulos nativos (`import/export`) |

### Navegadores testeados

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

---

## Próximas mejoras

- [x] CI/CD con GitHub Actions (ejecutar en cada PR sobre los 3 browsers)
- [ ] `storageState` para reutilizar sesión autenticada entre tests (evitar login repetido)
- [ ] Tests del módulo de filtros y ordenamiento del inventario
- [ ] Validaciones de accesibilidad con `@axe-core/playwright`
- [ ] Reporte integrado en GitHub Actions con publicación de HTML artifacts

---

## Contacto

**Ernesto Alexis Vázquez** — QA Automation Engineer

- GitHub: [@Vazquez-Ernesto](https://github.com/Vazquez-Ernesto)
- Email: ernestoalexisvazquez@gmail.com

---

*Sitio bajo prueba: [Swag Labs](https://www.saucedemo.com/) — entorno público de práctica para automatización de e-commerce. La versión `/v1/` fue retirada el 2025-10-31.*
