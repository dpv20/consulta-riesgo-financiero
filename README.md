# Consulta de Riesgo Financiero

[![CI](https://github.com/dpv20/consulta-riesgo-financiero/actions/workflows/ci.yml/badge.svg)](https://github.com/dpv20/consulta-riesgo-financiero/actions/workflows/ci.yml)

MVP que permite evaluar el *score* crediticio de personas o empresas según su RUT, con
autenticación JWT y control de acceso basado en roles.

- **Backend:** API REST en Node.js + TypeScript (Express), con firma y validación de JWT.
- **Frontend:** SPA en React + TypeScript (Vite), con login y consulta de score.

**▶ Aplicación en vivo: https://dpv20.github.io/consulta-riesgo-financiero/**

> La API corre en la capa gratuita de Render, que suspende la instancia tras un rato sin
> uso. **El primer inicio de sesión después de un periodo de inactividad puede tardar cerca
> de un minuto** mientras el servicio despierta; los siguientes son inmediatos.

## Requisitos

- **Node.js 20.19 o superior** (desarrollado sobre 24.20.0 LTS). Declarado en `engines`.
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

El usuario con rol `user` puede ingresar **con su email o con su RUT**, indistintamente.
Los `admin` no tienen RUT asociado, así que entran solo por email.

Son credenciales de demostración, incluidas a propósito para que el proyecto se pueda
ejecutar. No hay base de datos: la autenticación está simulada, como pide el enunciado, y
los dos usuarios viven en una constante en `backend/src/services/usuarios.ts`. Los scores
tampoco se almacenan: se calculan en cada consulta.

## Variables de entorno

**`backend/.env`**

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto de la API |
| `JWT_SECRET` | — | **Obligatoria.** Secreto de firma del JWT |
| `JWT_EXPIRES_IN` | `15m` | Vigencia del token |
| `CORS_ORIGIN` | `http://localhost:5173` | Orígenes autorizados, separados por coma |

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

**Se puede iniciar sesión con email o con RUT.** En la banca chilena ingresar con RUT es
la convención, y acá sale prácticamente gratis porque el RUT ya es parte del modelo. El
campo del contrato se llama `identificador` justamente porque acepta ambos, y la respuesta
de error es la misma en todos los casos, de modo que no se puede usar el login para
averiguar qué RUTs están registrados.

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

**El tipo con la contraseña no sale de su módulo.** `RegistroUsuario` —que incluye la
credencial— es privado de `services/usuarios.ts`; hacia afuera solo circula `Usuario`, sin
contraseña. Así, un `res.json(usuario)` descuidado no puede filtrarla.

**`createApp()` está separado del arranque del servidor**, para que las pruebas levanten la
API en memoria con supertest sin abrir un puerto.

**Los tipos del dominio se derivan de esquemas zod**, de forma que la validación en runtime
y los tipos en compilación no puedan desincronizarse.

## Pruebas

```bash
npm test
```

48 pruebas: el cálculo determinista del score, la validación de RUT, la matriz completa de
autenticación y autorización sobre la API levantada en memoria con supertest, y el
comportamiento de las vistas ante cada tipo de error.

Se ejecutan también en CI —junto con el lint, la verificación de tipos y el build— en cada
push a `main`.

## Limitaciones y qué haría en producción

El alcance del ejercicio es un MVP con autenticación simulada. Las simplificaciones son
deliberadas; esto es lo que faltaría para llevarlo a un entorno real.

**Persistencia y credenciales.** Los usuarios viven en una constante y las contraseñas
están en texto plano para que el proyecto se pueda ejecutar sin montar nada. En producción
irían en base de datos y las contraseñas hasheadas con argon2 o bcrypt.

**Ciclo de vida de la sesión.** El token dura 15 minutos y, al vencer, la persona vuelve a
ingresar. Correspondería un *refresh token* en cookie `httpOnly` con rotación y una lista de
revocación, de modo que un token robado se pueda invalidar.

**Límite de intentos.** `POST /login` no tiene rate limiting. En un servicio financiero es
imprescindible: límite por IP y por identificador, con backoff, para frenar fuerza bruta y
enumeración de RUTs.

**Origen del score.** El cálculo determinista cumple la regla del enunciado, pero **no es un
modelo de riesgo**: es un hash del RUT. En producción vendría de un bureau de crédito o de
un modelo propio, con caché, versionado del modelo y trazabilidad de qué versión produjo
cada resultado.

**Auditoría.** Toda consulta de score debería quedar registrada —quién consultó qué RUT y
cuándo—, tanto por regulación como para detectar uso indebido. Hoy no se registra nada.

**Observabilidad.** Faltan logs estructurados con identificador de petición, métricas de
latencia y error, y alertas. Hoy solo hay `console.error` para los fallos no controlados.

**Cabeceras de seguridad.** Correspondería `helmet` para las cabeceras estándar, HSTS y
forzar HTTPS. La configuración de CORS ya restringe el origen a uno solo, por variable de
entorno.

## Despliegue

- **Frontend:** https://dpv20.github.io/consulta-riesgo-financiero/ — GitHub Pages, con el
  workflow `.github/workflows/pages.yml`.
- **API:** https://consulta-riesgo-api.onrender.com — Render; por ejemplo,
  [`/health`](https://consulta-riesgo-api.onrender.com/health).

Como Pages sirve el sitio desde un subdirectorio, la ruta base se inyecta por entorno
(`VITE_BASE`) solo en ese build. Y como Pages no admite reglas de reescritura, el workflow
copia `index.html` como `404.html`: ante una ruta desconocida la SPA arranca igual y React
Router la resuelve en el cliente.

> Corre en la capa gratuita de Render, que suspende la instancia tras un rato sin uso.
> **La primera petición después de un periodo de inactividad puede tardar cerca de un minuto
> o devolver un error mientras el servicio despierta; basta reintentar.** No es un fallo de
> la aplicación: el error lo emite el enrutador de Render antes de llegar al servidor.

El repositorio incluye un blueprint de [Render](https://render.com) en `render.yaml`, con
dos servicios: la API como *Web Service* de Node y el frontend como *Static Site*.

Ambos se construyen desde la raíz, no desde sus subcarpetas: al ser un monorepo con npm
workspaces, el lockfile vive en la raíz y un `npm install` dentro de cada paquete lo
ignoraría.

Tras crear los servicios hay que completar dos variables que dependen de las URLs que
Render asigna:

- `VITE_API_URL` en el frontend → URL pública de la API.
- `CORS_ORIGIN` en la API → URL pública del frontend.

`JWT_SECRET` lo genera Render automáticamente, de modo que el secreto de firma nunca queda
escrito en el repositorio.

> En la capa gratuita los servicios se suspenden tras un rato sin uso, así que **la primera
> petición después de un periodo de inactividad puede tardar cerca de un minuto**. No es un
> error de la aplicación.

## Documentación adicional

- [`docs/API.md`](docs/API.md) — contrato de la API: endpoints, payload del JWT, códigos de
  error y su mapeo a mensajes de interfaz.
- [`ai_interactions.md`](ai_interactions.md) — registro de las herramientas de IA utilizadas
  y en qué partes del proyecto se apoyaron.
