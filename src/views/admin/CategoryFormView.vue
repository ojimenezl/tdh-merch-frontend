<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { categorias as mockCategorias } from '@/services/mock/db'
import type { Categoria, DefinicionAtributo } from '@/types'
import { ArrowLeft, Plus, Trash2 } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const id = route.params.id as string | undefined
const esNuevo = !id || id === 'nuevo'

const cargando = ref(false)
const form = ref<{
  nombre: string
  slug: string
  descripcion: string
  activa: boolean
  atributos: DefinicionAtributo[]
}>({
  nombre: '',
  slug: '',
  descripcion: '',
  activa: true,
  atributos: [],
})

function cargar() {
  if (esNuevo) return
  const cat = mockCategorias.find((c) => c.id === id)
  if (cat) {
    form.value = {
      nombre: cat.nombre,
      slug: cat.slug,
      descripcion: cat.descripcion ?? '',
      activa: cat.activa,
      atributos: [...cat.atributos],
    }
  }
}

function agregarAtributo() {
  form.value.atributos.push({
    clave: '',
    etiqueta: '',
    tipo: 'texto',
    requerido: false,
    generaVariante: false,
  })
}

function eliminarAtributo(idx: number) {
  form.value.atributos.splice(idx, 1)
}

async function guardar() {
  if (!form.value.nombre.trim()) {
    alert('El nombre es obligatorio')
    return
  }

  cargando.value = true
  await new Promise((r) => setTimeout(r, 300))

  if (esNuevo) {
    const nuevo: Categoria = {
      id: 'cat-' + Date.now(),
      ...form.value,
    }
    mockCategorias.push(nuevo)
  } else {
    const idx = mockCategorias.findIndex((c) => c.id === id)
    if (idx >= 0) {
      mockCategorias[idx] = { ...mockCategorias[idx], ...form.value }
    }
  }

  cargando.value = false
  router.push({ name: 'admin-categorias' })
}

onMounted(() => {
  if (!auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-4">
      <button @click="$router.back()" class="flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft class="h-4 w-4" />
        Volver
      </button>
    </div>

    <h1 class="font-display text-2xl uppercase text-fg mb-6">
      {{ esNuevo ? 'Nueva Categoría' : 'Editar Categoría' }}
    </h1>

    <div class="space-y-6 max-w-2xl">
      <!-- Datos básicos -->
      <div class="border-2 border-line bg-surface p-4 space-y-4">
        <h2 class="font-display text-lg uppercase text-fg">Datos Básicos</h2>

        <div>
          <label class="block text-xs font-bold uppercase text-muted mb-1">Nombre</label>
          <input v-model="form.nombre" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="Ej: Ropa" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-muted mb-1">Slug (URL)</label>
          <input v-model="form.slug" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="Ej: ropa" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-muted mb-1">Descripción</label>
          <textarea v-model="form.descripcion" rows="3" class="w-full border-2 border-line bg-bg px-3 py-2" placeholder="Descripción de la categoría..." />
        </div>

        <div class="flex items-center gap-3">
          <input type="checkbox" id="activa" v-model="form.activa" class="h-4 w-4" />
          <label for="activa" class="text-sm">Categoría activa</label>
        </div>
      </div>

      <!-- Atributos -->
      <div class="border-2 border-line bg-surface p-4 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display text-lg uppercase text-fg">Atributos del Tipo</h2>
          <button @click="agregarAtributo" class="flex items-center gap-1 text-xs font-bold uppercase text-accent hover:underline">
            <Plus class="h-4 w-4" />
            Agregar
          </button>
        </div>

        <p class="text-sm text-muted">
          Define los atributos que tendrán los productos de esta categoría (talla, color, capacidad, etc.)
        </p>

        <div v-if="form.atributos.length === 0" class="border-2 border-dashed border-line p-4 text-center text-muted text-sm">
          No hay atributos definidos
        </div>

        <div v-for="(attr, idx) in form.atributos" :key="idx" class="border border-line p-3 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-muted">Atributo {{ idx + 1 }}</span>
            <button @click="eliminarAtributo(idx)" class="text-danger hover:underline">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Clave</label>
              <input v-model="attr.clave" class="w-full border-2 border-line bg-bg px-2 py-1 text-sm" placeholder="talla" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Etiqueta</label>
              <input v-model="attr.etiqueta" class="w-full border-2 border-line bg-bg px-2 py-1 text-sm" placeholder="Talla" />
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Tipo</label>
              <select v-model="attr.tipo" class="w-full border-2 border-line bg-bg px-2 py-1 text-sm">
                <option value="texto">Texto</option>
                <option value="numero">Número</option>
                <option value="seleccion">Selección</option>
                <option value="color">Color</option>
              </select>
            </div>
            <div v-if="attr.tipo === 'seleccion' || attr.tipo === 'color'">
              <label class="block text-xs font-bold uppercase text-muted mb-1">Opciones (separadas por coma)</label>
              <input
                :value="attr.opciones?.join(', ')"
                @input="attr.opciones = ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)"
                class="w-full border-2 border-line bg-bg px-2 py-1 text-sm"
                placeholder="XS, S, M, L, XL"
              />
            </div>
          </div>

          <div class="flex gap-4 text-sm">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="attr.requerido" class="h-4 w-4" />
              Requerido
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="attr.generaVariante" class="h-4 w-4" />
              Genera variante
            </label>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3">
        <button
          @click="guardar"
          :disabled="cargando"
          class="bg-accent px-6 py-2 text-sm font-bold uppercase text-accent-contrast disabled:opacity-50"
        >
          {{ cargando ? 'Guardando...' : 'Guardar' }}
        </button>
        <button @click="$router.back()" class="px-6 py-2 border-2 border-line text-sm font-bold uppercase">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>
