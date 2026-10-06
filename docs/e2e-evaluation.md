# Evaluación de `e2e` (TesterArmy) sobre la suite Playwright de Swag Labs

> Fecha: 2026-10-06 · `e2e@0.18.0` + `@e2e-dev/web@0.13.0` (pre-1.0) · Playwright `1.53.0`
>
> Todo número de este documento sale de una ejecución real. Lo que no se pudo
> medir está marcado como **NO MEDIDO** o **ESTIMADO**, con el motivo.

## Resumen

| | Resultado |
|---|---|
| **Recomendación** | **Adoptar parcialmente.** Playwright sigue siendo el runner principal y bloqueante. `e2e` queda como capa **experimental, no bloqueante**, con 1 test (checkout). El MCP de `e2e` se adopta para desarrollo con Claude Code. No migrar más tests por ahora. |
| Hallazgo más importante | La suite estaba **rota en la realidad**: SauceDemo eliminó `/v1/` el 2025-10-31. De los 10 problemas que causó el rediseño, **solo 1 era un selector**; ninguno requería IA para resolverse. |
| Dónde `e2e` aporta | Wizards cuyo camino cambia (checkout). MCP para inspeccionar la app y obtener locators verificados, sin costo de modelo. |
| Dónde no | Login, mensajes de error, URLs, sesión, datos de negocio, clicks únicos. Es decir, 16 de los 17 tests actuales. |

---

## 1. Diagnóstico (Fase 1)

### Qué hay en el repo

| Área | Estado actual |
|---|---|
| Runner | `@playwright/test ^1.53.0` (lockfile: 1.53.0), JS ESM, sin TypeScript |
| Config | `playwright.config.js`: 3 projects (chromium, firefox, webkit), `fullyParallel`, retries 2 en CI, trace `on-first-retry`, screenshot y video solo en fallos, reporter html + list |
| Page Objects | 9 clases en `pages/`, reciben `page` de Playwright. Mezcla de `data-test`, ids, clases CSS y roles |
| Test data | `test-data/` (`USERS`, `MESSAGES`, `PRODUCTS`) — buena práctica, pero `PRODUCTS` y `USERS.PROBLEM` no se usaban |
| Tests | 17 tests en 8 specs. Cada test hace login por UI (sin `storageState`) |
| Fixtures / helpers / mocks / API helpers | No hay |
| Auth | Login por UI con credenciales de demo públicas en `test-data/users.js` |
| Env vars | Solo `CI`. Ningún `.env` |
| CI/CD | No había |
| Scripts npm | `test`, `test:ui`, `test:headed`, `test:debug`, `report`, `test:single` |

### Cómo se ejecuta y qué pasaba en realidad

El entorno de esta evaluación no tiene salida a `www.saucedemo.com` (política de red),
así que la app se sirvió localmente desde el repo público de SauceDemo
([`saucelabs/sample-app-web`](https://github.com/saucelabs/sample-app-web), rama `gh-pages`
= lo que está desplegado), con un servidor que emula GitHub Pages y Chromium
resolviendo `www.saucedemo.com` a ese servidor. El historial de esa rama muestra
el commit `fc86000 Delete v1 directory` del **2025-10-31**.

| Escenario (chromium) | Resultado | Tiempo |
|---|---|---|
| Suite original vs sitio con `/v1/` (antes del 2025-10-31) | 17/17 · `--repeat-each 5`: 85/85 | 15.2 s · 58.8 s |
| Suite original vs sitio **actual** | **9/17**, 8 timeouts de 30 s | 137 s |
| Solo URLs corregidas vs sitio actual | 15/17 | 33 s |

Los 8 fallos contra el sitio actual, uno por uno:

| Causa | Tests | ¿Lo resolvería `agent.act`? |
|---|---|---|
| URLs absolutas `/v1/...` en `waitForURL` | 7 | No. Es configuración (`baseURL`) |
| Selector CSS `input[value="CONTINUE"]` (ahora `"Continue"`) | 1 | Sí, pero `getByRole('button', { name: 'Continue' })` también |
| Copy `THANK YOU FOR YOUR ORDER` → `Thank you for your order!` | 1 (oculto tras el anterior) | **No debe**: el contrato de texto cambió y el test tiene que fallar |
| `count()` sin reintento después de navegar (race con React) | 2 (latentes, el sitio v1 era HTML estático) | No. Es una aserción mal escrita |

**Conclusión del diagnóstico: el problema dominante no fueron los selectores, sino las URLs hardcodeadas y aserciones sin reintento.**

### Patrones repetidos y fragilidad

- Login por UI repetido en los 17 tests (sin fixture ni `storageState`).
- Validación de URLs duplicada en `UrlPage`, `CartPage` y `SessionPage`, con URLs absolutas.
- `CartPage.validateItemCount` y `AddToCartPage.validateCartCount` duplican la misma lógica.
- `SessionPage`: `waitForTimeout(1000)` y `try/catch` que devuelve `boolean`, lo que esconde el error real.
- `Session.spec.js`: aserción condicional (`if (errorMessage visible) expect(...)`) — puede pasar sin verificar nada.
- `expect(await x.count())` / `expect(await x.isVisible())` — aserciones sin reintento.
- Selectores por clase CSS (`.btn_secondary`, `.btn_action.cart_button`, `.cart_cancel_link`) donde existen `data-test`.

### Qué NO debe pasar a un agente

Login y credenciales, mensajes de error exactos, URLs y redirecciones, protección de rutas,
contenido del carrito, precios y totales, y la confirmación de compra (acción de negocio).

---

## 2. Clasificación de los tests (Fase 2)

| Test | Cat. | Por qué |
|---|---|---|
| Login: exitoso, bloqueado, vacíos, sin user, sin pass (5) | **A** | Mensajes exactos de negocio. Un locator estable lo resuelve mejor |
| Session: ruta protegida | **A** | Seguridad. Debe ser exacto y determinístico |
| AddToCart: agregar / agregar y quitar (2) | **A** | El dato (qué producto) y el contador son el objetivo del test |
| Cart: redirecciones (3) | **A/D** | Un click y una URL. Usar IA para esto es costo sin beneficio |
| Inventory: listado y detalle | **A** | Comparar nombres es exacto. `agent.extract` sería más caro y menos preciso que `allTextContents()` |
| ProductDetail | **A** | Igual que Inventory |
| Header: navegar al inventario | **D** | Dos clicks |
| Header: logout | **B → D** | Hipótesis: el menú lateral cambia. Medido: no cambió. Ver POC-2 |
| Checkout: finalizar pedido | **C** | Wizard de varios pasos, y es el único que se rompió por un selector en el rediseño real |
| Checkout: cancelar | **A** | Es una variante del anterior. Si se adopta POC-1 se evalúa después |

**D (no usar IA)** aplica a todo test cuyo valor está en una aserción exacta, o cuya interacción entra en 1–2 locators estables.

---

## 3. Arquitectura recomendada (Fase 3)

```
                ┌───────────────────────── test-data/ (única fuente de datos) ─────────────┐
                │                                                                          │
 Playwright (principal, bloqueante)                     e2e (experimental, no bloqueante)
 playwright.config.js · tests/*.spec.js                 e2e.config.mts · e2e/*.e2e.js
 pages/ (Page Objects con `page`)                       sin Page Objects: agent.act + screen
 3 browsers · reporte HTML                              chromium · junit + markdown + report.json
                │                                                                          │
                └──────────────── BASE_URL (mismo entorno para los dos) ───────────────────┘

 Claude Code ── .mcp.json ──> `e2e mcp` (explorar la app, `locate`, sin modelo)
```

| Pregunta | Decisión |
|---|---|
| ¿Runner principal? | **Playwright.** Es estable, multi-browser, tiene reporte HTML, `fullyParallel` y un ecosistema que `e2e` todavía no cubre (ver "missing" en `node_modules/e2e/docs/migrate/playwright.mdx`) |
| ¿`e2e` como segundo runner? | Sí, aislado: `tests: ['e2e/**/*.e2e.js']`. Playwright no lo recolecta (`testDir: './tests'`) y `e2e` no recolecta `*.spec.js`. Verificado con `playwright test --list` (51 = 17 × 3) y `e2e list` (2) |
| Configuración | Dos archivos, mismo origen de datos: `BASE_URL` para los dos, y `e2e.config.mts` importa `test-data/users.js` |
| Credenciales | `credentials.standard` en `e2e.config.mts`. Se sobreescriben con `E2E_USER_STANDARD_USERNAME` / `E2E_USER_STANDARD_PASSWORD`. El password llega al test como `Secret` (el modelo solo ve su nombre) |
| Datos de prueba | `test-data/` compartido; los tests de `e2e` lo importan directamente |
| Page Objects | **No se comparten.** Los PO reciben `page` y `e2e` no expone `page` en los tests (by design: lo que pasa por un `page` crudo no se redacta). Envolverlos duplicaría la capa. Los tests agentic necesitan pocos locators |
| Reportes | Playwright: `playwright-report/`. e2e: `.e2e/report.json`, `.e2e/junit.xml`, `.e2e/summary.md`, `.e2e/failures/` |
| Screenshots/videos/traces | Playwright igual que antes. e2e: `trace: 'on-first-retry'`, `video: 'off'` (los videos de `e2e` no se enmascaran) |
| CI | `.github/workflows/tests.yml`: job `playwright` bloqueante, job `e2e-agentic` con `continue-on-error`, que se salta si no existe el secret `ANTHROPIC_API_KEY` y corre `--strict-cache` |
| Duplicación | POC-1 duplica temporalmente `Checkout.spec.js › Finalizar pedido`. **Regla:** si POC-1 se adopta, se borra el test de Playwright; si no, se borra POC-1. Nunca quedan los dos |

---

## 4. Prueba de concepto (Fase 4)

Se eligieron candidatos donde la IA **podría** tener ventaja, no los más fáciles. Solo hubo 2;
no se forzó un tercero (ver al final).

### POC-1 — Checkout (`e2e/checkout.e2e.js`) → **mantener como experimental**

1. **Hoy:** 9 pasos con Page Objects; formulario por ids, botón Continue por `input[value="CONTINUE"]`.
2. **Problema:** es el único test que se rompió por un selector en el rediseño real; el camino carrito → formulario → resumen es lo que más cambia en un e-commerce.
3. **Playwright puro:** `getByRole('button', { name: 'Continue' })` + `data-test` — resuelve el caso medido sin IA (aplicado en este PR).
4. **Con `e2e`:** login y "qué producto" determinísticos; `agent.act('Open the cart, start the checkout, fill in … then continue to the order overview', { params })`; luego URL, nombre del producto, subtotal, `Finish` y header verificados con locators.
5. **Determinístico:** credenciales, elección del producto, URL del resumen, item, subtotal, confirmación de compra, mensaje final.
6. **Agentic:** solo la navegación del wizard y el llenado del formulario.
7. **Costo:** ver métricas — en replay es **5× más lento** que Playwright (5.8 s vs 1.2 s de mediana) y, en vivo, llamadas al modelo.
8. **Riesgo:** un hand-off puede "arreglar" un cambio que debió fallar. Mitigado porque todo resultado de negocio se verifica después con locators. En CI, `--strict-cache` evita que un replay roto pase en silencio.
9. **Beneficio (medido con la mutación deliberada):** Playwright falló 4 tests; `e2e` en read-write pasó solo, re-grabó, y la siguiente corrida volvió a 0 llamadas.
10. **Recomendación:** **mantener como experimental** 4–6 semanas con las métricas de la sección 7. Si no se registra ningún cambio de UI en ese período que Playwright no haya absorbido con un locator semántico, revertir.

### POC-2 — Logout (`e2e/logout.e2e.js`, eliminado) → **revertir** (ya revertido; el archivo queda en el historial de git)

1. **Hoy:** `HeaderPage.logout()` → `.bm-burger-button` + `#logout_sidebar_link`.
2. **Problema supuesto:** el menú hamburguesa es un detalle de implementación que cambia entre versiones.
3. **Playwright puro:** `getByRole('button', { name: 'Open Menu' })` + `getByRole('link', { name: 'Logout' })`.
4. **Con `e2e`:** `agent.act('Log out of the application')` + URL, botón de login y acceso a ruta protegida verificados.
5–6. Determinístico: todo el resultado. Agentic: 2 clicks.
7. **Costo:** igual latencia en replay (1.67 s vs 1.64 s), pero necesita modelo configurado siempre (ver hallazgo en Fase 5).
8. **Riesgo:** bajo.
9. **Beneficio medido:** **ninguno.** En el rediseño real v1 → actual los selectores del menú **no cambiaron** (`Header.spec.js` siguió pasando).
10. **Recomendación:** **revertir**. Viola la regla "no usar IA para hacer un click". Queda en el historial como evidencia.

### Por qué no hay un tercer candidato

Los demás tests son de categoría A o D (tabla de la Fase 2). El único caso con valor
semántico real que apareció es **`problem_user`** (SauceDemo muestra imágenes y
comportamiento incorrectos para ese usuario): un `agent.assert('…', { vision: true })` sería
un buen candidato futuro, pero **no existe un test hoy** y la consigna era usar tests existentes.

---

## 5. Cache / replay (Fase 5) — verificado en 0.18.0

Fuente: `node_modules/e2e/docs/cache.mdx` (versión instalada; difiere de `main` justamente en la clave del cache) + ejecuciones reales.

| Pregunta | Respuesta | Verificado |
|---|---|---|
| ¿Dónde se guarda? | `.e2e/cache/<sha256>.json`, un archivo por paso, modo `0600` | ✔ |
| ¿Qué contiene? | Acciones con su target (`role`, `name`, `testId`, `placeholder`), valores tipeados, checks del estado final. Sin prompts, screenshots ni secretos | ✔ (entrada inspeccionada) |
| ¿Cómo se identifica un paso? | Test + target + instrucción + params + agente + `context`; también la **versión minor del engine** (en `main` esto ya cambió) y la identidad de la app (origen por defecto). **El modelo y el executor no forman parte de la clave** | Parcial: la UI mutada se sirvió en el **mismo** origen a propósito para conservar la clave; la regla de origen sale de la doc, no se midió |
| ¿Cuándo replaya? | Misma ruta de inicio, cada target se encuentra por rol/nombre/testId, y el efecto final se reproduce | ✔ 3/3 corridas y 20/20 repeticiones en replay |
| ¿Cuándo vuelve al modelo? | En `miss` (sin entrada), en retries (nunca replayan) y en hand-off (`target-not-found`, `end-mismatch`, etc.) | ✔ hand-off medido |
| ¿Qué pasa si cambia la UI? | El replay espera **15 s** al control; luego hand-off al agente, que continúa desde la pantalla actual y re-graba | ✔ 1 acción replayada → hand-off → paso completado → re-grabado |
| ¿Cómo afecta CI? | En CI el modo por defecto es `read-only`. Con `--strict-cache`, un recording roto falla con `REPLAY_STALE` (exit 2) **sin llamar al modelo** | ✔ exit 2, 0 llamadas |
| ¿Commitear el cache? | **Sí**: `.gitignore` ignora `.e2e/*` excepto `.e2e/cache/`. Revisar las entradas en el PR como test data (son acciones que se ejecutan sin modelo) | — |
| ¿Contaminación local → CI? | Las entradas dependen del origen: lo grabado contra `localhost`/staging no replaya contra producción. CI no escribe (`read-only`) | ✔ |
| ¿Invalidar? | `npx e2e cache clear`, o borrar el archivo; un run `read-write` exitoso re-graba | — |
| ¿Medir el ahorro? | Línea `Cache N replayed · M handed off · K missed` + `step.cache.mode` / `reason` en `.e2e/report.json` + `usage.modelTokens` | ✔ |

**Hallazgo que contradice la intuición:** sin modelo configurado, **todo test que usa el
fixture `agent` falla al iniciar** (`MODEL_UNAVAILABLE`), aunque su paso esté 100% en cache.
El cache ahorra llamadas, pero **no** permite correr sin API key.

---

## 6. Modelos (Fase 6)

No se agregó ninguna API key. `e2e.config.mts` solo configura modelo si existe `ANTHROPIC_API_KEY`.

| Tema | Análisis |
|---|---|
| Provider | `@ai-sdk/anthropic` directo (sin gateway): una sola credencial, sin intermediario, y Anthropic es una de las opciones documentadas por `e2e`. El repo no tenía configuración de IA previa |
| Modelo por defecto | `claude-sonnet-5-5`, elegido por el equipo por costo (configurable con `E2E_MODEL`). Necesita tool use + visión; lo tienen todos los de la tabla. Para pasos que fallen por calidad, `E2E_MODEL=claude-opus-5-5` |
| Compatibilidad | Opus 5.5 y Sonnet 5.5 rechazan `tool_choice` forzado. `e2e@0.18.0` lo maneja: reintenta con `auto` (`dist/agent/model/tool-choice.js`) |
| Precio por MTok (input / output) | Opus 5.5 $4 / $20 · Sonnet 5.5 $2 / $10 · Haiku 4.5 $1 / $5. Cambiar de modelo no invalida el cache |
| Tokens por paso | **NO MEDIDO** (sin key). Dato real: la observación más grande fue de 6.650 bytes (`usage.maxObservationBytes`). **ESTIMADO:** un `act` de checkout (6 acciones) ≈ 5–8 turnos × 3–6k tokens de entrada ≈ 20–40k entrada + 1–2k salida ⇒ ~$0.05–0.10 por ejecución en vivo con Sonnet 5.5 (el doble con Opus 5.5). En replay: $0 |
| Latencia | Replay medido: 5.8 s el checkout. En vivo: **NO MEDIDO** (se suma la latencia de cada turno del modelo) |
| Modelo local | Soportado vía `@ai-sdk/openai-compatible`, pero necesita tool calling + visión con calidad suficiente; no se evaluó. No recomendado para CI |
| CI | Key solo como secret del repo; el job agentic se salta si no existe |
| ¿Qué parte necesita modelo? | Solo `agent.act` en miss/hand-off y siempre `agent.assert/waitFor/extract`. El POC no usa `assert/extract` a propósito |

---

## 7. MCP + Claude Code (Fase 7)

`.mcp.json` registra `npx e2e mcp` (con telemetría desactivada). Claude Code pide aprobación
para servidores MCP de proyecto antes de usarlos. **No requiere modelo ni credenciales nuevas.**

Verificado hablando JSON-RPC por stdio con el servidor, igual que lo haría Claude Code:

| Capacidad | Resultado |
|---|---|
| Levantar/explorar la app | ✔ `open_session` abre el browser y devuelve el árbol |
| Inspeccionar la UI | ✔ `observe` (`#id role "name" testid=…`) |
| Encontrar locators reales | ✔ `locate {role:'button', name:'Login'}` → `screen.getByRole("button", "Login")` con cantidad exacta de matches |
| Llenar secretos | ✔ `type_secret` llena el password sin exponer el valor |
| Screenshots tras un secreto | ✔ bloqueados: `PIXEL_TAINTED` |
| Navegación peligrosa | ✔ `file:///etc/passwd` → `POLICY_DENIED` |
| Crear/ejecutar/corregir tests | Vía CLI (`npm run e2e`) y `.e2e/failures/*.md`, como indica la doc |

**Limitación:** el MCP es de `e2e`, por lo que sus locators son de la API de `e2e` (`screen.*`),
no de Playwright. Para la suite Playwright sirven como referencia (mismo rol/nombre), no para copiar y pegar.

---

## 8. Métricas: baseline vs experimento (Fase 8)

Chromium, app local (red del entorno bloqueada). El "agente" del experimento es un
**ejecutor determinista de validación** (no un LLM), conectado con la API pública de
`StepExecutor` (`ctx.actions`), así que el **cache, replay y hand-off son los reales**
del framework. Sirve para medir la mecánica, **no la calidad de un LLM**.

| Métrica | Baseline Playwright | Experimento e2e |
|---|---|---|
| Estabilidad (suite corregida) | **340/340**, 0% flaky | **20/20** en replay, 0% flaky |
| Tiempo, checkout (mediana) | **1.17 s** | 5.8 s en replay · 3.4 s la 1.ª grabación (suite) |
| Tiempo, logout (mediana) | 1.64 s | 1.67 s |
| Llamadas al modelo, run normal | 0 | **0** (100% replay) |
| Tokens | 0 | 0 en replay · en vivo **NO MEDIDO** |
| % replay | — | 100% estable · 50% con UI mutada |
| Cambio real de UI (v1 → actual) | 8/17 fallos, se arregló con 5 cambios determinísticos | El agente habría resuelto 1 de 10 problemas |
| Cambio deliberado (Checkout → Proceed to checkout, Continue → Next) | 4/17 fallos, 73 s | read-write: pasa, 1 hand-off, re-graba (19.5 s) · strict CI: `REPLAY_STALE`, 0 llamadas |
| Tiempo para actualizar el test | Cambiar 2 locators en 2 Page Objects | 0 (re-grabación automática) + revisar el diff del cache en el PR |
| Sin API key | Corre | **No corre** (`MODEL_UNAVAILABLE`, exit 2) |
| Requisito de Node | ≥ 18 | ≥ 22.22.3 o ≥ 24.8 |

### Criterios para declarar exitoso el experimento (a medir con key real, 4–6 semanas)

1. Flaky rate del job `e2e-agentic` ≤ al de Playwright.
2. ≥ 90% de pasos `replayed` en CI.
3. ≥ 1 cambio de UI real que Playwright no absorbió con locators semánticos y el agente sí.
4. Costo mensual de modelo < costo de horas de mantenimiento evitadas.
5. Cero casos donde un hand-off ocultó una regresión.

Si no se cumplen 3 y 5, revertir POC-1.

---

## 9. Seguridad (Fase 9)

| Superficie | Verificación |
|---|---|
| Credenciales | Password como `Secret`. **0 apariciones** en claro o base64 en `report.json`, `junit.xml`, `summary.md`, cache y traces descomprimidos |
| Traces | Reescritos: **17 reemplazos** por `<secret:standard.password>` |
| Screenshots | Después de llenar un secreto `e2e` no toma más screenshots en ese intento. Consecuencia: **los fallos de estos tests no tienen screenshot**, solo `failure/screen.txt` (árbol redactado) |
| Videos | `video: 'off'`. La doc declara que `e2e` no enmascara videos |
| MCP | `type_secret` nunca muestra el valor; `PIXEL_TAINTED`; `POLICY_DENIED` para `file:` |
| Prompts | El modelo ve el nombre del secreto, no el valor (`docs/security.mdx`; **NO MEDIDO** con un modelo real) |
| Downloads / consola | No aplica en este POC. Ojo: `command.log` y la consola de la app no se redactan |
| Telemetría | La CLI envía telemetría anónima a PostHog por defecto. Desactivada en `.mcp.json` y en CI (`E2E_TELEMETRY_DISABLED=1`); para local, `npx e2e telemetry disable` |
| Credencial de SauceDemo | Es pública (impresa en la pantalla de login). En un proyecto real va solo por variables de entorno |
| Vulnerabilidades | `npm audit`: 2 high, **preexistentes**, por Playwright < 1.55.1 (GHSA-7mvr-c777-76hp). No vienen de `e2e`. Se recomienda subir Playwright en un PR aparte |

---

## 10. Compatibilidad (Fase 10)

| Item | Valor | Impacto |
|---|---|---|
| Node local | 22.22.0 | **Incompatible:** `e2e` exige `^22.22.3 \|\| >=24.8.0` y la CLI lo valida al arrancar (`dist/internal/node-version.js`, por un bug de `module.registerHooks` en Node). npm solo avisa con `EBADENGINE` |
| Solución menos invasiva | `.nvmrc` = 24 y `node-version-file` en CI. No se cambió la Node global ni `engines` (Playwright sigue funcionando desde Node 18) | — |
| npm | 10.9.4 | OK |
| TypeScript | No se usa; `e2e` compila `.mts` sin instalar TypeScript | OK |
| Playwright | 1.53.0 (sin cambios) | `@e2e-dev/web` trae su propio `playwright-core@1.63.0`, independiente |
| Browsers | `e2e` necesita Chromium rev 1243 (`npx @e2e-dev/web install chromium`) | En este entorno la descarga estaba bloqueada; se validó con `web({ connect })` a un Chromium local, **solo en la validación** |
| Versiones | Pinneadas exactas: `e2e@0.18.0`, `@e2e-dev/web@0.13.0`, `ai@7.0.107`, `@ai-sdk/anthropic@4.0.58` (las mismas con las que `e2e@0.18.0` se testea) | Pre-1.0: cada minor puede romper y además re-keyea el cache |
| Funcionalidades que faltan vs Playwright | Reporte HTML, `fullyParallel`, emulación de devices, `toHaveScreenshot`, `page.on('console')`, entre otras | Por eso no se migra |

---

## 11. Cómo ejecutar

```bash
nvm use                    # Node 24 (.nvmrc)
npm ci

# Playwright (principal)
npx playwright install
npm test

# e2e (experimental)
npx @e2e-dev/web install chromium
export ANTHROPIC_API_KEY=...       # nunca en el repo
export E2E_TELEMETRY_DISABLED=1
npm run e2e                # local: cache read-write
npm run e2e:no-cache       # forzar el agente en vivo
npm run e2e:ci             # como CI: read-only + --strict-cache
npm run e2e:cache          # inspeccionar recordings
```

Variables:

| Variable | Uso |
|---|---|
| `BASE_URL` | Entorno para los dos runners (default `https://www.saucedemo.com/`) |
| `ANTHROPIC_API_KEY` | Requerida por los tests que usan `agent` |
| `E2E_MODEL` | Opcional, default `claude-sonnet-5-5` |
| `E2E_USER_STANDARD_USERNAME` / `E2E_USER_STANDARD_PASSWORD` | Override de la credencial |
| `E2E_TELEMETRY_DISABLED=1` | Desactiva la telemetría de la CLI |

Grabar el primer cache (requiere key): `npm run e2e`, revisar `.e2e/cache/*.json` y commitearlo.

---

## 12. Pendientes

- **NO MEDIDO:** tokens, latencia y calidad de un LLM real. Primer paso con key: `npm run e2e -- --no-cache --ai-trace`.
- Firefox/WebKit no se validaron localmente (solo hay Chromium en este entorno); CI los corre.
- Deuda de la suite Playwright detectada (fuera de alcance de este PR): login repetido sin `storageState`, `SessionPage` con `waitForTimeout` y `try/catch` que devuelve `boolean`, aserción condicional en `Session.spec.js`, validaciones de URL duplicadas, `npm audit`.
