import { test, expect } from '@playwright/test';
import SessionPage from '../pages/SessionPage.js';

// Test: Acceso a URL protegida sin login

test('Redirección a login al intentar acceder a página protegida', async ({ page }) => {
  const sessionPage = new SessionPage(page);
  
  // Intentamos acceder a la página protegida
  await sessionPage.goToProtectedUrl('/inventory.html');
  
  // Validamos que fuimos redirigidos al login
  const isRedirected = await sessionPage.validateRedirectToLogin();
  expect(isRedirected, 'No se redirigió correctamente a la página de login').toBe(true);
  
  // Verificamos que la URL es la correcta
  const currentUrl = page.url();
  expect(currentUrl, `URL incorrecta: ${currentUrl}`).toBe(sessionPage.loginUrl);

  // Validamos el título de la página
  const pageTitle = await page.title();
  expect(pageTitle).toBe('Swag Labs');

  // Validamos que los campos del formulario estén vacíos inicialmente
  const usernameValue = await page.inputValue('#user-name');
  const passwordValue = await page.inputValue('#password');
  expect(usernameValue).toBe('');
  expect(passwordValue).toBe('');

  // Validamos que el botón de login esté habilitado
  const loginButton = await page.locator('#login-button');
  expect(await loginButton.isEnabled()).toBe(true);

  // Validamos que el logo de Swag Labs esté visible
  const logo = await page.locator('.login_logo');
  expect(await logo.isVisible()).toBe(true);

  // Validamos que el mensaje de error sea el esperado
  const errorMessage = await page.locator('[data-test="error"]');
  if (await errorMessage.count() > 0 && await errorMessage.isVisible()) {
    const errorText = await errorMessage.textContent();
    expect(errorText?.trim()).toBe("Epic sadface: You can only access '/inventory.html' when you are logged in.");
  }

  // Validamos la URL anterior guardada (para asegurar que no podemos volver)
  await page.goBack();
  const backUrl = page.url();
  expect(
    backUrl === sessionPage.loginUrl || backUrl === 'about:blank',
    `La URL después de ir atrás no es segura: ${backUrl}`
  ).toBe(true);
});
