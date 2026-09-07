import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  cargando?: boolean
  children: ReactNode
}

export function Boton({ cargando = false, children, disabled, ...props }: Props) {
  return (
    <button
      {...props}
      disabled={disabled ?? cargando}
      className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {cargando ? 'Cargando…' : children}
    </button>
  )
}
