/**
 * Utilidades de RUT chileno.
 *
 * Se distinguen dos representaciones:
 *  - normalizada (`123456789`): la que se compara y con la que se calcula.
 *  - canónica (`12.345.678-9`): la que se muestra y se devuelve al cliente.
 *
 * Comparar siempre la forma normalizada evita que `12345678-9` y `12.345.678-9`
 * se traten como RUTs distintos.
 */

/** Quita puntos, guiones y espacios, y deja la K en mayúscula. */
export function normalizarRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase()
}

/**
 * Valida la **forma** del RUT: cuerpo numérico de 7 u 8 dígitos más un dígito
 * verificador (`0-9` o `K`). Es la validación que aplica la API.
 */
export function esFormatoRutValido(rut: string): boolean {
  const normalizado = normalizarRut(rut)

  if (normalizado.length < 8 || normalizado.length > 9) return false

  const cuerpo = normalizado.slice(0, -1)
  const digitoVerificador = normalizado.slice(-1)

  return /^[0-9]+$/.test(cuerpo) && /^[0-9K]$/.test(digitoVerificador)
}

/** Calcula el dígito verificador (módulo 11) del cuerpo de un RUT. */
export function calcularDigitoVerificador(cuerpo: string): string {
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

/** Comprueba el dígito verificador (módulo 11). */
export function tieneDigitoVerificadorValido(rut: string): boolean {
  const normalizado = normalizarRut(rut)

  if (!esFormatoRutValido(normalizado)) return false

  return calcularDigitoVerificador(normalizado.slice(0, -1)) === normalizado.slice(-1)
}

/**
 * Validación completa: forma **y** dígito verificador.
 *
 * Es la que aplica la API. En un servicio de riesgo financiero, aceptar un RUT que no
 * existe permitiría consultar identidades inventadas, así que el módulo 11 se exige.
 *
 * Efecto conocido: el RUT del ejemplo del enunciado, `12.345.678-9`, no lo cumple —le
 * corresponde `5`— y por lo tanto se rechaza con `400`. Está documentado en el README.
 */
export function esRutValido(rut: string): boolean {
  return esFormatoRutValido(rut) && tieneDigitoVerificadorValido(rut)
}

/** Pasa un RUT a su forma canónica con puntos y guion: `12.345.678-5`. */
export function formatearRut(rut: string): string {
  const normalizado = normalizarRut(rut)
  const cuerpo = normalizado.slice(0, -1)
  const digitoVerificador = normalizado.slice(-1)

  const conPuntos = cuerpo.replace(/\B(?=([0-9]{3})+(?![0-9]))/g, '.')

  return `${conPuntos}-${digitoVerificador}`
}
