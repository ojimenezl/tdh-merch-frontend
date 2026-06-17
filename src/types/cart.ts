import type { ValorAtributo } from './catalog'

// Línea del carrito (un producto/variante con su cantidad).
export interface ItemCarrito {
  productoId: string
  varianteId?: string
  slug: string // para enlazar al detalle del producto
  nombreProducto: string
  atributos: ValorAtributo[]
  imagen?: string
  precioUnitario: number
  cantidad: number
  stockMax: number // límite para no superar el stock disponible
}
