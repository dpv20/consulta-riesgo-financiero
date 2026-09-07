# Registro de uso de Inteligencia Artificial

El desafío autoriza apoyarse en modelos de IA y pide declarar qué herramientas se usaron y
en qué partes del código ayudaron. Este archivo es ese registro, y se mantiene actualizado
a medida que avanza el desarrollo.

## Herramientas

| Herramienta | Modelo | Estado | Uso |
|---|---|---|---|
| Claude Code | Opus 5 | En uso | Preparación del entorno, andamiaje de ambos proyectos, decisiones de arquitectura, documentación |
| Antigravity | Gemini | No utilizada | Mejora de UI y diseño, vale decir experto en UX/UI
| Codex | GPT | No utilizada | Revision final y definicion de mejoras |

El desarrollo se resolvió íntegramente con Claude Code. Las otras dos herramientas se
consideraron para repartir trabajo pero finalmente no se usaron, y no hay código suyo en el
repositorio.

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

### 2026-09-07 — Implementación del backend

**Asistido por Claude Code:**
- Módulo de RUT: normalización, validación de forma, cálculo del dígito verificador
  (módulo 11) y formato canónico.
- Cálculo determinista del score con FNV-1a de 32 bits sobre el RUT normalizado.
- Autenticación mock con comparación de contraseña en tiempo constante.
- Firma y verificación de JWT, distinguiendo token expirado de token inválido.
- Middlewares de autenticación y de autorización por rol, y manejador central de errores.
- Endpoints `POST /login` y `GET /score/:rut`.
- Suite de 33 pruebas: dominio de RUT, determinismo del score, y matriz de autenticación y
  autorización sobre la API levantada en memoria con supertest.

**Revisiones propias sobre lo generado:**
- Se detectó que el payload del JWT usaba la clave `rol` en lugar de `role`, que es la que
  fija el enunciado. Corregido.
- Se detectó que el RUT de ejemplo del enunciado, `12.345.678-9`, no satisface el módulo 11.
  Se resolvió **validar el dígito verificador de todos modos**, por tratarse de un servicio
  de riesgo financiero donde aceptar RUTs inexistentes sería un hueco real, y ajustar las
  credenciales de prueba a `12.345.678-5`. La desviación respecto del ejemplo queda
  documentada en el README y en `docs/API.md`.

### 2026-09-07 — Implementación del frontend

**Asistido por Claude Code:**
- Normalización de errores de la API a un tipo único con código estable, y el mapa de
  códigos a los mensajes que ve la persona usuaria.
- Cliente HTTP con token en memoria e interceptores, y estado de sesión con Zustand.
- Hooks de datos sobre TanStack Query para el login y la consulta de score.
- Componentes base —alerta, campo de formulario, botón y tarjeta de resultado— con
  etiquetas y descripciones enlazadas por `aria`.
- Pantallas de login y de consulta, con ruta protegida y cierre de sesión.
- Nueve pruebas de flujo sobre la interfaz: ingreso correcto e incorrecto, fallo de red,
  redirección sin sesión, consulta exitosa, rechazo por RUT ajeno y validación local.

### 2026-09-07 — Ajustes posteriores a la primera versión funcional

**Asistido por Claude Code:**
- Validación del dígito verificador del RUT (módulo 11) en frontend y backend.
- Inicio de sesión con email **o** RUT, con el campo del contrato renombrado a
  `identificador` y `email` mantenido como alias.
- Verificación de la aplicación en un navegador real —no solo con pruebas automatizadas—
  recorriendo login, consulta propia, rechazo por RUT ajeno, rechazo por dígito
  verificador, consulta como `admin` y comportamiento responsive.

**Decisiones propias en esta etapa:**
- Exigir el módulo 11 fue una decisión de dominio: en un servicio de riesgo financiero
  aceptar RUTs inexistentes permitiría consultar identidades inventadas. Se asumió
  conscientemente que el RUT de ejemplo del enunciado quedara rechazado.
- Permitir el ingreso por RUT responde a la convención de la banca chilena.

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
