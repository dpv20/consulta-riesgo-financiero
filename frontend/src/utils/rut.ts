/** Quita puntos, guiones y espacios, y deja la K en mayúscula. */
export function normalizarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

/** Forma esperada: cuerpo de 7 u 8 dígitos más dígito verificador (0-9 o K). */
export function esFormatoRutValido(rut: string): boolean {
  const normalizado = normalizarRut(rut)

  if (normalizado.length < 8 || normalizado.length > 9) return false

  return (
    /^[0-9]+$/.test(normalizado.slice(0, -1)) && /^[0-9K]$/.test(normalizado.slice(-1))
  )
}

function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0
  let multiplicador = 2

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = 11 - (suma % 11)
  if (resto === 11) return '0'
  if (resto === 10) return 'K'
  return String(resto)
}

/** Verifica el dígito verificador por módulo 11. */
export function tieneDigitoVerificadorValido(rut: string): boolean {
  const normalizado = normalizarRut(rut)

  if (!esFormatoRutValido(normalizado)) return false

  return calcularDigitoVerificador(normalizado.slice(0, -1)) === normalizado.slice(-1)
}

/**
 * Validación completa: forma **y** dígito verificador.
 *
 * Se valida acá igual que en la API, para no gastar un viaje de red en un RUT que el
 * servidor va a rechazar. El backend valida de todos modos: nunca se confía en el cliente.
 */
export function esRutValido(rut: string): boolean {
  return esFormatoRutValido(rut) && tieneDigitoVerificadorValido(rut)
}

/** Forma canónica con puntos y guion: `12.345.678-5`. */
export function formatearRut(rut: string): string {
  const normalizado = normalizarRut(rut)

  if (normalizado.length < 2) return normalizado

  const cuerpo = normalizado.slice(0, -1).replace(/\B(?=([0-9]{3})+(?![0-9]))/g, '.')

  return `${cuerpo}-${normalizado.slice(-1)}`
}
