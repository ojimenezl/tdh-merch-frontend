<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Package } from '@lucide/vue'
import { ordersService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha, formatearPrecio } from '@/lib/format'
import { ESTADOS_PEDIDO } from '@/lib/orderStatus'
import type { Pedido } from '@/types'

const auth = useAuthStore()
const pedidos = ref<Pedido[]>([])
const cargando = ref(true)

onMounted(async () => {
  if (auth.usuario) {
    try {
      pedidos.value = await ordersService.listarPorCliente(auth.usuario.id)
    } finally {
      cargando.value = false
    }
  }
})
</script>

<template>
  <div>
    <h2 class="mb-6 font-display text-2xl uppercase text-fg">Mis pedidos</h2>

    <!-- Carga -->
    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-24 animate-pulse border-2 border-line bg-surface" />
    </div>

    <!-- Sin pedidos -->
    <div
      v-else-if="pedidos.length === 0"
      class="border-2 border-dashed border-line bg-surface py-16 text-center"
    >
      <Package class="mx-auto h-10 w-10 text-line" />
      <p class="mt-3 font-display text-lg uppercase text-fg">Aún no tienes pedidos</p>
      <p class="mt-1 text-sm text-muted">Cuando realices una compra aparecerá aquí.</p>
      <RouterLink
        :to="{ name: 'catalogo' }"
        class="mt-5 inline-block bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
      >
        Ver catálogo
      </RouterLink>
    </div>

    <!-- Lista -->
    <div v-else class="space-y-3">
      <RouterLink
        v-for="p in pedidos"
        :key="p.id"
        :to="{ name: 'detalle-pedido', params: { id: p.id } }"
        class="group flex flex-col gap-3 border-2 border-line bg-surface p-5 transition hover:border-fg sm:flex-row sm:items-center"
      >
        <!-- Código + fecha -->
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <span class="font-display text-lg text-fg">{{ p.codigo }}</span>
            <span
              class="px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
              :class="ESTADOS_PEDIDO[p.estado].badge"
            >
              {{ ESTADOS_PEDIDO[p.estado].etiqueta }}
            </span>
          </div>
          <p class="mt-1 text-xs text-muted">{{ formatearFecha(p.creadoEn) }}</p>
          <p class="mt-1 text-xs text-muted">
            {{ p.items.length }} producto(s) · Pago: {{ p.metodoPagoPreferido }}
          </p>
        </div>

        <!-- Total -->
        <div class="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <span class="font-display text-xl text-fg">{{ formatearPrecio(p.total) }}</span>
          <span
            class="text-xs font-bold uppercase tracking-wide text-muted transition group-hover:text-accent"
          >
            Ver detalle →
          </span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
