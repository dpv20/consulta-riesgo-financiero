import type { Score } from '@/api/score'

interface Nivel {
  etiqueta: string
  texto: string
  barra: string
}

/**
 * El nivel se comunica con texto además de color.
 *
 * Apoyarse solo en el color dejaría fuera a quien no lo distingue, y en una cifra de riesgo
 * crediticio la lectura tiene que ser inequívoca.
 */
function nivelDe(score: number): Nivel {
  if (score >= 70) {
    return { etiqueta: 'Riesgo bajo', texto: 'text-emerald-700', barra: 'bg-emerald-500' }
  }

  if (score >= 40) {
    return { etiqueta: 'Riesgo medio', texto: 'text-amber-700', barra: 'bg-amber-500' }
  }

  return { etiqueta: 'Riesgo alto', texto: 'text-red-700', barra: 'bg-red-500' }
}

function formatearFecha(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function TarjetaScore({ resultado }: { resultado: Score }) {
  const nivel = nivelDe(resultado.score)

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-slate-500">Resultado</h2>
        <p className="font-mono text-lg text-slate-900">{resultado.rut}</p>
      </header>

      <div className="flex items-end gap-3">
        <span className="text-5xl font-semibold tabular-nums text-slate-900">
          {resultado.score}
        </span>
        <span className="pb-2 text-sm text-slate-500">de 100</span>
      </div>

      <div className="flex flex-col gap-2">
        <div
          role="meter"
          aria-valuenow={resultado.score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score ${resultado.score} de 100, ${nivel.etiqueta}`}
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`h-full rounded-full transition-all ${nivel.barra}`}
            style={{ width: `${resultado.score}%` }}
          />
        </div>

        <p className={`text-sm font-medium ${nivel.texto}`}>{nivel.etiqueta}</p>
      </div>

      <footer className="border-t border-slate-100 pt-3 text-xs text-slate-500">
        Consultado el {formatearFecha(resultado.fecha)}
      </footer>
    </article>
  )
}
