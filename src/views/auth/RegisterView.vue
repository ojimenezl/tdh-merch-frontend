<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { UserPlus } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const nombre = ref('')
const email = ref('')
const telefono = ref('')
const password = ref('')

async function enviar() {
  try {
    await auth.registro({
      nombre: nombre.value,
      email: email.value,
      telefono: telefono.value || undefined,
      password: password.value,
    })
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // El error se muestra desde auth.error
  }
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16">
    <div class="border-2 border-fg bg-surface p-8 shadow-[8px_8px_0_0_var(--accent)]">
      <h1 class="font-display text-4xl uppercase text-fg">Crear cuenta</h1>
      <p class="mt-1 text-sm text-muted">Regístrate para comprar y seguir tus pedidos.</p>

      <form class="mt-6 space-y-4" @submit.prevent="enviar">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">Nombre completo</label>
          <input
            v-model="nombre"
            type="text"
            required
            placeholder="Tu nombre"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">Teléfono (opcional)</label>
          <input
            v-model="telefono"
            type="tel"
            placeholder="0991234567"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">Contraseña</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="4"
            placeholder="••••••••"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>

        <p v-if="auth.error" class="border-2 border-danger px-3 py-2 text-sm font-bold uppercase text-danger">
          {{ auth.error }}
        </p>

        <button
          type="submit"
          :disabled="auth.cargando"
          class="flex w-full items-center justify-center gap-2 bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:opacity-50"
        >
          <UserPlus class="h-4 w-4" />
          {{ auth.cargando ? 'Creando cuenta...' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-muted">
        ¿Ya tienes cuenta?
        <RouterLink
          :to="{ name: 'login', query: route.query }"
          class="font-bold uppercase text-accent hover:underline"
        >
          Inicia sesión
        </RouterLink>
      </p>
    </div>
  </div>
</template>
