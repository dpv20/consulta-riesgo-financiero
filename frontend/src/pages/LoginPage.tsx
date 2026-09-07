import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Alerta } from '@/components/Alerta'
import { Boton } from '@/components/Boton'
import { Campo } from '@/components/Campo'
import { useIniciarSesion } from '@/hooks/useIniciarSesion'
import { useSesion } from '@/store/sesion'

export function LoginPage() {
  const usuario = useSesion((estado) => estado.usuario)
  const sesionExpirada = useSesion((estado) => estado.sesionExpirada)
  const descartarAviso = useSesion((estado) => estado.descartarAviso)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const login = useIniciarSesion()

  if (usuario) {
    return <Navigate to="/consulta" replace />
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    descartarAviso()
    login.mutate({ email: email.trim(), password })
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Consulta de Riesgo Financiero
          </h1>
          <p className="mt-1 text-sm text-slate-500">Ingresa para consultar un score</p>
        </div>

        <form
          onSubmit={enviar}
          noValidate
          className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          {sesionExpirada && <Alerta tono="aviso">Tu sesión expiró, vuelve a ingresar</Alerta>}

          {login.isError && <Alerta>{login.error.message}</Alerta>}

          <Campo
            etiqueta="Email"
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            disabled={login.isPending}
          />

          <Campo
            etiqueta="Contraseña"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            disabled={login.isPending}
          />

          <Boton type="submit" cargando={login.isPending}>
            Ingresar
          </Boton>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-slate-500">
          Credenciales de prueba:
          <br />
          <span className="font-mono">admin@prontopaga.cl / admin123</span>
          <br />
          <span className="font-mono">user@prontopaga.cl / user123</span>
        </p>
      </div>
    </main>
  )
}
