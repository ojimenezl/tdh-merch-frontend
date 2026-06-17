<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Producto } from '@/types'
import { formatearPrecio } from '@/lib/format'
import { hayStock } from '@/lib/product'

const props = defineProps<{ producto: Producto }>()

const disponible = computed(() => hayStock(props.producto))
</script>

<template>
  <RouterLink
    :to="{ name: 'producto', params: { slug: producto.slug } }"
    class="group flex flex-col border-2 border-line bg-surface transition hover:border-fg"
  >
    <div class="relative aspect-square overflow-hidden bg-bg">
      <img
        :src="producto.imagenes[0]?.url"
        :alt="producto.imagenes[0]?.alt"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        :class="{ 'opacity-40 grayscale': !disponible }"
        loading="lazy"
      />
      <span
        v-if="!disponible"
        class="absolute left-0 top-3 bg-fg px-3 py-1 text-xs font-bold uppercase tracking-wide text-bg"
      >
        Agotado
      </span>
      <span
        v-else-if="producto.destacado"
        class="absolute left-0 top-3 bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-contrast"
      >
        Hot
      </span>
    </div>

    <div class="flex flex-1 flex-col border-t-2 border-line p-4">
      <h3 class="font-display text-base uppercase leading-tight text-fg">{{ producto.nombre }}</h3>
      <p class="mt-1 line-clamp-2 flex-1 text-xs text-muted">{{ producto.descripcion }}</p>
      <div class="mt-4 flex items-center justify-between">
        <span class="font-display text-lg text-fg">{{ formatearPrecio(producto.precioBase) }}</span>
        <span
          class="bg-fg px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-bg transition group-hover:bg-accent group-hover:text-accent-contrast"
        >
          Ver
        </span>
      </div>
    </div>
  </RouterLink>
</template>
