import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ApiError } from '../errors/ApiError.js'

/** Cualquier ruta no declarada resuelve en el mismo formato de error del contrato. */
export const rutaNoEncontrada: RequestHandler = () => {
  throw ApiError.noEncontrado()
}

/**
 * Traduce cualquier error al formato uniforme del contrato.
 *
 * Los errores no previstos se registran en el servidor pero se responden como
 * `INTERNAL_ERROR` genérico: el detalle interno no viaja al cliente.
 */
export const manejadorErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.status).json({
      error: { code: error.code, message: error.message },
    })
    return
  }

  console.error('Error no controlado:', error)

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' },
  })
}
