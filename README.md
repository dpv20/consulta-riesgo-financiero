# Consulta de Riesgo Financiero

MVP que permite evaluar el *score* crediticio de personas o empresas según su RUT, con
autenticación JWT y control de acceso basado en roles.

- **Backend:** API REST en Node.js + TypeScript (Express), con firma y validación de JWT.
- **Frontend:** SPA en React + TypeScript (Vite), con login y consulta de score.

## Requisitos

- **Node.js 20 o superior** (desarrollado sobre 24.20.0 LTS)
- npm 10 o superior

## Puesta en marcha

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

Eso levanta ambos procesos a la vez:

- API — http://localhost:3000
- Web — http://localhost:5173

El repositorio está organizado como **npm workspaces**, así que un único `npm install` en la
raíz instala las dependencias de los dos paquetes.

## Usuarios de prueba

| Email | Password | Rol | Puede consultar |
|---|---|---|---|
| `admin@prontopaga.cl` | `admin123` | `admin` | Cualquier RUT |
| `user@prontopaga.cl` | `user123` | `user` | Solo `12.345.678-5` (el suyo) |

Son credenciales de demostración, incluidas a propósito para que el proyecto se pueda
ejecutar. No hay base de datos: la autenticación está simulada, como pide el enunciado.

## Variables de entorno

**`backend/.env`**

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto de la API |
| `JWT_SECRET` | — | **Obligatoria.** Secreto de firma del JWT |
| `JWT_EXPIRES_IN` | `15m` | Vigencia del token |
| `CORS_ORIGIN` | `http://localhost:5173` | Origen autorizado |

**`frontend/.env`**

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API |

La API **no levanta si falta `JWT_SECRET`**: es preferible fallar al arrancar que firmar
tokens con un valor por defecto.

## Scripts

Desde la raíz, aplican a los dos paquetes:

```bash
npm run dev        # API + web en paralelo
npm run build      # compila ambos
npm test           # ejecuta las pruebas de ambos
npm run typecheck  # verificación de tipos
npm run format     # Prettier
```

Y sobre un paquete concreto: `npm run dev -w backend`, `npm test -w frontend`, etc.

## Estructura

```
backend/
  src/
    config/       validación de variables de entorno
    middlewares/  autenticación y autorización
    routes/       endpoints
    services/     lógica de dominio (score, usuarios)
    app.ts        construcción de la app Express
    server.ts     arranque del servidor
frontend/
  src/
    api/          cliente HTTP
    components/   componentes reutilizables
    hooks/        hooks de datos
    pages/        vistas
    store/        estado de sesión
    test/         setup y utilidades de test
docs/
  API.md          contrato de la API
```

## Decisiones técnicas

**El RUT autorizado viaja firmado dentro del token.** Cuando el rol es `user`, el JWT
incluye su `rut`; cuando es `admin`, esa clave no existe. La autorización compara el RUT
solicitado contra el del token, así que el cliente no puede elegir qué está autorizado a ver.

**El access token se guarda en memoria, no en `localStorage`.** Reduce la superficie ante
XSS: un script inyectado no puede leerlo del storage. El costo asumido es que la sesión se
pierde al recargar. Para persistirla, la vía correcta sería una cookie `httpOnly` emitida
por el backend, no mover el token a `localStorage`.

**`401` y `403` se distinguen.** Token ausente, inválido o expirado devuelve `401`; token
válido sin permiso sobre ese RUT devuelve `403`. El frontend reacciona distinto a cada uno:
el `401` cierra la sesión, el `403` no. Un `403` tampoco revela si el RUT existe.

**El score se calcula con una función pura y determinista** sobre el RUT normalizado, sin
estado ni aleatoriedad, de modo que la regla del enunciado —mismo RUT, mismo score— sea
verificable con tests.

**Se valida el dígito verificador del RUT (módulo 11).** En un servicio de riesgo
financiero, aceptar un RUT que no existe permitiría consultar identidades inventadas, así
que un RUT mal formado o con dígito incorrecto se rechaza con `400`. Se valida en el
frontend para no gastar un viaje de red, y otra vez en el backend, porque no se confía en
el cliente.

> **Nota sobre el enunciado.** El RUT del ejemplo de la especificación, `12.345.678-9`, no
> satisface el módulo 11: a `12345678` le corresponde dígito `5`. Por eso las credenciales
> de prueba usan **`12.345.678-5`**, y una consulta a `12.345.678-9` responde `400`
> deliberadamente. Se prefirió mantener la validación por sobre reproducir el ejemplo, dado
> el dominio del problema.

**`createApp()` está separado del arranque del servidor**, para que las pruebas levanten la
API en memoria con supertest sin abrir un puerto.

**Los tipos del dominio se derivan de esquemas zod**, de forma que la validación en runtime
y los tipos en compilación no puedan desincronizarse.

## Pruebas

```bash
npm test
```

Cubren el cálculo determinista del score, la matriz de autorización por rol y el
comportamiento de las vistas ante errores.

## Documentación adicional

- [`docs/API.md`](docs/API.md) — contrato de la API: endpoints, payload del JWT, códigos de
  error y su mapeo a mensajes de interfaz.
- [`ai_interactions.md`](ai_interactions.md) — registro de las herramientas de IA utilizadas
  y en qué partes del proyecto se apoyaron.
