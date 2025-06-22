import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import InventoryPage from '../pages/InventoryPage.js';
import ProductDetailPage from '../pages/ProductDetailPage.js';
import { USERS } from '../test-data/users.js';

// Test: Validar información y acciones en el detalle de producto

test('Validar información y agregar/quitar producto desde el detalle', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const productDetailPage = new ProductDetailPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

  // Ir al detalle del primer producto
  await inventoryPage.goToProductDetail(0);

  // Validar nombre, descripción y precio no están vacíos
  const name = await productDetailPage.getName();
  const desc = await productDetailPage.getDescription();
  const price = await productDetailPage.getPrice();
  expect(name).not.toBe('');
  expect(desc).not.toBe('');
  expect(price).toMatch(/\$[0-9]+/);

  // Agregar al carrito y luego quitar
  await productDetailPage.addToCart();
  await productDetailPage.removeFromCart();

  // Volver al inventario
  await productDetailPage.backToProducts();
  // Validar que estamos de regreso en el inventario
  expect(await inventoryPage.getProductCount()).toBeGreaterThan(0);
});
