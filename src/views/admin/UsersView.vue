<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { adminUsersService, type DatosNuevoUsuario } from '@/services/adminUsers.service'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { formatearFecha } from '@/lib/format'
import type { Usuario, RolUsuario } from '@/types'
import { Search, Plus, Edit, Trash2, UserCheck, UserX, X, Users } from '@lucide/vue'

const auth = useAuthStore()
const router = useRouter()

const usuarios = ref<Usuario[]>([])
const cargando = ref(true)
const busqueda = ref('')
const filtroRol = ref<RolUsuario | 'todos'>('todos')
const filtroActivo = ref<'todos' | 'activos' | 'bloqueados'>('todos')

const mostrarModal = ref(false)
const editandoId = ref<string | null>(null)
const guardando = ref(false)
const formUsuario = ref<DatosNuevoUsuario>({
  nombre: '',
  email: '',
  telefono: '',
  rol: 'cliente',
})

const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    resultado = resultado.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.telefono && u.telefono.includes(q))
    )
  }

  if (filtroRol.value !== 'todos') {
    resultado = resultado.filter((u) => u.rol === filtroRol.value)
  }

  if (filtroActivo.value === 'activos') {
    resultado = resultado.filter((u) => u.activo)
  } else if (filtroActivo.value === 'bloqueados') {
    resultado = resultado.filter((u) => !u.activo)
  }

  return resultado
})

const contadores = computed(() => ({
  total: usuarios.value.length,
  clientes: usuarios.value.filter((u) => u.rol === 'cliente').length,
  admins: usuarios.value.filter((u) => u.rol === 'admin').length,
  superadmins: usuarios.value.filter((u) => u.rol === 'superadmin').length,
  activos: usuarios.value.filter((u) => u.activo).length,
  bloqueados: usuarios.value.filter((u) => !u.activo).length,
}))

async function cargar() {
  cargando.value = true
  try {
    usuarios.value = await adminUsersService.listar()
  } finally {
    cargando.value = false
  }
}

function abrirModalCrear() {
  editandoId.value = null
  formUsuario.value = { nombre: '', email: '', telefono: '', rol: 'cliente' }
  mostrarModal.value = true
}

function abrirModalEditar(u: Usuario) {
  editandoId.value = u.id
  formUsuario.value = {
    nombre: u.nombre,
    email: u.email,
    telefono: u.telefono ?? '',
    rol: u.rol,
  }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
  editandoId.value = null
}

async function guardarUsuario() {
  if (!formUsuario.value.nombre.trim() || !formUsuario.value.email.trim()) {
    alert('Nombre y email son obligatorios')
    return
  }

  guardando.value = true
  try {
    if (editandoId.value) {
      await adminUsersService.actualizar(editandoId.value, formUsuario.value)
    } else {
      await adminUsersService.crear(formUsuario.value)
    }
    cerrarModal()
    await cargar()
  } catch (e) {
    alert('Error: ' + (e instanceof Error ? e.message : String(e)))
  } finally {
    guardando.value = false
  }
}

async function toggleActivo(u: Usuario) {
  try {
    await adminUsersService.toggleActivo(u.id)
    await cargar()
  } catch (e) {
    alert('Error: ' + (e instanceof Error ? e.message : String(e)))
  }
}

async function cambiarRol(u: Usuario, nuevoRol: string) {
  try {
    await adminUsersService.actualizar(u.id, { rol: nuevoRol as RolUsuario })
    await cargar()
  } catch (e) {
    alert('Error: ' + (e instanceof Error ? e.message : String(e)))
  }
}

async function eliminar(u: Usuario) {
  if (u.id === auth.usuario?.id) {
    alert('No puedes eliminarte a ti mismo')
    return
  }
  if (!confirm(`¿Eliminar al usuario "${u.nombre}"?`)) return
  try {
    await adminUsersService.eliminar(u.id)
    await cargar()
  } catch (e) {
    alert('Error: ' + (e instanceof Error ? e.message : String(e)))
  }
}

const rolBadgeClass = (rol: RolUsuario) => {
  switch (rol) {
    case 'superadmin':
      return 'bg-accent text-accent-contrast'
    case 'admin':
      return 'bg-success/10 text-success'
    default:
      return 'bg-muted/10 text-muted'
  }
}

onMounted(() => {
  if (!auth.esSuperadmin) router.push({ name: 'admin-dashboard' })
  cargar()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-display text-3xl uppercase text-fg">Usuarios</h1>
      <button
        @click="abrirModalCrear"
        class="flex items-center gap-2 bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast"
      >
        <Plus class="h-4 w-4" />
        Nuevo usuario
      </button>
    </div>

    <!-- Stats -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ contadores.total }}</div>
        <div class="text-xs text-muted uppercase">Total</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ contadores.clientes }}</div>
        <div class="text-xs text-muted uppercase">Clientes</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ contadores.admins }}</div>
        <div class="text-xs text-muted uppercase">Admins</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl">{{ contadores.superadmins }}</div>
        <div class="text-xs text-muted uppercase">Superadmins</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl text-success">{{ contadores.activos }}</div>
        <div class="text-xs text-muted uppercase">Activos</div>
      </div>
      <div class="border-2 border-line p-3 text-center">
        <div class="font-display text-2xl text-danger">{{ contadores.bloqueados }}</div>
        <div class="text-xs text-muted uppercase">Bloqueados</div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="mb-6 space-y-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          class="w-full border-2 border-line bg-bg pl-10 pr-4 py-2 text-sm"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <select v-model="filtroRol" class="border-2 border-line bg-bg px-3 py-1.5 text-xs font-bold uppercase">
          <option value="todos">Todos los roles</option>
          <option value="cliente">Clientes</option>
          <option value="admin">Admins</option>
          <option value="superadmin">Superadmins</option>
        </select>
        <select v-model="filtroActivo" class="border-2 border-line bg-bg px-3 py-1.5 text-xs font-bold uppercase">
          <option value="todos">Todos</option>
          <option value="activos">Solo activos</option>
          <option value="bloqueados">Solo bloqueados</option>
        </select>
      </div>
    </div>

    <!-- Lista -->
    <div v-if="cargando" class="space-y-3">
      <div v-for="n in 4" :key="n" class="h-20 animate-pulse border-2 border-line bg-surface" />
    </div>

    <div v-else-if="usuariosFiltrados.length === 0" class="border-2 border-dashed border-line p-8 text-center">
      <Users class="mx-auto h-12 w-12 text-muted mb-4" />
      <p class="text-muted">No hay usuarios que coincidan con los filtros</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="u in usuariosFiltrados"
        :key="u.id"
        :class="[
          'border-2 p-4 transition-colors',
          u.activo ? 'border-line bg-surface' : 'border-danger/30 bg-danger/5'
        ]"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center text-sm font-bold uppercase',
                u.activo ? 'bg-accent/10 text-accent' : 'bg-danger/10 text-danger'
              ]"
            >
              {{ u.nombre.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-display text-sm uppercase text-fg">{{ u.nombre }}</span>
                <span :class="rolBadgeClass(u.rol)" class="px-2 py-0.5 text-xs font-bold uppercase">
                  {{ u.rol }}
                </span>
                <span v-if="!u.activo" class="px-2 py-0.5 text-xs font-bold uppercase bg-danger text-danger-contrast">
                  Bloqueado
                </span>
              </div>
              <div class="text-xs text-muted">
                {{ u.email }}
                <span v-if="u.telefono"> · {{ u.telefono }}</span>
              </div>
              <div class="text-xs text-muted">Creado: {{ formatearFecha(u.creadoEn) }}</div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <select
              :value="u.rol"
              @change="(e: Event) => cambiarRol(u, (e.target as HTMLSelectElement).value)"
              class="border-2 border-line bg-bg px-2 py-1 text-xs font-bold uppercase"
              :disabled="u.id === auth.usuario?.id"
            >
              <option value="cliente">Cliente</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>

            <button
              @click="toggleActivo(u)"
              :class="[
                'p-2 border-2 transition-colors',
                u.activo
                  ? 'border-success text-success hover:bg-success/10'
                  : 'border-danger text-danger hover:bg-danger/10'
              ]"
              :title="u.activo ? 'Bloquear usuario' : 'Activar usuario'"
              :disabled="u.id === auth.usuario?.id"
            >
              <UserCheck v-if="u.activo" class="h-4 w-4" />
              <UserX v-else class="h-4 w-4" />
            </button>

            <button
              @click="abrirModalEditar(u)"
              class="p-2 border-2 border-line text-fg hover:bg-bg transition-colors"
              title="Editar"
            >
              <Edit class="h-4 w-4" />
            </button>

            <button
              @click="eliminar(u)"
              class="p-2 border-2 border-line text-danger hover:bg-danger/10 transition-colors"
              title="Eliminar"
              :disabled="u.id === auth.usuario?.id"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar -->
    <Teleport to="body">
      <div
        v-if="mostrarModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="cerrarModal"
      >
        <div class="w-full max-w-md border-2 border-line bg-bg p-6">
          <div class="mb-6 flex items-center justify-between">
            <h2 class="font-display text-xl uppercase text-fg">
              {{ editandoId ? 'Editar Usuario' : 'Nuevo Usuario' }}
            </h2>
            <button @click="cerrarModal" class="text-muted hover:text-fg">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Nombre *</label>
              <input
                v-model="formUsuario.nombre"
                class="w-full border-2 border-line bg-surface px-3 py-2"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Email *</label>
              <input
                v-model="formUsuario.email"
                type="email"
                class="w-full border-2 border-line bg-surface px-3 py-2"
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Teléfono</label>
              <input
                v-model="formUsuario.telefono"
                class="w-full border-2 border-line bg-surface px-3 py-2"
                placeholder="0991234567"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-muted mb-1">Rol</label>
              <select v-model="formUsuario.rol" class="w-full border-2 border-line bg-surface px-3 py-2">
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div v-if="!editandoId">
              <label class="block text-xs font-bold uppercase text-muted mb-1">Contraseña</label>
              <input
                v-model="formUsuario.password"
                type="password"
                class="w-full border-2 border-line bg-surface px-3 py-2"
                placeholder="••••••••"
              />
              <p class="text-xs text-muted mt-1">Se enviará un email para establecer la contraseña (en producción)</p>
            </div>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              @click="guardarUsuario"
              :disabled="guardando"
              class="flex-1 bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : (editandoId ? 'Guardar cambios' : 'Crear usuario') }}
            </button>
            <button
              @click="cerrarModal"
              class="px-4 py-2 border-2 border-line text-sm font-bold uppercase"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
