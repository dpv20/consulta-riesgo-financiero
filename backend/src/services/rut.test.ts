import { describe, expect, it } from 'vitest'
import {
  calcularDigitoVerificador,
  esFormatoRutValido,
  esRutValido,
  formatearRut,
  normalizarRut,
  tieneDigitoVerificadorValido,
} from './rut.js'

describe('normalizarRut', () => {
  it('quita puntos y guion', () => {
    expect(normalizarRut('12.345.678-9')).toBe('123456789')
  })

  it('deja igual un RUT ya normalizado', () => {
    expect(normalizarRut('123456789')).toBe('123456789')
  })

  it('pasa la K a mayúscula', () => {
    expect(normalizarRut('7.654.321-k')).toBe('7654321K')
  })
})

describe('esFormatoRutValido', () => {
  it('acepta las distintas escrituras del mismo RUT', () => {
    expect(esFormatoRutValido('12.345.678-9')).toBe(true)
    expect(esFormatoRutValido('12345678-9')).toBe(true)
    expect(esFormatoRutValido('123456789')).toBe(true)
  })

  it('acepta K como dígito verificador', () => {
    expect(esFormatoRutValido('7.654.321-K')).toBe(true)
  })

  it('rechaza entradas con forma incorrecta', () => {
    expect(esFormatoRutValido('')).toBe(false)
    expect(esFormatoRutValido('123')).toBe(false)
    expect(esFormatoRutValido('no-es-un-rut')).toBe(false)
    expect(esFormatoRutValido('1234567890123')).toBe(false)
  })
})

describe('calcularDigitoVerificador', () => {
  it('calcula el dígito con módulo 11', () => {
    expect(calcularDigitoVerificador('12345678')).toBe('5')
    expect(calcularDigitoVerificador('11111111')).toBe('1')
  })
})

describe('esRutValido', () => {
  it('exige forma y dígito verificador', () => {
    expect(esRutValido('12.345.678-5')).toBe(true)
    expect(esRutValido('11.111.111-1')).toBe(true)
    expect(esRutValido('12.345.678-9')).toBe(false)
    expect(esRutValido('no-es-un-rut')).toBe(false)
  })
})

describe('tieneDigitoVerificadorValido', () => {
  it('distingue un dígito correcto de uno incorrecto', () => {
    expect(tieneDigitoVerificadorValido('12.345.678-5')).toBe(true)
    expect(tieneDigitoVerificadorValido('12.345.678-9')).toBe(false)
  })
})

describe('formatearRut', () => {
  it('devuelve la forma canónica con puntos y guion', () => {
    expect(formatearRut('123456789')).toBe('12.345.678-9')
    expect(formatearRut('12.345.678-9')).toBe('12.345.678-9')
  })

  it('formatea un RUT con dígito verificador K', () => {
    expect(formatearRut('7654321K')).toBe('7.654.321-K')
  })
})
