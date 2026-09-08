import { useEffect, useState } from 'react'

/**
 * Devuelve `true` cuando `activo` lleva más de `ms` sin apagarse.
 *
 * Sirve para mostrar un aviso solo cuando una espera se hace larga: si la operación
 * responde rápido, el aviso nunca aparece y no agrega ruido.
 */
export function useAvisoTrasEspera(activo: boolean, ms = 3000): boolean {
  const [cumplido, setCumplido] = useState(false)

  useEffect(() => {
    if (!activo) return

    const temporizador = setTimeout(() => setCumplido(true), ms)

    // Al apagarse `activo` se limpia el temporizador y se reinicia el estado, para que
    // la siguiente espera vuelva a contar desde cero.
    return () => {
      clearTimeout(temporizador)
      setCumplido(false)
    }
  }, [activo, ms])

  // Se deriva en el render en vez de sincronizarlo con un setState extra.
  return activo && cumplido
}
