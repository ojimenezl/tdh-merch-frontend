<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Check, Package, ArrowRight } from '@lucide/vue'
import { ordersService } from '@/services'
import { formatearPrecio, formatearFecha } from '@/lib/format'
import { ESTADOS_PEDIDO, FLUJO_PEDIDO } from '@/lib/orderStatus'
import type { Pedido } from '@/types'

const route = useRoute()
const pedido = ref<Pedido | null>(null)
const cargando = ref(true)

onMounted(async () => {
  try {
    pedido.value = await ordersService.obtener(route.params.id as string)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-14 sm:px-6">

    <!-- Carga -->
    <div v-if="cargando" class="space-y-4">
      <div class="h-16 w-2/3 animate-pulse bg-surface" />
      <div class="h-48 animate-pulse bg-surface" />
    </div>

    <!-- Pedido no encontrado -->
    <div v-else-if="!pedido" class="border-2 border-line bg-surface py-20 text-center">
      <p class="font-display text-2xl uppercase text-fg">Pedido no encontrado</p>
      <RouterLink
        :to="{ name: 'home' }"
        class="mt-5 inline-block bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast"
      >
        Ir al inicio
      </RouterLink>
    </div>

    <!-- Confirmación -->
    <div v-else class="space-y-8">

      <!-- Encabezado de éxito -->
      <div class="border-2 border-fg bg-surface p-8 shadow-[8px_8px_0_0_var(--accent)]">
        <div class="flex items-center gap-4">
          <span class="flex h-14 w-14 shrink-0 items-center justify-center bg-accent text-accent-contrast">
            <Check class="h-8 w-8" />
          </span>
          <div>
            <h1 class="font-display text-3xl uppercase text-fg sm:text-4xl">¡Pedido recibido!</h1>
            <p class="text-sm text-muted">Te confirmamos que tu pedido está en proceso.</p>
          </div>
        </div>

        <div class="mt-6 grid gap-3 border-t-2 border-line pt-6 sm:grid-cols-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-muted">Código</p>
            <p class="font-display text-xl text-fg">{{ pedido.codigo }}</p>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-muted">Fecha</p>
            <p class="font-bold text-fg">{{ formatearFecha(pedido.creadoEn) }}</p>
          </div>
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-muted">Pago</p>
            <p class="font-bold uppercase text-fg">{{ pedido.metodoPagoPreferido }}</p>
            <p class="text-xs text-muted">Al recibir</p>
          </div>
        </div>
      </div>

      <!-- Línea de tiempo del estado -->
      <div class="border-2 border-line bg-surface p-5">
        <p class="mb-5 font-display text-sm uppercase tracking-wide text-muted">Estado del pedido</p>
        <div class="flex items-start gap-0">
          <template v-for="(est, i) in FLUJO_PEDIDO" :key="est">
            <div class="flex flex-col items-center">
              <div
                class="flex h-8 w-8 shrink-0 items-center justify-center border-2 text-xs font-bold"
                :class="
                  pedido.estado === est
                    ? 'border-accent bg-accent text-accent-contrast'
                    : FLUJO_PEDIDO.indexOf(pedido.estado) > i
                      ? 'border-fg bg-fg text-bg'
                      : 'border-line bg-surface text-muted'
                "
              >
                <Check
                  v-if="FLUJO_PEDIDO.indexOf(pedido.estado) > i"
                  class="h-3.5 w-3.5"
                />
                <span v-else class="text-[10px]">{{ i + 1 }}</span>
              </div>
              <p
                class="mt-1.5 w-16 text-center text-[9px] font-bold uppercase leading-tight"
                :class="
                  pedido.estado === est || FLUJO_PEDIDO.indexOf(pedido.estado) > i
                    ? 'text-fg'
                    : 'text-muted'
                "
              >
                {{ ESTADOS_PEDIDO[est].etiqueta }}
              </p>
            </div>
            <div
              v-if="i < FLUJO_PEDIDO.length - 1"
              class="mt-4 flex-1 border-t-2"
              :class="FLUJO_PEDIDO.indexOf(pedido.estado) > i ? 'border-fg' : 'border-line'"
            />
          </template>
        </div>
      </div>

      <!-- Dirección de entrega -->
      <div class="border-2 border-line bg-surface p-5">
        <p class="mb-3 font-display text-sm uppercase tracking-wide text-muted">Entrega en</p>
        <p class="font-bold text-fg">
          {{ pedido.direccionEntrega.nombreReceptor }} · {{ pedido.direccionEntrega.telefono }}
        </p>
        <p class="text-sm text-muted">{{ pedido.direccionEntrega.calle }}</p>
        <p class="text-sm text-muted">
          {{ pedido.direccionEntrega.ciudad }}, {{ pedido.direccionEntrega.provincia }}
        </p>
        <p v-if="pedido.direccionEntrega.referencia" class="text-sm text-muted">
          Ref: {{ pedido.direccionEntrega.referencia }}
        </p>
      </div>

      <!-- Items -->
      <div class="border-2 border-line bg-surface">
        <p class="border-b-2 border-line px-5 py-3 font-display text-sm uppercase tracking-wide text-muted">
          Productos
        </p>
        <div class="divide-y-2 divide-line">
          <div
            v-for="item in pedido.items"
            :key="`${item.productoId}-${item.varianteId ?? 'base'}`"
            class="flex items-center gap-4 px-5 py-4"
          >
            <div class="h-14 w-14 shrink-0 overflow-hidden border-2 border-line bg-bg">
              <img
                v-if="item.imagen"
                :src="item.imagen"
                :alt="item.nombreProducto"
                class="h-full w-full object-cover"
              />
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
        <!-- Total -->
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

      <!-- Acciones -->
      <div class="flex flex-wrap gap-4">
        <RouterLink
          :to="{ name: 'catalogo' }"
          class="flex items-center gap-2 border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-fg transition hover:border-fg"
        >
          Seguir comprando
        </RouterLink>
        <RouterLink
          :to="{ name: 'mis-pedidos' }"
          class="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
        >
          <Package class="h-4 w-4" />
          Ver mis pedidos <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

    </div>
  </div>
</template>
