import type { Credenciales, DatosRegistro, SesionAuth, Usuario } from '@/types'
import { USAR_MOCK, simularLatencia, apiFetch } from './config'
import { usuarios } from './mock/db'

// Mientras sea mock, generamos un "token" falso.
function tokenFalso(usuario: Usuario): string {
  return `mock-token.${usuario.id}.${Date.now()}`
}

export const authService = {
  /**
   * Valida credenciales sin completar login (para flujo 2FA)
   */
  async validarCredenciales(credenciales: Credenciales): Promise<Usuario> {
    if (USAR_MOCK) {
      const usuario = usuarios.find((u) => u.email === credenciales.email && u.activo)
      if (!usuario || !credenciales.password) {
        return Promise.reject(new Error('Credenciales inválidas'))
      }
      return simularLatencia(usuario)
    }
    return apiFetch<Usuario>('/auth/validate', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    })
  },

  /**
   * Login completo (genera token)
   */
  async login(credenciales: Credenciales): Promise<SesionAuth> {
    if (USAR_MOCK) {
      const usuario = usuarios.find((u) => u.email === credenciales.email && u.activo)
      // En el mock cualquier contraseña no vacía es válida.
      if (!usuario || !credenciales.password) {
        return Promise.reject(new Error('Credenciales inválidas'))
      }
      return simularLatencia({ token: tokenFalso(usuario), usuario })
    }
    return apiFetch<SesionAuth>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credenciales),
    })
  },

  /**
   * Genera token para usuario ya validado (después de 2FA)
   */
  async generarToken(usuario: Usuario): Promise<SesionAuth> {
    if (USAR_MOCK) {
      return simularLatencia({ token: tokenFalso(usuario), usuario })
    }
    return apiFetch<SesionAuth>('/auth/token', {
      method: 'POST',
      body: JSON.stringify({ userId: usuario.id }),
    })
  },

  async registro(datos: DatosRegistro): Promise<SesionAuth> {
    if (USAR_MOCK) {
      if (usuarios.some((u) => u.email === datos.email)) {
        return Promise.reject(new Error('Ya existe una cuenta con ese email'))
      }
      const nuevo: Usuario = {
        id: `user-${Date.now()}`,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        rol: 'cliente',
        activo: true,
        creadoEn: new Date().toISOString(),
        direcciones: [],
      }
      usuarios.push(nuevo)
      return simularLatencia({ token: tokenFalso(nuevo), usuario: nuevo })
    }
    return apiFetch<SesionAuth>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  async perfil(): Promise<Usuario | null> {
    if (USAR_MOCK) {
      return simularLatencia(usuarios.find((u) => u.rol === 'cliente') ?? null)
    }
    return apiFetch<Usuario>('/auth/perfil')
  },
}
