import { describe, expect, it } from 'vitest'
import App from '@/App'
import { renderWithProviders, screen } from '@/test/utils'

describe('App', () => {
  it('renderiza la home', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('heading', { name: /starter listo/i })).toBeInTheDocument()
  })

  it('muestra 404 en una ruta desconocida', () => {
    renderWithProviders(<App />, { route: '/no-existe' })
    expect(screen.getByText(/404/)).toBeInTheDocument()
  })
})
