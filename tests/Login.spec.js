import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import UrlPage from '../pages/UrlPage.js';
import { USERS } from '../test-data/users.js';
import { MESSAGES } from '../test-data/messages.js';

test('Login exitoso con credenciales válidas', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const urlPage = new UrlPage(page);
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Validamos que llegamos a /inventory.html
  await urlPage.validateHomeUrl();
});


test('login con credenciales invalidas', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();  await loginPage.login(USERS.LOCKED.username, USERS.LOCKED.password);

  // Validamos que el mensaje de error es visible
  await expect(page.getByText(MESSAGES.ERRORS.LOCKED_USER)).toBeVisible();
});

test('login con campos vacíos', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('', '');

  // Validamos que el mensaje de error es visible
  await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
});

test('login con usuario vacío', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login  ('', 'secret_sauce');   

// Validamos que el mensaje de error es visible
  await expect(page.getByText('Epic sadface: Username is required')).toBeVisible();
});

test('login con contraseña vacía', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', ''); 

// Validamos que el mensaje de error es visible
  await expect(page.getByText('Epic sadface: Password is required')).toBeVisible();
});
