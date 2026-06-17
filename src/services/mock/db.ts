import type {
  Categoria,
  Producto,
  Usuario,
  Pedido,
  Conversacion,
  Notificacion,
} from '@/types'

/**
 * Base de datos MOCK en memoria.
 * Imita lo que más adelante devolverá MongoDB a través del backend Nest.
 * Los servicios trabajan SIEMPRE sobre copias de estos datos.
 */

const img = (seed: string) => `https://picsum.photos/seed/${seed}/700/700`

export const categorias: Categoria[] = [
  {
    id: 'cat-ropa',
    nombre: 'Ropa',
    slug: 'ropa',
    descripcion: 'Camisetas, hoodies y más.',
    activa: true,
    atributos: [
      {
        clave: 'talla',
        etiqueta: 'Talla',
        tipo: 'seleccion',
        opciones: ['XS', 'S', 'M', 'L', 'XL'],
        requerido: true,
        generaVariante: true,
      },
      {
        clave: 'color',
        etiqueta: 'Color',
        tipo: 'color',
        opciones: ['Negro', 'Blanco', 'Azul', 'Gris'],
        requerido: true,
        generaVariante: true,
      },
      {
        clave: 'material',
        etiqueta: 'Material',
        tipo: 'texto',
        requerido: false,
        generaVariante: false,
      },
    ],
  },
  {
    id: 'cat-tazas',
    nombre: 'Tazas',
    slug: 'tazas',
    descripcion: 'Tazas para todos los gustos.',
    activa: true,
    atributos: [
      {
        clave: 'capacidad',
        etiqueta: 'Capacidad',
        tipo: 'seleccion',
        opciones: ['300 ml', '350 ml', '450 ml'],
        requerido: true,
        generaVariante: true,
      },
      {
        clave: 'material',
        etiqueta: 'Material',
        tipo: 'seleccion',
        opciones: ['Cerámica', 'Vidrio', 'Acero'],
        requerido: true,
        generaVariante: false,
      },
    ],
  },
  {
    id: 'cat-libros',
    nombre: 'Libros',
    slug: 'libros',
    descripcion: 'Lecturas seleccionadas.',
    activa: true,
    atributos: [
      { clave: 'autor', etiqueta: 'Autor', tipo: 'texto', requerido: true, generaVariante: false },
      { clave: 'isbn', etiqueta: 'ISBN', tipo: 'texto', requerido: false, generaVariante: false },
      {
        clave: 'paginas',
        etiqueta: 'Páginas',
        tipo: 'numero',
        requerido: false,
        generaVariante: false,
      },
    ],
  },
]

export const productos: Producto[] = [
  {
    id: 'prod-camiseta',
    nombre: 'Camiseta TDH Classic',
    slug: 'camiseta-tdh-classic',
    descripcion:
      'Camiseta de algodón 100% con el logo de TDH merch. Cómoda, fresca y para uso diario.',
    categoriaId: 'cat-ropa',
    precioBase: 18.9,
    destacado: true,
    activo: true,
    creadoEn: '2026-05-01T10:00:00.000Z',
    atributos: [{ clave: 'material', valor: 'Algodón 100%' }],
    imagenes: [
      { id: 'i1', url: img('camiseta1'), alt: 'Camiseta TDH frente' },
      { id: 'i2', url: img('camiseta2'), alt: 'Camiseta TDH espalda' },
      { id: 'i3', url: img('camiseta3'), alt: 'Camiseta TDH detalle' },
    ],
    variantes: [
      {
        id: 'v-cam-m-negro',
        sku: 'CAM-M-NEG',
        precio: 18.9,
        stock: 12,
        atributos: [
          { clave: 'talla', valor: 'M' },
          { clave: 'color', valor: 'Negro' },
        ],
      },
      {
        id: 'v-cam-l-negro',
        sku: 'CAM-L-NEG',
        precio: 18.9,
        stock: 7,
        atributos: [
          { clave: 'talla', valor: 'L' },
          { clave: 'color', valor: 'Negro' },
        ],
      },
      {
        id: 'v-cam-m-blanco',
        sku: 'CAM-M-BLA',
        precio: 18.9,
        stock: 0,
        atributos: [
          { clave: 'talla', valor: 'M' },
          { clave: 'color', valor: 'Blanco' },
        ],
      },
    ],
  },
  {
    id: 'prod-hoodie',
    nombre: 'Hoodie TDH Oversize',
    slug: 'hoodie-tdh-oversize',
    descripcion: 'Hoodie con capucha, corte oversize y felpa interior. Abriga sin pesar.',
    categoriaId: 'cat-ropa',
    precioBase: 39.9,
    destacado: true,
    activo: true,
    creadoEn: '2026-05-10T10:00:00.000Z',
    atributos: [{ clave: 'material', valor: 'Algodón + poliéster' }],
    imagenes: [
      { id: 'i1', url: img('hoodie1'), alt: 'Hoodie TDH frente' },
      { id: 'i2', url: img('hoodie2'), alt: 'Hoodie TDH detalle' },
    ],
    variantes: [
      {
        id: 'v-hood-m-gris',
        sku: 'HOOD-M-GRI',
        precio: 39.9,
        stock: 9,
        atributos: [
          { clave: 'talla', valor: 'M' },
          { clave: 'color', valor: 'Gris' },
        ],
      },
      {
        id: 'v-hood-l-azul',
        sku: 'HOOD-L-AZU',
        precio: 39.9,
        stock: 5,
        atributos: [
          { clave: 'talla', valor: 'L' },
          { clave: 'color', valor: 'Azul' },
        ],
      },
    ],
  },
  {
    id: 'prod-taza',
    nombre: 'Taza TDH Logo',
    slug: 'taza-tdh-logo',
    descripcion: 'Taza de cerámica con el logo de TDH merch. Apta para microondas.',
    categoriaId: 'cat-tazas',
    precioBase: 9.5,
    destacado: false,
    activo: true,
    creadoEn: '2026-05-15T10:00:00.000Z',
    atributos: [{ clave: 'material', valor: 'Cerámica' }],
    imagenes: [
      { id: 'i1', url: img('taza1'), alt: 'Taza TDH' },
      { id: 'i2', url: img('taza2'), alt: 'Taza TDH detalle' },
    ],
    variantes: [
      {
        id: 'v-taza-350',
        sku: 'TAZ-350',
        precio: 9.5,
        stock: 30,
        atributos: [{ clave: 'capacidad', valor: '350 ml' }],
      },
      {
        id: 'v-taza-450',
        sku: 'TAZ-450',
        precio: 11.5,
        stock: 18,
        atributos: [{ clave: 'capacidad', valor: '450 ml' }],
      },
    ],
  },
  {
    id: 'prod-libro',
    nombre: 'Guía del Emprendedor Digital',
    slug: 'guia-emprendedor-digital',
    descripcion: 'Un libro práctico para lanzar tu negocio en línea desde cero.',
    categoriaId: 'cat-libros',
    precioBase: 24.0,
    destacado: true,
    activo: true,
    creadoEn: '2026-05-20T10:00:00.000Z',
    stockSimple: 25,
    atributos: [
      { clave: 'autor', valor: 'María Gómez' },
      { clave: 'isbn', valor: '978-9942-00-123-4' },
      { clave: 'paginas', valor: 240 },
    ],
    imagenes: [{ id: 'i1', url: img('libro1'), alt: 'Portada del libro' }],
    variantes: [],
  },
]

export const usuarios: Usuario[] = [
  {
    id: 'user-cliente',
    nombre: 'Juan Pérez',
    email: 'cliente@tdh.com',
    rol: 'cliente',
    telefono: '0991234567',
    activo: true,
    creadoEn: '2026-05-02T08:00:00.000Z',
    direcciones: [
      {
        id: 'dir-1',
        etiqueta: 'Casa',
        nombreReceptor: 'Juan Pérez',
        telefono: '0991234567',
        pais: 'Ecuador',
        provincia: 'Pichincha',
        ciudad: 'Quito',
        calle: 'Av. Amazonas N34-120 y Av. Naciones Unidas',
        referencia: 'Edificio azul, piso 3',
        predeterminada: true,
      },
    ],
  },
  {
    id: 'user-admin',
    nombre: 'Ana Admin',
    email: 'admin@tdh.com',
    rol: 'admin',
    telefono: '0987654321',
    activo: true,
    creadoEn: '2026-04-20T08:00:00.000Z',
    direcciones: [],
  },
  {
    id: 'user-super',
    nombre: 'Super Admin',
    email: 'super@tdh.com',
    rol: 'superadmin',
    activo: true,
    creadoEn: '2026-04-01T08:00:00.000Z',
    direcciones: [],
  },
]

export const pedidos: Pedido[] = [
  {
    id: 'ped-1',
    codigo: 'TDH-0001',
    clienteId: 'user-cliente',
    estado: 'en_camino',
    metodoPagoPreferido: 'efectivo',
    subtotal: 58.8,
    envio: 3.0,
    total: 61.8,
    creadoEn: '2026-06-10T14:30:00.000Z',
    actualizadoEn: '2026-06-14T09:00:00.000Z',
    direccionEntrega: {
      id: 'dir-1',
      etiqueta: 'Casa',
      nombreReceptor: 'Juan Pérez',
      telefono: '0991234567',
      pais: 'Ecuador',
      provincia: 'Pichincha',
      ciudad: 'Quito',
      calle: 'Av. Amazonas N34-120 y Av. Naciones Unidas',
      referencia: 'Edificio azul, piso 3',
      predeterminada: true,
    },
    items: [
      {
        productoId: 'prod-camiseta',
        varianteId: 'v-cam-m-negro',
        nombreProducto: 'Camiseta TDH Classic',
        atributos: [
          { clave: 'talla', valor: 'M' },
          { clave: 'color', valor: 'Negro' },
        ],
        imagen: img('camiseta1'),
        precioUnitario: 18.9,
        cantidad: 1,
      },
      {
        productoId: 'prod-hoodie',
        varianteId: 'v-hood-m-gris',
        nombreProducto: 'Hoodie TDH Oversize',
        atributos: [
          { clave: 'talla', valor: 'M' },
          { clave: 'color', valor: 'Gris' },
        ],
        imagen: img('hoodie1'),
        precioUnitario: 39.9,
        cantidad: 1,
      },
    ],
    historialEstados: [
      { estado: 'pendiente', fecha: '2026-06-10T14:30:00.000Z' },
      { estado: 'en_preparacion', fecha: '2026-06-11T10:00:00.000Z' },
      { estado: 'listo_para_envio', fecha: '2026-06-12T16:00:00.000Z' },
      { estado: 'en_camino', fecha: '2026-06-14T09:00:00.000Z', nota: 'Despachado a Quito' },
    ],
  },
  {
    id: 'ped-2',
    codigo: 'TDH-0002',
    clienteId: 'user-cliente',
    estado: 'entregado',
    metodoPagoPreferido: 'transferencia',
    subtotal: 9.5,
    envio: 3.0,
    total: 12.5,
    creadoEn: '2026-05-28T11:00:00.000Z',
    actualizadoEn: '2026-06-01T13:00:00.000Z',
    direccionEntrega: {
      id: 'dir-1',
      etiqueta: 'Casa',
      nombreReceptor: 'Juan Pérez',
      telefono: '0991234567',
      pais: 'Ecuador',
      provincia: 'Pichincha',
      ciudad: 'Quito',
      calle: 'Av. Amazonas N34-120 y Av. Naciones Unidas',
      predeterminada: true,
    },
    items: [
      {
        productoId: 'prod-taza',
        varianteId: 'v-taza-350',
        nombreProducto: 'Taza TDH Logo',
        atributos: [{ clave: 'capacidad', valor: '350 ml' }],
        imagen: img('taza1'),
        precioUnitario: 9.5,
        cantidad: 1,
      },
    ],
    historialEstados: [
      { estado: 'pendiente', fecha: '2026-05-28T11:00:00.000Z' },
      { estado: 'en_preparacion', fecha: '2026-05-29T10:00:00.000Z' },
      { estado: 'en_camino', fecha: '2026-05-31T08:00:00.000Z' },
      { estado: 'entregado', fecha: '2026-06-01T13:00:00.000Z' },
    ],
  },
]

export const conversaciones: Conversacion[] = [
  {
    pedidoId: 'ped-1',
    codigoPedido: 'TDH-0001',
    clienteId: 'user-cliente',
    clienteNombre: 'Juan Pérez',
    actualizadoEn: '2026-06-14T10:15:00.000Z',
    mensajes: [
      {
        id: 'msg-1',
        pedidoId: 'ped-1',
        autor: 'cliente',
        autorNombre: 'Juan Pérez',
        texto: 'Hola, ¿cuándo llegaría mi pedido aproximadamente?',
        leido: true,
        fecha: '2026-06-14T10:00:00.000Z',
      },
      {
        id: 'msg-2',
        pedidoId: 'ped-1',
        autor: 'admin',
        autorNombre: 'Ana (TDH merch)',
        texto: '¡Hola Juan! Tu pedido ya está en camino a Quito, llegaría en 1-2 días.',
        leido: true,
        fecha: '2026-06-14T10:15:00.000Z',
      },
    ],
  },
]

export const notificaciones: Notificacion[] = [
  {
    id: 'not-1',
    usuarioId: 'user-cliente',
    tipo: 'pedido',
    titulo: 'Tu pedido va en camino',
    detalle: 'El pedido TDH-0001 está en camino a tu dirección.',
    leida: false,
    fecha: '2026-06-14T09:00:00.000Z',
    enlace: '/cuenta/pedidos/ped-1',
  },
  {
    id: 'not-2',
    usuarioId: 'user-cliente',
    tipo: 'mensaje',
    titulo: 'Nueva respuesta de soporte',
    detalle: 'Ana respondió tu consulta sobre el pedido TDH-0001.',
    leida: false,
    fecha: '2026-06-14T10:15:00.000Z',
    enlace: '/cuenta/pedidos/ped-1',
  },
]
