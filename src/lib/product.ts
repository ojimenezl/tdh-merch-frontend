import type { Producto, VarianteProducto } from '@/types'

// Stock total disponible (suma de variantes o stock simple).
export function stockTotal(producto: Producto): number {
  if (producto.variantes.length === 0) return producto.stockSimple ?? 0
  return producto.variantes.reduce((s, v) => s + v.stock, 0)
}

export function hayStock(producto: Producto): boolean {
  return stockTotal(producto) > 0
}

// Claves de atributo que definen variantes (ej. ['talla', 'color']).
export function clavesVariante(producto: Producto): string[] {
  const claves = new Set<string>()
  producto.variantes.forEach((v) => v.atributos.forEach((a) => claves.add(a.clave)))
  return [...claves]
}

// Valores únicos disponibles por cada clave de variante.
export function opcionesPorClave(producto: Producto): Record<string, string[]> {
  const mapa: Record<string, Set<string>> = {}
  producto.variantes.forEach((v) => {
    v.atributos.forEach((a) => {
      mapa[a.clave] ??= new Set()
      mapa[a.clave].add(String(a.valor))
    })
  })
  const res: Record<string, string[]> = {}
  for (const clave of Object.keys(mapa)) res[clave] = [...mapa[clave]]
  return res
}

// Busca la variante que coincide exactamente con la selección del usuario.
export function buscarVariante(
  producto: Producto,
  seleccion: Record<string, string>,
): VarianteProducto | undefined {
  const claves = clavesVariante(producto)
  if (claves.some((c) => !seleccion[c])) return undefined
  return producto.variantes.find((v) =>
    v.atributos.every((a) => seleccion[a.clave] === String(a.valor)),
  )
}

// Indica si una combinación parcial tiene al menos una variante con stock.
export function comboTieneStock(
  producto: Producto,
  clave: string,
  valor: string,
  seleccion: Record<string, string>,
): boolean {
  return producto.variantes.some((v) => {
    const coincideEste = v.atributos.some((a) => a.clave === clave && String(a.valor) === valor)
    if (!coincideEste) return false
    // Respeta el resto de selecciones ya hechas (menos la clave actual).
    const coincideResto = Object.entries(seleccion)
      .filter(([k]) => k !== clave)
      .every(([k, val]) => v.atributos.some((a) => a.clave === k && String(a.valor) === val))
    return coincideResto && v.stock > 0
  })
}
