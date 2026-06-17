import { defineStore } from 'pinia'
import { ref } from 'vue'

const CLAVE_STORAGE = 'tdh_theme'

function preferenciaInicial(): boolean {
  const guardado = localStorage.getItem(CLAVE_STORAGE)
  if (guardado) return guardado === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = defineStore('theme', () => {
  const oscuro = ref(preferenciaInicial())

  function aplicar() {
    document.documentElement.classList.toggle('dark', oscuro.value)
    localStorage.setItem(CLAVE_STORAGE, oscuro.value ? 'dark' : 'light')
  }

  function alternar() {
    oscuro.value = !oscuro.value
    aplicar()
  }

  // Sincroniza la clase del <html> con el estado actual al iniciar.
  function inicializar() {
    aplicar()
  }

  return { oscuro, alternar, inicializar }
})
