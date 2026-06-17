import type { Producto } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { productos } from './mock/db'

export const adminProductsService = {
  async listarTodos(): Promise<Producto[]> {
    if (USAR_MOCK) return simularLatencia([...productos].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn)))
    return apiFetch<Producto[]>('/admin/productos')
  },

  async obtenerPorId(id: string): Promise<Producto | null> {
    if (USAR_MOCK) return simularLatencia(productos.find((p) => p.id === id) ?? null)
    return apiFetch<Producto>(`/admin/productos/${id}`)
  },

  async crear(data: Partial<Producto>): Promise<Producto> {
    if (USAR_MOCK) {
      const ahora = new Date().toISOString()
      const nuevo: Producto = {
        id: `prod-${Date.now()}`,
        nombre: String(data.nombre ?? 'Nuevo producto'),
        slug: String((data.slug ?? (`nuevo-${Date.now()}`)).toString()),
        descripcion: String(data.descripcion ?? ''),
        categoriaId: String(data.categoriaId ?? 'cat-ropa'),
        precioBase: Number(data.precioBase ?? 0),
        imagenes: data.imagenes ?? [],
        atributos: data.atributos ?? [],
        variantes: data.variantes ?? [],
        stockSimple: data.stockSimple ?? 0,
        destacado: !!data.destacado,
        activo: data.activo ?? true,
        creadoEn: ahora,
      }
      productos.push(nuevo)
      return simularLatencia(nuevo)
    }
    return apiFetch<Producto>('/admin/productos', { method: 'POST', body: JSON.stringify(data) })
  },

  async actualizar(id: string, patch: Partial<Producto>): Promise<Producto> {
    if (USAR_MOCK) {
      const p = productos.find((x) => x.id === id)
      if (!p) return Promise.reject(new Error('Producto no encontrado'))
      Object.assign(p, patch)
      return simularLatencia(p)
    }
    return apiFetch<Producto>(`/admin/productos/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  },

  async eliminar(id: string): Promise<void> {
    if (USAR_MOCK) {
      const idx = productos.findIndex((x) => x.id === id)
      if (idx >= 0) productos.splice(idx, 1)
      await simularLatencia(null, 150)
      return
    }
    await apiFetch<void>(`/admin/productos/${id}`, { method: 'DELETE' })
  },
}

