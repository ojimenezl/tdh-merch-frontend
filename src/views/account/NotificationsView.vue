<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Bell, CheckCheck } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { formatearFecha } from '@/lib/format'

const auth = useAuthStore()
const notif = useNotificationsStore()

onMounted(async () => {
  if (auth.usuario) await notif.cargar(auth.usuario.id)
})

const iconoTipo: Record<string, string> = {
  pedido: '📦',
  mensaje: '💬',
  sistema: '🔔',
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-display text-2xl uppercase text-fg">Notificaciones</h2>
      <button
        v-if="notif.noLeidas > 0"
        type="button"
        class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted transition hover:text-accent"
        @click="auth.usuario && notif.marcarTodasLeidas(auth.usuario.id)"
      >
        <CheckCheck class="h-4 w-4" /> Marcar todas como leídas
      </button>
    </div>

    <!-- Carga -->
    <div v-if="notif.cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-16 animate-pulse border-2 border-line bg-surface" />
    </div>

    <!-- Vacío -->
    <div
      v-else-if="notif.items.length === 0"
      class="border-2 border-dashed border-line bg-surface py-16 text-center"
    >
      <Bell class="mx-auto h-10 w-10 text-line" />
      <p class="mt-3 font-display text-lg uppercase text-fg">Sin notificaciones</p>
      <p class="mt-1 text-sm text-muted">Aquí verás los cambios de estado de tus pedidos.</p>
    </div>

    <!-- Lista -->
    <div v-else class="space-y-2">
      <component
        :is="n.enlace ? RouterLink : 'div'"
        v-for="n in notif.items"
        :key="n.id"
        :to="n.enlace ?? undefined"
        class="flex cursor-pointer items-start gap-4 border-2 p-4 transition"
        :class="
          !n.leida
            ? 'border-fg bg-surface hover:border-accent'
            : 'border-line bg-surface opacity-60 hover:opacity-100'
        "
        @click="notif.marcarLeida(n.id)"
      >
        <span class="mt-0.5 text-xl leading-none">{{ iconoTipo[n.tipo] ?? '🔔' }}</span>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-fg" :class="!n.leida ? '' : 'font-medium'">{{ n.titulo }}</p>
          <p class="mt-0.5 text-sm text-muted">{{ n.detalle }}</p>
          <p class="mt-1 text-xs text-muted">{{ formatearFecha(n.fecha) }}</p>
        </div>
        <span
          v-if="!n.leida"
          class="mt-1.5 h-2.5 w-2.5 shrink-0 bg-accent"
        />
      </component>
    </div>
  </div>
</template>
