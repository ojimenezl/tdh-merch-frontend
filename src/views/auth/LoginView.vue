<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { LogIn, ShieldCheck, ArrowLeft } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { totpService } from '@/services/totp.service'
import type { Usuario } from '@/types'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const codigoTOTP = ref('')
const error2FA = ref('')

// Estado del flujo: 'credentials' | '2fa'
const paso = ref<'credentials' | '2fa'>('credentials')
const usuarioPendiente = ref<Usuario | null>(null)
const verificando2FA = ref(false)

async function enviarCredenciales() {
  try {
    // Primero validamos las credenciales sin hacer login completo
    const usuario = await auth.validarCredenciales({ email: email.value, password: password.value })
    
    if (!usuario) {
      return // El error se muestra desde auth.error
    }

    // Verificar si requiere 2FA
    const requiere = await totpService.requiere2FA(usuario.id, usuario.rol)
    
    if (requiere) {
      usuarioPendiente.value = usuario
      paso.value = '2fa'
      error2FA.value = ''
    } else {
      // Usuario normal (cliente) - login directo
      await auth.completarLogin(usuario)
      redirigir()
    }
  } catch {
    // El error se muestra desde auth.error
  }
}

async function verificarCodigo() {
  if (!usuarioPendiente.value) return
  
  verificando2FA.value = true
  error2FA.value = ''
  
  try {
    const resultado = await totpService.verificarCodigo(usuarioPendiente.value.id, codigoTOTP.value)
    
    if (resultado.valido) {
      await auth.completarLogin(usuarioPendiente.value)
      redirigir()
    } else {
      error2FA.value = resultado.mensaje || 'Código inválido'
    }
  } catch (e) {
    error2FA.value = 'Error al verificar el código'
  } finally {
    verificando2FA.value = false
  }
}

function volverACredenciales() {
  paso.value = 'credentials'
  usuarioPendiente.value = null
  codigoTOTP.value = ''
  error2FA.value = ''
}

function redirigir() {
  const redirect = (route.query.redirect as string) || '/'
  router.push(redirect)
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col px-4 py-16">
    <div class="border-2 border-fg bg-surface p-8 shadow-[8px_8px_0_0_var(--accent)]">
      
      <!-- Paso 1: Credenciales -->
      <template v-if="paso === 'credentials'">
        <h1 class="font-display text-4xl uppercase text-fg">Iniciar sesión</h1>
        <p class="mt-1 text-sm text-muted">Accede a tu cuenta para comprar y seguir tus pedidos.</p>

        <form class="mt-6 space-y-4" @submit.prevent="enviarCredenciales">
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
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
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
            <LogIn class="h-4 w-4" />
            {{ auth.cargando ? 'Verificando...' : 'Continuar' }}
          </button>
        </form>

        <p class="mt-5 text-center text-sm text-muted">
          ¿No tienes cuenta?
          <RouterLink
            :to="{ name: 'registro', query: route.query }"
            class="font-bold uppercase text-accent hover:underline"
          >
            Regístrate
          </RouterLink>
        </p>

        <!-- Ayuda para el mock -->
        <div class="mt-6 border-2 border-line bg-bg p-3 text-xs text-muted">
          <p class="font-bold uppercase tracking-wide text-fg">Cuentas de prueba (mock):</p>
          <p>cliente@tdh.com · admin@tdh.com · super@tdh.com</p>
          <p>Cualquier contraseña funciona.</p>
          <p class="mt-1 text-accent">Admin/Super requieren código 2FA (cualquier 6 dígitos)</p>
        </div>
      </template>

      <!-- Paso 2: Verificación 2FA -->
      <template v-else-if="paso === '2fa'">
        <button
          type="button"
          @click="volverACredenciales"
          class="mb-4 flex items-center gap-1 text-xs font-bold uppercase text-muted hover:text-fg"
        >
          <ArrowLeft class="h-3 w-3" />
          Volver
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="flex h-12 w-12 items-center justify-center bg-accent/10 text-accent">
            <ShieldCheck class="h-6 w-6" />
          </div>
          <div>
            <h1 class="font-display text-2xl uppercase text-fg">Verificación 2FA</h1>
            <p class="text-xs text-muted">Ingresa el código de tu app authenticator</p>
          </div>
        </div>

        <div class="mb-4 border-2 border-accent/30 bg-accent/5 p-3">
          <p class="text-sm">
            <span class="font-bold">{{ usuarioPendiente?.nombre }}</span>
            <span class="text-muted"> ({{ usuarioPendiente?.rol }})</span>
          </p>
          <p class="text-xs text-muted">{{ usuarioPendiente?.email }}</p>
        </div>

        <form class="space-y-4" @submit.prevent="verificarCodigo">
          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-fg">
              Código de 6 dígitos
            </label>
            <input
              v-model="codigoTOTP"
              type="text"
              inputmode="numeric"
              pattern="\d{6}"
              maxlength="6"
              required
              placeholder="000000"
              autocomplete="one-time-code"
              class="w-full border-2 border-line bg-bg px-3 py-3 text-center font-display text-2xl tracking-[0.5em] text-fg outline-none transition focus:border-accent"
            />
          </div>

          <p v-if="error2FA" class="border-2 border-danger px-3 py-2 text-sm font-bold uppercase text-danger">
            {{ error2FA }}
          </p>

          <button
            type="submit"
            :disabled="verificando2FA || codigoTOTP.length !== 6"
            class="flex w-full items-center justify-center gap-2 bg-accent py-3.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:opacity-50"
          >
            <ShieldCheck class="h-4 w-4" />
            {{ verificando2FA ? 'Verificando...' : 'Verificar código' }}
          </button>
        </form>

        <div class="mt-6 border-2 border-line bg-bg p-3 text-xs text-muted">
          <p class="font-bold uppercase tracking-wide text-fg">Modo de prueba:</p>
          <p>Ingresa cualquier código de 6 dígitos (ej: 123456)</p>
          <p class="mt-1">En producción, usarás Google Authenticator o similar.</p>
        </div>
      </template>

    </div>
  </div>
</template>
