import type { Categoria, FiltrosCatalogo, Producto } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { categorias, productos } from './mock/db'

function aplicarFiltros(lista: Producto[], filtros: FiltrosCatalogo): Producto[] {
  let res = lista.filter((p) => p.activo)

  if (filtros.categoriaId) {
    res = res.filter((p) => p.categoriaId === filtros.categoriaId)
  }
  if (filtros.soloDestacados) {
    res = res.filter((p) => p.destacado)
  }
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase()
    res = res.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q),
    )
  }
  if (typeof filtros.precioMin === 'number') {
    res = res.filter((p) => p.precioBase >= filtros.precioMin!)
  }
  if (typeof filtros.precioMax === 'number') {
    res = res.filter((p) => p.precioBase <= filtros.precioMax!)
  }

  switch (filtros.orden) {
    case 'precio_asc':
      res.sort((a, b) => a.precioBase - b.precioBase)
      break
    case 'precio_desc':
      res.sort((a, b) => b.precioBase - a.precioBase)
      break
    case 'nombre':
      res.sort((a, b) => a.nombre.localeCompare(b.nombre))
      break
    case 'recientes':
    default:
      res.sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
      break
  }

  return res
}

export const catalogService = {
  async listarCategorias(): Promise<Categoria[]> {
    if (USAR_MOCK) return simularLatencia(categorias.filter((c) => c.activa))
    return apiFetch<Categoria[]>('/categorias')
  },

  async obtenerCategoria(slug: string): Promise<Categoria | null> {
    if (USAR_MOCK) {
      return simularLatencia(categorias.find((c) => c.slug === slug) ?? null)
    }
    return apiFetch<Categoria>(`/categorias/${slug}`)
  },

  async listarProductos(filtros: FiltrosCatalogo = {}): Promise<Producto[]> {
    if (USAR_MOCK) return simularLatencia(aplicarFiltros(productos, filtros))
    const params = new URLSearchParams(filtros as Record<string, string>).toString()
    return apiFetch<Producto[]>(`/productos?${params}`)
  },

  async productosDestacados(limite = 4): Promise<Producto[]> {
    if (USAR_MOCK) {
      return simularLatencia(productos.filter((p) => p.activo && p.destacado).slice(0, limite))
    }
    return apiFetch<Producto[]>(`/productos/destacados?limite=${limite}`)
  },

  async obtenerProducto(slug: string): Promise<Producto | null> {
    if (USAR_MOCK) {
      return simularLatencia(productos.find((p) => p.slug === slug && p.activo) ?? null)
    }
    return apiFetch<Producto>(`/productos/${slug}`)
  },
}
