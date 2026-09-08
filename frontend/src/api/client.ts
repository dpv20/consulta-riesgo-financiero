import axios from 'axios'
import { normalizarError } from './errores.js'

/**
 * Cliente HTTP central. La baseURL sale de `VITE_API_URL` (ver `.env.example`) para no
 * dejar endpoints fijos en el bundle.
 */
/**
 * El timeout es holgado a propósito. La API está desplegada en una capa gratuita que
 * suspende la instancia por inactividad, y despertarla toma cerca de un minuto. Con un
 * timeout corto, el cliente aborta la petición antes de que el servidor alcance a
 * responder y el fallo se ve como si el servicio estuviera caído.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 90_000,
  headers: { 'Content-Type': 'application/json' },
})

let tokenDeAcceso: string | null = null
let alPerderSesion: (() => void) | null = null

/**
 * El token vive en memoria, no en `localStorage`.
 *
 * Reduce la superficie ante XSS: un script inyectado no puede leerlo del storage. El costo
 * asumido es que la sesión se pierde al recargar. Para persistirla, la vía correcta sería
 * una cookie `httpOnly` emitida por el backend.
 */
export function definirToken(token: string | null): void {
  tokenDeAcceso = token
}

/** Permite a la capa de sesión reaccionar cuando la API rechaza la identidad. */
export function alPerderLaSesion(callback: () => void): void {
  alPerderSesion = callback
}

api.interceptors.request.use((config) => {
  if (tokenDeAcceso) {
    config.headers.Authorization = `Bearer ${tokenDeAcceso}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const normalizado = normalizarError(error)

    // Solo un problema de identidad cierra la sesión. Un 403 no: la persona sigue
    // autenticada, simplemente no tiene permiso sobre ese RUT.
    if (normalizado.requiereReingreso) {
      tokenDeAcceso = null
      alPerderSesion?.()
    }

    return Promise.reject(normalizado)
  },
)
