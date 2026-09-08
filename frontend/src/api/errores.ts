import axios from 'axios'

/** Códigos que puede devolver la API. Ver docs/API.md. */
export type CodigoError =
  | 'VALIDATION_ERROR'
  | 'INVALID_RUT'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN_RUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'

/**
 * Mensajes que ve la persona usuaria.
 *
 * Viven en el frontend, no en la API: el backend entrega un `code` estable y la interfaz
 * decide cómo contarlo. Así el texto se puede cambiar o traducir sin tocar el servidor.
 */
const MENSAJES: Record<CodigoError, string> = {
  VALIDATION_ERROR: 'Revisa los datos ingresados',
  INVALID_RUT: 'El RUT ingresado no es válido',
  INVALID_CREDENTIALS: 'Email o contraseña incorrectos',
  UNAUTHENTICATED: 'Necesitas iniciar sesión',
  TOKEN_EXPIRED: 'Tu sesión expiró, vuelve a ingresar',
  FORBIDDEN_RUT: 'Solo puedes consultar tu propio RUT',
  NOT_FOUND: 'No encontramos lo que buscabas',
  INTERNAL_ERROR: 'Ocurrió un error inesperado, intenta de nuevo',
  NETWORK_ERROR: 'No pudimos conectar con el servidor. Vuelve a intentar.',
}

export class ErrorApi extends Error {
  readonly codigo: CodigoError

  constructor(codigo: CodigoError) {
    super(MENSAJES[codigo])
    this.codigo = codigo
    this.name = 'ErrorApi'
  }

  /** `true` cuando el problema es de identidad y corresponde volver al login. */
  get requiereReingreso(): boolean {
    return this.codigo === 'UNAUTHENTICATED' || this.codigo === 'TOKEN_EXPIRED'
  }
}

function esCodigoConocido(valor: unknown): valor is CodigoError {
  return typeof valor === 'string' && valor in MENSAJES
}

/**
 * Traduce cualquier fallo a un `ErrorApi`, para que la interfaz nunca tenga que inspeccionar
 * errores de axios ni ramificar por el texto del mensaje.
 */
export function normalizarError(error: unknown): ErrorApi {
  if (error instanceof ErrorApi) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) return new ErrorApi('NETWORK_ERROR')

    const codigo: unknown = error.response.data?.error?.code

    return new ErrorApi(esCodigoConocido(codigo) ? codigo : 'INTERNAL_ERROR')
  }

  return new ErrorApi('INTERNAL_ERROR')
}
