import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../errors/ApiError.js'
import { verificarToken } from '../services/tokens.js'

/**
 * Valida el token del encabezado `Authorization: Bearer <token>`.
 *
 * Cualquier problema de identidad —falta el token, la firma no calza, expiró— resuelve
 * en 401. La distinción entre expirado e inválido la hace `verificarToken`.
 */
export function autenticar(req: Request, _res: Response, next: NextFunction): void {
  const encabezado = req.header('authorization')

  if (!encabezado?.startsWith('Bearer ')) {
    throw ApiError.noAutenticado()
  }

  const token = encabezado.slice('Bearer '.length).trim()

  if (!token) {
    throw ApiError.noAutenticado()
  }

  req.auth = verificarToken(token)

  next()
}
