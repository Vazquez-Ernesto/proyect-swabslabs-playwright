import { test, expect } from '@playwright/test';
import LoginPage from '../pages/LoginPage.js';
import AddToCartPage from '../pages/AddToCartPage.js';
import InventoryPage from '../pages/InventoryPage.js';
import ProductDetailPage from '../pages/ProductDetailPage.js';
import UrlPage from '../pages/UrlPage.js';
import { USERS } from '../test-data/users.js';

// Test: Validar cantidad de productos y navegación al detalle

test('Validar productos listados y navegación al detalle', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);
  const addToCartPage = new AddToCartPage(page);
  const urlPage = new UrlPage(page);

  // Login
  await loginPage.goto();
  await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);

    
  // Validar que estamos en el inventario
  await urlPage.validateHomeUrl(page);

  // Validar que hay al menos un producto (esperar al render: count() no reintenta)
  await expect(inventoryPage.productItems.first()).toBeVisible();
  const count = await inventoryPage.getProductCount();
  expect(count).toBeGreaterThan(0);

  // Obtener el nombre del primer producto
  const firstProductName = await inventoryPage.getProductName(0);

  // Ir al detalle del primer producto
  await inventoryPage.goToProductDetail(0);

  // Validar que el nombre en el detalle coincide
  const productDetailPage = new ProductDetailPage(page);
  const detailName = await productDetailPage.getName();
  expect(detailName).toContain(firstProductName.trim());
});
