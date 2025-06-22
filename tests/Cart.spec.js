import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import CartPage from '../pages/CartPage.js';
import AddToCartPage from '../pages/AddToCartPage.js';
import UrlPage from '../pages/UrlPage.js';
import { USERS } from '../test-data/users.js';

test('Validar Redireccion Al Carrito Desde Inventario', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const addToCartPage = new AddToCartPage(page);
  const cartPage = new CartPage(page);
  const urlPage = new UrlPage(page);

  // ✅ Paso 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // ✅ Paso 2: Ir al carrito
  await cartPage.goToCart();
  await urlPage.validateCartUrl();
});

test('Validar Redireccion Al Carrito con un producto añadido', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const addToCartPage = new AddToCartPage(page);
  const cartPage = new CartPage(page);
  const urlPage = new UrlPage(page);

  // ✅ Paso 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
  await urlPage.validateHomeUrl(page);

  // ✅ Paso 2: Agregar producto al carrito
  await addToCartPage.addFirstProductToCart();

  // ✅ Paso 3: Ir al carrito desde inventario
  await cartPage.goToCart();
  await cartPage.validateItemCount(1);

  await urlPage.validateCartUrl();
});

test('Volver al home desde el carrito usando CONTINUE SHOPPING', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const cartPage = new CartPage(page);
  const urlPage = new UrlPage(page);

  // Paso 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Paso 2: Ir al carrito
  await cartPage.goToCart();
  await urlPage.validateCartUrl();

  // Paso 3: Click en 'Continue Shopping'
  await cartPage.continueShopping();

  // Paso 4: Validar que vuelve al home
  await urlPage.validateHomeUrl();
});
