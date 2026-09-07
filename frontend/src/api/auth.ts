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

export async function iniciarSesion(
  email: string,
  password: string,
): Promise<RespuestaLogin> {
  const { data } = await api.post<RespuestaLogin>('/login', { email, password })

  return data
}
