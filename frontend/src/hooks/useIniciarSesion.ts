import { useMutation } from '@tanstack/react-query'
import { iniciarSesion } from '@/api/auth'
import type { ErrorApi } from '@/api/errores'
import { useSesion } from '@/store/sesion'

interface Credenciales {
  /** Email o RUT. */
  identificador: string
  password: string
}

export function useIniciarSesion() {
  const iniciar = useSesion((estado) => estado.iniciar)

  return useMutation<void, ErrorApi, Credenciales>({
    mutationFn: async ({ identificador, password }) => {
      const { token, user } = await iniciarSesion(identificador, password)

      iniciar(token, user)
    },
  })
}
