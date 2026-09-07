import cors from 'cors'
import express, { type Express } from 'express'
import { env } from './config/env.js'

/**
 * La construcción de la app vive separada del arranque del servidor: así los tests pueden
 * levantarla con supertest sin abrir un puerto real.
 *
 * Las rutas del desafío se montan acá.
 */
export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: env.CORS_ORIGIN }))
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  return app
}
