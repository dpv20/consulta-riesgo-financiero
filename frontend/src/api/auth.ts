import { api } from './client.js'

export type Rol = 'admin' | 'user'

export interface Usuario {
  id: string
  role: Rol
  /** Solo los usuarios con rol `user` tienen RUT asociado. */
  rut: string | null
}

interface RespuestaLogin {
  token: string
  user: Usuario
}

/** `identificador` acepta el email o el RUT de la persona. */
export async function iniciarSesion(
  identificador: string,
  password: string,
): Promise<RespuestaLogin> {
  const { data } = await api.post<RespuestaLogin>('/login', { identificador, password })

  return data
}
