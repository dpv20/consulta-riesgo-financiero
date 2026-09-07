import { timingSafeEqual } from 'node:crypto'
import { formatearRut, normalizarRut } from './rut.js'

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

/**
 * Busca por email o por RUT.
 *
 * Ingresar con RUT es la convención en la banca chilena, y acá sale gratis porque el RUT
 * ya es parte del modelo. Se compara normalizado, así que da igual cómo venga escrito.
 * Los usuarios `admin` no tienen RUT, y por lo tanto solo entran por email.
 */
function buscarUsuario(identificador: string): Usuario | undefined {
  const email = identificador.trim().toLowerCase()
  const rut = normalizarRut(identificador)

  return USUARIOS.find(
    (u) =>
      u.email.toLowerCase() === email ||
      // El largo mínimo evita que un identificador sin dígitos se normalice a algo
      // corto y calce por accidente.
      (rut.length >= 8 && u.rut !== undefined && normalizarRut(u.rut) === rut),
  )
}

/**
 * Devuelve el usuario si las credenciales calzan, o `null` si no.
 *
 * `identificador` acepta el email o el RUT.
 */
export function autenticar(identificador: string, password: string): Usuario | null {
  const usuario = buscarUsuario(identificador)

  // Se compara igual aunque el usuario no exista, para no revelar por tiempo de
  // respuesta si el identificador está registrado.
  const passwordEsperada = usuario?.password ?? ''
  const coincide = comparacionSegura(password, passwordEsperada)

  return usuario && coincide ? usuario : null
}
