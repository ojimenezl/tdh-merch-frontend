import type { Usuario, RolUsuario } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { usuarios } from './mock/db'

export interface DatosNuevoUsuario {
  nombre: string
  email: string
  telefono?: string
  rol: RolUsuario
  password?: string
}

export const adminUsersService = {
  async listar(): Promise<Usuario[]> {
    if (USAR_MOCK) return simularLatencia([...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return apiFetch<Usuario[]>('/admin/usuarios')
  },

  async obtener(id: string): Promise<Usuario | null> {
    if (USAR_MOCK) return simularLatencia(usuarios.find((u) => u.id === id) ?? null)
    return apiFetch<Usuario>(`/admin/usuarios/${id}`)
  },

  async crear(datos: DatosNuevoUsuario): Promise<Usuario> {
    if (USAR_MOCK) {
      const existe = usuarios.find((u) => u.email === datos.email)
      if (existe) return Promise.reject(new Error('El email ya está registrado'))
      const nuevo: Usuario = {
        id: 'user-' + Date.now(),
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        rol: datos.rol,
        activo: true,
        creadoEn: new Date().toISOString(),
        direcciones: [],
      }
      usuarios.push(nuevo)
      return simularLatencia(nuevo)
    }
    return apiFetch<Usuario>('/admin/usuarios', { method: 'POST', body: JSON.stringify(datos) })
  },

  async actualizar(id: string, patch: Partial<Usuario>): Promise<Usuario> {
    if (USAR_MOCK) {
      const u = usuarios.find((x) => x.id === id)
      if (!u) return Promise.reject(new Error('Usuario no encontrado'))
      Object.assign(u, patch)
      return simularLatencia(u)
    }
    return apiFetch<Usuario>(`/admin/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
  },

  async toggleActivo(id: string): Promise<Usuario> {
    if (USAR_MOCK) {
      const u = usuarios.find((x) => x.id === id)
      if (!u) return Promise.reject(new Error('Usuario no encontrado'))
      u.activo = !u.activo
      return simularLatencia(u)
    }
    return apiFetch<Usuario>(`/admin/usuarios/${id}/toggle-activo`, { method: 'PATCH' })
  },

  async eliminar(id: string): Promise<void> {
    if (USAR_MOCK) {
      const idx = usuarios.findIndex((x) => x.id === id)
      if (idx >= 0) usuarios.splice(idx, 1)
      await simularLatencia(null, 150)
      return
    }
    await apiFetch<void>(`/admin/usuarios/${id}`, { method: 'DELETE' })
  },
}

