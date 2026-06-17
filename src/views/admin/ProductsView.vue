<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { adminProductsService } from '@/services/adminProducts.service'
import { useAuthStore } from '@/stores/auth'
import { formatearPrecio } from '@/lib/format'
import type { Producto } from '@/types'

const router = useRouter()
const auth = useAuthStore()

const productos = ref<Producto[]>([])
const cargando = ref(true)

async function cargar() {
  cargando.value = true
  try {
    productos.value = await adminProductsService.listarTodos()
  } finally {
    cargando.value = false
  }
}

async function eliminar(id: string) {
  if (!confirm('Eliminar producto?')) return
  await adminProductsService.eliminar(id)
  await cargar()
}

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="font-display text-3xl uppercase text-fg">Productos</h1>
      <RouterLink to="/admin/productos/nuevo" class="bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast">Crear producto</RouterLink>
    </div>

    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-24 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else class="grid gap-3">
      <div v-for="p in productos" :key="p.id" class="flex items-center justify-between gap-4 border-2 border-line p-4">
        <div class="flex items-center gap-4">
          <div class="h-16 w-16 overflow-hidden border-2 bg-bg">
            <img v-if="p.imagenes[0]" :src="p.imagenes[0].url" :alt="p.nombre" class="h-full w-full object-cover" />
          </div>
          <div>
            <div class="font-display text-sm uppercase text-fg">{{ p.nombre }}</div>
            <div class="text-xs text-muted">{{ p.categoriaId }}</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="font-display">{{ formatearPrecio(p.precioBase) }}</div>
          <RouterLink :to="`/admin/productos/${p.id}`" class="px-3 py-1 border-2 border-line text-sm">Editar</RouterLink>
          <button @click="eliminar(p.id)" class="px-3 py-1 border-2 border-line text-sm text-danger">Eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

