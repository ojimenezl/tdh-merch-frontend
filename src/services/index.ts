/**
 * Capa de servicios (API) de TDH merch.
 *
 * Los componentes y stores SIEMPRE consumen datos desde aquí, nunca directo.
 * Hoy devuelve datos mock; cuando el backend Nest esté listo, solo se cambia
 * la implementación interna (ver `config.ts` -> USAR_MOCK).
 */
export { catalogService } from './catalog.service'
export { authService } from './auth.service'
export { ordersService } from './orders.service'
export { messagesService } from './messages.service'
export { notificationsService } from './notifications.service'
export { USAR_MOCK, API_BASE_URL } from './config'
