import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Credenciales, DatosRegistro, Usuario } from '@/types'
import { authService } from '@/services'

const CLAVE_STORAGE = 'tdh_auth'

interface DatosPersistidos {
  token: string
  usuario: Usuario
}

function cargarPersistido(): DatosPersistidos | null {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    return raw ? (JSON.parse(raw) as DatosPersistidos) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const inicial = cargarPersistido()

  const usuario = ref<Usuario | null>(inicial?.usuario ?? null)
  const token = ref<string | null>(inicial?.token ?? null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  const estaAutenticado = computed(() => !!token.value && !!usuario.value)
  const rol = computed(() => usuario.value?.rol ?? null)
  const esAdmin = computed(() => rol.value === 'admin' || rol.value === 'superadmin')
  const esSuperadmin = computed(() => rol.value === 'superadmin')

  function persistir() {
    if (token.value && usuario.value) {
      localStorage.setItem(
        CLAVE_STORAGE,
        JSON.stringify({ token: token.value, usuario: usuario.value }),
      )
    } else {
      localStorage.removeItem(CLAVE_STORAGE)
    }
  }

  /**
   * Login completo (para usuarios sin 2FA)
   */
  async function login(credenciales: Credenciales) {
    cargando.value = true
    error.value = null
    try {
      const sesion = await authService.login(credenciales)
      usuario.value = sesion.usuario
      token.value = sesion.token
      persistir()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo iniciar sesión'
      throw e
    } finally {
      cargando.value = false
    }
  }

  /**
   * Valida credenciales sin completar login (paso 1 del flujo 2FA)
   */
  async function validarCredenciales(credenciales: Credenciales): Promise<Usuario | null> {
    cargando.value = true
    error.value = null
    try {
      const user = await authService.validarCredenciales(credenciales)
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Credenciales inválidas'
      return null
    } finally {
      cargando.value = false
    }
  }

  /**
   * Completa el login después de verificar 2FA (paso 2 del flujo 2FA)
   */
  async function completarLogin(user: Usuario) {
    cargando.value = true
    error.value = null
    try {
      const sesion = await authService.generarToken(user)
      usuario.value = sesion.usuario
      token.value = sesion.token
      persistir()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo completar el inicio de sesión'
      throw e
    } finally {
      cargando.value = false
    }
  }

  async function registro(datos: DatosRegistro) {
    cargando.value = true
    error.value = null
    try {
      const sesion = await authService.registro(datos)
      usuario.value = sesion.usuario
      token.value = sesion.token
      persistir()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudo crear la cuenta'
      throw e
    } finally {
      cargando.value = false
    }
  }

  function logout() {
    usuario.value = null
    token.value = null
    error.value = null
    persistir()
  }

  return {
    usuario,
    token,
    cargando,
    error,
    estaAutenticado,
    rol,
    esAdmin,
    esSuperadmin,
    login,
    validarCredenciales,
    completarLogin,
    registro,
    logout,
  }
})
