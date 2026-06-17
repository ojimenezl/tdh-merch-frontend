import type { EstadoPedido } from '@/types'

interface MetaEstado {
  etiqueta: string
  descripcion: string
  // Clases Tailwind para badges (texto + fondo).
  badge: string
  // Color de punto para la línea de tiempo.
  punto: string
}

export const ESTADOS_PEDIDO: Record<EstadoPedido, MetaEstado> = {
  pendiente: {
    etiqueta: 'Pendiente',
    descripcion: 'Recibimos tu pedido y lo estamos revisando.',
    badge: 'bg-amber-50 text-amber-700',
    punto: 'bg-amber-500',
  },
  en_preparacion: {
    etiqueta: 'En preparación',
    descripcion: 'Estamos armando tu pedido.',
    badge: 'bg-blue-50 text-blue-700',
    punto: 'bg-blue-500',
  },
  listo_para_envio: {
    etiqueta: 'Listo para envío',
    descripcion: 'Tu pedido está empacado y listo para salir.',
    badge: 'bg-indigo-50 text-indigo-700',
    punto: 'bg-indigo-500',
  },
  en_camino: {
    etiqueta: 'En camino',
    descripcion: 'Tu pedido va en camino a tu zona.',
    badge: 'bg-violet-50 text-violet-700',
    punto: 'bg-violet-500',
  },
  en_reparto: {
    etiqueta: 'En reparto',
    descripcion: 'El repartidor está llevando tu pedido.',
    badge: 'bg-fuchsia-50 text-fuchsia-700',
    punto: 'bg-fuchsia-500',
  },
  entregado: {
    etiqueta: 'Entregado',
    descripcion: 'Tu pedido fue entregado. ¡Gracias por tu compra!',
    badge: 'bg-emerald-50 text-emerald-700',
    punto: 'bg-emerald-500',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    descripcion: 'El pedido fue cancelado.',
    badge: 'bg-slate-100 text-slate-600',
    punto: 'bg-slate-400',
  },
  devolucion_solicitada: {
    etiqueta: 'Devolución solicitada',
    descripcion: 'Recibimos tu solicitud de devolución.',
    badge: 'bg-orange-50 text-orange-700',
    punto: 'bg-orange-500',
  },
  devuelto: {
    etiqueta: 'Devuelto',
    descripcion: 'La devolución fue completada.',
    badge: 'bg-rose-50 text-rose-700',
    punto: 'bg-rose-500',
  },
  entrega_fallida: {
    etiqueta: 'Entrega fallida',
    descripcion: 'No pudimos entregar el pedido. Intentaremos de nuevo.',
    badge: 'bg-red-50 text-red-700',
    punto: 'bg-red-500',
  },
}

// Flujo "feliz" en orden, para dibujar la línea de tiempo del cliente.
export const FLUJO_PEDIDO: EstadoPedido[] = [
  'pendiente',
  'en_preparacion',
  'listo_para_envio',
  'en_camino',
  'en_reparto',
  'entregado',
]

/**
 * Transiciones permitidas desde cada estado (lo usará el admin para
 * saber a qué estado puede mover un pedido).
 */
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  pendiente: ['en_preparacion', 'cancelado'],
  en_preparacion: ['listo_para_envio', 'cancelado'],
  listo_para_envio: ['en_camino', 'cancelado'],
  en_camino: ['en_reparto', 'entrega_fallida'],
  en_reparto: ['entregado', 'entrega_fallida'],
  entregado: ['devolucion_solicitada'],
  entrega_fallida: ['en_reparto', 'cancelado'],
  devolucion_solicitada: ['devuelto'],
  devuelto: [],
  cancelado: [],
}

export function etiquetaEstado(estado: EstadoPedido): string {
  return ESTADOS_PEDIDO[estado].etiqueta
}
