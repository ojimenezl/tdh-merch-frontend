import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'Inicio' },
      },
      {
        path: 'catalogo',
        name: 'catalogo',
        component: () => import('@/views/CatalogView.vue'),
        meta: { title: 'Catálogo' },
      },
      {
        path: 'producto/:slug',
        name: 'producto',
        component: () => import('@/views/ProductDetailView.vue'),
        meta: { title: 'Producto' },
      },
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: 'Iniciar sesión', soloInvitados: true },
      },
      {
        path: 'registro',
        name: 'registro',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { title: 'Crear cuenta', soloInvitados: true },
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: () => import('@/views/CheckoutView.vue'),
        meta: { title: 'Checkout', requiereAuth: true },
      },
      {
        path: 'contacto',
        name: 'contacto',
        component: () => import('@/views/ContactView.vue'),
        meta: { title: 'Contacto' },
      },
      {
        path: 'cuenta',
        component: () => import('@/layouts/AccountLayout.vue'),
        meta: { requiereAuth: true },
        children: [
          {
            path: '',
            redirect: { name: 'mis-pedidos' },
          },
          {
            path: 'pedidos',
            name: 'mis-pedidos',
            component: () => import('@/views/account/MyOrdersView.vue'),
            meta: { title: 'Mis pedidos', requiereAuth: true },
          },
          {
            path: 'pedidos/:id',
            name: 'detalle-pedido',
            component: () => import('@/views/account/OrderDetailView.vue'),
            meta: { title: 'Detalle del pedido', requiereAuth: true },
          },
          {
            path: 'notificaciones',
            name: 'mis-notificaciones',
            component: () => import('@/views/account/NotificationsView.vue'),
            meta: { title: 'Notificaciones', requiereAuth: true },
          },
          {
            path: 'perfil',
            name: 'mi-perfil',
            component: () => import('@/views/account/ProfileView.vue'),
            meta: { title: 'Mi perfil', requiereAuth: true },
          },
        ],
      },
      {
        path: 'checkout/confirmacion/:id',
        name: 'confirmacion',
        component: () => import('@/views/OrderConfirmView.vue'),
        meta: { title: 'Pedido confirmado', requiereAuth: true },
      },
      {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Página no encontrada' },
      },
      {
        path: 'admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiereAdmin: true },
        children: [
          { path: '', name: 'admin-dashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: 'Dashboard', requiereAdmin: true } },
          { path: 'productos', name: 'admin-productos', component: () => import('@/views/admin/ProductsView.vue'), meta: { title: 'Productos', requiereAdmin: true } },
          { path: 'productos/nuevo', name: 'admin-producto-nuevo', component: () => import('@/views/admin/ProductFormView.vue'), meta: { title: 'Crear producto', requiereAdmin: true } },
          { path: 'productos/:id', name: 'admin-producto-edit', component: () => import('@/views/admin/ProductFormView.vue'), meta: { title: 'Editar producto', requiereAdmin: true } },
          { path: 'pedidos', name: 'admin-pedidos', component: () => import('@/views/admin/OrdersView.vue'), meta: { title: 'Pedidos', requiereAdmin: true } },
          { path: 'pedidos/:id', name: 'admin-pedido-detalle', component: () => import('@/views/admin/OrderDetailAdminView.vue'), meta: { title: 'Detalle del pedido', requiereAdmin: true } },
          { path: 'mensajes', name: 'admin-mensajes', component: () => import('@/views/admin/MessagesAdminView.vue'), meta: { title: 'Mensajes', requiereAdmin: true } },
          { path: 'notificaciones', name: 'admin-notificaciones', component: () => import('@/views/admin/NotificationsAdminView.vue'), meta: { title: 'Notificaciones', requiereAdmin: true } },
          { path: 'usuarios', name: 'admin-usuarios', component: () => import('@/views/admin/UsersView.vue'), meta: { title: 'Usuarios', requiereSuperadmin: true } },
          { path: 'categorias', name: 'admin-categorias', component: () => import('@/views/admin/CategoriesView.vue'), meta: { title: 'Categorías', requiereSuperadmin: true } },
          { path: 'categorias/nuevo', name: 'admin-categoria-nuevo', component: () => import('@/views/admin/CategoryFormView.vue'), meta: { title: 'Crear categoría', requiereSuperadmin: true } },
          { path: 'categorias/:id', name: 'admin-categoria-edit', component: () => import('@/views/admin/CategoryFormView.vue'), meta: { title: 'Editar categoría', requiereSuperadmin: true } },
          { path: 'auditoria', name: 'admin-auditoria', component: () => import('@/views/admin/AuditMessagesView.vue'), meta: { title: 'Auditoría', requiereSuperadmin: true } },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Guard de autenticación: protege rutas y evita ver login estando logueado.
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiereAuth && !auth.estaAutenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.soloInvitados && auth.estaAutenticado) {
    return { name: 'home' }
  }
  // Rutas de admin
  if (to.meta.requiereAdmin && !(auth.esAdmin || auth.esSuperadmin)) {
    return { name: 'home' }
  }
  // Rutas de superadmin
  if (to.meta.requiereSuperadmin && !auth.esSuperadmin) {
    return { name: 'admin-dashboard' }
  }
})

router.afterEach((to) => {
  const base = 'TDH merch'
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · ${base}` : base
})

export default router
