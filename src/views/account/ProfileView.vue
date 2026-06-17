<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatearFecha } from '@/lib/format'

const auth = useAuthStore()

const form = reactive({
  nombre: auth.usuario?.nombre ?? '',
  email: auth.usuario?.email ?? '',
  telefono: auth.usuario?.telefono ?? '',
})

const guardado = reactive({ ok: false })

// Refresca si el usuario cambia (ej. después de login)
watch(
  () => auth.usuario,
  (u) => {
    if (u) {
      form.nombre = u.nombre
      form.email = u.email
      form.telefono = u.telefono ?? ''
    }
  },
)

function guardar() {
  // En el mock, solo mostramos feedback visual. Con el backend real se llamará a authService.actualizarPerfil().
  guardado.ok = true
  setTimeout(() => (guardado.ok = false), 2500)
}
</script>

<template>
  <div>
    <h2 class="mb-6 font-display text-2xl uppercase text-fg">Mi perfil</h2>

    <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
      <!-- Formulario -->
      <form class="space-y-4 border-2 border-line bg-surface p-6" @submit.prevent="guardar">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Nombre</label>
          <input
            v-model="form.nombre"
            type="text"
            required
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Teléfono</label>
          <input
            v-model="form.telefono"
            type="tel"
            placeholder="0991234567"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>

        <div class="flex items-center gap-4 pt-2">
          <button
            type="submit"
            class="bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
          >
            Guardar cambios
          </button>
          <span
            v-if="guardado.ok"
            class="text-xs font-bold uppercase tracking-wide text-ok"
          >
            ¡Guardado!
          </span>
        </div>
      </form>

      <!-- Info de la cuenta -->
      <div class="space-y-4">
        <div class="border-2 border-line bg-surface p-5">
          <p class="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Tu cuenta</p>
          <div class="flex items-center gap-3">
            <span class="flex h-12 w-12 items-center justify-center bg-accent font-display text-xl text-accent-contrast">
              {{ auth.usuario?.nombre.charAt(0).toUpperCase() }}
            </span>
            <div>
              <p class="font-bold text-fg">{{ auth.usuario?.nombre }}</p>
              <p class="text-xs uppercase tracking-wide text-accent">{{ auth.usuario?.rol }}</p>
            </div>
          </div>
          <div class="mt-4 space-y-1 border-t-2 border-line pt-3 text-xs text-muted">
            <p>Miembro desde: <span class="font-bold text-fg">{{ auth.usuario ? formatearFecha(auth.usuario.creadoEn) : '—' }}</span></p>
            <p>Estado: <span class="font-bold text-ok">Activo</span></p>
          </div>
        </div>

        <!-- Nota mock -->
        <div class="border-2 border-accent bg-accent-soft p-4 text-xs text-fg">
          <p class="font-bold uppercase tracking-wide">Nota (mock)</p>
          <p class="mt-1 text-muted">
            La actualización real del perfil se activa cuando el backend esté conectado.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
