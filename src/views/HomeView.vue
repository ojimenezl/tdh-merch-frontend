<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Sparkles, ShieldCheck, Truck } from '@lucide/vue'
import { catalogService } from '@/services'
import type { Producto } from '@/types'
import ProductCard from '@/components/catalog/ProductCard.vue'
import BrandMarquee from '@/components/layout/BrandMarquee.vue'

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
  <!-- HERO -->
  <section class="relative overflow-hidden bg-bg">
    <!-- Marca de agua gigante de fondo -->
    <span
      class="pointer-events-none absolute -right-8 top-1/2 hidden -translate-y-1/2 select-none font-display text-[16rem] uppercase leading-none text-fg/[0.04] lg:block"
    >
      TDH
    </span>

    <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
      <!-- Texto -->
      <div>
        <div class="flex items-center gap-3">
          <span class="h-2 w-2 bg-accent"></span>
          <span class="text-xs font-bold uppercase tracking-[0.25em] text-muted">
            Drop 01 — 2026
          </span>
        </div>

        <h1 class="mt-6 font-display text-6xl uppercase leading-[0.9] text-fg sm:text-7xl xl:text-8xl">
          No compras.<br />
          <span class="bg-accent px-2 text-accent-contrast">Perteneces.</span>
        </h1>

        <p class="mt-6 max-w-md text-base text-muted">
          Ropa y merch para los que visten la actitud. Únete al club.
        </p>

        <div class="mt-9 flex flex-wrap gap-3">
          <RouterLink
            :to="{ name: 'catalogo' }"
            class="group flex items-center gap-2 bg-accent px-7 py-4 font-bold uppercase tracking-wide text-accent-contrast transition hover:gap-4"
          >
            Ver el drop
            <ArrowRight class="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </RouterLink>
          <RouterLink
            :to="{ name: 'catalogo' }"
            class="border-2 border-fg px-7 py-4 font-bold uppercase tracking-wide text-fg transition hover:bg-fg hover:text-bg"
          >
            Catálogo
          </RouterLink>
        </div>
      </div>

      <!-- Tarjeta de miembro (membership card) -->
      <div class="flex justify-center lg:justify-end">
        <div
          class="w-full max-w-sm rotate-2 border-2 border-fg bg-surface p-6 shadow-[8px_8px_0_0_var(--accent)] transition hover:rotate-0"
        >
          <div class="flex items-start justify-between">
            <span class="font-display text-xl uppercase text-fg">TDH<br />Members Club</span>
            <span class="flex h-10 w-10 items-center justify-center bg-accent font-display text-accent-contrast">T</span>
          </div>

          <div class="mt-10 space-y-1">
            <p class="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">Member</p>
            <p class="font-display text-3xl uppercase tracking-wide text-fg">N° 001</p>
          </div>

          <!-- "Código de barras" decorativo -->
          <div class="mt-6 flex h-10 items-end gap-[3px]">
            <span
              v-for="n in 42"
              :key="n"
              class="w-[3px] bg-fg"
              :style="{ height: `${30 + ((n * 37) % 70)}%` }"
            ></span>
          </div>

          <div class="mt-4 flex items-center justify-between border-t-2 border-line pt-3">
            <span class="text-xs font-bold uppercase tracking-wide text-muted">EST. 2026</span>
            <span class="text-xs font-bold uppercase tracking-wide text-accent">Activo</span>
          </div>
        </div>
      </div>
    </div>
  </section>

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
