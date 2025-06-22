import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import AddToCartPage from '../pages/AddToCartPage.js';
import CartPage from '../pages/CartPage.js';
import { USERS } from '../test-data/users.js';

  test('Agregar un producto al carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const addToCartPage = new AddToCartPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    // Validación de URL post login
    await expect(page).toHaveURL(/.*inventory/);

    // Agregar producto y validar cambio de botón
    await addToCartPage.addFirstProductToCart();
    await addToCartPage.validateRemoveButtonVisible();
    await addToCartPage.validateCartCount(1);

    // Ir al carrito y validar
    await cartPage.goToCart();
    await cartPage.validateItemCount(1);
    await cartPage.validateHasProducts();
    await cartPage.validateCheckoutButtonVisible();
  });

  test('Agregar y luego quitar un producto del carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const addToCartPage = new AddToCartPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
    await expect(page).toHaveURL(/.*inventory/);

    // Agregar producto y validar
    await addToCartPage.addFirstProductToCart();
    await addToCartPage.validateRemoveButtonVisible();
    await addToCartPage.validateCartCount(1);

    // Ir al carrito y validar
    await cartPage.goToCart();
    await cartPage.validateItemCount(1);
    await cartPage.validateHasProducts();
    await cartPage.validateCheckoutButtonVisible();

    // Quitar producto y validar reversión del estado
    await addToCartPage.removeFirstProductFromCart();
 

    // Ir al carrito y validar que está vacío
    await cartPage.validateItemCount(0);
  });


