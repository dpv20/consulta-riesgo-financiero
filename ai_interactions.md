# Registro de uso de Inteligencia Artificial

El desafío autoriza apoyarse en modelos de IA y pide declarar qué herramientas se usaron y
en qué partes del código ayudaron. Este archivo es ese registro, y se mantiene actualizado
a medida que avanza el desarrollo.

## Herramientas

| Herramienta | Modelo | Estado | Uso |
|---|---|---|---|
| Claude Code | Opus 5 | En uso | Preparación del entorno, andamiaje de ambos proyectos, decisiones de arquitectura, documentación |
| Antigravity | Gemini | Previsto | Componentes de UI, responsive, accesibilidad |
| Codex | GPT | Previsto | Endpoints, middlewares de JWT, tests del backend |

Cuando una herramienta prevista se use realmente, su fila pasa a "En uso" y sus aportes se
detallan abajo.

## Criterio de uso

La IA se usó como apoyo para planificar, estructurar y acelerar tareas mecánicas
—configuración de herramientas, andamiaje, boilerplate— y como interlocutor para contrastar
decisiones técnicas. Las decisiones de arquitectura y de seguridad se tomaron de forma
explícita y están documentadas con su justificación, no aceptadas por defecto.

---

## Registro cronológico

### 2026-09-04 — Preparación del entorno (previo a recibir el enunciado)

Todo lo de esta sección es configuración de herramientas, anterior al desarrollo del
desafío. Ningún código de la solución se escribió en esta etapa.

**Asistido por Claude Code:**
- Instalación de Node.js 24.20.0 LTS en modo portable (la máquina no tenía Node).
- Andamiaje de un proyecto Vite + React + TypeScript, con Tailwind 4, React Router,
  TanStack Query, Zustand, react-hook-form y zod.
- Configuración de Vitest + Testing Library: `setup.ts`, y un helper `renderWithProviders`
  que monta Router y React Query para los tests.
- Configuración de TypeScript en modo `strict`, alias `@/` → `src/`, Prettier y linter.
- Cliente HTTP con axios: instancia central, `baseURL` por variable de entorno,
  interceptores de request y de respuesta 401.

### 2026-09-07 — Andamiaje del backend (posterior al enunciado)

**Asistido por Claude Code:**
- Andamiaje del proyecto de API: Express 5 + TypeScript en ESM, con `jsonwebtoken`, zod,
  `cors` y `dotenv`; Vitest + supertest para pruebas.
- Configuración de TypeScript (`strict`, `noUncheckedIndexedAccess`), Prettier y scripts de
  `dev` / `build` / `test` / `typecheck`.
- Separación de `createApp()` (en `app.ts`) del arranque del servidor (`server.ts`), para
  poder levantar la app en memoria desde los tests con supertest.
- Validación de variables de entorno con zod al arrancar el proceso, de modo que la API no
  levante si falta el secreto de firma del JWT.
- Endpoint `/health` y un test de humo, como verificación del andamiaje.

### 2026-09-07 — Estructura del repositorio y contrato de API

**Asistido por Claude Code:**
- Organización del repositorio como **npm workspaces** con dos paquetes, `backend/` y
  `frontend/`, de modo que un solo `npm install` en la raíz instale ambos y `npm run dev`
  levante los dos procesos en paralelo.
- Redacción de `docs/API.md`: definición de los endpoints, del payload del JWT, del formato
  uniforme de error con sus códigos, y del mapeo de cada código al mensaje de interfaz
  correspondiente.
- Redacción de este `README.md` y verificación de que sus instrucciones funcionan tal como
  están escritas.

<!-- Las entradas del desarrollo de la solución van a continuación, a medida que ocurren -->

---

## Decisiones técnicas discutidas con IA

Se listan porque son las que más peso tienen en la evaluación, y para dejar claro cuáles se
tomaron de forma deliberada:

- **El access token se guarda en memoria, no en `localStorage`.** Reduce la superficie ante
  XSS: un script inyectado no puede leerlo del storage. El costo asumido es que la sesión se
  pierde al recargar la página. Si hubiera que persistirla, la vía correcta sería una cookie
  `httpOnly` emitida por el backend, no mover el token a `localStorage`.
- **El secreto del JWT se lee de variable de entorno y se valida al arrancar.** El proceso
  falla de inmediato si no está definido, en lugar de firmar tokens con un valor por defecto.
- **Separación entre `401` y `403`.** Token ausente, inválido o expirado devuelve `401`;
  token válido sin permiso sobre ese RUT devuelve `403`.
- **El cálculo del score se resuelve con una función pura y determinista** sobre el RUT
  normalizado, sin estado ni aleatoriedad, para que la regla del enunciado sea verificable
  con tests.

## Autoría

El código entregado fue revisado línea por línea. Las decisiones de arquitectura, seguridad
y estructura descritas arriba son deliberadas y puedo explicarlas y sostenerlas sin apoyo de
las herramientas.
