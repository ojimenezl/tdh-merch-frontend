<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ordersService, messagesService } from '@/services'
import { formatearPrecio, formatearFecha } from '@/lib/format'
import { ESTADOS_PEDIDO, TRANSICIONES, FLUJO_PEDIDO } from '@/lib/orderStatus'
import type { Pedido, Conversacion } from '@/types'
import { ArrowLeft, MapPin, Phone, User, Package, MessageSquare, Check } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const pedidoId = route.params.id as string
const cargando = ref(true)
const pedido = ref<Pedido | null>(null)
const conversacion = ref<Conversacion | null>(null)
const nuevoMensaje = ref('')

async function cargar() {
  cargando.value = true
  try {
    pedido.value = await ordersService.obtener(pedidoId)
    if (pedido.value) {
      try {
        conversacion.value = await messagesService.obtenerPorPedido(pedidoId)
      } catch {
        conversacion.value = null
      }
    }
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(nuevoEstado: string) {
  if (!pedido.value) return
  try {
    await ordersService.cambiarEstado(pedido.value.id, nuevoEstado as any)
    await cargar()
  } catch (e) {
    alert('Error: ' + (e instanceof Error ? e.message : String(e)))
  }
}

async function enviarMensaje() {
  if (!pedido.value || !nuevoMensaje.value.trim()) return
  await messagesService.enviarMensaje(
    pedido.value.id,
    'admin',
    auth.usuario?.nombre ?? 'Admin',
    nuevoMensaje.value.trim()
  )
  nuevoMensaje.value = ''
  await cargar()
}

const estadoActualIndex = computed(() => {
  if (!pedido.value) return -1
  return FLUJO_PEDIDO.indexOf(pedido.value.estado)
})

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center gap-4">
      <RouterLink to="/admin/pedidos" class="flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft class="h-4 w-4" />
        Volver a pedidos
      </RouterLink>
    </div>

    <div v-if="cargando" class="space-y-4">
      <div class="h-12 animate-pulse bg-surface border-2 border-line" />
      <div class="h-64 animate-pulse bg-surface border-2 border-line" />
    </div>

    <div v-else-if="pedido" class="space-y-6">
      <!-- Cabecera del pedido -->
      <div class="border-2 border-line bg-surface p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="font-display text-3xl uppercase text-fg">{{ pedido.codigo }}</h1>
            <p class="text-sm text-muted mt-1">Creado el {{ formatearFecha(pedido.creadoEn) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span :class="ESTADOS_PEDIDO[pedido.estado].badge" class="px-3 py-2 text-sm font-bold uppercase">
              {{ ESTADOS_PEDIDO[pedido.estado].etiqueta }}
            </span>
            <select
              @change="(e: Event) => cambiarEstado((e.target as HTMLSelectElement).value)"
              :value="pedido.estado"
              class="border-2 border-line bg-bg px-3 py-2 text-sm font-bold uppercase"
            >
              <option v-for="opt in TRANSICIONES[pedido.estado]" :key="opt" :value="opt">
                → {{ ESTADOS_PEDIDO[opt].etiqueta }}
              </option>
            </select>
          </div>
        </div>

        <!-- Línea de tiempo de estados -->
        <div class="mt-6 pt-6 border-t border-line">
          <div class="flex items-center justify-between">
            <div
              v-for="(estado, idx) in FLUJO_PEDIDO"
              :key="estado"
              class="flex flex-col items-center"
              :class="idx <= estadoActualIndex ? 'text-accent' : 'text-muted'"
            >
              <div
                :class="[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                  idx < estadoActualIndex ? 'bg-accent text-accent-contrast' : '',
                  idx === estadoActualIndex ? 'bg-accent text-accent-contrast ring-2 ring-accent ring-offset-2 ring-offset-bg' : '',
                  idx > estadoActualIndex ? 'border-2 border-muted' : ''
                ]"
              >
                <Check v-if="idx < estadoActualIndex" class="h-4 w-4" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span class="mt-2 text-xs font-bold uppercase text-center max-w-[80px]">
                {{ ESTADOS_PEDIDO[estado].etiqueta }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid de información -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Dirección de entrega -->
        <div class="border-2 border-line bg-surface p-4">
          <h2 class="font-display text-lg uppercase text-fg mb-4 flex items-center gap-2">
            <MapPin class="h-5 w-5" />
            Dirección de Entrega
          </h2>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <User class="h-4 w-4 text-muted" />
              <span>{{ pedido.direccionEntrega.nombreReceptor }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="h-4 w-4 text-muted" />
              <span>{{ pedido.direccionEntrega.telefono }}</span>
            </div>
            <div class="mt-3 p-3 bg-bg border border-line">
              <p>{{ pedido.direccionEntrega.calle }}</p>
              <p>{{ pedido.direccionEntrega.ciudad }}, {{ pedido.direccionEntrega.provincia }}</p>
              <p>{{ pedido.direccionEntrega.pais }}</p>
              <p v-if="pedido.direccionEntrega.referencia" class="text-muted mt-2">
                Ref: {{ pedido.direccionEntrega.referencia }}
              </p>
            </div>
          </div>
        </div>

        <!-- Resumen de pago -->
        <div class="border-2 border-line bg-surface p-4">
          <h2 class="font-display text-lg uppercase text-fg mb-4">Resumen</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted">Método de pago preferido</span>
              <span class="font-bold uppercase">{{ pedido.metodoPagoPreferido }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Subtotal</span>
              <span>{{ formatearPrecio(pedido.subtotal) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">Envío</span>
              <span>{{ formatearPrecio(pedido.envio) }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-2 mt-2">
              <span class="font-bold">Total</span>
              <span class="font-display text-xl">{{ formatearPrecio(pedido.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Productos -->
      <div class="border-2 border-line bg-surface p-4">
        <h2 class="font-display text-lg uppercase text-fg mb-4 flex items-center gap-2">
          <Package class="h-5 w-5" />
          Productos ({{ pedido.items.length }})
        </h2>
        <div class="space-y-3">
          <div v-for="item in pedido.items" :key="item.productoId + item.varianteId" class="flex gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
            <div class="h-16 w-16 flex-shrink-0 overflow-hidden border-2 border-line bg-bg">
              <img :src="item.imagen" :alt="item.nombreProducto" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1">
              <div class="font-display text-sm uppercase">{{ item.nombreProducto }}</div>
              <div class="text-xs text-muted">
                {{ item.atributos.map(a => a.valor).join(' / ') }}
              </div>
              <div class="text-xs text-muted mt-1">Cantidad: {{ item.cantidad }}</div>
            </div>
            <div class="text-right">
              <div class="font-display">{{ formatearPrecio(item.precioUnitario * item.cantidad) }}</div>
              <div v-if="item.cantidad > 1" class="text-xs text-muted">
                {{ formatearPrecio(item.precioUnitario) }} c/u
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat con el cliente -->
      <div class="border-2 border-line bg-surface p-4">
        <h2 class="font-display text-lg uppercase text-fg mb-4 flex items-center gap-2">
          <MessageSquare class="h-5 w-5" />
          Conversación con el Cliente
        </h2>

        <div v-if="!conversacion || conversacion.mensajes.length === 0" class="border-2 border-dashed border-line p-6 text-center text-muted">
          No hay mensajes en este pedido
        </div>

        <div v-else class="space-y-3 max-h-64 overflow-y-auto mb-4">
          <div
            v-for="m in conversacion.mensajes"
            :key="m.id"
            class="flex"
            :class="m.autor === 'admin' ? 'justify-end' : 'justify-start'"
          >
            <div :class="m.autor === 'admin' ? 'bg-fg text-bg' : 'border-2 border-line bg-bg'" class="max-w-[70%] p-3">
              <div class="text-xs font-bold uppercase tracking-wide opacity-70">
                {{ m.autorNombre }} · {{ formatearFecha(m.fecha) }}
              </div>
              <div class="mt-1 text-sm">{{ m.texto }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <input
            v-model="nuevoMensaje"
            class="flex-1 border-2 border-line bg-bg px-3 py-2 text-sm"
            placeholder="Escribe una respuesta..."
            @keyup.enter="enviarMensaje"
          />
          <button @click="enviarMensaje" class="bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast">
            Enviar
          </button>
        </div>
      </div>

      <!-- Historial de estados -->
      <div class="border-2 border-line bg-surface p-4">
        <h2 class="font-display text-lg uppercase text-fg mb-4">Historial de Estados</h2>
        <div class="space-y-2">
          <div v-for="h in pedido.historialEstados" :key="h.fecha" class="flex items-start gap-3 text-sm">
            <div :class="ESTADOS_PEDIDO[h.estado].punto" class="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" />
            <div>
              <span class="font-bold">{{ ESTADOS_PEDIDO[h.estado].etiqueta }}</span>
              <span class="text-muted"> — {{ formatearFecha(h.fecha) }}</span>
              <p v-if="h.nota" class="text-muted text-xs mt-1">{{ h.nota }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="border-2 border-dashed border-line p-8 text-center text-muted">
      Pedido no encontrado
    </div>
  </div>
</template>
