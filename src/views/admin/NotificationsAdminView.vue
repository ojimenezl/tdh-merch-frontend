<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha } from '@/lib/format'
import { Bell, Package, MessageSquare, AlertTriangle, Check } from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()

interface NotificacionAdmin {
  id: string
  tipo: 'pedido' | 'mensaje' | 'stock'
  titulo: string
  detalle: string
  leida: boolean
  fecha: string
  enlace?: string
}

const cargando = ref(true)
const notificaciones = ref<NotificacionAdmin[]>([])

async function cargar() {
  cargando.value = true
  await new Promise((r) => setTimeout(r, 300))

  notificaciones.value = [
    {
      id: 'nadm-1',
      tipo: 'pedido',
      titulo: 'Nuevo pedido recibido',
      detalle: 'El cliente Juan Pérez ha realizado el pedido TDH-0003.',
      leida: false,
      fecha: '2026-06-16T10:00:00.000Z',
      enlace: '/admin/pedidos',
    },
    {
      id: 'nadm-2',
      tipo: 'mensaje',
      titulo: 'Nuevo mensaje de cliente',
      detalle: 'Juan Pérez ha enviado un mensaje sobre el pedido TDH-0001.',
      leida: false,
      fecha: '2026-06-15T14:30:00.000Z',
      enlace: '/admin/mensajes',
    },
    {
      id: 'nadm-3',
      tipo: 'stock',
      titulo: 'Stock bajo',
      detalle: 'Camiseta TDH Classic (M/Blanco) tiene 0 unidades.',
      leida: true,
      fecha: '2026-06-14T09:00:00.000Z',
      enlace: '/admin/productos',
    },
    {
      id: 'nadm-4',
      tipo: 'pedido',
      titulo: 'Pedido entregado',
      detalle: 'El pedido TDH-0002 ha sido marcado como entregado.',
      leida: true,
      fecha: '2026-06-01T13:00:00.000Z',
      enlace: '/admin/pedidos',
    },
  ]

  cargando.value = false
}

function marcarLeida(id: string) {
  const n = notificaciones.value.find((x) => x.id === id)
  if (n) n.leida = true
}

function marcarTodasLeidas() {
  notificaciones.value.forEach((n) => (n.leida = true))
}

const iconos = {
  pedido: Package,
  mensaje: MessageSquare,
  stock: AlertTriangle,
}

const colores = {
  pedido: 'bg-accent/10 text-accent',
  mensaje: 'bg-success/10 text-success',
  stock: 'bg-danger/10 text-danger',
}

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-3xl uppercase text-fg">Notificaciones</h1>
      <button
        v-if="notificaciones.some((n) => !n.leida)"
        @click="marcarTodasLeidas"
        class="flex items-center gap-2 text-xs font-bold uppercase text-accent hover:underline"
      >
        <Check class="h-4 w-4" />
        Marcar todas como leídas
      </button>
    </div>

    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-20 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else-if="notificaciones.length === 0" class="border-2 border-dashed border-line p-8 text-center">
      <Bell class="mx-auto h-12 w-12 text-muted mb-4" />
      <p class="text-muted">No tienes notificaciones</p>
    </div>

    <div v-else class="space-y-2">
      <component
        :is="n.enlace ? RouterLink : 'div'"
        v-for="n in notificaciones"
        :key="n.id"
        :to="n.enlace"
        @click="marcarLeida(n.id)"
        :class="[
          'flex items-start gap-4 border-2 p-4 transition-colors cursor-pointer',
          n.leida ? 'border-line bg-surface opacity-60' : 'border-accent bg-surface hover:bg-bg'
        ]"
      >
        <div :class="['flex h-10 w-10 items-center justify-center flex-shrink-0', colores[n.tipo]]">
          <component :is="iconos[n.tipo]" class="h-5 w-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-display text-sm uppercase text-fg">{{ n.titulo }}</h3>
            <span class="text-xs text-muted flex-shrink-0">{{ formatearFecha(n.fecha) }}</span>
          </div>
          <p class="text-sm text-muted mt-1">{{ n.detalle }}</p>
        </div>
        <div v-if="!n.leida" class="h-2 w-2 rounded-full bg-accent flex-shrink-0 mt-2" />
      </component>
    </div>
  </div>
</template>
