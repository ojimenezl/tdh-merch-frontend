<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { categorias as mockCategorias } from '@/services/mock/db'
import { useAuthStore } from '@/stores/auth'
import type { Categoria } from '@/types'
import { Plus, Edit, Trash2, Layers, Check, X } from '@lucide/vue'

const router = useRouter()
const auth = useAuthStore()

const cargando = ref(true)
const categorias = ref<Categoria[]>([])

async function cargar() {
  cargando.value = true
  await new Promise((r) => setTimeout(r, 200))
  categorias.value = [...mockCategorias]
  cargando.value = false
}

async function eliminar(id: string) {
  if (!confirm('¿Eliminar esta categoría?')) return
  const idx = mockCategorias.findIndex((c) => c.id === id)
  if (idx >= 0) mockCategorias.splice(idx, 1)
  await cargar()
}

async function toggleActiva(cat: Categoria) {
  const idx = mockCategorias.findIndex((c) => c.id === cat.id)
  if (idx >= 0) {
    mockCategorias[idx].activa = !mockCategorias[idx].activa
  }
  await cargar()
}

onMounted(() => {
  if (!auth.esSuperadmin) router.push({ name: 'admin-dashboard' })
  cargar()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-3xl uppercase text-fg">Categorías</h1>
      <RouterLink
        to="/admin/categorias/nuevo"
        class="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast"
      >
        <Plus class="h-4 w-4" />
        Nueva categoría
      </RouterLink>
    </div>

    <p class="text-sm text-muted mb-6">
      Las categorías definen los tipos de productos y sus atributos (talla, color, capacidad, etc.)
    </p>

    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 3" :key="n" class="h-24 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else-if="categorias.length === 0" class="border-2 border-dashed border-line p-8 text-center">
      <Layers class="mx-auto h-12 w-12 text-muted mb-4" />
      <p class="text-muted">No hay categorías. Crea la primera.</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="cat in categorias"
        :key="cat.id"
        :class="[
          'border-2 p-4 transition-colors',
          cat.activa ? 'border-line bg-surface' : 'border-line bg-surface opacity-50'
        ]"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <span class="font-display text-lg uppercase text-fg">{{ cat.nombre }}</span>
              <span
                :class="cat.activa ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'"
                class="px-2 py-0.5 text-xs font-bold uppercase"
              >
                {{ cat.activa ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <p class="text-sm text-muted mt-1">{{ cat.descripcion }}</p>

            <div v-if="cat.atributos.length > 0" class="mt-3">
              <span class="text-xs font-bold uppercase text-muted">Atributos:</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="attr in cat.atributos"
                  :key="attr.clave"
                  :class="[
                    'px-2 py-0.5 text-xs border',
                    attr.generaVariante ? 'border-accent text-accent' : 'border-line text-muted'
                  ]"
                >
                  {{ attr.etiqueta }}
                  <span v-if="attr.generaVariante" class="opacity-70">(variante)</span>
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="toggleActiva(cat)"
              :class="[
                'p-2 border-2 transition-colors',
                cat.activa ? 'border-success text-success hover:bg-success/10' : 'border-muted text-muted hover:bg-muted/10'
              ]"
              :title="cat.activa ? 'Desactivar' : 'Activar'"
            >
              <Check v-if="cat.activa" class="h-4 w-4" />
              <X v-else class="h-4 w-4" />
            </button>
            <RouterLink
              :to="`/admin/categorias/${cat.id}`"
              class="p-2 border-2 border-line text-fg hover:bg-bg transition-colors"
              title="Editar"
            >
              <Edit class="h-4 w-4" />
            </RouterLink>
            <button
              @click="eliminar(cat.id)"
              class="p-2 border-2 border-line text-danger hover:bg-danger/10 transition-colors"
              title="Eliminar"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
