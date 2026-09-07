import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../errors/ApiError.js'
import type { Rol, Usuario } from './usuarios.js'

/** Contenido firmado del JWT. Ver docs/API.md. */
export interface PayloadToken {
  sub: string
  /** El enunciado fija esta clave en inglés dentro del token. */
  role: Rol
  /** Presente únicamente cuando el rol es `user`. */
  rut?: string
}

/**
 * Firma un token para el usuario.
 *
 * El `rut` se incluye solo si el rol es `user`. Esa decisión es la que sostiene la
 * autorización: el RUT autorizado viaja firmado dentro del token, así que el cliente
 * no puede elegir qué está habilitado a consultar.
 */
export function firmarToken(usuario: Usuario): string {
  const payload: PayloadToken = {
    sub: usuario.id,
    role: usuario.rol,
    ...(usuario.rol === 'user' && usuario.rut ? { rut: usuario.rut } : {}),
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

/**
 * Verifica firma y expiración.
 *
 * Distingue el token expirado del token inválido porque el frontend reacciona distinto:
 * ante `TOKEN_EXPIRED` avisa que la sesión caducó, y no lo trata como un error genérico.
 */
export function verificarToken(token: string): PayloadToken {
  try {
    const decodificado = jwt.verify(token, env.JWT_SECRET)

    if (typeof decodificado === 'string') {
      throw ApiError.noAutenticado('Token con formato inválido')
    }

    return decodificado as PayloadToken & jwt.JwtPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.tokenExpirado()
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.noAutenticado('Token inválido')
    }
    throw error
  }
}
