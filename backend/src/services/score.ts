import { normalizarRut } from './rut.js'

/**
 * Score de riesgo financiero de un RUT.
 *
 * El enunciado exige que sea **determinista**: el mismo RUT siempre da el mismo score,
 * y RUTs distintos dan scores distintos. Por eso es una función pura sobre el RUT
 * normalizado, sin estado, sin aleatoriedad y sin depender de la fecha.
 *
 * Se usa FNV-1a de 32 bits, que dispersa bien entradas cortas y parecidas —dos RUTs
 * consecutivos producen scores muy distintos— y es reproducible en cualquier ejecución.
 */
export function calcularScore(rut: string): number {
  const normalizado = normalizarRut(rut)

  let hash = 2166136261

  for (let i = 0; i < normalizado.length; i++) {
    hash ^= normalizado.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  // `>>> 0` lo pasa a entero sin signo antes del módulo: sin esto, un hash negativo
  // daría un score negativo.
  return (hash >>> 0) % 101
}
