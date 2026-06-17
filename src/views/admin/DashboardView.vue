<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminStatsService, type AdminStats, type ProductoStockBajo, type SuperadminStats } from '@/services/adminStats.service'
import { formatearPrecio, formatearFecha } from '@/lib/format'
import { ESTADOS_PEDIDO } from '@/lib/orderStatus'
import type { Pedido } from '@/types'
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Users,
  Layers,
  BarChart3,
} from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()

const cargando = ref(true)
const stats = ref<AdminStats | null>(null)
const stockBajo = ref<ProductoStockBajo[]>([])
const pedidosRecientes = ref<Pedido[]>([])
const superadminStats = ref<SuperadminStats | null>(null)

async function cargar() {
  cargando.value = true
  try {
    const promesas: Promise<unknown>[] = [
      adminStatsService.obtenerResumen(),
      adminStatsService.obtenerProductosStockBajo(),
      adminStatsService.obtenerPedidosRecientes(),
    ]
    
    if (auth.esSuperadmin) {
      promesas.push(adminStatsService.obtenerStatsSuperadmin())
    }

    const resultados = await Promise.all(promesas)
    stats.value = resultados[0] as AdminStats
    stockBajo.value = resultados[1] as ProductoStockBajo[]
    pedidosRecientes.value = resultados[2] as Pedido[]
    
    if (auth.esSuperadmin && resultados[3]) {
      superadminStats.value = resultados[3] as SuperadminStats
    }
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div>
    <h1 class="font-display text-3xl uppercase text-fg mb-6">Dashboard</h1>

    <!-- Stats Grid -->
    <div v-if="cargando" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 6" :key="n" class="h-28 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else-if="stats" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Pedidos Hoy -->
      <div class="border-2 border-line bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-accent/10 text-accent">
            <ShoppingCart class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Pedidos Hoy</div>
            <div class="font-display text-2xl text-fg">{{ stats.pedidosHoy }}</div>
          </div>
        </div>
      </div>

      <!-- Pedidos Pendientes -->
      <div class="border-2 border-line bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-warning/10 text-warning">
            <Package class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Pendientes</div>
            <div class="font-display text-2xl text-fg">{{ stats.pedidosPendientes }}</div>
          </div>
        </div>
      </div>

      <!-- Stock Bajo -->
      <RouterLink to="/admin/productos" class="border-2 border-line bg-surface p-4 hover:border-danger transition-colors">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-danger/10 text-danger">
            <AlertTriangle class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Stock Bajo</div>
            <div class="font-display text-2xl text-fg">{{ stats.productosStockBajo }}</div>
          </div>
        </div>
      </RouterLink>

      <!-- Ventas Hoy -->
      <div class="border-2 border-line bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-success/10 text-success">
            <DollarSign class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Ventas Hoy</div>
            <div class="font-display text-2xl text-fg">{{ formatearPrecio(stats.totalVentasHoy) }}</div>
          </div>
        </div>
      </div>

      <!-- Ventas Mes -->
      <div class="border-2 border-line bg-surface p-4">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-accent/10 text-accent">
            <TrendingUp class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Ventas del Mes</div>
            <div class="font-display text-2xl text-fg">{{ formatearPrecio(stats.totalVentasMes) }}</div>
          </div>
        </div>
      </div>

      <!-- Mensajes Sin Leer -->
      <RouterLink to="/admin/mensajes" class="border-2 border-line bg-surface p-4 hover:border-accent transition-colors">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center bg-accent/10 text-accent">
            <MessageSquare class="h-6 w-6" />
          </div>
          <div>
            <div class="text-xs font-bold uppercase text-muted">Mensajes</div>
            <div class="font-display text-2xl text-fg">{{ stats.conversacionesSinLeer }}</div>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Two columns: Recent Orders + Low Stock -->
    <div class="mt-8 grid gap-6 lg:grid-cols-2">
      <!-- Pedidos Recientes -->
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-xl uppercase text-fg">Pedidos Recientes</h2>
          <RouterLink to="/admin/pedidos" class="text-xs font-bold uppercase text-accent hover:underline">Ver todos</RouterLink>
        </div>
        <div class="space-y-2">
          <div v-for="p in pedidosRecientes" :key="p.id" class="flex items-center justify-between border-2 border-line p-3">
            <div>
              <div class="font-display text-sm">{{ p.codigo }}</div>
              <div class="text-xs text-muted">{{ formatearFecha(p.creadoEn) }}</div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="ESTADOS_PEDIDO[p.estado].badge" class="px-2 py-1 text-xs font-bold uppercase">
                {{ ESTADOS_PEDIDO[p.estado].etiqueta }}
              </span>
              <span class="font-display text-sm">{{ formatearPrecio(p.total) }}</span>
            </div>
          </div>
          <div v-if="pedidosRecientes.length === 0" class="border-2 border-dashed border-line p-4 text-center text-muted">
            No hay pedidos recientes
          </div>
        </div>
      </div>

      <!-- Stock Bajo -->
      <div>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-display text-xl uppercase text-fg">Stock Bajo</h2>
          <RouterLink to="/admin/productos" class="text-xs font-bold uppercase text-accent hover:underline">Ver productos</RouterLink>
        </div>
        <div class="space-y-2">
          <div v-for="item in stockBajo.slice(0, 5)" :key="item.id + item.variante" class="flex items-center justify-between border-2 border-line p-3">
            <div>
              <div class="font-display text-sm">{{ item.nombre }}</div>
              <div class="text-xs text-muted">{{ item.variante }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span :class="item.stock === 0 ? 'bg-danger text-danger-contrast' : 'bg-warning text-warning-contrast'" class="px-2 py-1 text-xs font-bold uppercase">
                {{ item.stock === 0 ? 'Agotado' : `${item.stock} uds` }}
              </span>
            </div>
          </div>
          <div v-if="stockBajo.length === 0" class="border-2 border-dashed border-line p-4 text-center text-muted">
            Todo el stock en buen nivel
          </div>
        </div>
      </div>
    </div>

    <!-- Superadmin Global Stats -->
    <div v-if="auth.esSuperadmin && superadminStats" class="mt-8">
      <h2 class="font-display text-xl uppercase text-fg mb-4 flex items-center gap-2">
        <BarChart3 class="h-5 w-5" />
        Métricas Globales (Superadmin)
      </h2>
      
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Usuarios -->
        <RouterLink to="/admin/usuarios" class="border-2 border-line bg-surface p-4 hover:border-accent transition-colors">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center bg-accent/10 text-accent">
              <Users class="h-5 w-5" />
            </div>
            <div>
              <div class="text-xs font-bold uppercase text-muted">Usuarios</div>
              <div class="font-display text-xl text-fg">{{ superadminStats.totalUsuarios }}</div>
              <div class="text-xs text-muted">
                {{ superadminStats.usuariosActivos }} activos · {{ superadminStats.usuariosBloqueados }} bloqueados
              </div>
            </div>
          </div>
        </RouterLink>

        <!-- Categorías -->
        <RouterLink to="/admin/categorias" class="border-2 border-line bg-surface p-4 hover:border-accent transition-colors">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center bg-success/10 text-success">
              <Layers class="h-5 w-5" />
            </div>
            <div>
              <div class="text-xs font-bold uppercase text-muted">Categorías</div>
              <div class="font-display text-xl text-fg">{{ superadminStats.totalCategorias }}</div>
              <div class="text-xs text-muted">{{ superadminStats.categoriasActivas }} activas</div>
            </div>
          </div>
        </RouterLink>

        <!-- Productos -->
        <RouterLink to="/admin/productos" class="border-2 border-line bg-surface p-4 hover:border-accent transition-colors">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center bg-warning/10 text-warning">
              <Package class="h-5 w-5" />
            </div>
            <div>
              <div class="text-xs font-bold uppercase text-muted">Productos</div>
              <div class="font-display text-xl text-fg">{{ superadminStats.totalProductos }}</div>
              <div class="text-xs text-muted">{{ superadminStats.productosActivos }} activos</div>
            </div>
          </div>
        </RouterLink>

        <!-- Ventas históricas -->
        <div class="border-2 border-line bg-surface p-4">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center bg-success/10 text-success">
              <TrendingUp class="h-5 w-5" />
            </div>
            <div>
              <div class="text-xs font-bold uppercase text-muted">Ventas Históricas</div>
              <div class="font-display text-xl text-fg">{{ formatearPrecio(superadminStats.ventasHistoricas) }}</div>
              <div class="text-xs text-muted">{{ superadminStats.totalPedidos }} pedidos totales</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink to="/admin/usuarios" class="px-4 py-2 border-2 border-line text-sm font-bold uppercase hover:bg-surface transition-colors">
          Gestionar Usuarios
        </RouterLink>
        <RouterLink to="/admin/categorias" class="px-4 py-2 border-2 border-line text-sm font-bold uppercase hover:bg-surface transition-colors">
          Gestionar Categorías
        </RouterLink>
        <RouterLink to="/admin/auditoria" class="px-4 py-2 border-2 border-line text-sm font-bold uppercase hover:bg-surface transition-colors">
          Ver Auditoría
        </RouterLink>
      </div>
    </div>
  </div>
</template>
