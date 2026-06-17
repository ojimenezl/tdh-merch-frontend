<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { Minus, Plus, ShoppingBag, Trash2, X } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatearPrecio } from '@/lib/format'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const atributosTexto = (item: { atributos: { valor: string | number | boolean }[] }) =>
  item.atributos.map((a) => a.valor).join(' · ')

const envio = 3.0
const total = computed(() => cart.subtotal + (cart.vacio ? 0 : envio))

function finalizarCompra() {
  cart.cerrar()
  if (!auth.estaAutenticado) {
    // Acceso obligatorio: si no hay sesión, va a login y luego vuelve al checkout.
    router.push({ name: 'login', query: { redirect: '/checkout' } })
  } else {
    router.push('/checkout')
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="cart.abierto" class="fixed inset-0 z-50 bg-fg/50" @click="cart.cerrar()" />
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <aside
        v-if="cart.abierto"
        class="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-line bg-surface shadow-2xl"
      >
        <header class="flex items-center justify-between border-b-2 border-line px-5 py-4">
          <h2 class="flex items-center gap-2 font-display text-xl uppercase text-fg">
            <ShoppingBag class="h-5 w-5" /> Tu carrito
          </h2>
          <button
            type="button"
            class="p-2 text-muted transition hover:bg-bg hover:text-fg"
            @click="cart.cerrar()"
          >
            <X class="h-5 w-5" />
          </button>
        </header>

        <!-- Vacío -->
        <div v-if="cart.vacio" class="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <ShoppingBag class="h-12 w-12 text-line" />
          <p class="font-display text-lg uppercase text-fg">Carrito vacío</p>
          <p class="text-sm text-muted">Añade productos desde el catálogo.</p>
          <RouterLink
            :to="{ name: 'catalogo' }"
            class="mt-2 bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-accent-contrast"
            @click="cart.cerrar()"
          >
            Ver catálogo
          </RouterLink>
        </div>

        <!-- Lista de items -->
        <div v-else class="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div
            v-for="item in cart.items"
            :key="`${item.productoId}-${item.varianteId ?? 'base'}`"
            class="flex gap-3 border-b border-line pb-4"
          >
            <RouterLink
              :to="{ name: 'producto', params: { slug: item.slug } }"
              class="h-20 w-20 shrink-0 overflow-hidden border-2 border-line bg-bg"
              @click="cart.cerrar()"
            >
              <img v-if="item.imagen" :src="item.imagen" :alt="item.nombreProducto" class="h-full w-full object-cover" />
            </RouterLink>

            <div class="flex flex-1 flex-col">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="font-display text-sm uppercase leading-tight text-fg">{{ item.nombreProducto }}</h3>
                  <p v-if="item.atributos.length" class="text-xs uppercase tracking-wide text-muted">
                    {{ atributosTexto(item) }}
                  </p>
                </div>
                <button
                  type="button"
                  class="p-1 text-muted transition hover:text-danger"
                  @click="cart.quitar(item.productoId, item.varianteId)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>

              <div class="mt-auto flex items-center justify-between">
                <div class="flex items-center border-2 border-line">
                  <button
                    type="button"
                    class="px-2 py-1 text-fg transition hover:bg-bg disabled:opacity-30"
                    :disabled="item.cantidad <= 1"
                    @click="cart.cambiarCantidad(item.productoId, item.varianteId, item.cantidad - 1)"
                  >
                    <Minus class="h-3.5 w-3.5" />
                  </button>
                  <span class="w-8 text-center text-sm font-bold">{{ item.cantidad }}</span>
                  <button
                    type="button"
                    class="px-2 py-1 text-fg transition hover:bg-bg disabled:opacity-30"
                    :disabled="item.cantidad >= item.stockMax"
                    @click="cart.cambiarCantidad(item.productoId, item.varianteId, item.cantidad + 1)"
                  >
                    <Plus class="h-3.5 w-3.5" />
                  </button>
                </div>
                <span class="font-display text-base text-fg">
                  {{ formatearPrecio(item.precioUnitario * item.cantidad) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen -->
        <footer v-if="!cart.vacio" class="border-t-2 border-line px-5 py-4">
          <div class="space-y-1 text-sm">
            <div class="flex justify-between uppercase tracking-wide text-muted">
              <span>Subtotal</span><span>{{ formatearPrecio(cart.subtotal) }}</span>
            </div>
            <div class="flex justify-between uppercase tracking-wide text-muted">
              <span>Envío</span><span>{{ formatearPrecio(envio) }}</span>
            </div>
            <div class="flex justify-between pt-1 font-display text-xl text-fg">
              <span>Total</span><span>{{ formatearPrecio(total) }}</span>
            </div>
          </div>
          <button
            type="button"
            class="mt-4 w-full bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
            @click="finalizarCompra"
          >
            Finalizar compra
          </button>
          <p class="mt-2 text-center text-xs font-bold uppercase tracking-wide text-muted">
            Pago contra entrega
          </p>
        </footer>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
