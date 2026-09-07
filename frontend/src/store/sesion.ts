import { create } from 'zustand'
import type { Usuario } from '@/api/auth'
import { alPerderLaSesion, definirToken } from '@/api/client'

interface EstadoSesion {
  usuario: Usuario | null
  /** Se activa cuando la API rechaza el token, para poder avisar en el login. */
  sesionExpirada: boolean
  iniciar: (token: string, usuario: Usuario) => void
  cerrar: () => void
  descartarAviso: () => void
}

/**
 * Estado de sesión.
 *
 * El token no se guarda acá: vive en el módulo del cliente HTTP, en memoria. El store
 * conserva solo los datos del usuario, que son los que la interfaz necesita mostrar.
 */
export const useSesion = create<EstadoSesion>((set) => ({
  usuario: null,
  sesionExpirada: false,

  iniciar: (token, usuario) => {
    definirToken(token)
    set({ usuario, sesionExpirada: false })
  },

  cerrar: () => {
    definirToken(null)
    set({ usuario: null, sesionExpirada: false })
  },

  descartarAviso: () => set({ sesionExpirada: false }),
}))

// Cuando la API responde 401, la sesión local se cierra y se deja el aviso para el login.
alPerderLaSesion(() => {
  useSesion.setState({ usuario: null, sesionExpirada: true })
})
