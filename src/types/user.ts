// Usuarios y roles de TDH merch.

export type RolUsuario = 'cliente' | 'admin' | 'superadmin'

export interface Direccion {
  id: string
  etiqueta: string // 'Casa', 'Trabajo', etc.
  nombreReceptor: string
  telefono: string
  pais: string
  provincia: string
  ciudad: string
  calle: string
  referencia?: string
  predeterminada: boolean
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  telefono?: string
  direcciones: Direccion[]
  activo: boolean
  creadoEn: string // ISO date
}

// Datos que se envían al registrarse.
export interface DatosRegistro {
  nombre: string
  email: string
  password: string
  telefono?: string
}

// Datos para iniciar sesión.
export interface Credenciales {
  email: string
  password: string
}

// Respuesta de autenticación (token + usuario), como la dará el backend.
export interface SesionAuth {
  token: string
  usuario: Usuario
}
