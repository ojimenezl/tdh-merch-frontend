<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlidersHorizontal, X } from '@lucide/vue'
import { catalogService } from '@/services'
import type { Categoria, FiltrosCatalogo, Producto } from '@/types'
import ProductCard from '@/components/catalog/ProductCard.vue'

const route = useRoute()
const router = useRouter()

const categorias = ref<Categoria[]>([])
const productos = ref<Producto[]>([])
const cargando = ref(true)

// Controles locales de precio (se aplican al confirmar).
const precioMin = ref('')
const precioMax = ref('')

const ordenes: { valor: NonNullable<FiltrosCatalogo['orden']>; etiqueta: string }[] = [
  { valor: 'recientes', etiqueta: 'Más recientes' },
  { valor: 'precio_asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio_desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'nombre', etiqueta: 'Nombre (A-Z)' },
]

const categoriaActiva = computed(() => (route.query.categoria as string) || '')
const busqueda = computed(() => (route.query.q as string) || '')
const ordenActivo = computed(() => (route.query.orden as string) || 'recientes')

const hayFiltros = computed(
  () =>
    !!categoriaActiva.value ||
    !!busqueda.value ||
    !!route.query.precioMin ||
    !!route.query.precioMax,
)

function actualizarQuery(cambios: Record<string, string | undefined>) {
  const query = { ...route.query, ...cambios }
  // Limpia claves vacías.
  Object.keys(query).forEach((k) => {
    if (!query[k]) delete query[k]
  })
  router.push({ name: 'catalogo', query })
}

function seleccionarCategoria(id: string) {
  actualizarQuery({ categoria: categoriaActiva.value === id ? undefined : id })
}

function aplicarPrecio() {
  actualizarQuery({ precioMin: precioMin.value || undefined, precioMax: precioMax.value || undefined })
}

function limpiarFiltros() {
  precioMin.value = ''
  precioMax.value = ''
  router.push({ name: 'catalogo' })
}

async function cargar() {
  cargando.value = true
  try {
    const filtros: FiltrosCatalogo = {
      categoriaId: categoriaActiva.value || undefined,
      busqueda: busqueda.value || undefined,
      orden: ordenActivo.value as FiltrosCatalogo['orden'],
      precioMin: route.query.precioMin ? Number(route.query.precioMin) : undefined,
      precioMax: route.query.precioMax ? Number(route.query.precioMax) : undefined,
    }
    productos.value = await catalogService.listarProductos(filtros)
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  categorias.value = await catalogService.listarCategorias()
  precioMin.value = (route.query.precioMin as string) || ''
  precioMax.value = (route.query.precioMax as string) || ''
  await cargar()
})

watch(() => route.query, cargar)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <header class="mb-8 border-b-2 border-fg pb-4">
      <h1 class="font-display text-5xl uppercase text-fg sm:text-6xl">Catálogo</h1>
      <p class="mt-2 text-sm font-bold uppercase tracking-wide text-muted">
        <span v-if="busqueda">Resultados para "{{ busqueda }}" · </span>
        {{ productos.length }} producto(s)
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[260px_1fr]">
      <!-- Filtros -->
      <aside class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="flex items-center gap-2 font-display text-sm uppercase tracking-wide text-fg">
            <SlidersHorizontal class="h-4 w-4" /> Filtros
          </h2>
          <button
            v-if="hayFiltros"
            type="button"
            class="flex items-center gap-1 text-xs font-bold uppercase text-accent hover:underline"
            @click="limpiarFiltros"
          >
            <X class="h-3.5 w-3.5" /> Limpiar
          </button>
        </div>

        <!-- Categorías -->
        <div class="border-2 border-line bg-surface p-4">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Categorías</h3>
          <ul class="space-y-1">
            <li>
              <button
                type="button"
                class="w-full px-3 py-2 text-left text-sm font-bold uppercase tracking-wide transition"
                :class="!categoriaActiva ? 'bg-accent text-accent-contrast' : 'text-muted hover:bg-bg hover:text-fg'"
                @click="actualizarQuery({ categoria: undefined })"
              >
                Todas
              </button>
            </li>
            <li v-for="c in categorias" :key="c.id">
              <button
                type="button"
                class="w-full px-3 py-2 text-left text-sm font-bold uppercase tracking-wide transition"
                :class="categoriaActiva === c.id ? 'bg-accent text-accent-contrast' : 'text-muted hover:bg-bg hover:text-fg'"
                @click="seleccionarCategoria(c.id)"
              >
                {{ c.nombre }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Precio -->
        <div class="border-2 border-line bg-surface p-4">
          <h3 class="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Precio (USD)</h3>
          <div class="flex items-center gap-2">
            <input
              v-model="precioMin"
              type="number"
              min="0"
              placeholder="Mín"
              class="w-full border-2 border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
            <span class="text-muted">—</span>
            <input
              v-model="precioMax"
              type="number"
              min="0"
              placeholder="Máx"
              class="w-full border-2 border-line bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-accent"
            />
          </div>
          <button
            type="button"
            class="mt-3 w-full bg-fg py-2 text-sm font-bold uppercase tracking-wide text-bg transition hover:bg-accent hover:text-accent-contrast"
            @click="aplicarPrecio"
          >
            Aplicar
          </button>
        </div>
      </aside>

      <!-- Resultados -->
      <section>
        <div class="mb-4 flex items-center justify-end">
          <label class="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted">
            Ordenar
            <select
              :value="ordenActivo"
              class="border-2 border-line bg-surface px-3 py-2 text-sm font-medium text-fg outline-none focus:border-accent"
              @change="actualizarQuery({ orden: ($event.target as HTMLSelectElement).value })"
            >
              <option v-for="o in ordenes" :key="o.valor" :value="o.valor">{{ o.etiqueta }}</option>
            </select>
          </label>
        </div>

        <!-- Carga -->
        <div v-if="cargando" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="h-80 animate-pulse border-2 border-line bg-surface" />
        </div>

        <!-- Vacío -->
        <div
          v-else-if="productos.length === 0"
          class="border-2 border-dashed border-line bg-surface py-20 text-center"
        >
          <p class="font-display text-xl uppercase text-fg">Sin resultados</p>
          <p class="mt-1 text-sm text-muted">Prueba quitar algún filtro o cambiar la búsqueda.</p>
          <button
            type="button"
            class="mt-4 border-2 border-fg px-5 py-2 text-sm font-bold uppercase tracking-wide text-fg transition hover:bg-fg hover:text-bg"
            @click="limpiarFiltros"
          >
            Limpiar filtros
          </button>
        </div>

        <!-- Grid -->
        <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <ProductCard v-for="p in productos" :key="p.id" :producto="p" />
        </div>
      </section>
    </div>
  </div>
</template>
