# Contrato de la API

Documento de referencia entre backend y frontend. **Es la fuente de verdad**: si el código
y este documento discrepan, se corrige el que esté equivocado, pero no se avanza con ambos
desalineados.

- **Base URL en desarrollo:** `http://localhost:3000`
- Todas las respuestas son `application/json`.
- Los endpoints protegidos esperan la cabecera `Authorization: Bearer <token>`.

---

## Formato de error

Todos los errores comparten la misma forma, para que el frontend pueda ramificar por
`code` sin depender del texto:

```json
{
  "error": {
    "code": "FORBIDDEN_RUT",
    "message": "No tienes permiso para consultar este RUT"
  }
}
```

| HTTP | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Cuerpo o parámetro con forma inválida |
| 400 | `INVALID_RUT` | El RUT no cumple formato o dígito verificador |
| 401 | `INVALID_CREDENTIALS` | Email o contraseña incorrectos en el login |
| 401 | `UNAUTHENTICATED` | Falta el token, o su firma es inválida |
| 401 | `TOKEN_EXPIRED` | El token es válido pero expiró |
| 403 | `FORBIDDEN_RUT` | Rol `user` consultando un RUT que no es el suyo |
| 500 | `INTERNAL_ERROR` | Fallo no controlado |

> **`401` y `403` no son intercambiables.** `401` = no sé quién eres (o ya no lo sé).
> `403` = sé quién eres y no te corresponde. El frontend reacciona distinto a cada uno:
> el `401` saca al login, el `403` no.

> Un `403` **no revela** si el RUT consultado existe o no. No filtrar esa información es
> parte del control de acceso.

---

## `POST /login`

Autenticación simulada contra credenciales mock. No hay base de datos.

**Request**

```json
{ "email": "user@prontopaga.cl", "password": "user123" }
```

**200 OK**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "u-002", "role": "user", "rut": "12.345.678-9" }
}
```

El objeto `user` se devuelve aparte del token **a propósito**: el frontend no debe decodificar
el JWT para decidir qué mostrar. El token se envía; el estado de UI sale de `user`.

Para un `admin`, `rut` es `null`:

```json
{ "token": "...", "user": { "id": "u-001", "role": "admin", "rut": null } }
```

**Errores:** `400 VALIDATION_ERROR` · `401 INVALID_CREDENTIALS`

### Payload del JWT

```json
{
  "sub": "u-002",
  "role": "user",
  "rut": "12.345.678-9",
  "iat": 1751034900,
  "exp": 1751035800
}
```

- `sub` — ID del usuario.
- `role` — `"admin"` o `"user"`.
- `rut` — **presente solo si `role` es `"user"`.** En un `admin` la clave no existe.
  Es lo que hace posible la regla de autorización: el RUT autorizado viaja firmado dentro
  del token, no lo elige el cliente.
- Expiración: **15 minutos** (`JWT_EXPIRES_IN`, configurable por entorno).

---

## `GET /score/:rut`

Devuelve el score de riesgo financiero de un RUT. Requiere autenticación.

**Autorización**

| Rol | Puede consultar |
|---|---|
| `admin` | Cualquier RUT |
| `user` | **Únicamente el RUT de su propio token** |

La comparación se hace sobre el RUT **normalizado**, no sobre el texto crudo: `12345678-9`
y `12.345.678-9` son el mismo RUT y deben resolverse igual.

**200 OK**

```json
{ "rut": "12.345.678-9", "score": 73, "fecha": "2025-06-27T14:35:00Z" }
```

- `rut` — devuelto en formato canónico con puntos y guion.
- `score` — entero **entre 0 y 100**.
- `fecha` — ISO 8601 en UTC, momento de la consulta.

**Errores:** `400 INVALID_RUT` · `401 UNAUTHENTICATED` · `401 TOKEN_EXPIRED` ·
`403 FORBIDDEN_RUT`

### Regla determinista

El enunciado exige que **el mismo RUT devuelva siempre el mismo score, y que RUTs distintos
devuelvan scores distintos**.

Se resuelve con una **función pura** sobre el RUT normalizado: sin estado, sin aleatoriedad
y sin depender de la fecha. Consecuencia práctica: es verificable con un test que llame dos
veces y compare, y con otro que compruebe que dos RUTs distintos difieren.

`fecha` sí cambia entre llamadas — es el momento de la consulta, no parte del score.

---

## Usuarios mock

| Email | Password | Rol | RUT |
|---|---|---|---|
| `admin@prontopaga.cl` | `admin123` | `admin` | — |
| `user@prontopaga.cl` | `user123` | `user` | `12.345.678-9` |

Credenciales de demostración para una prueba técnica: van en el repositorio a propósito,
para que el evaluador pueda ejecutar el proyecto. En un sistema real no existirían.

---

## RUT: formato y normalización

- **Formato canónico** (el que se muestra y se devuelve): `12.345.678-9`.
- **Formato normalizado** (el que se compara y con el que se calcula): `123456789`, sin
  puntos ni guion, con `K` en mayúscula.
- Se valida el **dígito verificador** (módulo 11). Un RUT con forma correcta pero dígito
  incorrecto es `400 INVALID_RUT`.
- El frontend valida antes de llamar, para no gastar un viaje de red; el backend valida
  igual, porque nunca se confía en el cliente.

---

## Mapa de errores → mensajes de UI

Referencia para el frontend. Los tres primeros son los casos que el enunciado pide
manejar de forma explícita.

| `code` | Mensaje al usuario | Acción |
|---|---|---|
| `INVALID_CREDENTIALS` | Email o contraseña incorrectos | Quedarse en el login |
| `FORBIDDEN_RUT` | Solo puedes consultar tu propio RUT | Quedarse en la vista, mantener el formulario |
| `TOKEN_EXPIRED` | Tu sesión expiró, vuelve a ingresar | Limpiar sesión y redirigir al login |
| `UNAUTHENTICATED` | Necesitas iniciar sesión | Redirigir al login |
| `INVALID_RUT` | El RUT ingresado no es válido | Error de campo en el formulario |
| `INTERNAL_ERROR` | Ocurrió un error inesperado, intenta de nuevo | Ofrecer reintentar |
| _(sin respuesta)_ | No pudimos conectar con el servidor | Ofrecer reintentar |
