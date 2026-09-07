import type { ReactNode } from 'react'

type Tono = 'error' | 'aviso' | 'info'

const ESTILOS: Record<Tono, string> = {
  error: 'border-red-300 bg-red-50 text-red-900',
  aviso: 'border-amber-300 bg-amber-50 text-amber-900',
  info: 'border-slate-300 bg-slate-50 text-slate-700',
}

interface Props {
  tono?: Tono
  children: ReactNode
}

/**
 * `role="alert"` hace que los lectores de pantalla anuncien el mensaje apenas aparece,
 * sin que la persona tenga que ir a buscarlo.
 */
export function Alerta({ tono = 'error', children }: Props) {
  return (
    <p role="alert" className={`rounded-md border px-3 py-2 text-sm ${ESTILOS[tono]}`}>
      {children}
    </p>
  )
}
