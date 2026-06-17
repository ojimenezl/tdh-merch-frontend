import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ItemCarrito } from '@/types'

const CLAVE_STORAGE = 'tdh_cart'

// Identificador único de una línea (producto + variante).
function claveItem(productoId: string, varianteId?: string): string {
  return `${productoId}::${varianteId ?? 'base'}`
}

function cargarPersistido(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(CLAVE_STORAGE)
    return raw ? (JSON.parse(raw) as ItemCarrito[]) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<ItemCarrito[]>(cargarPersistido())
  const abierto = ref(false)

  const cantidadTotal = computed(() => items.value.reduce((s, i) => s + i.cantidad, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0))
  const vacio = computed(() => items.value.length === 0)

  // Persiste automáticamente ante cualquier cambio.
  watch(items, (val) => localStorage.setItem(CLAVE_STORAGE, JSON.stringify(val)), { deep: true })

  function agregar(item: ItemCarrito) {
    const clave = claveItem(item.productoId, item.varianteId)
    const existente = items.value.find((i) => claveItem(i.productoId, i.varianteId) === clave)
    if (existente) {
      existente.cantidad = Math.min(existente.cantidad + item.cantidad, item.stockMax)
    } else {
      items.value.push({ ...item, cantidad: Math.min(item.cantidad, item.stockMax) })
    }
  }

  function cambiarCantidad(productoId: string, varianteId: string | undefined, cantidad: number) {
    const clave = claveItem(productoId, varianteId)
    const item = items.value.find((i) => claveItem(i.productoId, i.varianteId) === clave)
    if (!item) return
    item.cantidad = Math.max(1, Math.min(cantidad, item.stockMax))
  }

  function quitar(productoId: string, varianteId?: string) {
    const clave = claveItem(productoId, varianteId)
    items.value = items.value.filter((i) => claveItem(i.productoId, i.varianteId) !== clave)
  }

  function vaciar() {
    items.value = []
  }

  function abrir() {
    abierto.value = true
  }
  function cerrar() {
    abierto.value = false
  }

  return {
    items,
    abierto,
    cantidadTotal,
    subtotal,
    vacio,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    abrir,
    cerrar,
  }
})
