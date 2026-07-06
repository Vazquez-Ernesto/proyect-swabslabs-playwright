import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import AddToCartPage from '../pages/AddToCartPage.js';
import CartPage from '../pages/CartPage.js';
import CheckoutPage from '../pages/CheckoutPage.js';
import UrlPage from '../pages/UrlPage.js';
import { USERS } from '../test-data/users.js';

test('Finalizar pedido exitosamente', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const urlPage = new UrlPage(page);
  const addToCartPage = new AddToCartPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Paso 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Validar URL home
  await urlPage.validateHomeUrl();

  // Paso 2: Agregar producto al carrito
  await addToCartPage.addFirstProductToCart();

  // Paso 3: Ir al carrito
  await cartPage.goToCart();

  // Paso 4: Validar que el carrito tenga un producto
  await cartPage.validateItemCount(1);

  // Paso 5: Ir al checkout
  await cartPage.proceedToCheckout();

  // Paso 6: Llenar formulario y continuar
  await checkoutPage.fillCheckoutInfo(USERS.STANDARD.firstName, USERS.STANDARD.lastName, USERS.STANDARD.postalCode);
  await checkoutPage.proceedToOverview();

  // Paso 7: Validar llegada a página de resumen del pedido
  await urlPage.validateCheckoutOverviewUrl();

  // Paso 8: Finalizar compra
  await checkoutPage.finishCheckout();

  // Paso 9: Validar mensaje final
  await expect(page.locator('.complete-header')).toHaveText('THANK YOU FOR YOUR ORDER');
});

test('Cancelar pedido desde el formulario de checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const addToCartPage = new AddToCartPage(page);
  const cartPage = new CartPage(page);
  const checkoutPage = new CheckoutPage(page);
  const urlPage = new UrlPage(page);

  // Paso 1: Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Validar URL home
  await urlPage.validateHomeUrl();

  // Paso 2: Agregar producto al carrito
  await addToCartPage.addFirstProductToCart();

  // Paso 3: Ir al carrito
  await cartPage.goToCart();

  // Paso 4: Validar que el carrito tenga un producto
  await cartPage.validateItemCount(1);

  // Paso 5: Proceder al checkout
  await cartPage.proceedToCheckout();

  // Paso 6: Llenar formulario de checkout
  await checkoutPage.fillCheckoutInfo(USERS.STANDARD.firstName, USERS.STANDARD.lastName, USERS.STANDARD.postalCode);

  // Paso 7: Cancelar
  await checkoutPage.cancelCheckout();

  // Paso 8 (opcional): Validar retorno a home o carrito
  await urlPage.validateCartUrl(); // O validá que vuelve a `cart.html` si aplica
});
