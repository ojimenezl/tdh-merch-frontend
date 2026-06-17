<script setup lang="ts">
import { RouterLink } from 'vue-router'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-auto border-t-2 border-fg bg-surface">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center bg-accent font-display text-accent-contrast">T</span>
            <span class="font-display text-xl uppercase text-fg">TDH merch</span>
          </div>
          <p class="mt-4 max-w-xs text-sm text-muted">
            No solo ropa. Una forma de pertenecer.
          </p>
        </div>

        <div>
          <h3 class="font-display text-sm uppercase tracking-wide text-fg">Tienda</h3>
          <ul class="mt-4 space-y-2 text-sm text-muted">
            <li><RouterLink :to="{ name: 'catalogo' }" class="hover:text-accent">Catálogo</RouterLink></li>
            <li><RouterLink :to="{ name: 'catalogo', query: { orden: 'recientes' } }" class="hover:text-accent">Novedades</RouterLink></li>
            <li><RouterLink :to="{ name: 'catalogo' }" class="hover:text-accent">El drop</RouterLink></li>
          </ul>
        </div>

        <div>
          <h3 class="font-display text-sm uppercase tracking-wide text-fg">Ayuda</h3>
          <ul class="mt-4 space-y-2 text-sm text-muted">
            <li><RouterLink :to="{ name: 'contacto' }" class="hover:text-accent">Contacto</RouterLink></li>
            <li><RouterLink :to="{ name: 'mis-pedidos' }" class="hover:text-accent">Estado de mi pedido</RouterLink></li>
            <li><a href="#" class="hover:text-accent">Preguntas frecuentes</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-display text-sm uppercase tracking-wide text-fg">Pago</h3>
          <p class="mt-4 text-sm text-muted">
            Contra entrega: efectivo o transferencia al recibir tu pedido.
          </p>
        </div>
      </div>

      <div
        class="mt-10 flex flex-col items-center justify-between gap-2 border-t-2 border-line pt-6 text-xs font-bold uppercase tracking-wide text-muted sm:flex-row"
      >
        <span>© {{ year }} TDH merch</span>
        <span>Members only · Est. 2026</span>
      </div>
    </div>
  </footer>
</template>
