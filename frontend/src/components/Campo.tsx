import { useId, type InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  etiqueta: string
  error?: string | undefined
  ayuda?: string | undefined
}

/**
 * Campo de formulario con etiqueta asociada y mensajes enlazados por `aria-describedby`,
 * de modo que el error se anuncie junto al campo y no quede solo como color.
 */
export function Campo({ etiqueta, error, ayuda, ...props }: Props) {
  const id = useId()
  const idMensaje = `${id}-mensaje`
  const mensaje = error ?? ayuda

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {etiqueta}
      </label>

      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={mensaje ? idMensaje : undefined}
        className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
      />

      {mensaje && (
        <span
          id={idMensaje}
          className={`text-xs ${error ? 'text-red-700' : 'text-amber-700'}`}
        >
          {mensaje}
        </span>
      )}
    </div>
  )
}
