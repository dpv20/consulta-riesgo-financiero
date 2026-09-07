import cors from 'cors'
import express, { type Express } from 'express'
import { env } from './config/env.js'
import { manejadorErrores, rutaNoEncontrada } from './middlewares/manejadorErrores.js'
import { authRouter } from './routes/auth.routes.js'
import { scoreRouter } from './routes/score.routes.js'

/**
 * La construcción de la app vive separada del arranque del servidor: así los tests la
 * levantan con supertest sin abrir un puerto real.
 */
export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use(authRouter)
  app.use('/score', scoreRouter)

  // Los manejadores de error van al final, después de todas las rutas.
  app.use(rutaNoEncontrada)
  app.use(manejadorErrores)

  return app
}
