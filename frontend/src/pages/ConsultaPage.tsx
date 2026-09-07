import { useState, type FormEvent } from 'react'
import { Alerta } from '@/components/Alerta'
import { Boton } from '@/components/Boton'
import { Campo } from '@/components/Campo'
import { TarjetaScore } from '@/components/TarjetaScore'
import { useScore } from '@/hooks/useScore'
import { useSesion } from '@/store/sesion'
import { esFormatoRutValido, formatearRut, tieneDigitoVerificadorValido } from '@/utils/rut'

export function ConsultaPage() {
  const usuario = useSesion((estado) => estado.usuario)
  const cerrar = useSesion((estado) => estado.cerrar)

  const [rut, setRut] = useState(usuario?.rut ?? '')
  const [rutConsultado, setRutConsultado] = useState('')
  const [errorDeFormato, setErrorDeFormato] = useState<string>()

  const consulta = useScore(rutConsultado)

  // El dígito verificador se avisa, pero no impide consultar: el RUT de ejemplo del
  // enunciado no lo cumple. Ver README.
  const avisoDigito =
    rut.length > 0 && esFormatoRutValido(rut) && !tieneDigitoVerificadorValido(rut)
      ? 'El dígito verificador no corresponde a este RUT'
      : undefined

  function enviar(evento: FormEvent) {
    evento.preventDefault()

    if (!esFormatoRutValido(rut)) {
      setErrorDeFormato('Ingresa un RUT con formato válido, por ejemplo 12.345.678-9')
      setRutConsultado('')
      return
    }

    setErrorDeFormato(undefined)
    setRutConsultado(formatearRut(rut))
  }

  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="font-semibold text-slate-900">Consulta de Riesgo Financiero</h1>
            <p className="text-xs text-slate-500">
              Sesión de <span className="font-mono">{usuario?.id}</span> · rol{' '}
              <span className="font-medium">{usuario?.role}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={cerrar}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 sm:p-6">
        <form
          onSubmit={enviar}
          noValidate
          className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <Campo
            etiqueta="RUT a consultar"
            name="rut"
            inputMode="text"
            placeholder="12.345.678-9"
            value={rut}
            onChange={(evento) => setRut(evento.target.value)}
            onBlur={() => setRut((actual) => (esFormatoRutValido(actual) ? formatearRut(actual) : actual))}
            error={errorDeFormato}
            ayuda={avisoDigito}
            disabled={consulta.isFetching}
          />

          {usuario?.role === 'user' && (
            <p className="text-xs text-slate-500">
              Con rol <span className="font-medium">user</span> solo puedes consultar tu
              propio RUT.
            </p>
          )}

          <Boton type="submit" cargando={consulta.isFetching}>
            Consultar score
          </Boton>
        </form>

        {consulta.isError && <Alerta>{consulta.error.message}</Alerta>}

        {consulta.isFetching && (
          <p className="text-sm text-slate-500" aria-live="polite">
            Consultando…
          </p>
        )}

        {consulta.data && !consulta.isFetching && <TarjetaScore resultado={consulta.data} />}

        {!rutConsultado && !consulta.isError && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            Ingresa un RUT y presiona <span className="font-medium">Consultar score</span>{' '}
            para ver el resultado.
          </p>
        )}
      </main>
    </div>
  )
}
