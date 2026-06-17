import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notificacion } from '@/types'
import { notificationsService } from '@/services'

export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notificacion[]>([])
  const cargando = ref(false)

  const noLeidas = computed(() => items.value.filter((n) => !n.leida).length)

  async function cargar(usuarioId: string) {
    cargando.value = true
    try {
      items.value = await notificationsService.listarPorUsuario(usuarioId)
    } finally {
      cargando.value = false
    }
  }

  async function marcarLeida(id: string) {
    await notificationsService.marcarLeida(id)
    const n = items.value.find((x) => x.id === id)
    if (n) n.leida = true
  }

  async function marcarTodasLeidas(usuarioId: string) {
    await notificationsService.marcarTodasLeidas(usuarioId)
    items.value.forEach((n) => (n.leida = true))
  }

  return { items, cargando, noLeidas, cargar, marcarLeida, marcarTodasLeidas }
})
