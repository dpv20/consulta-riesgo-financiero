import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ConsultaPage } from '@/pages/ConsultaPage'
import { LoginPage } from '@/pages/LoginPage'
import { useSesion } from '@/store/sesion'

/** Deja pasar solo con sesión iniciada; si no, devuelve al login. */
function RutaProtegida({ children }: { children: ReactElement }) {
  const usuario = useSesion((estado) => estado.usuario)

  if (!usuario) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/consulta"
        element={
          <RutaProtegida>
            <ConsultaPage />
          </RutaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
