<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  Bell,
  Users,
  Layers,
  LogOut,
  Store,
  FileSearch,
} from '@lucide/vue'
import { computed } from 'vue'

const auth = useAuthStore()
const route = useRoute()

const navItems = computed(() => {
  const items = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/productos', icon: Package, label: 'Productos' },
    { to: '/admin/pedidos', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/admin/mensajes', icon: MessageSquare, label: 'Mensajes' },
    { to: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
  ]

  if (auth.esSuperadmin) {
    items.push(
      { to: '/admin/usuarios', icon: Users, label: 'Usuarios' },
      { to: '/admin/categorias', icon: Layers, label: 'Categorías' },
      { to: '/admin/auditoria', icon: FileSearch, label: 'Auditoría' }
    )
  }

  return items
})

function isActive(to: string, exact?: boolean) {
  if (exact) return route.path === to
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header class="border-b-2 border-line bg-surface">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-4">
          <RouterLink to="/" class="font-display text-lg uppercase text-fg flex items-center gap-2">
            <Store class="h-5 w-5" />
            TDH merch
          </RouterLink>
          <span class="text-xs font-bold uppercase text-accent px-2 py-1 bg-accent/10">
            {{ auth.esSuperadmin ? 'Superadmin' : 'Admin' }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-muted">{{ auth.usuario?.nombre }}</span>
          <RouterLink to="/" class="text-xs font-bold uppercase text-muted hover:text-fg transition-colors">
            Ver tienda
          </RouterLink>
          <button class="flex items-center gap-1 text-sm text-danger hover:underline" @click="auth.logout()">
            <LogOut class="h-4 w-4" />
            Salir
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav class="space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'flex items-center gap-3 rounded px-4 py-3 text-sm font-bold uppercase transition-colors',
              isActive(item.to, item.exact)
                ? 'bg-accent text-accent-contrast'
                : 'border-2 border-line text-fg hover:bg-surface'
            ]"
          >
            <component :is="item.icon" class="h-4 w-4" />
            {{ item.label }}
          </RouterLink>
        </nav>
        <section>
          <RouterView />
        </section>
      </div>
    </main>
  </div>
</template>
