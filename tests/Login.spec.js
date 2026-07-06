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


test('Login con usuario bloqueado muestra error', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(USERS.LOCKED.username, USERS.LOCKED.password);

  await expect(page.getByText(MESSAGES.ERRORS.LOCKED_USER)).toBeVisible();
});

test('Login con campos vacíos muestra error de username', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('', '');

  await expect(page.getByText(MESSAGES.ERRORS.EMPTY_USERNAME)).toBeVisible();
});

test('Login sin username muestra error de username', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('', 'secret_sauce');

  await expect(page.getByText(MESSAGES.ERRORS.EMPTY_USERNAME)).toBeVisible();
});

test('Login sin password muestra error de password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('standard_user', '');

  await expect(page.getByText(MESSAGES.ERRORS.EMPTY_PASSWORD)).toBeVisible();
});
