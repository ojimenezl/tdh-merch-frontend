<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminProductsService } from '@/services/adminProducts.service'
import { categorias as mockCategorias } from '@/services/mock/db'
import { useAuthStore } from '@/stores/auth'
import type { Producto, VarianteProducto, ImagenProducto, DefinicionAtributo, ValorAtributo } from '@/types'
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Package } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = route.params.id as string | undefined
const esNuevo = !id || id === 'nuevo'
const cargando = ref(false)
const guardando = ref(false)

const form = ref({
  nombre: '',
  slug: '',
  descripcion: '',
  categoriaId: '',
  precioBase: 0,
  destacado: false,
  activo: true,
  stockSimple: 0,
  atributos: [] as ValorAtributo[],
  imagenes: [] as ImagenProducto[],
  variantes: [] as VarianteProducto[],
})

const categoriaSeleccionada = computed(() => {
  return mockCategorias.find((c) => c.id === form.value.categoriaId)
})

const atributosCat = computed<DefinicionAtributo[]>(() => {
  return categoriaSeleccionada.value?.atributos ?? []
})

const atributosVariante = computed(() => {
  return atributosCat.value.filter((a) => a.generaVariante)
})

const atributosNoVariante = computed(() => {
  return atributosCat.value.filter((a) => !a.generaVariante)
})

const usaVariantes = computed(() => atributosVariante.value.length > 0)

watch(
  () => form.value.categoriaId,
  () => {
    form.value.atributos = atributosNoVariante.value.map((a): ValorAtributo => ({
      clave: a.clave,
      valor: '',
    }))
    form.value.variantes = []
  }
)

async function cargar() {
  if (esNuevo) {
    if (mockCategorias.length > 0) {
      form.value.categoriaId = mockCategorias[0].id
    }
    return
  }
  cargando.value = true
  try {
    const producto = await adminProductsService.obtenerPorId(id!)
    if (producto) {
      form.value = {
        nombre: producto.nombre,
        slug: producto.slug,
        descripcion: producto.descripcion,
        categoriaId: producto.categoriaId,
        precioBase: producto.precioBase,
        destacado: producto.destacado,
        activo: producto.activo,
        stockSimple: producto.stockSimple ?? 0,
        atributos: producto.atributos?.map((a: ValorAtributo) => ({ clave: a.clave, valor: a.valor })) ?? [],
        imagenes: [...producto.imagenes],
        variantes: producto.variantes?.map((v) => ({ ...v })) ?? [],
      }
    }
  } finally {
    cargando.value = false
  }
}

function agregarImagen() {
  const seed = 'img-' + Date.now()
  form.value.imagenes.push({
    id: seed,
    url: `https://picsum.photos/seed/${seed}/700/700`,
    alt: form.value.nombre || 'Producto',
  })
}

function eliminarImagen(idx: number) {
  form.value.imagenes.splice(idx, 1)
}

function agregarVariante() {
  const attrs: ValorAtributo[] = atributosVariante.value.map((a): ValorAtributo => ({
    clave: a.clave,
    valor: a.opciones?.[0] ?? '',
  }))
  form.value.variantes.push({
    id: 'var-' + Date.now(),
    sku: '',
    precio: form.value.precioBase,
    stock: 0,
    atributos: attrs,
  })
}

function eliminarVariante(idx: number) {
  form.value.variantes.splice(idx, 1)
}

function generarSku(variante: VarianteProducto) {
  const prefix = form.value.nombre.substring(0, 3).toUpperCase()
  const suffix = variante.atributos.map((a) => String(a.valor).substring(0, 3).toUpperCase()).join('-')
  variante.sku = `${prefix}-${suffix}`
}

async function guardar() {
  if (!form.value.nombre.trim()) {
    alert('El nombre es obligatorio')
    return
  }
  if (!form.value.categoriaId) {
    alert('Selecciona una categoría')
    return
  }

  guardando.value = true
  try {
    const data: Partial<Producto> = {
      nombre: form.value.nombre,
      slug: form.value.slug || form.value.nombre.toLowerCase().replace(/\s+/g, '-'),
      descripcion: form.value.descripcion,
      categoriaId: form.value.categoriaId,
      precioBase: form.value.precioBase,
      destacado: form.value.destacado,
      activo: form.value.activo,
      atributos: form.value.atributos.filter((a) => a.valor !== ''),
      imagenes: form.value.imagenes,
      variantes: form.value.variantes,
    }

    if (!usaVariantes.value) {
      data.stockSimple = form.value.stockSimple
      data.variantes = []
    }

    if (esNuevo) {
      await adminProductsService.crear(data as any)
    } else {
      await adminProductsService.actualizar(id!, data)
    }
    router.push({ name: 'admin-productos' })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-4">
      <button @click="$router.back()" class="flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft class="h-4 w-4" />
        Volver a productos
      </button>
    </div>

    <h1 class="font-display text-2xl uppercase text-fg mb-6">
      {{ esNuevo ? 'Crear Producto' : 'Editar Producto' }}
    </h1>

    <div v-if="cargando" class="space-y-4">
      <div class="h-64 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else class="grid gap-6 lg:grid-cols-[1fr_300px]">
      <!-- Columna principal -->
      <div class="space-y-6">
        <!-- Datos básicos -->
        <div class="border-2 border-line bg-surface p-4 space-y-4">
          <h2 class="font-display text-lg uppercase text-fg">Datos Básicos</h2>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Nombre *</label>
              <input v-model="form.nombre" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="Camiseta TDH" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Slug (URL)</label>
              <input v-model="form.slug" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="camiseta-tdh" />
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Categoría *</label>
              <select v-model="form.categoriaId" class="w-full border-2 border-line bg-bg px-3 py-2">
                <option value="">Seleccionar...</option>
                <option v-for="cat in mockCategorias" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Precio base ($)</label>
              <input v-model.number="form.precioBase" type="number" step="0.01" min="0" class="w-full border-2 border-line bg-bg px-3 py-2" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-muted mb-1">Descripción</label>
            <textarea v-model="form.descripcion" rows="4" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="Descripción del producto..." />
          </div>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.destacado" class="h-4 w-4" />
              Destacado
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="form.activo" class="h-4 w-4" />
              Activo
            </label>
          </div>
        </div>

        <!-- Atributos del producto (no variantes) -->
        <div v-if="atributosNoVariante.length > 0" class="border-2 border-line bg-surface p-4 space-y-4">
          <h2 class="font-display text-lg uppercase text-fg">Atributos</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div v-for="attr in atributosNoVariante" :key="attr.clave">
              <label class="block text-xs font-bold uppercase text-muted mb-1">
                {{ attr.etiqueta }}
                <span v-if="attr.requerido" class="text-danger">*</span>
              </label>
              <input
                v-if="attr.tipo === 'texto' || attr.tipo === 'numero'"
                v-model="form.atributos.find((a: ValorAtributo) => a.clave === attr.clave)!.valor"
                :type="attr.tipo === 'numero' ? 'number' : 'text'"
                class="w-full border-2 border-line bg-bg px-3 py-2"
              />
              <select
                v-else-if="attr.tipo === 'seleccion'"
                v-model="form.atributos.find((a: ValorAtributo) => a.clave === attr.clave)!.valor"
                class="w-full border-2 border-line bg-bg px-3 py-2"
              >
                <option value="">Seleccionar...</option>
                <option v-for="opt in attr.opciones" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Stock simple (sin variantes) -->
        <div v-if="!usaVariantes" class="border-2 border-line bg-surface p-4 space-y-4">
          <h2 class="font-display text-lg uppercase text-fg">Stock</h2>
          <div class="max-w-xs">
            <label class="block text-xs font-bold uppercase text-muted mb-1">Cantidad disponible</label>
            <input v-model.number="form.stockSimple" type="number" min="0" class="w-full border-2 border-line bg-bg px-3 py-2" />
          </div>
        </div>

        <!-- Variantes -->
        <div v-if="usaVariantes" class="border-2 border-line bg-surface p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg uppercase text-fg flex items-center gap-2">
              <Package class="h-5 w-5" />
              Variantes
            </h2>
            <button @click="agregarVariante" class="flex items-center gap-1 text-xs font-bold uppercase text-accent hover:underline">
              <Plus class="h-4 w-4" />
              Agregar variante
            </button>
          </div>

          <p class="text-sm text-muted">
            Cada variante representa una combinación de:
            <span v-for="(attr, i) in atributosVariante" :key="attr.clave">
              {{ attr.etiqueta }}<span v-if="i < atributosVariante.length - 1">, </span>
            </span>
          </p>

          <div v-if="form.variantes.length === 0" class="border-2 border-dashed border-line p-4 text-center text-muted text-sm">
            No hay variantes. Agrega al menos una.
          </div>

          <div v-for="(variante, idx) in form.variantes" :key="variante.id" class="border border-line p-3 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase text-muted">Variante {{ idx + 1 }}</span>
              <button @click="eliminarVariante(idx)" class="text-danger hover:underline">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div v-for="attr in atributosVariante" :key="attr.clave">
                <label class="block text-xs font-bold uppercase text-muted mb-1">{{ attr.etiqueta }}</label>
                <select
                  v-model="variante.atributos.find((a: ValorAtributo) => a.clave === attr.clave)!.valor"
                  class="w-full border-2 border-line bg-bg px-2 py-1 text-sm"
                >
                  <option v-for="opt in attr.opciones" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div>
                <label class="block text-xs font-bold uppercase text-muted mb-1">SKU</label>
                <div class="flex gap-2">
                  <input v-model="variante.sku" class="flex-1 border-2 border-line bg-bg px-2 py-1 text-sm" placeholder="CAM-M-NEG" />
                  <button @click="generarSku(variante)" class="px-2 py-1 border-2 border-line text-xs hover:bg-bg" title="Generar SKU">
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-muted mb-1">Precio ($)</label>
                <input v-model.number="variante.precio" type="number" step="0.01" min="0" class="w-full border-2 border-line bg-bg px-2 py-1 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase text-muted mb-1">Stock</label>
                <input v-model.number="variante.stock" type="number" min="0" class="w-full border-2 border-line bg-bg px-2 py-1 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna lateral -->
      <div class="space-y-6">
        <!-- Imágenes -->
        <div class="border-2 border-line bg-surface p-4 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-display text-lg uppercase text-fg flex items-center gap-2">
              <ImageIcon class="h-5 w-5" />
              Imágenes
            </h2>
            <button @click="agregarImagen" class="flex items-center gap-1 text-xs font-bold uppercase text-accent hover:underline">
              <Plus class="h-4 w-4" />
            </button>
          </div>

          <div v-if="form.imagenes.length === 0" class="border-2 border-dashed border-line p-4 text-center">
            <ImageIcon class="mx-auto h-8 w-8 text-muted mb-2" />
            <p class="text-xs text-muted">Sin imágenes</p>
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <div v-for="(img, idx) in form.imagenes" :key="img.id" class="relative group">
              <img :src="img.url" :alt="img.alt" class="aspect-square w-full object-cover border-2 border-line" />
              <button
                @click="eliminarImagen(idx)"
                class="absolute top-1 right-1 p-1 bg-danger text-danger-contrast opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 class="h-3 w-3" />
              </button>
              <span v-if="idx === 0" class="absolute bottom-1 left-1 px-1 text-xs bg-accent text-accent-contrast">
                Principal
              </span>
            </div>
          </div>

          <p class="text-xs text-muted">
            La primera imagen será la principal. (En producción aquí se subirían archivos reales)
          </p>
        </div>

        <!-- Acciones -->
        <div class="border-2 border-line bg-surface p-4 space-y-3">
          <button
            @click="guardar"
            :disabled="guardando"
            class="w-full bg-accent px-4 py-3 text-sm font-bold uppercase text-accent-contrast disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : (esNuevo ? 'Crear producto' : 'Guardar cambios') }}
          </button>
          <button
            @click="$router.back()"
            class="w-full px-4 py-3 border-2 border-line text-sm font-bold uppercase hover:bg-bg"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
