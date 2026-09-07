import 'dotenv/config'
import { z } from 'zod'

/**
 * Toda la configuración sensible entra por variables de entorno y se valida al arrancar.
 * Si falta el secreto del JWT el proceso no levanta: es preferible fallar de inmediato
 * a firmar tokens con un valor por defecto.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es obligatorio'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const detalle = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`)
  throw new Error(`Configuración inválida:\n${detalle.join('\n')}`)
}

export const env = parsed.data
