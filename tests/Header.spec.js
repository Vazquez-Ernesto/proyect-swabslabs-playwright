import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import HeaderPage from '../pages/HeaderPage.js';
import { USERS } from '../test-data/users.js';
import urlPage from '../pages/UrlPage.js';

// Test: Logout y navegación desde el header

test('Logout exitoso desde el header', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const headerPage = new HeaderPage(page);
  const url = new urlPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Logout
  await headerPage.logout();

// Validar que estamos en la página de login
    await url.validateLoginUrl();


});

test('Navegar al inventario desde el menú', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const headerPage = new HeaderPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Ir a otra página (carrito)
  await headerPage.goToCart();

  // Volver al inventario desde el menú
  await headerPage.goToInventory();

  // Validar que estamos en el inventario
  await expect(page).toHaveURL(/inventory/);
});
