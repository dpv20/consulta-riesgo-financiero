import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { iniciarSesion } from '@/api/auth'
import { ErrorApi } from '@/api/errores'
import { obtenerScore } from '@/api/score'
import { useSesion } from '@/store/sesion'
import { renderWithProviders, screen, userEvent } from '@/test/utils'

vi.mock('@/api/auth', () => ({ iniciarSesion: vi.fn() }))
vi.mock('@/api/score', () => ({ obtenerScore: vi.fn() }))

const loginMock = vi.mocked(iniciarSesion)
const scoreMock = vi.mocked(obtenerScore)

const USER = { id: 'u-002', role: 'user' as const, rut: '12.345.678-5' }

function iniciarSesionEnElStore() {
  useSesion.setState({ usuario: USER, sesionExpirada: false })
}

beforeEach(() => {
  vi.clearAllMocks()
  useSesion.setState({ usuario: null, sesionExpirada: false })
})

describe('Login', () => {
  it('muestra el formulario de ingreso', () => {
    renderWithProviders(<App />)

    expect(screen.getByLabelText(/email o rut/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })

  it('avisa cuando las credenciales son incorrectas', async () => {
    loginMock.mockRejectedValue(new ErrorApi('INVALID_CREDENTIALS'))
    const usuario = userEvent.setup()

    renderWithProviders(<App />)

    await usuario.type(screen.getByLabelText(/email o rut/i), 'admin@prontopaga.cl')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'incorrecta')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /email o contraseña incorrectos/i,
    )
  })

  it('avisa que el servidor no responde ante un fallo de red', async () => {
    loginMock.mockRejectedValue(new ErrorApi('NETWORK_ERROR'))
    const usuario = userEvent.setup()

    renderWithProviders(<App />)

    await usuario.type(screen.getByLabelText(/email o rut/i), 'admin@prontopaga.cl')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'admin123')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos conectar/i)
  })

  it('permite ingresar con el RUT en vez del email', async () => {
    loginMock.mockResolvedValue({ token: 'un-token', user: USER })
    const usuario = userEvent.setup()

    renderWithProviders(<App />)

    await usuario.type(screen.getByLabelText(/email o rut/i), '12.345.678-5')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'user123')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(loginMock).toHaveBeenCalledWith('12.345.678-5', 'user123')
    expect(await screen.findByRole('button', { name: /consultar score/i })).toBeInTheDocument()
  })

  it('entra a la consulta cuando las credenciales son correctas', async () => {
    loginMock.mockResolvedValue({ token: 'un-token', user: USER })
    const usuario = userEvent.setup()

    renderWithProviders(<App />)

    await usuario.type(screen.getByLabelText(/email o rut/i), 'user@prontopaga.cl')
    await usuario.type(screen.getByLabelText(/contraseña/i), 'user123')
    await usuario.click(screen.getByRole('button', { name: /ingresar/i }))

    expect(await screen.findByRole('button', { name: /consultar score/i })).toBeInTheDocument()
  })
})

describe('Rutas protegidas', () => {
  it('devuelve al login si no hay sesión', () => {
    renderWithProviders(<App />, { route: '/consulta' })

    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument()
  })
})

describe('Consulta de score', () => {
  it('muestra el resultado de una consulta exitosa', async () => {
    iniciarSesionEnElStore()
    scoreMock.mockResolvedValue({
      rut: '12.345.678-5',
      score: 73,
      fecha: '2026-09-07T14:35:00.000Z',
    })
    const usuario = userEvent.setup()

    renderWithProviders(<App />, { route: '/consulta' })
    await usuario.click(screen.getByRole('button', { name: /consultar score/i }))

    expect(await screen.findByText('73')).toBeInTheDocument()
    expect(screen.getByText(/riesgo bajo/i)).toBeInTheDocument()
  })

  it('explica el rechazo cuando el RUT no le corresponde al usuario', async () => {
    iniciarSesionEnElStore()
    scoreMock.mockRejectedValue(new ErrorApi('FORBIDDEN_RUT'))
    const usuario = userEvent.setup()

    renderWithProviders(<App />, { route: '/consulta' })

    const campo = screen.getByLabelText(/rut a consultar/i)
    await usuario.clear(campo)
    await usuario.type(campo, '11.111.111-1')
    await usuario.click(screen.getByRole('button', { name: /consultar score/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /solo puedes consultar tu propio rut/i,
    )
  })

  it('no llama a la API si el RUT tiene forma inválida', async () => {
    iniciarSesionEnElStore()
    const usuario = userEvent.setup()

    renderWithProviders(<App />, { route: '/consulta' })

    const campo = screen.getByLabelText(/rut a consultar/i)
    await usuario.clear(campo)
    await usuario.type(campo, 'no-es-un-rut')
    await usuario.click(screen.getByRole('button', { name: /consultar score/i }))

    expect(await screen.findByText(/formato válido/i)).toBeInTheDocument()
    expect(scoreMock).not.toHaveBeenCalled()
  })

  it('rechaza un RUT con dígito verificador incorrecto sin llamar a la API', async () => {
    iniciarSesionEnElStore()
    const usuario = userEvent.setup()

    renderWithProviders(<App />, { route: '/consulta' })

    const campo = screen.getByLabelText(/rut a consultar/i)
    await usuario.clear(campo)
    await usuario.type(campo, '12.345.678-9')
    await usuario.click(screen.getByRole('button', { name: /consultar score/i }))

    expect(await screen.findByText(/dígito verificador no corresponde/i)).toBeInTheDocument()
    expect(scoreMock).not.toHaveBeenCalled()
  })
})
