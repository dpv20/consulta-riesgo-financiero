import { api } from './client.js'

export interface Score {
  rut: string
  score: number
  fecha: string
}

export async function obtenerScore(rut: string): Promise<Score> {
  const { data } = await api.get<Score>(`/score/${encodeURIComponent(rut)}`)

  return data
}
