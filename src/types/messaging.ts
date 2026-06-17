// Mensajería (chat cliente <-> admin por pedido) y notificaciones.

export type AutorMensaje = 'cliente' | 'admin'

export interface Mensaje {
  id: string
  pedidoId: string
  autor: AutorMensaje
  autorNombre: string
  texto: string
  leido: boolean
  fecha: string
}

// Conversación agrupada por pedido (ping-pong de mensajes).
export interface Conversacion {
  pedidoId: string
  codigoPedido: string
  clienteId: string
  clienteNombre: string
  mensajes: Mensaje[]
  actualizadoEn: string
}

export type TipoNotificacion = 'pedido' | 'mensaje' | 'sistema'

export interface Notificacion {
  id: string
  usuarioId: string
  tipo: TipoNotificacion
  titulo: string
  detalle: string
  leida: boolean
  fecha: string
  enlace?: string // ruta interna a la que lleva la notificación
}

// Mensaje del formulario de contacto (visitante o cliente).
export interface MensajeContacto {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}
