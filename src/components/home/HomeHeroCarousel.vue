<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { HOME_CAROUSEL_INITIAL, HOME_CAROUSEL_SLIDES } from '@/data/homeCarousel'

const slides = HOME_CAROUSEL_SLIDES
const activo = ref(HOME_CAROUSEL_INITIAL >= 0 ? HOME_CAROUSEL_INITIAL : 0)
const pausado = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

const slideActual = computed(() => slides[activo.value])
const progreso = computed(() => ((activo.value + 1) / slides.length) * 100)

function offsetRelativo(index: number) {
  const len = slides.length
  let diff = index - activo.value
  if (diff > len / 2) diff -= len
  if (diff < -len / 2) diff += len
  return diff
}

const slideStyles = computed(() =>
  slides.map((_, index) => {
    const diff = offsetRelativo(index)
    const abs = Math.abs(diff)
    const isCenter = diff === 0

    if (abs > 1) {
      return {
        opacity: '0',
        pointerEvents: 'none' as const,
        transform: 'translate(-50%, -50%) scale(0.6)',
        zIndex: 0,
        filter: 'blur(8px)',
      }
    }

    const translateX = diff * 108
    const scale = isCenter ? 1 : 0.74
    const rotateY = diff * -14
    const translateZ = isCenter ? 60 : -100

    return {
      opacity: isCenter ? '1' : '0.42',
      pointerEvents: 'auto' as const,
      transform: `translate(-50%, -50%) translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: isCenter ? 30 : 20 - abs,
      filter: isCenter ? 'none' : 'blur(2px) brightness(0.65) saturate(0.85)',
    }
  }),
)

function irA(index: number) {
  if (index === activo.value) return
  activo.value = (index + slides.length) % slides.length
}

function anterior() {
  irA(activo.value - 1)
}

function siguiente() {
  irA(activo.value + 1)
}

function iniciarAuto() {
  timer = setInterval(() => {
    if (!pausado.value) siguiente()
  }, 5500)
}

onMounted(iniciarAuto)
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <section
    class="home-cine relative flex h-[calc(100svh-4rem)] w-full flex-col overflow-hidden bg-black"
    @mouseenter="pausado = true"
    @mouseleave="pausado = false"
  >
    <!-- Fondo ambiental (slide activo) -->
    <Transition name="cine-ambient" mode="out-in">
      <div :key="slideActual.id + '-bg'" class="pointer-events-none absolute inset-0">
        <img
          :src="slideActual.imagen"
          alt=""
          aria-hidden="true"
          class="cine-ambient-img absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-[48px] saturate-150"
        />
        <img
          :src="slideActual.imagen"
          alt=""
          aria-hidden="true"
          class="absolute inset-0 h-full w-full scale-150 object-cover opacity-35 blur-[80px] saturate-200"
        />
        <div class="absolute inset-0 bg-black/45" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.65)_100%)]" />
        <div class="absolute inset-0 bg-accent/[0.07] mix-blend-soft-light" />
      </div>
    </Transition>

    <!-- Tres posts visibles -->
    <div class="relative z-10 flex flex-1 items-center justify-center px-2 py-4 sm:px-4">
      <div class="carousel-stage relative h-[min(72vh,720px)] w-full max-w-6xl">
        <div class="carousel-track absolute inset-0">
          <article
            v-for="(slide, index) in slides"
            :key="slide.id"
            class="carousel-slide absolute left-1/2 top-1/2 w-[min(88vw,400px)] cursor-pointer sm:w-[min(42vh,440px)]"
            :style="slideStyles[index]"
            :aria-hidden="index !== activo"
            @click="irA(index)"
          >
            <div
              class="cine-frame relative w-full"
              :class="[
                index === activo && slide.destacado ? 'cine-frame--featured' : '',
                index === activo ? 'cine-frame--active' : 'cine-frame--side',
              ]"
            >
              <div
                v-if="index === activo"
                class="pointer-events-none absolute -inset-px bg-gradient-to-b from-accent/30 via-transparent to-accent/20 opacity-70"
              />

              <div class="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                <img
                  :src="slide.imagen"
                  :alt="slide.titulo"
                  class="h-full w-full object-cover object-center"
                  :class="index === activo ? 'cine-image' : ''"
                  loading="lazy"
                />

                <div class="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.35)]" />

                <!-- Título solo en el centro -->
                <template v-if="index === activo">
                  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div class="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
                    <p
                      v-if="slide.destacado"
                      class="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.45em] text-accent"
                    >
                      <span class="h-px w-5 bg-accent" />
                      Featured
                    </p>
                    <h2 class="cine-title font-display uppercase leading-[0.9] text-white">
                      {{ slide.titulo }}
                    </h2>
                  </div>

                  <div class="cine-grain pointer-events-none absolute inset-0 opacity-[0.16]" />
                  <div class="home-carousel-scan pointer-events-none absolute inset-0 opacity-15" />

                  <div class="pointer-events-none absolute left-3 top-3 h-7 w-7 border-l border-t border-accent/70 sm:left-4 sm:top-4 sm:h-8 sm:w-8" />
                  <div class="pointer-events-none absolute right-3 top-3 h-7 w-7 border-r border-t border-accent/70 sm:right-4 sm:top-4 sm:h-8 sm:w-8" />
                  <div class="pointer-events-none absolute bottom-3 left-3 h-7 w-7 border-b border-l border-accent/70 sm:bottom-4 sm:left-4 sm:h-8 sm:w-8" />
                  <div class="pointer-events-none absolute bottom-3 right-3 h-7 w-7 border-b border-r border-accent/70 sm:bottom-4 sm:right-4 sm:h-8 sm:w-8" />
                </template>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- Controles -->
    <div class="relative z-10 flex flex-col gap-3 px-4 pb-5 pt-2 sm:px-8 sm:pb-6">
      <div class="mx-auto h-px w-full max-w-xl bg-white/15">
        <div
          class="h-full bg-accent transition-all duration-700 ease-out shadow-[0_0_12px_var(--accent)]"
          :style="{ width: `${progreso}%` }"
        />
      </div>

      <div class="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-black/30 text-white/80 backdrop-blur-sm transition hover:border-accent hover:text-accent"
          aria-label="Anterior"
          @click="anterior"
        >
          <ChevronLeft class="h-5 w-5" />
        </button>

        <div class="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1 px-1">
          <button
            v-for="(slide, index) in slides"
            :key="slide.id + '-label'"
            type="button"
            class="text-[10px] font-bold uppercase tracking-[0.15em] transition sm:text-xs"
            :class="index === activo ? 'text-accent drop-shadow-[0_0_8px_var(--accent)]' : 'text-white/40 hover:text-white/75'"
            @click="irA(index)"
          >
            {{ slide.titulo }}
          </button>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center border border-white/25 bg-black/30 text-white/80 backdrop-blur-sm transition hover:border-accent hover:text-accent"
          aria-label="Siguiente"
          @click="siguiente"
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-stage {
  perspective: 1400px;
  perspective-origin: 50% 45%;
}

.carousel-track {
  transform-style: preserve-3d;
}

.carousel-slide {
  transition:
    transform 0.75s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.65s ease,
    filter 0.65s ease;
  will-change: transform, opacity, filter;
}

.cine-frame {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08),
    0 0 40px -12px rgba(201, 247, 61, 0.2),
    0 20px 50px -20px rgba(0, 0, 0, 0.85);
}

.cine-frame--active {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 60px -10px rgba(201, 247, 61, 0.35),
    0 24px 60px -20px rgba(0, 0, 0, 0.9);
}

.cine-frame--featured {
  box-shadow:
    0 0 0 1px rgba(201, 247, 61, 0.35),
    0 0 80px -8px rgba(201, 247, 61, 0.45),
    0 28px 70px -18px rgba(0, 0, 0, 0.9);
}

.cine-frame--side {
  box-shadow: 0 16px 40px -18px rgba(0, 0, 0, 0.9);
}

.cine-title {
  font-size: clamp(1.75rem, 5.5vw, 3.25rem);
  text-shadow:
    0 0 32px rgba(201, 247, 61, 0.2),
    0 3px 18px rgba(0, 0, 0, 0.9);
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.06);
}

.cine-image {
  animation: cine-kenburns 7s ease-out forwards;
  will-change: transform;
}

.cine-ambient-img {
  animation: cine-ambient-drift 12s ease-in-out infinite alternate;
}

.cine-grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

.cine-ambient-enter-active,
.cine-ambient-leave-active {
  transition: opacity 0.8s ease;
}

.cine-ambient-enter-from,
.cine-ambient-leave-to {
  opacity: 0;
}

@keyframes cine-kenburns {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

@keyframes cine-ambient-drift {
  from {
    transform: scale(1.2);
  }
  to {
    transform: scale(1.28);
  }
}
</style>
