import type { PayloadToken } from '../services/tokens.js'

/**
 * El middleware de autenticación deja el payload verificado en `req.auth`, para que los
 * middlewares siguientes y los handlers lo consuman ya tipado.
 */
declare global {
  namespace Express {
    interface Request {
      auth?: PayloadToken
    }
  }
}

export {}
