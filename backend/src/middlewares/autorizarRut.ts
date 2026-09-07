import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../errors/ApiError.js'
import { normalizarRut } from '../services/rut.js'
import { paramTexto } from '../utils/request.js'

/**
 * Control de acceso sobre el RUT consultado.
 *
 *  - `admin`: cualquier RUT.
 *  - `user`: únicamente el RUT que viene firmado en su token.
 *
 * La comparación se hace sobre la forma normalizada, para que `12345678-9` y
 * `12.345.678-9` se resuelvan igual. El RUT autorizado sale del token, nunca de la
 * petición: el cliente no puede ampliarse los permisos.
 */
export function autorizarRut(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.auth

  if (!auth) {
    throw ApiError.noAutenticado()
  }

  if (auth.role === 'admin') {
    next()
    return
  }

  const rutSolicitado = normalizarRut(paramTexto(req, 'rut'))
  const rutAutorizado = normalizarRut(auth.rut ?? '')

  if (!rutAutorizado || rutSolicitado !== rutAutorizado) {
    throw ApiError.rutProhibido()
  }

  next()
}
