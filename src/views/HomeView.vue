<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Sparkles, ShieldCheck, Truck } from '@lucide/vue'
import { catalogService } from '@/services'
import type { Producto } from '@/types'
import ProductCard from '@/components/catalog/ProductCard.vue'
import BrandMarquee from '@/components/layout/BrandMarquee.vue'
import HomeHeroCarousel from '@/components/home/HomeHeroCarousel.vue'

const features = [
  { icon: Truck, title: 'Pago contra entrega', desc: 'Pagas al recibir. Efectivo o transferencia.' },
  { icon: ShieldCheck, title: 'Seguimiento real', desc: 'Sigue tu pedido dentro de la app, sin correos.' },
  { icon: Sparkles, title: 'Drops constantes', desc: 'Ropa hoy. Tazas, libros y más mañana.' },
]

const destacados = ref<Producto[]>([])
const cargando = ref(true)

onMounted(async () => {
  try {
    destacados.value = await catalogService.productosDestacados(4)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <!-- Carrusel hero a altura de pantalla -->
  <HomeHeroCarousel />

  <!-- FEATURES -->
  <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
    <div class="grid gap-px border-2 border-fg bg-fg sm:grid-cols-3">
      <div v-for="f in features" :key="f.title" class="bg-surface p-7">
        <component :is="f.icon" class="h-7 w-7 text-accent" />
        <h3 class="mt-4 font-display text-lg uppercase text-fg">{{ f.title }}</h3>
        <p class="mt-1 text-sm text-muted">{{ f.desc }}</p>
      </div>
    </div>
  </section>

  <!-- DESTACADOS -->
  <section class="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
    <div class="mb-8 flex items-end justify-between border-b-2 border-fg pb-3">
      <h2 class="font-display text-4xl uppercase text-fg sm:text-5xl">Lo más buscado</h2>
      <RouterLink
        :to="{ name: 'catalogo' }"
        class="text-sm font-bold uppercase tracking-wide text-fg transition hover:text-accent"
      >
        Ver todo →
      </RouterLink>
    </div>

    <div v-if="cargando" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="n in 4" :key="n" class="h-80 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <ProductCard v-for="p in destacados" :key="p.id" :producto="p" />
    </div>
  </section>

  <!-- MARQUEE inferior -->
  <div class="mt-8">
    <BrandMarquee variant="fg" :items="['ÚNETE AL CLUB', 'TDH MERCH', 'WEAR THE ATTITUDE', 'DROP 01']" />
  </div>
</template>
