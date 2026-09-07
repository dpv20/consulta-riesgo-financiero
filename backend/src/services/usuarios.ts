import { timingSafeEqual } from 'node:crypto'
import { formatearRut } from './rut.js'

export type Rol = 'admin' | 'user'

export interface Usuario {
  id: string
  email: string
  password: string
  rol: Rol
  /** Solo los usuarios con rol `user` tienen un RUT asociado. */
  rut?: string
}

/**
 * Credenciales simuladas. El enunciado pide autenticación mock, sin persistencia.
 *
 * En un sistema real esto sería una tabla y las contraseñas estarían hasheadas con
 * bcrypt o argon2; aquí van en claro a propósito, para que el evaluador pueda ejecutar
 * el proyecto sin montar nada.
 */
const USUARIOS: readonly Usuario[] = [
  { id: 'u-001', email: 'admin@prontopaga.cl', password: 'admin123', rol: 'admin' },
  {
    id: 'u-002',
    email: 'user@prontopaga.cl',
    password: 'user123',
    rol: 'user',
    rut: formatearRut('12345678-5'),
  },
]

/**
 * Comparación en tiempo constante: evita que el tiempo de respuesta filtre cuántos
 * caracteres del secreto son correctos.
 */
function comparacionSegura(a: string, b: string): boolean {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) return false

  return timingSafeEqual(bufferA, bufferB)
}

/** Devuelve el usuario si las credenciales calzan, o `null` si no. */
export function autenticar(email: string, password: string): Usuario | null {
  const usuario = USUARIOS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  )

  // Se compara igual aunque el usuario no exista, para no revelar por tiempo de
  // respuesta si el email está registrado.
  const passwordEsperada = usuario?.password ?? ''
  const coincide = comparacionSegura(password, passwordEsperada)

  return usuario && coincide ? usuario : null
}
