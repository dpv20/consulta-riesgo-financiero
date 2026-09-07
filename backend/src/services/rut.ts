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

/**
 * Comprueba el dígito verificador (módulo 11).
 *
 * **No se usa como criterio de rechazo en la API, a propósito.** El RUT de ejemplo del
 * enunciado, `12.345.678-9`, no satisface el módulo 11 —le corresponde `5`—, así que
 * exigirlo haría que la propia respuesta de ejemplo de la especificación devolviera un
 * 400. La API valida la forma; el dígito verificador se ofrece como ayuda al usuario en
 * el formulario del frontend, sin bloquear la consulta.
 */
export function tieneDigitoVerificadorValido(rut: string): boolean {
  const normalizado = normalizarRut(rut)

  if (!esFormatoRutValido(normalizado)) return false

  return calcularDigitoVerificador(normalizado.slice(0, -1)) === normalizado.slice(-1)
}

/** Pasa un RUT a su forma canónica con puntos y guion: `12.345.678-9`. */
export function formatearRut(rut: string): string {
  const normalizado = normalizarRut(rut)
  const cuerpo = normalizado.slice(0, -1)
  const digitoVerificador = normalizado.slice(-1)

  const conPuntos = cuerpo.replace(/\B(?=([0-9]{3})+(?![0-9]))/g, '.')

  return `${conPuntos}-${digitoVerificador}`
}
