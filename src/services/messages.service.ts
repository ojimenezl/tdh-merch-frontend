import type { AutorMensaje, Conversacion, Mensaje, MensajeContacto } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { conversaciones } from './mock/db'

export const messagesService = {
  // Conversación de un pedido (cliente o admin).
  async obtenerPorPedido(pedidoId: string): Promise<Conversacion | null> {
    if (USAR_MOCK) {
      return simularLatencia(conversaciones.find((c) => c.pedidoId === pedidoId) ?? null)
    }
    return apiFetch<Conversacion>(`/conversaciones/${pedidoId}`)
  },

  // Bandeja del admin: todas las conversaciones.
  async listarConversaciones(): Promise<Conversacion[]> {
    if (USAR_MOCK) {
      return simularLatencia(
        [...conversaciones].sort((a, b) => b.actualizadoEn.localeCompare(a.actualizadoEn)),
      )
    }
    return apiFetch<Conversacion[]>('/conversaciones')
  },

  async enviarMensaje(
    pedidoId: string,
    autor: AutorMensaje,
    autorNombre: string,
    texto: string,
  ): Promise<Mensaje> {
    const ahora = new Date().toISOString()
    const mensaje: Mensaje = {
      id: `msg-${Date.now()}`,
      pedidoId,
      autor,
      autorNombre,
      texto,
      leido: false,
      fecha: ahora,
    }
    if (USAR_MOCK) {
      let conv = conversaciones.find((c) => c.pedidoId === pedidoId)
      if (!conv) {
        conv = {
          pedidoId,
          codigoPedido: pedidoId,
          clienteId: '',
          clienteNombre: autorNombre,
          mensajes: [],
          actualizadoEn: ahora,
        }
        conversaciones.push(conv)
      }
      conv.mensajes.push(mensaje)
      conv.actualizadoEn = ahora
      return simularLatencia(mensaje)
    }
    return apiFetch<Mensaje>(`/conversaciones/${pedidoId}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ autor, autorNombre, texto }),
    })
  },

  // Formulario de contacto público.
  async enviarContacto(datos: MensajeContacto): Promise<{ ok: true }> {
    if (USAR_MOCK) return simularLatencia({ ok: true as const })
    return apiFetch<{ ok: true }>('/contacto', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}
