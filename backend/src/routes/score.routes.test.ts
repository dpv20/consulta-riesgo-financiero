import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { createApp } from '../app.js'
import { env } from '../config/env.js'

const app = createApp()

const RUT_DEL_USER = '12.345.678-5'
const RUT_AJENO = '11.111.111-1'

let tokenAdmin: string
let tokenUser: string

async function iniciarSesion(email: string, password: string): Promise<string> {
  const res = await request(app).post('/login').send({ email, password })

  return res.body.token
}

beforeAll(async () => {
  tokenAdmin = await iniciarSesion('admin@prontopaga.cl', 'admin123')
  tokenUser = await iniciarSesion('user@prontopaga.cl', 'user123')
})

describe('GET /score/:rut — autenticación', () => {
  it('rechaza la petición sin token', async () => {
    const res = await request(app).get('/score/' + RUT_DEL_USER)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('rechaza un token firmado con otro secreto', async () => {
    const tokenFalso = jwt.sign(
      { sub: 'u-002', role: 'user', rut: RUT_DEL_USER },
      'otro-secreto',
    )

    const res = await request(app)
      .get('/score/' + RUT_DEL_USER)
      .set('Authorization', 'Bearer ' + tokenFalso)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('distingue un token expirado de uno inválido', async () => {
    const tokenExpirado = jwt.sign(
      { sub: 'u-002', role: 'user', rut: RUT_DEL_USER },
      env.JWT_SECRET,
      { expiresIn: '-1s' },
    )

    const res = await request(app)
      .get('/score/' + RUT_DEL_USER)
      .set('Authorization', 'Bearer ' + tokenExpirado)

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('TOKEN_EXPIRED')
  })
})

describe('GET /score/:rut — autorización', () => {
  it('permite a un user consultar su propio RUT', async () => {
    const res = await request(app)
      .get('/score/' + RUT_DEL_USER)
      .set('Authorization', 'Bearer ' + tokenUser)

    expect(res.status).toBe(200)
    expect(res.body.rut).toBe(RUT_DEL_USER)
  })

  it('reconoce su RUT aunque venga sin formato', async () => {
    const res = await request(app)
      .get('/score/123456785')
      .set('Authorization', 'Bearer ' + tokenUser)

    expect(res.status).toBe(200)
    expect(res.body.rut).toBe(RUT_DEL_USER)
  })

  it('impide a un user consultar un RUT ajeno', async () => {
    const res = await request(app)
      .get('/score/' + RUT_AJENO)
      .set('Authorization', 'Bearer ' + tokenUser)

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('FORBIDDEN_RUT')
  })

  it('no revela en el 403 si el RUT existe', async () => {
    const res = await request(app)
      .get('/score/' + RUT_AJENO)
      .set('Authorization', 'Bearer ' + tokenUser)

    expect(JSON.stringify(res.body)).not.toContain(RUT_AJENO)
  })

  it('permite a un admin consultar cualquier RUT', async () => {
    for (const rut of [RUT_DEL_USER, RUT_AJENO, '22.222.222-2']) {
      const res = await request(app)
        .get('/score/' + rut)
        .set('Authorization', 'Bearer ' + tokenAdmin)

      expect(res.status).toBe(200)
      expect(res.body.rut).toBe(rut)
    }
  })
})

describe('GET /score/:rut — respuesta', () => {
  it('devuelve rut, score y fecha con la forma del contrato', async () => {
    const res = await request(app)
      .get('/score/' + RUT_DEL_USER)
      .set('Authorization', 'Bearer ' + tokenAdmin)

    expect(res.status).toBe(200)
    expect(Object.keys(res.body).sort()).toEqual(['fecha', 'rut', 'score'])
    expect(res.body.score).toBeGreaterThanOrEqual(0)
    expect(res.body.score).toBeLessThanOrEqual(100)
    expect(new Date(res.body.fecha).toISOString()).toBe(res.body.fecha)
  })

  it('devuelve el mismo score en consultas sucesivas', async () => {
    const pedir = () =>
      request(app)
        .get('/score/' + RUT_AJENO)
        .set('Authorization', 'Bearer ' + tokenAdmin)

    const [primera, segunda] = await Promise.all([pedir(), pedir()])

    expect(primera.body.score).toBe(segunda.body.score)
  })

  it('rechaza un RUT con forma inválida', async () => {
    const res = await request(app)
      .get('/score/no-es-un-rut')
      .set('Authorization', 'Bearer ' + tokenAdmin)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_RUT')
  })

  it('rechaza un RUT con dígito verificador incorrecto', async () => {
    // 12.345.678-9 es el RUT del ejemplo del enunciado: su digito verificador deberia
    // ser 5. Como es un servicio de riesgo financiero, no se aceptan RUTs inexistentes.
    const res = await request(app)
      .get('/score/12.345.678-9')
      .set('Authorization', 'Bearer ' + tokenAdmin)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_RUT')
  })

  it('valida la identidad antes que la forma del RUT', async () => {
    const res = await request(app).get('/score/no-es-un-rut')

    expect(res.status).toBe(401)
  })
})
