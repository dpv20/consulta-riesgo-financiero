import { useQuery } from '@tanstack/react-query'
import type { ErrorApi } from '@/api/errores'
import { obtenerScore, type Score } from '@/api/score'
import { normalizarRut } from '@/utils/rut'

/**
 * Consulta el score de un RUT.
 *
 * La clave de caché usa el RUT normalizado, así que `12.345.678-9` y `123456789` comparten
 * resultado. Como el score es determinista, reconsultar el mismo RUT es gratis.
 *
 * `retry: false` es deliberado: un 403 o un 400 no mejoran reintentando.
 */
export function useScore(rut: string) {
  return useQuery<Score, ErrorApi>({
    queryKey: ['score', normalizarRut(rut)],
    queryFn: () => obtenerScore(rut),
    enabled: rut.length > 0,
    retry: false,
  })
}
