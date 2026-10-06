// Configuración del runner `e2e` (TesterArmy) — capa EXPERIMENTAL de la suite.
//
// Playwright (playwright.config.js + tests/) sigue siendo el runner principal.
// Este runner solo ejecuta los tests de e2e/**/*.e2e.js: flujos donde un objetivo
// en lenguaje natural (agent.act) aporta y el resultado se verifica con locators.
// Ver docs/e2e-evaluation.md.
//
// Requiere Node ^22.22.3 o >=24.8.0 (la CLI lo valida al arrancar).
// e2e no carga archivos .env: las variables llegan desde la shell o el CI.
import { anthropic } from '@ai-sdk/anthropic';
import { web } from '@e2e-dev/web';
import { USERS } from './test-data/users.js';

// Sin ANTHROPIC_API_KEY no se configura modelo, y todo test que use el fixture
// `agent` falla al iniciar con MODEL_UNAVAILABLE, aunque su paso esté en el
// cache de replay (verificado en 0.18.0). Con la key, un paso reproducido desde
// el cache no hace ninguna llamada al modelo.
// E2E_MODEL permite cambiar el modelo sin editar este archivo; cambiarlo NO
// invalida el cache de replay.
const model = process.env.ANTHROPIC_API_KEY
  ? anthropic(process.env.E2E_MODEL ?? 'claude-opus-5-5')
  : undefined;

export default {
  projectId: 'swag-labs-playwright-automation',
  tests: ['e2e/**/*.e2e.js'],
  targets: [
    {
      name: 'chromium',
      // SauceDemo expone sus contratos de test como data-test="...".
      engine: web({ testIdAttribute: 'data-test' }),
      app: { url: process.env.BASE_URL ?? 'https://www.saucedemo.com' },
    },
  ],
  // Credencial pública de demo (impresa en la página de login de SauceDemo).
  // En CI se sobreescribe con E2E_USER_STANDARD_USERNAME / E2E_USER_STANDARD_PASSWORD.
  // El password se entrega a los tests como Secret: el modelo solo ve su nombre.
  credentials: {
    standard: {
      username: USERS.STANDARD.username,
      password: USERS.STANDARD.password,
    },
  },
  ...(model && { agents: { default: { model } } }),
  // Igual criterio que playwright.config.js: evidencia solo cuando hace falta.
  // Video desactivado: e2e no enmascara los videos (redaction "incomplete").
  trace: 'on-first-retry',
  video: 'off',
  reporters: ['list', 'junit', 'markdown'],
};
