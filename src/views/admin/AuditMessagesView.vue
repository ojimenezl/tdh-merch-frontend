<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { messagesService } from '@/services'
import { formatearFecha } from '@/lib/format'
import type { Conversacion, Mensaje } from '@/types'
import { Search, MessageSquare, User, Shield } from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()

const cargando = ref(true)
const conversaciones = ref<Conversacion[]>([])
const busqueda = ref('')
const conversacionSeleccionada = ref<Conversacion | null>(null)

interface MensajeConInfo extends Mensaje {
  codigoPedido: string
  clienteNombre: string
}

const todosLosMensajes = computed((): MensajeConInfo[] => {
  const mensajes: MensajeConInfo[] = []
  for (const conv of conversaciones.value) {
    for (const msg of conv.mensajes) {
      mensajes.push({
        ...msg,
        codigoPedido: conv.codigoPedido,
        clienteNombre: conv.clienteNombre,
      })
    }
  }
  return mensajes.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
})

const mensajesFiltrados = computed(() => {
  if (!busqueda.value.trim()) return todosLosMensajes.value
  const q = busqueda.value.toLowerCase()
  return todosLosMensajes.value.filter(
    (m) =>
      m.texto.toLowerCase().includes(q) ||
      m.autorNombre.toLowerCase().includes(q) ||
      m.codigoPedido.toLowerCase().includes(q) ||
      m.clienteNombre.toLowerCase().includes(q)
  )
})

const conversacionesFiltradas = computed(() => {
  if (!busqueda.value.trim()) return conversaciones.value
  const q = busqueda.value.toLowerCase()
  return conversaciones.value.filter(
    (c) =>
      c.codigoPedido.toLowerCase().includes(q) ||
      c.clienteNombre.toLowerCase().includes(q) ||
      c.mensajes.some((m) => m.texto.toLowerCase().includes(q))
  )
})

const estadisticas = computed(() => ({
  totalConversaciones: conversaciones.value.length,
  totalMensajes: todosLosMensajes.value.length,
  mensajesCliente: todosLosMensajes.value.filter((m) => m.autor === 'cliente').length,
  mensajesAdmin: todosLosMensajes.value.filter((m) => m.autor === 'admin').length,
}))

async function cargar() {
  cargando.value = true
  try {
    conversaciones.value = await messagesService.listarConversaciones()
  } finally {
    cargando.value = false
  }
}

function verConversacion(conv: Conversacion) {
  conversacionSeleccionada.value = conv
}

function cerrarDetalle() {
  conversacionSeleccionada.value = null
}

onMounted(() => {
  if (!auth.esSuperadmin) router.push({ name: 'admin-dashboard' })
  cargar()
})
</script>

<template>
  <div>
    <h1 class="font-display text-3xl uppercase text-fg mb-6">Auditoría de Mensajes</h1>

    <!-- Estadísticas -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ estadisticas.totalConversaciones }}</div>
        <div class="text-xs text-muted uppercase">Conversaciones</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ estadisticas.totalMensajes }}</div>
        <div class="text-xs text-muted uppercase">Mensajes Total</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl text-accent">{{ estadisticas.mensajesCliente }}</div>
        <div class="text-xs text-muted uppercase">De Clientes</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl text-success">{{ estadisticas.mensajesAdmin }}</div>
        <div class="text-xs text-muted uppercase">De Admins</div>
      </div>
    </div>

    <!-- Búsqueda -->
    <div class="mb-6 relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar por pedido, cliente, admin o contenido del mensaje..."
        class="w-full border-2 border-line bg-bg pl-10 pr-4 py-2 text-sm"
      />
    </div>

    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-24 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-2">
      <!-- Lista de conversaciones -->
      <div>
        <h2 class="font-display text-lg uppercase text-fg mb-4">Conversaciones</h2>

        <div v-if="conversacionesFiltradas.length === 0" class="border-2 border-dashed border-line p-6 text-center">
          <MessageSquare class="mx-auto h-10 w-10 text-muted mb-3" />
          <p class="text-muted text-sm">No hay conversaciones</p>
        </div>

        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div
            v-for="conv in conversacionesFiltradas"
            :key="conv.pedidoId"
            :class="[
              'border-2 p-3 cursor-pointer transition-colors',
              conversacionSeleccionada?.pedidoId === conv.pedidoId
                ? 'border-accent bg-accent/5'
                : 'border-line hover:border-accent/50'
            ]"
            @click="verConversacion(conv)"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-display text-sm">{{ conv.codigoPedido }}</span>
              <span class="text-xs text-muted">{{ conv.mensajes.length }} msg</span>
            </div>
            <div class="text-xs text-muted">Cliente: {{ conv.clienteNombre }}</div>
            <div class="text-xs text-muted">Últ. actividad: {{ formatearFecha(conv.actualizadoEn) }}</div>
          </div>
        </div>
      </div>

      <!-- Timeline de mensajes o detalle -->
      <div>
        <h2 class="font-display text-lg uppercase text-fg mb-4">
          {{ conversacionSeleccionada ? `Chat: ${conversacionSeleccionada.codigoPedido}` : 'Timeline Global' }}
        </h2>

        <!-- Detalle de conversación seleccionada -->
        <div v-if="conversacionSeleccionada" class="border-2 border-line bg-surface p-4">
          <div class="flex items-center justify-between mb-4">
            <div>
              <div class="font-display text-sm">{{ conversacionSeleccionada.codigoPedido }}</div>
              <div class="text-xs text-muted">{{ conversacionSeleccionada.clienteNombre }}</div>
            </div>
            <button @click="cerrarDetalle" class="text-xs font-bold uppercase text-accent hover:underline">
              Ver timeline
            </button>
          </div>

          <div class="space-y-3 max-h-[500px] overflow-y-auto">
            <div
              v-for="m in conversacionSeleccionada.mensajes"
              :key="m.id"
              :class="[
                'p-3',
                m.autor === 'admin' ? 'bg-fg text-bg ml-8' : 'border-2 border-line bg-bg mr-8'
              ]"
            >
              <div class="flex items-center gap-2 text-xs font-bold uppercase opacity-70 mb-1">
                <User v-if="m.autor === 'cliente'" class="h-3 w-3" />
                <Shield v-else class="h-3 w-3" />
                {{ m.autorNombre }}
                <span class="font-normal">· {{ formatearFecha(m.fecha) }}</span>
              </div>
              <div class="text-sm">{{ m.texto }}</div>
            </div>
          </div>
        </div>

        <!-- Timeline global -->
        <div v-else class="space-y-2 max-h-[600px] overflow-y-auto">
          <div v-if="mensajesFiltrados.length === 0" class="border-2 border-dashed border-line p-6 text-center">
            <p class="text-muted text-sm">No hay mensajes</p>
          </div>

          <div
            v-for="m in mensajesFiltrados.slice(0, 50)"
            :key="m.id"
            class="border-2 border-line p-3"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2">
                <div
                  :class="[
                    'flex h-6 w-6 items-center justify-center text-xs',
                    m.autor === 'admin' ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent'
                  ]"
                >
                  <User v-if="m.autor === 'cliente'" class="h-3 w-3" />
                  <Shield v-else class="h-3 w-3" />
                </div>
                <div>
                  <div class="text-xs font-bold uppercase">{{ m.autorNombre }}</div>
                  <div class="text-xs text-muted">
                    {{ m.autor === 'cliente' ? 'Cliente' : 'Admin' }} · {{ m.codigoPedido }}
                  </div>
                </div>
              </div>
              <span class="text-xs text-muted">{{ formatearFecha(m.fecha) }}</span>
            </div>
            <p class="text-sm text-fg pl-8">{{ m.texto }}</p>
          </div>

          <div v-if="mensajesFiltrados.length > 50" class="text-center text-sm text-muted py-4">
            Mostrando los últimos 50 mensajes de {{ mensajesFiltrados.length }} totales
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
