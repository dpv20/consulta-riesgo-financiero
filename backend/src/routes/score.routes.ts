import { Router } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../errors/ApiError.js'
import { autenticar } from '../middlewares/autenticar.js'
import { autorizarRut } from '../middlewares/autorizarRut.js'
import { esRutValido, formatearRut } from '../services/rut.js'
import { calcularScore } from '../services/score.js'
import { paramTexto } from '../utils/request.js'

/** Rechaza un RUT inexistente —forma o dígito verificador— antes de evaluar permisos. */
function validarRut(req: Request, _res: Response, next: NextFunction): void {
  if (!esRutValido(paramTexto(req, 'rut'))) {
    throw ApiError.rutInvalido()
  }

  next()
}

export const scoreRouter = Router()

/**
 * El orden de los middlewares importa: primero se resuelve la identidad (401), después
 * la forma del dato (400) y por último el permiso (403). Invertirlo revelaría, a quien
 * no está autenticado, si un RUT tiene forma válida.
 */
scoreRouter.get('/:rut', autenticar, validarRut, autorizarRut, (req, res) => {
  const rut = paramTexto(req, 'rut')

  res.json({
    rut: formatearRut(rut),
    score: calcularScore(rut),
    fecha: new Date().toISOString(),
  })
})
