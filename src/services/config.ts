/**
 * Configuración de la capa de servicios.
 *
 * Hoy todo usa datos MOCK. El día que el backend Nest esté listo:
 *   1. Poner USAR_MOCK = false (o VITE_USAR_MOCK=false en .env)
 *   2. Implementar las llamadas reales con `apiFetch` en cada servicio.
 * Los componentes NO cambian, porque solo conocen las funciones del servicio.
 */
export const USAR_MOCK = (import.meta.env.VITE_USAR_MOCK ?? 'true') !== 'false'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// Simula la latencia de red para que el mock se comporte como una API real.
export function simularLatencia<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(clonar(data)), ms))
}

// Clona en profundidad para no mutar la "base de datos" mock por accidente.
// Usamos JSON.parse/stringify porque structuredClone no puede clonar objetos reactivos de Vue.
export function clonar<T>(data: T): T {
  if (data === null || data === undefined) return data
  try {
    return JSON.parse(JSON.stringify(data))
  } catch {
    // Fallback para objetos no serializables
    return data
  }
}

/**
 * Wrapper para llamadas HTTP reales (se usará cuando USAR_MOCK sea false).
 * Centraliza base URL, headers y manejo de errores.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}
