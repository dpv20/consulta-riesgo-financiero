import { describe, expect, it } from 'vitest'
import { calcularScore } from './score.js'

const RUTS_DE_MUESTRA = [
  '12.345.678-9',
  '11.111.111-1',
  '22.222.222-2',
  '9.876.543-3',
  '18.765.432-1',
  '5.432.109-8',
]

describe('calcularScore', () => {
  it('es determinista: el mismo RUT devuelve siempre el mismo score', () => {
    for (const rut of RUTS_DE_MUESTRA) {
      const primera = calcularScore(rut)

      for (let i = 0; i < 10; i++) {
        expect(calcularScore(rut)).toBe(primera)
      }
    }
  })

  it('ignora el formato: la misma identidad da el mismo score', () => {
    const esperado = calcularScore('12.345.678-9')

    expect(calcularScore('12345678-9')).toBe(esperado)
    expect(calcularScore('123456789')).toBe(esperado)
  })

  it('devuelve scores distintos para RUTs distintos', () => {
    const scores = RUTS_DE_MUESTRA.map(calcularScore)

    expect(new Set(scores).size).toBe(RUTS_DE_MUESTRA.length)
  })

  it('siempre está entre 0 y 100', () => {
    for (let cuerpo = 1_000_000; cuerpo < 1_000_500; cuerpo++) {
      const score = calcularScore(`${cuerpo}-0`)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
      expect(Number.isInteger(score)).toBe(true)
    }
  })
})
