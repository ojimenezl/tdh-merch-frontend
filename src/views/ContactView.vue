<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Send } from '@lucide/vue'
import { messagesService } from '@/services'

const form = reactive({
  nombre: '',
  email: '',
  asunto: '',
  mensaje: '',
})

const enviando = ref(false)
const enviado = ref(false)
const error = ref<string | null>(null)

async function enviar() {
  enviando.value = true
  error.value = null
  try {
    await messagesService.enviarContacto({ ...form })
    enviado.value = true
    form.nombre = ''
    form.email = ''
    form.asunto = ''
    form.mensaje = ''
  } catch {
    error.value = 'No pudimos enviar tu mensaje. Inténtalo de nuevo.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-4 py-14 sm:px-6">
    <div class="mb-8 border-b-2 border-fg pb-5">
      <h1 class="font-display text-5xl uppercase text-fg">Contacto</h1>
      <p class="mt-2 text-sm text-muted">¿Tienes alguna pregunta? Escríbenos.</p>
    </div>

    <!-- Éxito -->
    <div
      v-if="enviado"
      class="border-2 border-ok bg-surface p-8 text-center"
    >
      <p class="font-display text-3xl uppercase text-ok">¡Mensaje enviado!</p>
      <p class="mt-2 text-sm text-muted">Te responderemos lo antes posible.</p>
      <button
        type="button"
        class="mt-5 bg-accent px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
        @click="enviado = false"
      >
        Enviar otro mensaje
      </button>
    </div>

    <!-- Formulario -->
    <form v-else class="space-y-5 border-2 border-line bg-surface p-8" @submit.prevent="enviar">
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Nombre *</label>
          <input
            v-model="form.nombre"
            type="text"
            required
            placeholder="Tu nombre"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Email *</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="tucorreo@ejemplo.com"
            class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Asunto *</label>
        <input
          v-model="form.asunto"
          type="text"
          required
          placeholder="¿En qué te podemos ayudar?"
          class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
        />
      </div>

      <div>
        <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">Mensaje *</label>
        <textarea
          v-model="form.mensaje"
          rows="5"
          required
          placeholder="Escribe tu mensaje aquí..."
          class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
        />
      </div>

      <p v-if="error" class="border-2 border-danger px-4 py-2 text-sm font-bold uppercase text-danger">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="enviando"
        class="flex items-center gap-2 bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:opacity-50"
      >
        <Send class="h-4 w-4" />
        {{ enviando ? 'Enviando...' : 'Enviar mensaje' }}
      </button>
    </form>
  </div>
</template>
