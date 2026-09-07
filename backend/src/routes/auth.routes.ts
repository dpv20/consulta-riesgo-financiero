import { Router } from 'express'
import { z } from 'zod'
import { ApiError } from '../errors/ApiError.js'
import { firmarToken } from '../services/tokens.js'
import { autenticar as autenticarCredenciales } from '../services/usuarios.js'

/**
 * `identificador` acepta email o RUT. Se mantiene `email` como alias porque es el nombre
 * que cualquiera asumiría al probar la API a ciegas, y no cuesta nada aceptarlo.
 */
const credencialesSchema = z.object({
  identificador: z.string().trim().min(1).optional(),
  email: z.string().trim().min(1).optional(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export const authRouter = Router()

authRouter.post('/login', (req, res) => {
  const resultado = credencialesSchema.safeParse(req.body)

  if (!resultado.success) {
    throw ApiError.validacion(
      resultado.error.issues[0]?.message ?? 'Credenciales con formato inválido',
    )
  }

  const identificador = resultado.data.identificador ?? resultado.data.email

  if (!identificador) {
    throw ApiError.validacion('Ingresa tu email o RUT')
  }

  const usuario = autenticarCredenciales(identificador, resultado.data.password)

  if (!usuario) {
    throw ApiError.credencialesInvalidas()
  }

  // El objeto `user` se devuelve aparte del token a propósito: así el frontend no
  // necesita decodificar el JWT para decidir qué mostrar.
  res.json({
    token: firmarToken(usuario),
    user: {
      id: usuario.id,
      role: usuario.rol,
      rut: usuario.rut ?? null,
    },
  })
})
