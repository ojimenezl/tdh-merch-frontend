import { pedidos, productos, conversaciones, usuarios, categorias } from './mock/db'
import { simularLatencia, clonar } from './config'

export interface AdminStats {
  pedidosHoy: number
  pedidosPendientes: number
  productosStockBajo: number
  totalVentasHoy: number
  totalVentasMes: number
  conversacionesSinLeer: number
}

export interface ProductoStockBajo {
  id: string
  nombre: string
  variante: string
  stock: number
}

function esHoy(fecha: string): boolean {
  const d = new Date(fecha)
  const hoy = new Date()
  return d.toDateString() === hoy.toDateString()
}

function esMesActual(fecha: string): boolean {
  const d = new Date(fecha)
  const hoy = new Date()
  return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear()
}

async function obtenerResumen(): Promise<AdminStats> {
  await simularLatencia(null, 200)

  const pedidosHoy = pedidos.filter((p) => esHoy(p.creadoEn)).length
  const pedidosPendientes = pedidos.filter((p) =>
    ['pendiente', 'en_preparacion', 'listo_para_envio'].includes(p.estado)
  ).length

  let productosStockBajo = 0
  for (const prod of productos) {
    if (prod.variantes && prod.variantes.length > 0) {
      for (const v of prod.variantes) {
        if (v.stock <= 5) productosStockBajo++
      }
    } else if (prod.stockSimple !== undefined && prod.stockSimple <= 5) {
      productosStockBajo++
    }
  }

  const totalVentasHoy = pedidos
    .filter((p) => esHoy(p.creadoEn))
    .reduce((sum, p) => sum + p.total, 0)

  const totalVentasMes = pedidos
    .filter((p) => esMesActual(p.creadoEn))
    .reduce((sum, p) => sum + p.total, 0)

  const conversacionesSinLeer = conversaciones.filter((c) =>
    c.mensajes.some((m) => m.autor === 'cliente' && !m.leido)
  ).length

  return {
    pedidosHoy,
    pedidosPendientes,
    productosStockBajo,
    totalVentasHoy,
    totalVentasMes,
    conversacionesSinLeer,
  }
}

async function obtenerProductosStockBajo(): Promise<ProductoStockBajo[]> {
  await simularLatencia(null, 150)
  const resultado: ProductoStockBajo[] = []

  for (const prod of clonar(productos)) {
    if (prod.variantes && prod.variantes.length > 0) {
      for (const v of prod.variantes) {
        if (v.stock <= 5) {
          const attrs = v.atributos.map((a) => a.valor).join(' / ')
          resultado.push({
            id: prod.id,
            nombre: prod.nombre,
            variante: attrs,
            stock: v.stock,
          })
        }
      }
    } else if (prod.stockSimple !== undefined && prod.stockSimple <= 5) {
      resultado.push({
        id: prod.id,
        nombre: prod.nombre,
        variante: 'Único',
        stock: prod.stockSimple,
      })
    }
  }

  return resultado.sort((a, b) => a.stock - b.stock)
}

async function obtenerPedidosRecientes() {
  await simularLatencia(null, 100)
  return clonar(pedidos)
    .sort((a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime())
    .slice(0, 5)
}

export interface SuperadminStats {
  totalUsuarios: number
  usuariosActivos: number
  usuariosBloqueados: number
  totalCategorias: number
  categoriasActivas: number
  totalProductos: number
  productosActivos: number
  totalPedidos: number
  ventasHistoricas: number
}

async function obtenerStatsSuperadmin(): Promise<SuperadminStats> {
  await simularLatencia(null, 200)

  return {
    totalUsuarios: usuarios.length,
    usuariosActivos: usuarios.filter((u) => u.activo).length,
    usuariosBloqueados: usuarios.filter((u) => !u.activo).length,
    totalCategorias: categorias.length,
    categoriasActivas: categorias.filter((c) => c.activa).length,
    totalProductos: productos.length,
    productosActivos: productos.filter((p) => p.activo).length,
    totalPedidos: pedidos.length,
    ventasHistoricas: pedidos.reduce((sum, p) => sum + p.total, 0),
  }
}

export const adminStatsService = {
  obtenerResumen,
  obtenerProductosStockBajo,
  obtenerPedidosRecientes,
  obtenerStatsSuperadmin,
}
