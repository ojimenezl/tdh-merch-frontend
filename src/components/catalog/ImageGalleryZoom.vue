<script setup lang="ts">
import { ref } from 'vue'
import type { ImagenProducto } from '@/types'

const props = defineProps<{ imagenes: ImagenProducto[] }>()

const activa = ref(0)
const zoom = ref(false)
const origen = ref('50% 50%')

function moverZoom(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  origen.value = `${x}% ${y}%`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Imagen principal con zoom al pasar el cursor -->
    <div
      class="relative aspect-square overflow-hidden border-2 border-fg bg-bg"
      :class="zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'"
      @mouseenter="zoom = true"
      @mouseleave="zoom = false"
      @mousemove="moverZoom"
    >
      <img
        v-if="imagenes.length"
        :src="imagenes[activa]?.url"
        :alt="imagenes[activa]?.alt"
        class="h-full w-full object-cover transition-transform duration-200"
        :style="{ transformOrigin: origen, transform: zoom ? 'scale(2)' : 'scale(1)' }"
      />
      <div v-else class="flex h-full items-center justify-center text-sm text-muted">
        Sin imagen
      </div>
    </div>

    <!-- Miniaturas -->
    <div v-if="imagenes.length > 1" class="flex gap-3">
      <button
        v-for="(img, i) in imagenes"
        :key="img.id"
        type="button"
        class="h-20 w-20 overflow-hidden border-2 bg-bg transition"
        :class="i === activa ? 'border-accent' : 'border-line hover:border-fg'"
        @click="activa = i"
      >
        <img :src="img.url" :alt="img.alt" class="h-full w-full object-cover" loading="lazy" />
      </button>
    </div>
  </div>
</template>
