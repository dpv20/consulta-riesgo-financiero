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

/**
 * Enlaza el cliente HTTP con el estado de sesión: cuando la API rechaza el token, la
 * sesión local se cierra y queda el aviso para mostrar en el login.
 *
 * Se llama explícitamente desde `main.tsx` en vez de ejecutarse al importar el módulo:
 * un efecto secundario en la carga acopla el comportamiento al orden de los imports, y
 * hace que los tests arrastren la conexión sin pedirla.
 */
export function conectarSesionConElCliente(): void {
  alPerderLaSesion(() => {
    useSesion.setState({ usuario: null, sesionExpirada: true })
  })
}
