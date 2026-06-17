import type { Notificacion } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { notificaciones } from './mock/db'

export const notificationsService = {
  async listarPorUsuario(usuarioId: string): Promise<Notificacion[]> {
    if (USAR_MOCK) {
      return simularLatencia(
        notificaciones
          .filter((n) => n.usuarioId === usuarioId)
          .sort((a, b) => b.fecha.localeCompare(a.fecha)),
      )
    }
    return apiFetch<Notificacion[]>(`/notificaciones?usuarioId=${usuarioId}`)
  },

  async marcarLeida(id: string): Promise<void> {
    if (USAR_MOCK) {
      const n = notificaciones.find((x) => x.id === id)
      if (n) n.leida = true
      await simularLatencia(null, 150)
      return
    }
    await apiFetch<void>(`/notificaciones/${id}/leida`, { method: 'PATCH' })
  },

  async marcarTodasLeidas(usuarioId: string): Promise<void> {
    if (USAR_MOCK) {
      notificaciones.filter((n) => n.usuarioId === usuarioId).forEach((n) => (n.leida = true))
      await simularLatencia(null, 150)
      return
    }
    await apiFetch<void>(`/notificaciones/leer-todas`, {
      method: 'PATCH',
      body: JSON.stringify({ usuarioId }),
    })
  },
}
