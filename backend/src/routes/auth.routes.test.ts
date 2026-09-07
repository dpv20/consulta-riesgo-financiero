import jwt from 'jsonwebtoken'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../app.js'

const app = createApp()

describe('POST /login', () => {
  it('autentica a un admin y no incluye RUT en su token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@prontopaga.cl', password: 'admin123' })

    expect(res.status).toBe(200)
    expect(res.body.user).toEqual({ id: 'u-001', role: 'admin', rut: null })

    const payload = jwt.decode(res.body.token) as Record<string, unknown>
    expect(payload.sub).toBe('u-001')
    expect(payload.role).toBe('admin')
    expect(payload.rut).toBeUndefined()
  })

  it('autentica a un user e incluye su RUT en el token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'user@prontopaga.cl', password: 'user123' })

    expect(res.status).toBe(200)
    expect(res.body.user).toEqual({ id: 'u-002', role: 'user', rut: '12.345.678-5' })

    const payload = jwt.decode(res.body.token) as Record<string, unknown>
    expect(payload.role).toBe('user')
    expect(payload.rut).toBe('12.345.678-5')
  })

  it('emite un token con expiración', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@prontopaga.cl', password: 'admin123' })

    const payload = jwt.decode(res.body.token) as { exp: number; iat: number }

    expect(payload.exp).toBeGreaterThan(payload.iat)
  })

  it('rechaza una contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'admin@prontopaga.cl', password: 'incorrecta' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('responde igual ante un email inexistente, sin revelar si está registrado', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: 'nadie@prontopaga.cl', password: 'lo-que-sea' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('acepta el RUT como identificador, en cualquier formato', async () => {
    for (const identificador of ['12.345.678-5', '12345678-5', '123456785']) {
      const res = await request(app)
        .post('/login')
        .send({ identificador, password: 'user123' })

      expect(res.status).toBe(200)
      expect(res.body.user.id).toBe('u-002')
    }
  })

  it('acepta el email por la clave identificador', async () => {
    const res = await request(app)
      .post('/login')
      .send({ identificador: 'admin@prontopaga.cl', password: 'admin123' })

    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe('admin')
  })

  it('no permite entrar con el RUT de otra persona', async () => {
    const res = await request(app)
      .post('/login')
      .send({ identificador: '11.111.111-1', password: 'user123' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('rechaza un cuerpo incompleto', async () => {
    const res = await request(app).post('/login').send({ email: 'admin@prontopaga.cl' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
