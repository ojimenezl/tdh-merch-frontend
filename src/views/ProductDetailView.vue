<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { Check, ChevronRight, Minus, Plus, ShoppingCart } from '@lucide/vue'
import { catalogService } from '@/services'
import { useCartStore } from '@/stores/cart'
import type { Categoria, Producto } from '@/types'
import { formatearPrecio } from '@/lib/format'
import {
  buscarVariante,
  clavesVariante,
  comboTieneStock,
  opcionesPorClave,
  stockTotal,
} from '@/lib/product'
import ImageGalleryZoom from '@/components/catalog/ImageGalleryZoom.vue'

const route = useRoute()
const cart = useCartStore()

const producto = ref<Producto | null>(null)
const categoria = ref<Categoria | null>(null)
const cargando = ref(true)
const seleccion = reactive<Record<string, string>>({})
const cantidad = ref(1)
const agregado = ref(false)

const claves = computed(() => (producto.value ? clavesVariante(producto.value) : []))
const opciones = computed(() => (producto.value ? opcionesPorClave(producto.value) : {}))
const tieneVariantes = computed(() => claves.value.length > 0)

// Etiqueta legible de una clave de atributo (ej. 'talla' -> 'Talla').
function etiqueta(clave: string): string {
  const def = categoria.value?.atributos.find((a) => a.clave === clave)
  return def?.etiqueta ?? clave
}

const varianteSel = computed(() =>
  producto.value && tieneVariantes.value
    ? buscarVariante(producto.value, seleccion)
    : undefined,
)

const precioActual = computed(() => {
  if (varianteSel.value) return varianteSel.value.precio
  return producto.value?.precioBase ?? 0
})

const stockActual = computed(() => {
  if (!producto.value) return 0
  if (tieneVariantes.value) return varianteSel.value?.stock ?? 0
  return stockTotal(producto.value)
})

const seleccionCompleta = computed(() =>
  !tieneVariantes.value ? true : claves.value.every((c) => seleccion[c]),
)

const puedeAgregar = computed(() => seleccionCompleta.value && stockActual.value > 0)

// Atributos generales (no de variante), con etiqueta legible.
const atributosGenerales = computed(() => {
  if (!producto.value) return []
  return producto.value.atributos.map((a) => ({
    etiqueta: etiqueta(a.clave),
    valor: String(a.valor),
  }))
})

function elegir(clave: string, valor: string) {
  seleccion[clave] = seleccion[clave] === valor ? '' : valor
  agregado.value = false
}

function cambiarCantidad(delta: number) {
  const nueva = cantidad.value + delta
  if (nueva >= 1 && nueva <= Math.max(stockActual.value, 1)) cantidad.value = nueva
}

function agregarAlCarrito() {
  if (!producto.value || !puedeAgregar.value) return
  cart.agregar({
    productoId: producto.value.id,
    varianteId: varianteSel.value?.id,
    slug: producto.value.slug,
    nombreProducto: producto.value.nombre,
    atributos: varianteSel.value?.atributos ?? [],
    imagen: producto.value.imagenes[0]?.url,
    precioUnitario: precioActual.value,
    cantidad: cantidad.value,
    stockMax: stockActual.value,
  })
  agregado.value = true
  cart.abrir()
}

async function cargar(slug: string) {
  cargando.value = true
  agregado.value = false
  cantidad.value = 1
  Object.keys(seleccion).forEach((k) => delete seleccion[k])
  try {
    const [p, cats] = await Promise.all([
      catalogService.obtenerProducto(slug),
      catalogService.listarCategorias(),
    ])
    producto.value = p
    categoria.value = p ? cats.find((c) => c.id === p.categoriaId) ?? null : null
  } finally {
    cargando.value = false
  }
}

onMounted(() => cargar(route.params.slug as string))
watch(() => route.params.slug, (slug) => slug && cargar(slug as string))
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <!-- Carga -->
    <div v-if="cargando" class="grid gap-10 lg:grid-cols-2">
      <div class="aspect-square animate-pulse border-2 border-line bg-surface" />
      <div class="space-y-4">
        <div class="h-10 w-2/3 animate-pulse bg-surface" />
        <div class="h-6 w-1/3 animate-pulse bg-surface" />
        <div class="h-24 animate-pulse bg-surface" />
      </div>
    </div>

    <!-- No encontrado -->
    <div
      v-else-if="!producto"
      class="border-2 border-dashed border-line bg-surface py-20 text-center"
    >
      <p class="font-display text-xl uppercase text-fg">Producto no encontrado</p>
      <RouterLink
        :to="{ name: 'catalogo' }"
        class="mt-4 inline-block bg-accent px-5 py-2 text-sm font-bold uppercase tracking-wide text-accent-contrast"
      >
        Volver al catálogo
      </RouterLink>
    </div>

    <!-- Detalle -->
    <div v-else>
      <!-- Breadcrumb -->
      <nav class="mb-6 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted">
        <RouterLink :to="{ name: 'home' }" class="hover:text-accent">Inicio</RouterLink>
        <ChevronRight class="h-4 w-4" />
        <RouterLink :to="{ name: 'catalogo' }" class="hover:text-accent">Catálogo</RouterLink>
        <template v-if="categoria">
          <ChevronRight class="h-4 w-4" />
          <RouterLink
            :to="{ name: 'catalogo', query: { categoria: categoria.id } }"
            class="hover:text-accent"
          >
            {{ categoria.nombre }}
          </RouterLink>
        </template>
      </nav>

      <div class="grid gap-10 lg:grid-cols-2">
        <!-- Galería -->
        <ImageGalleryZoom :imagenes="producto.imagenes" />

        <!-- Información -->
        <div>
          <h1 class="font-display text-4xl uppercase leading-none text-fg sm:text-5xl">
            {{ producto.nombre }}
          </h1>
          <p class="mt-4 font-display text-3xl text-fg">
            <span class="bg-accent px-2 text-accent-contrast">{{ formatearPrecio(precioActual) }}</span>
          </p>

          <p class="mt-6 text-sm leading-relaxed text-muted">{{ producto.descripcion }}</p>

          <!-- Selección de variantes -->
          <div v-if="tieneVariantes" class="mt-7 space-y-5">
            <div v-for="clave in claves" :key="clave">
              <p class="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                {{ etiqueta(clave) }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="valor in opciones[clave]"
                  :key="valor"
                  type="button"
                  :disabled="!comboTieneStock(producto, clave, valor, seleccion)"
                  class="border-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-30"
                  :class="
                    seleccion[clave] === valor
                      ? 'border-fg bg-fg text-bg'
                      : 'border-line text-fg hover:border-fg'
                  "
                  @click="elegir(clave, valor)"
                >
                  {{ valor }}
                </button>
              </div>
            </div>
          </div>

          <!-- Stock -->
          <p class="mt-6 text-sm font-bold uppercase tracking-wide">
            <span v-if="!seleccionCompleta" class="text-muted">Selecciona las opciones</span>
            <span v-else-if="stockActual > 0" class="text-ok">{{ stockActual }} disponibles</span>
            <span v-else class="text-danger">Agotado</span>
          </p>

          <!-- Cantidad + agregar -->
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <div class="flex items-center border-2 border-line">
              <button
                type="button"
                class="px-3 py-2.5 text-fg transition hover:bg-bg disabled:opacity-30"
                :disabled="cantidad <= 1"
                @click="cambiarCantidad(-1)"
              >
                <Minus class="h-4 w-4" />
              </button>
              <span class="w-10 text-center font-display text-lg">{{ cantidad }}</span>
              <button
                type="button"
                class="px-3 py-2.5 text-fg transition hover:bg-bg disabled:opacity-30"
                :disabled="cantidad >= stockActual"
                @click="cambiarCantidad(1)"
              >
                <Plus class="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              :disabled="!puedeAgregar"
              class="flex flex-1 items-center justify-center gap-2 bg-accent px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
              @click="agregarAlCarrito"
            >
              <ShoppingCart class="h-5 w-5" />
              Añadir al carrito
            </button>
          </div>

          <!-- Confirmación -->
          <p
            v-if="agregado"
            class="mt-3 flex items-center gap-2 border-2 border-ok px-4 py-3 text-sm font-bold uppercase tracking-wide text-ok"
          >
            <Check class="h-4 w-4" />
            Añadido al carrito.
          </p>

          <!-- Atributos generales -->
          <div v-if="atributosGenerales.length" class="mt-8 border-t-2 border-line pt-6">
            <h2 class="font-display text-sm uppercase tracking-wide text-fg">Detalles</h2>
            <dl class="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              <div
                v-for="a in atributosGenerales"
                :key="a.etiqueta"
                class="flex justify-between border-b border-line py-1.5 text-sm"
              >
                <dt class="uppercase tracking-wide text-muted">{{ a.etiqueta }}</dt>
                <dd class="font-bold text-fg">{{ a.valor }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
