// Catálogo: categorías, atributos configurables, productos y variantes.

// Tipo de dato de un atributo configurable.
export type TipoAtributo = 'texto' | 'numero' | 'seleccion' | 'color' | 'booleano'

/**
 * Definición de un atributo dentro de una categoría.
 * Esto es lo que hace el catálogo "configurable": la categoría Ropa puede
 * definir talla/color, la categoría Libros autor/ISBN, Tazas capacidad, etc.
 */
export interface DefinicionAtributo {
  clave: string // identificador, ej. 'talla'
  etiqueta: string // texto visible, ej. 'Talla'
  tipo: TipoAtributo
  opciones?: string[] // para 'seleccion' o 'color'
  requerido: boolean
  // Si true, este atributo genera variantes con su propio stock (ej. talla, color).
  generaVariante: boolean
}

export interface Categoria {
  id: string
  nombre: string // 'Ropa', 'Tazas', 'Libros'
  slug: string
  descripcion?: string
  atributos: DefinicionAtributo[]
  activa: boolean
}

export interface ImagenProducto {
  id: string
  url: string
  alt: string
}

// Valor concreto de un atributo en un producto o variante.
export interface ValorAtributo {
  clave: string
  valor: string | number | boolean
}

export interface VarianteProducto {
  id: string
  sku: string
  atributos: ValorAtributo[] // ej. talla=M, color=Negro
  precio: number
  stock: number
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  descripcion: string
  categoriaId: string
  precioBase: number
  imagenes: ImagenProducto[]
  // Atributos generales del producto (ej. autor, material) que no generan variante.
  atributos: ValorAtributo[]
  // Variantes con stock individual. Si está vacío, se usa stockSimple.
  variantes: VarianteProducto[]
  stockSimple?: number // stock cuando el producto no tiene variantes
  destacado: boolean
  activo: boolean
  creadoEn: string
}

// Filtros para el listado de catálogo.
export interface FiltrosCatalogo {
  busqueda?: string
  categoriaId?: string
  precioMin?: number
  precioMax?: number
  soloDestacados?: boolean
  orden?: 'recientes' | 'precio_asc' | 'precio_desc' | 'nombre'
}
