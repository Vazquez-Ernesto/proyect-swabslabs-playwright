// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000, // Timeout global de 30 segundos
  expect: {
    timeout: 5000 // Timeout para las aserciones
  },
  fullyParallel: true, // Ejecutar tests en paralelo
  forbidOnly: !!process.env.CI, // Falla si encuentra test.only() en CI
  retries: process.env.CI ? 2 : 0, // Reintentos: 2 en CI, 0 en local
  workers: process.env.CI ? 1 : undefined, // Workers: 1 en CI, auto en local
  reporter: [
    ['html'], // Reporte HTML
    ['list'] // Reporte en consola
  ],
  use: {
    baseURL: 'https://www.saucedemo.com/v1/',
    trace: 'on-first-retry', // Captura trace en el primer reintento
    screenshot: 'only-on-failure', // Screenshot solo en fallos
    video: 'retain-on-failure', // Video solo en fallos
  },

  /* Configurar los navegadores para testing */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
