import type { Request } from 'express'

/**
 * Express 5 tipa los parámetros de ruta como `string | string[]`, porque un patrón puede
 * capturar el mismo nombre varias veces. Acá siempre se espera un valor simple.
 */
export function paramTexto(req: Request, nombre: string): string {
  const valor = req.params[nombre]

  return typeof valor === 'string' ? valor : ''
}
