/** Códigos de error del contrato. Ver docs/API.md. */
export type CodigoError =
  | 'VALIDATION_ERROR'
  | 'INVALID_RUT'
  | 'INVALID_CREDENTIALS'
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'FORBIDDEN_RUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'

/**
 * Error de dominio con la información que necesita la respuesta HTTP.
 * El manejador central lo traduce al formato uniforme del contrato.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: CodigoError,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static validacion(message: string) {
    return new ApiError(400, 'VALIDATION_ERROR', message)
  }

  static rutInvalido() {
    return new ApiError(400, 'INVALID_RUT', 'El RUT ingresado no es válido')
  }

  static credencialesInvalidas() {
    return new ApiError(401, 'INVALID_CREDENTIALS', 'Email o contraseña incorrectos')
  }

  static noAutenticado(message = 'Necesitas iniciar sesión') {
    return new ApiError(401, 'UNAUTHENTICATED', message)
  }

  static tokenExpirado() {
    return new ApiError(401, 'TOKEN_EXPIRED', 'Tu sesión expiró, vuelve a ingresar')
  }

  static rutProhibido() {
    return new ApiError(403, 'FORBIDDEN_RUT', 'Solo puedes consultar tu propio RUT')
  }

  static noEncontrado() {
    return new ApiError(404, 'NOT_FOUND', 'Recurso no encontrado')
  }
}
