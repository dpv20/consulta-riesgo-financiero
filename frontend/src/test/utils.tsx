import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'

/** QueryClient sin reintentos ni caché entre tests. */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
}

type Options = Omit<RenderOptions, 'wrapper'> & { route?: string }

/** `render` con Router + React Query ya montados. */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', ...options }: Options = {},
) {
  const queryClient = createTestQueryClient()

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
