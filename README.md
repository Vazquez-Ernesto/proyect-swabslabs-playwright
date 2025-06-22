# proyect-swabslabs-playwright
# Proyecto Playwright - Swabslabs

## Requisitos
- Node.js >= 18
- npm >= 9

## Instalación

```bash
npm install
```

## Ejecución de pruebas

- Todas las pruebas (headless):
  ```bash
  npm test
  ```
- UI interactiva:
  ```bash
  npm run test:ui
  ```
- Navegador visible:
  ```bash
  npm run test:headed
  ```
- Debug:
  ```bash
  npm run test:debug
  ```
- Reporte HTML:
  ```bash
  npm run report
  ```

## Estructura del proyecto

- `pages/`: Page Objects (clases para cada página)
- `tests/`: Pruebas automatizadas
- `test-data/`: Datos de prueba centralizados
- `playwright.config.js`: Configuración de Playwright

## Agregar nuevos tests
1. Crea un nuevo archivo en `tests/`.
2. Usa los Page Objects y datos de prueba desde `pages/` y `test-data/`.

## Ejemplo de uso de datos de prueba
```js
import { USERS } from '../test-data/users.js';
await loginPage.login(USERS.STANDARD.username, USERS.STANDARD.password);
```

## Reportes y depuración
- Los reportes HTML se generan automáticamente y pueden verse con `npm run report`.
- Los videos, screenshots y traces se guardan en la carpeta `test-results/`.

---

¡Contribuciones y mejoras son bienvenidas!
