<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Bell, Mail, Package, User } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const auth = useAuthStore()
const notif = useNotificationsStore()
const route = useRoute()

onMounted(() => {
  if (auth.usuario) notif.cargar(auth.usuario.id)
})

const nav = [
  { name: 'mis-pedidos', label: 'Mis pedidos', icon: Package },
  { name: 'mis-notificaciones', label: 'Notificaciones', icon: Bell, badge: true },
  { name: 'mi-perfil', label: 'Mi perfil', icon: User },
  { name: 'contacto', label: 'Contacto', icon: Mail },
]
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div class="mb-8 border-b-2 border-fg pb-5">
      <h1 class="font-display text-4xl uppercase text-fg sm:text-5xl">Mi cuenta</h1>
      <p class="mt-1 text-sm text-muted">
        Bienvenido, <span class="font-bold text-fg">{{ auth.usuario?.nombre }}</span>
      </p>
    </div>

    <div class="grid gap-8 lg:grid-cols-[220px_1fr]">
      <!-- Nav lateral -->
      <nav class="flex flex-row gap-1 lg:flex-col">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition"
          :class="
            route.name === item.name
              ? 'border-fg bg-fg text-bg'
              : 'border-line bg-surface text-muted hover:border-fg hover:text-fg'
          "
        >
          <component :is="item.icon" class="h-4 w-4 shrink-0" />
          <span class="hidden sm:inline">{{ item.label }}</span>
          <span
            v-if="item.badge && notif.noLeidas > 0"
            class="ml-auto flex h-5 min-w-5 items-center justify-center bg-accent px-1 text-[10px] font-bold text-accent-contrast"
          >
            {{ notif.noLeidas }}
          </span>
        </RouterLink>
      </nav>

      <!-- Contenido de cada sub-vista -->
      <section>
        <RouterView />
      </section>
    </div>
  </div>
</template>
