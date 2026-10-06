// POC-1 (categoría C): agent.act + aserciones determinísticas.
//
// Contraparte Playwright: tests/Checkout.spec.js › "Finalizar pedido exitosamente".
// Ese test se rompió con el rediseño de SauceDemo (input[value="CONTINUE"] pasó
// a "Continue"). Acá el recorrido carrito → formulario → resumen es un objetivo
// en lenguaje natural; todo lo que define "pedido correcto" sigue siendo exacto.
import { test } from '@e2e-dev/web';
import { credentials, expect } from 'e2e';
import { MESSAGES } from '../test-data/messages.js';
import { PRODUCTS } from '../test-data/products.js';
import { USERS } from '../test-data/users.js';

test('checkout: el agente completa el wizard y el pedido se verifica con locators', async ({ app, agent, browser, screen }) => {
  const user = credentials.user('standard');

  // Determinístico: login (contrato estable, y el password nunca pasa por el modelo).
  await app.open('/');
  await screen.getByTestId('username').fill(user.username);
  await screen.getByTestId('password').fill(user.password);
  await screen.getByTestId('login-button').tap();
  await expect(browser).toHaveURL('/inventory.html');

  // Determinístico: qué producto se compra es dato de prueba, no una decisión del agente.
  await screen.getByTestId('add-to-cart-sauce-labs-backpack').tap();
  await expect(screen.getByTestId('shopping-cart-badge')).toHaveText('1');

  // Agentic: el camino hasta el resumen (botones, pasos, orden de campos) puede cambiar.
  await agent.act(
    'Open the cart, start the checkout, fill in first name {firstName}, last name {lastName} and postal code {postalCode}, then continue to the order overview',
    {
      params: {
        firstName: USERS.STANDARD.firstName,
        lastName: USERS.STANDARD.lastName,
        postalCode: USERS.STANDARD.postalCode,
      },
    },
  );

  // Determinístico: el agente llegó al estado correcto y con los datos correctos.
  await expect(browser).toHaveURL('/checkout-step-two.html');
  await expect(screen.getByTestId('inventory-item-name')).toHaveText(PRODUCTS.BACKPACK.name);
  await expect(screen.getByTestId('subtotal-label')).toHaveText(`Item total: $${PRODUCTS.BACKPACK.price}`);

  // Determinístico: confirmar la compra es una acción de negocio, no se delega.
  await screen.getByTestId('finish').tap();
  await expect(browser).toHaveURL('/checkout-complete.html');
  await expect(screen.getByTestId('complete-header')).toHaveText(MESSAGES.SUCCESS.ORDER_COMPLETE);
});
