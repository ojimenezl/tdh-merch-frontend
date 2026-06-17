import type { Direccion } from './user'
import type { ValorAtributo } from './catalog'

/**
 * Estados posibles de un pedido (flujo contra entrega, sin pago en línea).
 */
export type EstadoPedido =
  | 'pendiente' // pedido recibido, aún sin preparar
  | 'en_preparacion' // se está armando el pedido
  | 'listo_para_envio' // empacado, listo para salir
  | 'en_camino' // despachado hacia la ciudad/zona
  | 'en_reparto' // el repartidor lo lleva al cliente
  | 'entregado' // entregado y pagado
  | 'cancelado' // cancelado (por cliente o tienda)
  | 'devolucion_solicitada' // el cliente pidió devolver
  | 'devuelto' // devolución completada
  | 'entrega_fallida' // no se pudo entregar

export type MetodoPago = 'efectivo' | 'transferencia'

// Un ítem dentro del pedido (foto del producto al momento de comprar).
export interface ItemPedido {
  productoId: string
  varianteId?: string
  nombreProducto: string
  atributos: ValorAtributo[]
  imagen?: string
  precioUnitario: number
  cantidad: number
}

// Registro de cada cambio de estado (para la línea de tiempo del cliente).
export interface CambioEstado {
  estado: EstadoPedido
  fecha: string
  nota?: string
}

export interface Pedido {
  id: string
  codigo: string // ej. 'TDH-0001'
  clienteId: string
  items: ItemPedido[]
  subtotal: number
  envio: number
  total: number
  estado: EstadoPedido
  historialEstados: CambioEstado[]
  direccionEntrega: Direccion
  metodoPagoPreferido: MetodoPago
  creadoEn: string
  actualizadoEn: string
}

// Datos necesarios para crear un pedido desde el checkout.
export interface DatosNuevoPedido {
  items: ItemPedido[]
  direccionEntrega: Direccion
  metodoPagoPreferido: MetodoPago
}
