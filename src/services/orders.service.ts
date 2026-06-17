import type { DatosNuevoPedido, EstadoPedido, Pedido } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { pedidos } from './mock/db'

function siguienteCodigo(): string {
  const n = pedidos.length + 1
  return `TDH-${String(n).padStart(4, '0')}`
}

export const ordersService = {
  // Pedidos de un cliente (panel del cliente).
  async listarPorCliente(clienteId: string): Promise<Pedido[]> {
    if (USAR_MOCK) {
      return simularLatencia(
        pedidos
          .filter((p) => p.clienteId === clienteId)
          .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)),
      )
    }
    return apiFetch<Pedido[]>(`/pedidos?clienteId=${clienteId}`)
  },

  // Todos los pedidos (panel del admin).
  async listarTodos(): Promise<Pedido[]> {
    if (USAR_MOCK) {
      return simularLatencia([...pedidos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)))
    }
    return apiFetch<Pedido[]>('/pedidos')
  },

  async obtener(id: string): Promise<Pedido | null> {
    if (USAR_MOCK) return simularLatencia(pedidos.find((p) => p.id === id) ?? null)
    return apiFetch<Pedido>(`/pedidos/${id}`)
  },

  async crear(clienteId: string, datos: DatosNuevoPedido): Promise<Pedido> {
    if (USAR_MOCK) {
      const subtotal = datos.items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0)
      const envio = 3.0
      const ahora = new Date().toISOString()
      const nuevo: Pedido = {
        id: `ped-${Date.now()}`,
        codigo: siguienteCodigo(),
        clienteId,
        items: datos.items,
        subtotal,
        envio,
        total: subtotal + envio,
        estado: 'pendiente',
        historialEstados: [{ estado: 'pendiente', fecha: ahora }],
        direccionEntrega: datos.direccionEntrega,
        metodoPagoPreferido: datos.metodoPagoPreferido,
        creadoEn: ahora,
        actualizadoEn: ahora,
      }
      pedidos.push(nuevo)
      return simularLatencia(nuevo)
    }
    return apiFetch<Pedido>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ clienteId, ...datos }),
    })
  },

  // Cambiar estado de un pedido (panel admin).
  async cambiarEstado(id: string, estado: EstadoPedido, nota?: string): Promise<Pedido> {
    if (USAR_MOCK) {
      const pedido = pedidos.find((p) => p.id === id)
      if (!pedido) return Promise.reject(new Error('Pedido no encontrado'))
      const ahora = new Date().toISOString()
      pedido.estado = estado
      pedido.actualizadoEn = ahora
      pedido.historialEstados.push({ estado, fecha: ahora, nota })
      return simularLatencia(pedido)
    }
    return apiFetch<Pedido>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado, nota }),
    })
  },
}
