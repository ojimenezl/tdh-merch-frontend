<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { messagesService } from '@/services'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const convs = ref<any[]>([])
const cargando = ref(true)
const seleccionado = ref<any | null>(null)
const texto = ref('')

async function cargar() {
  cargando.value = true
  try {
    convs.value = await messagesService.listarConversaciones()
  } finally {
    cargando.value = false
  }
}

async function abrir(conv: any) {
  seleccionado.value = conv
}

async function enviar() {
  if (!seleccionado.value || !texto.value.trim()) return
  await messagesService.enviarMensaje(seleccionado.value.pedidoId, 'admin', auth.usuario?.nombre ?? 'Admin', texto.value.trim())
  texto.value = ''
  await cargar()
}

onMounted(() => {
  if (!auth.esAdmin && !auth.esSuperadmin) router.push({ name: 'home' })
  cargar()
})
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
    <div>
      <h2 class="font-display text-2xl uppercase text-fg mb-4">Conversaciones</h2>
      <div v-if="cargando" class="space-y-2">
        <div v-for="n in 6" :key="n" class="h-16 animate-pulse border-2 border-line bg-surface"></div>
      </div>
      <div v-else class="space-y-2">
        <div v-for="c in convs" :key="c.pedidoId" class="border-2 border-line p-3 cursor-pointer" @click="abrir(c)">
          <div class="flex items-center justify-between">
            <div>
              <div class="font-display text-sm uppercase">{{ c.codigoPedido }}</div>
              <div class="text-xs text-muted">{{ c.clienteNombre }}</div>
            </div>
            <div class="text-xs text-muted">{{ c.actualizadoEn }}</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h2 class="font-display text-2xl uppercase text-fg mb-4">Chat</h2>
      <div v-if="!seleccionado" class="border-2 border-dashed border-line bg-surface p-6 text-center text-muted">
        Selecciona una conversación para ver y responder.
      </div>
      <div v-else class="border-2 border-line bg-surface p-4 flex flex-col gap-3">
        <div class="max-h-64 overflow-y-auto space-y-3">
          <div v-for="m in seleccionado.mensajes" :key="m.id" class="flex" :class="m.autor === 'admin' ? 'justify-end' : 'justify-start'">
            <div :class="m.autor === 'admin' ? 'bg-fg text-bg p-3' : 'border-2 border-line bg-surface p-3'">
              <div class="text-xs font-bold uppercase tracking-wide">{{ m.autorNombre }} · {{ m.fecha }}</div>
              <div class="mt-1 text-sm">{{ m.texto }}</div>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <input v-model="texto" class="flex-1 border-2 border-line bg-bg px-3 py-2 text-sm" placeholder="Escribe una respuesta..." />
          <button @click="enviar" class="bg-accent px-4 py-2 text-sm font-bold uppercase text-accent-contrast">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

