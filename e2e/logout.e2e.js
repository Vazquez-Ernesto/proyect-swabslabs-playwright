// POC-2 (categoría B → evaluado para REVERTIR): navegación por menú lateral.
//
// Contraparte Playwright: tests/Header.spec.js › "Logout exitoso desde el header".
// Hipótesis: el menú hamburguesa (clases de react-burger-menu, animación del
// sidebar) es un detalle de implementación que cambia entre versiones.
// Resultado medido: en el rediseño v1 → actual los selectores del menú NO
// cambiaron. El objetivo cabe en 2 clicks: ver docs/e2e-evaluation.md.
import { test } from '@e2e-dev/web';
import { credentials, expect } from 'e2e';

test('logout: el agente sale de la sesión y el estado se verifica con locators', async ({ app, agent, browser, screen }) => {
  const user = credentials.user('standard');

  await app.open('/');
  await screen.getByTestId('username').fill(user.username);
  await screen.getByTestId('password').fill(user.password);
  await screen.getByTestId('login-button').tap();
  await expect(browser).toHaveURL('/inventory.html');

  await agent.act('Log out of the application');

  // La sesión terminó: volvió al login y la ruta protegida ya no es accesible.
  await expect(browser).toHaveURL('/');
  await expect(screen.getByTestId('login-button')).toBeVisible();
  await app.open('/inventory.html');
  await expect(screen.getByTestId('error')).toContainText('You can only access');
});
