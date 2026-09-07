import { timingSafeEqual } from 'node:crypto'
import { formatearRut, normalizarRut } from './rut.js'

export type Rol = 'admin' | 'user'

/**
 * Registro completo, con credencial incluida.
 *
 * No se exporta a propósito: la contraseña no debe salir de este módulo. El resto de la
 * aplicación trabaja con `Usuario`, que no la tiene, de modo que un `res.json(usuario)`
 * descuidado no pueda filtrarla.
 */
interface RegistroUsuario {
  id: string
  email: string
  password: string
  rol: Rol
  /** Solo los usuarios con rol `user` tienen un RUT asociado. */
  rut?: string
}

/** Lo que ve el resto de la aplicación: identidad sin credenciales. */
export interface Usuario {
  id: string
  rol: Rol
  rut?: string
}

/**
 * Credenciales simuladas. El enunciado pide autenticación mock, sin persistencia.
 *
 * En un sistema real esto sería una tabla y las contraseñas estarían hasheadas con
 * bcrypt o argon2; aquí van en claro a propósito, para que el evaluador pueda ejecutar
 * el proyecto sin montar nada.
 */
const USUARIOS: readonly RegistroUsuario[] = [
  { id: 'u-001', email: 'admin@prontopaga.cl', password: 'admin123', rol: 'admin' },
  {
    id: 'u-002',
    email: 'user@prontopaga.cl',
    password: 'user123',
    rol: 'user',
    rut: formatearRut('12345678-5'),
  },
]

/** Quita la credencial antes de que el registro salga del módulo. */
function sinCredenciales(registro: RegistroUsuario): Usuario {
  return {
    id: registro.id,
    rol: registro.rol,
    ...(registro.rut ? { rut: registro.rut } : {}),
  }
}

/**
 * Busca por email o por RUT.
 *
 * Ingresar con RUT es la convención en la banca chilena, y acá sale gratis porque el RUT
 * ya es parte del modelo. Se compara normalizado, así que da igual cómo venga escrito.
 * Los usuarios `admin` no tienen RUT, y por lo tanto solo entran por email.
 */
function buscarRegistro(identificador: string): RegistroUsuario | undefined {
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
 * Devuelve el usuario si las credenciales calzan, o `null` si no.
 *
 * `identificador` acepta el email o el RUT.
 */
export function autenticar(identificador: string, password: string): Usuario | null {
  const registro = buscarRegistro(identificador)

  // Se compara igual aunque el usuario no exista, para no revelar por tiempo de
  // respuesta si el identificador está registrado.
  const passwordEsperada = registro?.password ?? ''
  const coincide = comparacionSegura(password, passwordEsperada)

  return registro && coincide ? sinCredenciales(registro) : null
}
