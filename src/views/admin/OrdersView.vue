<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { ordersService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import { TRANSICIONES, ESTADOS_PEDIDO, FLUJO_PEDIDO } from '@/lib/orderStatus'
import { formatearPrecio, formatearFecha } from '@/lib/format'
import type { Pedido, EstadoPedido } from '@/types'
import { useRouter, RouterLink } from 'vue-router'
import { Search, Filter, Eye } from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()

const pedidos = ref<Pedido[]>([])
const cargando = ref(true)
const filtroEstado = ref<EstadoPedido | 'todos'>('todos')
const busqueda = ref('')

async function cargar() {
  cargando.value = true
  try {
    pedidos.value = await ordersService.listarTodos()
  } finally {
    cargando.value = false
  }
}

const pedidosFiltrados = computed(() => {
  let resultado = [...pedidos.value]

  if (filtroEstado.value !== 'todos') {
    resultado = resultado.filter((p) => p.estado === filtroEstado.value)
  }

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (p) =>
        p.codigo.toLowerCase().includes(q) ||
        p.direccionEntrega.nombreReceptor.toLowerCase().includes(q)
    )
  }

  return resultado.sort(
    (a, b) => new Date(b.creadoEn).getTime() - new Date(a.creadoEn).getTime()
  )
})

async function cambiarEstado(pedidoId: string, nuevoEstado: string) {
  try {
    await ordersService.cambiarEstado(pedidoId, nuevoEstado as any)
    await cargar()
  } catch (e) {
    alert('No se pudo cambiar el estado: ' + (e instanceof Error ? e.message : String(e)))
  }
}

const contadores = computed(() => {
  const c: Record<string, number> = { todos: pedidos.value.length }
  for (const estado of FLUJO_PEDIDO) {
    c[estado] = pedidos.value.filter((p) => p.estado === estado).length
  }
  return c
})

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <h1 class="font-display text-3xl uppercase text-fg mb-6">Pedidos</h1>

    <!-- Filtros -->
    <div class="mb-6 space-y-4">
      <!-- Búsqueda -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por código o cliente..."
          class="w-full border-2 border-line bg-bg pl-10 pr-4 py-2 text-sm"
        />
      </div>

      <!-- Filtros por estado -->
      <div class="flex flex-wrap gap-2">
        <button
          @click="filtroEstado = 'todos'"
          :class="[
            'px-3 py-1.5 text-xs font-bold uppercase border-2 transition-colors',
            filtroEstado === 'todos'
              ? 'border-accent bg-accent text-accent-contrast'
              : 'border-line hover:bg-surface'
          ]"
        >
          Todos ({{ contadores.todos }})
        </button>
        <button
          v-for="estado in FLUJO_PEDIDO"
          :key="estado"
          @click="filtroEstado = estado"
          :class="[
            'px-3 py-1.5 text-xs font-bold uppercase border-2 transition-colors',
            filtroEstado === estado
              ? 'border-accent bg-accent text-accent-contrast'
              : 'border-line hover:bg-surface'
          ]"
        >
          {{ ESTADOS_PEDIDO[estado].etiqueta }} ({{ contadores[estado] || 0 }})
        </button>
      </div>
    </div>

    <!-- Lista de pedidos -->
    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-24 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else-if="pedidosFiltrados.length === 0" class="border-2 border-dashed border-line p-8 text-center">
      <Filter class="mx-auto h-12 w-12 text-muted mb-4" />
      <p class="text-muted">No hay pedidos que coincidan con los filtros</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="p in pedidosFiltrados"
        :key="p.id"
        class="border-2 border-line bg-surface p-4 hover:border-accent transition-colors"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Info principal -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <span class="font-display text-lg">{{ p.codigo }}</span>
              <span :class="ESTADOS_PEDIDO[p.estado].badge" class="px-2 py-0.5 text-xs font-bold uppercase">
                {{ ESTADOS_PEDIDO[p.estado].etiqueta }}
              </span>
            </div>
            <div class="text-sm text-muted mt-1">
              {{ p.direccionEntrega.nombreReceptor }} · {{ p.direccionEntrega.ciudad }}
            </div>
            <div class="text-xs text-muted mt-1">
              {{ formatearFecha(p.creadoEn) }} · {{ p.items.length }} producto{{ p.items.length > 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center gap-3">
            <div class="text-right">
              <div class="font-display text-lg">{{ formatearPrecio(p.total) }}</div>
              <div class="text-xs text-muted uppercase">{{ p.metodoPagoPreferido }}</div>
            </div>

            <select
              @change="(e: Event) => cambiarEstado(p.id, (e.target as HTMLSelectElement).value)"
              :value="p.estado"
              class="border-2 border-line bg-bg px-2 py-1 text-xs font-bold uppercase"
            >
              <option v-for="opt in TRANSICIONES[p.estado]" :key="opt" :value="opt">
                → {{ ESTADOS_PEDIDO[opt].etiqueta }}
              </option>
            </select>

            <RouterLink
              :to="`/admin/pedidos/${p.id}`"
              class="flex items-center gap-1 px-3 py-1 border-2 border-line text-xs font-bold uppercase hover:bg-bg transition-colors"
            >
              <Eye class="h-3 w-3" />
              Ver
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
