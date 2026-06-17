<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { LogOut, Moon, Search, ShoppingCart, Sun, User, LayoutDashboard } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationsStore } from '@/stores/notifications'
import BrandMarquee from './BrandMarquee.vue'
import { computed, watch } from 'vue'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()
const theme = useThemeStore()
const notifStore = useNotificationsStore()

const notifCount = computed(() => notifStore.noLeidas)

watch(
  () => auth.usuario,
  (u) => { if (u) notifStore.cargar(u.id) },
  { immediate: true },
)

const busqueda = ref('')
const menuCuenta = ref(false)

function buscar() {
  router.push({ name: 'catalogo', query: busqueda.value ? { q: busqueda.value } : {} })
}

function cerrarSesion() {
  auth.logout()
  menuCuenta.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <BrandMarquee />

  <header class="sticky top-0 z-40 border-b-2 border-line bg-surface">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
      <!-- Logo / marca -->
      <RouterLink to="/" class="flex shrink-0 items-center gap-2">
        <span
          class="flex h-9 w-9 items-center justify-center bg-accent font-display text-xl leading-none text-accent-contrast"
        >
          T
        </span>
        <span class="font-display text-2xl uppercase tracking-tight text-fg">TDH Club</span>
      </RouterLink>

      <!-- Buscador -->
        <form class="relative ml-4 hidden flex-1 md:block" @submit.prevent="buscar" role="search" aria-label="Buscar productos">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          v-model="busqueda"
          type="search"
          placeholder="BUSCAR..."
          aria-label="Buscar productos"
          class="w-full border-2 border-line bg-bg py-2 pl-10 pr-4 text-sm font-medium uppercase tracking-wide text-fg outline-none transition placeholder:text-muted focus:border-accent"
        />
      </form>

      <!-- Acciones -->
      <nav class="ml-auto flex items-center gap-1">
        <!-- Toggle de tema -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center border-2 border-line text-fg transition hover:border-accent hover:text-accent"
          :title="theme.oscuro ? 'Modo claro' : 'Modo oscuro'"
          aria-pressed="false"
          @click="theme.alternar()"
          aria-label="Alternar tema oscuro"
        >
          <Sun v-if="theme.oscuro" class="h-5 w-5" aria-hidden="true" />
          <Moon v-else class="h-5 w-5" aria-hidden="true" />
        </button>

        <!-- Cuenta -->
        <div class="relative">
          <RouterLink
            v-if="!auth.estaAutenticado"
            :to="{ name: 'login' }"
            class="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide text-fg transition hover:text-accent"
          >
            <User class="h-5 w-5" />
            <span class="hidden sm:inline">Ingresar</span>
          </RouterLink>

          <button
            v-else
            type="button"
            class="flex items-center gap-2 px-2 py-2 text-sm font-bold text-fg transition hover:text-accent"
            @click="menuCuenta = !menuCuenta"
          >
            <span
              class="flex h-8 w-8 items-center justify-center bg-accent font-display text-sm text-accent-contrast"
            >
              {{ auth.usuario?.nombre.charAt(0).toUpperCase() }}
            </span>
            <span class="hidden max-w-24 truncate uppercase tracking-wide sm:inline">
              {{ auth.usuario?.nombre }}
            </span>
          </button>

          <div
            v-if="menuCuenta && auth.estaAutenticado"
            class="absolute right-0 mt-2 w-52 border-2 border-line bg-elevated py-1 shadow-xl"
          >
            <div class="border-b border-line px-4 py-3">
              <p class="text-sm font-bold uppercase text-fg">{{ auth.usuario?.nombre }}</p>
              <p class="text-xs uppercase tracking-wide text-accent">{{ auth.rol }}</p>
            </div>
            <RouterLink
              v-if="auth.esAdmin || auth.esSuperadmin"
              :to="{ name: 'admin-dashboard' }"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-accent transition hover:bg-bg"
              @click="menuCuenta = false"
            >
              <LayoutDashboard class="h-4 w-4" /> Panel Admin
            </RouterLink>
            <RouterLink
              :to="{ name: 'mis-pedidos' }"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-fg transition hover:bg-bg"
              @click="menuCuenta = false"
            >
              <User class="h-4 w-4" /> Mi cuenta
            </RouterLink>
            <RouterLink
              :to="{ name: 'mis-notificaciones' }"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-fg transition hover:bg-bg"
              @click="menuCuenta = false"
            >
              <span>🔔</span> Notificaciones
              <span
                v-if="notifCount > 0"
                class="ml-auto flex h-5 min-w-5 items-center justify-center bg-accent px-1 text-[10px] font-bold text-accent-contrast"
              >
                {{ notifCount }}
              </span>
            </RouterLink>
            <button
              type="button"
              class="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-danger transition hover:bg-bg"
              @click="cerrarSesion"
            >
              <LogOut class="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        </div>

        <!-- Carrito -->
        <button
          type="button"
          class="flex items-center gap-2 px-3 py-2 text-sm font-bold uppercase tracking-wide text-fg transition hover:text-accent"
          @click="cart.abrir()"
          aria-label="Abrir carrito"
        >
          <span class="relative">
            <ShoppingCart class="h-5 w-5" />
            <span
              v-if="cart.cantidadTotal > 0"
              class="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[10px] font-bold text-accent-contrast"
            >
              {{ cart.cantidadTotal }}
            </span>
          </span>
          <span class="hidden sm:inline">Carrito</span>
        </button>
      </nav>
    </div>
  </header>
</template>
