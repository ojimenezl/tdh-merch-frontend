<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { ArrowLeft, Check, Send } from '@lucide/vue'
import { ordersService, messagesService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha, formatearPrecio } from '@/lib/format'
import { ESTADOS_PEDIDO, FLUJO_PEDIDO } from '@/lib/orderStatus'
import type { Conversacion, Pedido } from '@/types'

const route = useRoute()
const auth = useAuthStore()

const pedido = ref<Pedido | null>(null)
const conv = ref<Conversacion | null>(null)
const cargando = ref(true)
const textoMensaje = ref('')
const enviandoMsg = ref(false)
const chatEl = ref<HTMLElement | null>(null)

// Posición del estado actual en el flujo feliz (para la línea de tiempo).
const posEstado = computed(() =>
  pedido.value ? FLUJO_PEDIDO.indexOf(pedido.value.estado) : -1,
)

async function cargar() {
  cargando.value = true
  try {
    const [p, c] = await Promise.all([
      ordersService.obtener(route.params.id as string),
      messagesService.obtenerPorPedido(route.params.id as string),
    ])
    pedido.value = p
    conv.value = c
  } finally {
    cargando.value = false
  }
}

async function enviarMensaje() {
  if (!textoMensaje.value.trim() || !auth.usuario || !pedido.value) return
  enviandoMsg.value = true
  try {
    const msg = await messagesService.enviarMensaje(
      pedido.value.id,
      'cliente',
      auth.usuario.nombre,
      textoMensaje.value.trim(),
    )
    if (!conv.value) {
      conv.value = {
        pedidoId: pedido.value.id,
        codigoPedido: pedido.value.codigo,
        clienteId: auth.usuario.id,
        clienteNombre: auth.usuario.nombre,
        mensajes: [],
        actualizadoEn: msg.fecha,
      }
    }
    conv.value.mensajes.push(msg)
    textoMensaje.value = ''
    await nextTick()
    chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: 'smooth' })
  } finally {
    enviandoMsg.value = false
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <!-- Volver -->
    <RouterLink
      :to="{ name: 'mis-pedidos' }"
      class="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted transition hover:text-accent"
    >
      <ArrowLeft class="h-4 w-4" /> Mis pedidos
    </RouterLink>

    <!-- Carga -->
    <div v-if="cargando" class="space-y-4">
      <div class="h-10 w-1/3 animate-pulse bg-surface" />
      <div class="h-32 animate-pulse bg-surface" />
      <div class="h-48 animate-pulse bg-surface" />
    </div>

    <!-- No encontrado -->
    <div v-else-if="!pedido" class="border-2 border-dashed border-line bg-surface py-14 text-center">
      <p class="font-display text-xl uppercase text-fg">Pedido no encontrado</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Header del pedido -->
      <div class="flex flex-wrap items-start justify-between gap-4 border-b-2 border-fg pb-5">
        <div>
          <h2 class="font-display text-3xl uppercase text-fg">{{ pedido.codigo }}</h2>
          <p class="mt-1 text-xs text-muted">{{ formatearFecha(pedido.creadoEn) }}</p>
        </div>
        <span
          class="px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
          :class="ESTADOS_PEDIDO[pedido.estado].badge"
        >
          {{ ESTADOS_PEDIDO[pedido.estado].etiqueta }}
        </span>
      </div>

      <!-- Línea de tiempo del flujo feliz -->
      <div class="border-2 border-line bg-surface p-5">
        <p class="mb-5 text-xs font-bold uppercase tracking-wide text-muted">Seguimiento</p>
        <div class="flex items-start">
          <template v-for="(est, i) in FLUJO_PEDIDO" :key="est">
            <div class="flex flex-col items-center">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center border-2 text-xs font-bold"
                :class="
                  pedido.estado === est
                    ? 'border-accent bg-accent text-accent-contrast'
                    : posEstado > i
                      ? 'border-fg bg-fg text-bg'
                      : 'border-line bg-bg text-muted'
                "
              >
                <Check v-if="posEstado > i" class="h-3.5 w-3.5" />
                <span v-else class="text-[10px]">{{ i + 1 }}</span>
              </div>
              <p
                class="mt-2 w-16 text-center text-[9px] font-bold uppercase leading-tight"
                :class="pedido.estado === est || posEstado > i ? 'text-fg' : 'text-muted'"
              >
                {{ ESTADOS_PEDIDO[est].etiqueta }}
              </p>
            </div>
            <div
              v-if="i < FLUJO_PEDIDO.length - 1"
              class="mt-4 flex-1 border-t-2"
              :class="posEstado > i ? 'border-fg' : 'border-line'"
            />
          </template>
        </div>

        <!-- Historial de estados -->
        <div class="mt-6 border-t-2 border-line pt-4 space-y-2">
          <p class="text-xs font-bold uppercase tracking-wide text-muted">Historial</p>
          <div
            v-for="cambio in [...pedido.historialEstados].reverse()"
            :key="cambio.fecha"
            class="flex items-start gap-3 text-sm"
          >
            <span
              class="mt-0.5 h-2 w-2 shrink-0 rounded-full"
              :class="ESTADOS_PEDIDO[cambio.estado].punto"
            />
            <div>
              <span class="font-bold text-fg">{{ ESTADOS_PEDIDO[cambio.estado].etiqueta }}</span>
              <span class="ml-2 text-xs text-muted">{{ formatearFecha(cambio.fecha) }}</span>
              <p v-if="cambio.nota" class="text-xs text-muted">{{ cambio.nota }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dirección -->
      <div class="border-2 border-line bg-surface p-5">
        <p class="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Entrega en</p>
        <p class="font-bold text-fg">
          {{ pedido.direccionEntrega.nombreReceptor }} · {{ pedido.direccionEntrega.telefono }}
        </p>
        <p class="text-sm text-muted">{{ pedido.direccionEntrega.calle }}</p>
        <p class="text-sm text-muted">
          {{ pedido.direccionEntrega.ciudad }}, {{ pedido.direccionEntrega.provincia }}
        </p>
      </div>

      <!-- Productos -->
      <div class="border-2 border-line bg-surface">
        <p class="border-b-2 border-line px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
          Productos
        </p>
        <div class="divide-y-2 divide-line">
          <div
            v-for="item in pedido.items"
            :key="`${item.productoId}-${item.varianteId}`"
            class="flex items-center gap-4 px-5 py-4"
          >
            <div class="h-14 w-14 shrink-0 overflow-hidden border-2 border-line bg-bg">
              <img v-if="item.imagen" :src="item.imagen" :alt="item.nombreProducto" class="h-full w-full object-cover" />
            </div>
            <div class="flex-1">
              <p class="font-display text-sm uppercase text-fg">{{ item.nombreProducto }}</p>
              <p v-if="item.atributos.length" class="text-xs uppercase tracking-wide text-muted">
                {{ item.atributos.map((a) => a.valor).join(' · ') }}
              </p>
              <p class="text-xs text-muted">Cant: {{ item.cantidad }}</p>
            </div>
            <p class="font-display text-base text-fg">
              {{ formatearPrecio(item.precioUnitario * item.cantidad) }}
            </p>
          </div>
        </div>
        <!-- Totales -->
        <div class="space-y-1 border-t-2 border-line px-5 py-4 text-sm">
          <div class="flex justify-between text-muted">
            <span class="uppercase tracking-wide">Subtotal</span>
            <span>{{ formatearPrecio(pedido.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-muted">
            <span class="uppercase tracking-wide">Envío</span>
            <span>{{ formatearPrecio(pedido.envio) }}</span>
          </div>
          <div class="flex justify-between border-t-2 border-line pt-2 font-display text-xl text-fg">
            <span>Total</span>
            <span>{{ formatearPrecio(pedido.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Chat con el admin -->
      <div class="border-2 border-line bg-surface">
        <p class="border-b-2 border-line px-5 py-3 font-display text-sm uppercase tracking-wide text-fg">
          Mensajes
        </p>

        <!-- Lista de mensajes -->
        <div
          ref="chatEl"
          class="max-h-72 space-y-3 overflow-y-auto px-5 py-4"
        >
          <div
            v-if="!conv || conv.mensajes.length === 0"
            class="py-6 text-center text-sm text-muted"
          >
            Sin mensajes aún. Puedes preguntar cualquier cosa sobre tu pedido.
          </div>
          <div
            v-for="msg in conv?.mensajes ?? []"
            :key="msg.id"
            class="flex"
            :class="msg.autor === 'cliente' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-xs px-4 py-2.5 text-sm"
              :class="
                msg.autor === 'cliente'
                  ? 'bg-fg text-bg'
                  : 'border-2 border-line bg-surface text-fg'
              "
            >
              <p class="text-[10px] font-bold uppercase tracking-wide opacity-60 mb-1">
                {{ msg.autorNombre }} · {{ formatearFecha(msg.fecha) }}
              </p>
              <p>{{ msg.texto }}</p>
            </div>
          </div>
        </div>

        <!-- Input -->
        <form
          class="flex gap-2 border-t-2 border-line px-5 py-4"
          @submit.prevent="enviarMensaje"
        >
          <input
            v-model="textoMensaje"
            type="text"
            placeholder="Escribe tu pregunta..."
            class="flex-1 border-2 border-line bg-bg px-3 py-2 text-sm text-fg outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            :disabled="!textoMensaje.trim() || enviandoMsg"
            class="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:opacity-40"
          >
            <Send class="h-4 w-4" />
            <span class="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
