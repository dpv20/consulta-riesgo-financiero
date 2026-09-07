import axios from 'axios'

/**
 * Cliente HTTP central. La baseURL sale de `VITE_API_URL` (ver .env.example)
 * para no dejar endpoints hardcodeados en el bundle.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

let accessToken: string | null = null

/** El token vive en memoria, no en localStorage (menor superficie ante XSS). */
export function setAccessToken(token: string | null) {
  accessToken = token
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setAccessToken(null)
    }
    return Promise.reject(error)
  },
)
