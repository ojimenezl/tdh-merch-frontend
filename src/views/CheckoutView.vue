<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, Package, MapPin, CreditCard } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { ordersService } from '@/services'
import { formatearPrecio } from '@/lib/format'
import type { MetodoPago } from '@/types'

const router = useRouter()
const cart = useCartStore()
const auth = useAuthStore()

// Pasos: 1 = dirección, 2 = método de pago, 3 = confirmación
const paso = ref(1)
const enviando = ref(false)
const errorEnvio = ref<string | null>(null)

const ENVIO = 3.0
const total = computed(() => cart.subtotal + ENVIO)

// Formulario de dirección
const dir = reactive({
  nombreReceptor: auth.usuario?.nombre ?? '',
  telefono: auth.usuario?.telefono ?? '',
  pais: 'Ecuador',
  provincia: '',
  ciudad: '',
  calle: '',
  referencia: '',
})

const metodoPago = ref<MetodoPago>('efectivo')

const provinciasEcuador = [
  'Azuay', 'Bolívar', 'Cañar', 'Carchi', 'Chimborazo', 'Cotopaxi',
  'El Oro', 'Esmeraldas', 'Galápagos', 'Guayas', 'Imbabura', 'Loja',
  'Los Ríos', 'Manabí', 'Morona Santiago', 'Napo', 'Orellana', 'Pastaza',
  'Pichincha', 'Santa Elena', 'Santo Domingo', 'Sucumbíos', 'Tungurahua',
  'Zamora Chinchipe',
]

const pasosConfig = [
  { n: 1, label: 'Dirección', icon: MapPin },
  { n: 2, label: 'Pago', icon: CreditCard },
  { n: 3, label: 'Confirmar', icon: Package },
]

function dirValida() {
  return (
    dir.nombreReceptor.trim() &&
    dir.telefono.trim() &&
    dir.provincia &&
    dir.ciudad.trim() &&
    dir.calle.trim()
  )
}

async function confirmarPedido() {
  if (!auth.usuario) return
  enviando.value = true
  errorEnvio.value = null
  try {
    const pedido = await ordersService.crear(auth.usuario.id, {
      items: cart.items.map((i) => ({
        productoId: i.productoId,
        varianteId: i.varianteId,
        nombreProducto: i.nombreProducto,
        atributos: i.atributos,
        imagen: i.imagen,
        precioUnitario: i.precioUnitario,
        cantidad: i.cantidad,
      })),
      direccionEntrega: {
        id: `dir-${Date.now()}`,
        etiqueta: 'Entrega',
        nombreReceptor: dir.nombreReceptor,
        telefono: dir.telefono,
        pais: dir.pais,
        provincia: dir.provincia,
        ciudad: dir.ciudad,
        calle: dir.calle,
        referencia: dir.referencia || undefined,
        predeterminada: false,
      },
      metodoPagoPreferido: metodoPago.value,
    })
    cart.vaciar()
    router.push({ name: 'confirmacion', params: { id: pedido.id } })
  } catch (e) {
    errorEnvio.value = e instanceof Error ? e.message : 'No se pudo crear el pedido'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

    <!-- Header del checkout -->
    <div class="mb-10 border-b-2 border-fg pb-6">
      <h1 class="font-display text-5xl uppercase text-fg">Checkout</h1>
      <!-- Stepper -->
      <div class="mt-5 flex items-center gap-0">
        <template v-for="(p, i) in pasosConfig" :key="p.n">
          <div class="flex items-center gap-2">
            <div
              class="flex h-8 w-8 items-center justify-center border-2 text-xs font-bold transition"
              :class="
                paso > p.n
                  ? 'border-accent bg-accent text-accent-contrast'
                  : paso === p.n
                    ? 'border-fg bg-fg text-bg'
                    : 'border-line bg-surface text-muted'
              "
            >
              <Check v-if="paso > p.n" class="h-4 w-4" />
              <component v-else :is="p.icon" class="h-4 w-4" />
            </div>
            <span
              class="hidden text-xs font-bold uppercase tracking-wide sm:inline"
              :class="paso === p.n ? 'text-fg' : 'text-muted'"
            >
              {{ p.label }}
            </span>
          </div>
          <div
            v-if="i < pasosConfig.length - 1"
            class="mx-3 h-px flex-1 border-t-2"
            :class="paso > p.n ? 'border-accent' : 'border-line'"
          />
        </template>
      </div>
    </div>

    <div class="grid gap-10 lg:grid-cols-[1fr_360px]">

      <!-- Panel izquierdo: formularios por paso -->
      <div>

        <!-- PASO 1: Dirección -->
        <div v-if="paso === 1" class="space-y-5">
          <h2 class="font-display text-2xl uppercase text-fg">Dirección de entrega</h2>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Nombre del receptor *
              </label>
              <input
                v-model="dir.nombreReceptor"
                type="text"
                required
                placeholder="Quien recibe el pedido"
                class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
              />
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Teléfono *
              </label>
              <input
                v-model="dir.telefono"
                type="tel"
                required
                placeholder="0991234567"
                class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">País</label>
            <input
              v-model="dir.pais"
              type="text"
              class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Provincia *
              </label>
              <select
                v-model="dir.provincia"
                required
                class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
              >
                <option value="" disabled>Selecciona...</option>
                <option v-for="prov in provinciasEcuador" :key="prov" :value="prov">
                  {{ prov }}
                </option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                Ciudad *
              </label>
              <input
                v-model="dir.ciudad"
                type="text"
                required
                placeholder="Quito, Guayaquil..."
                class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Dirección (calle y número) *
            </label>
            <input
              v-model="dir.calle"
              type="text"
              required
              placeholder="Av. Principal N34-120 y Calle Secundaria"
              class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
              Referencia (opcional)
            </label>
            <input
              v-model="dir.referencia"
              type="text"
              placeholder="Edificio azul, piso 3, casa con portón rojo..."
              class="w-full border-2 border-line bg-bg px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent"
            />
          </div>

          <div class="flex justify-end pt-2">
            <button
              type="button"
              :disabled="!dirValida()"
              class="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:cursor-not-allowed disabled:opacity-40"
              @click="paso = 2"
            >
              Siguiente <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- PASO 2: Método de pago -->
        <div v-if="paso === 2" class="space-y-5">
          <h2 class="font-display text-2xl uppercase text-fg">Método de pago</h2>
          <p class="text-sm text-muted">El pago se realiza al recibir el pedido. Elige cómo quieres pagar.</p>

          <div class="grid gap-4 sm:grid-cols-2">
            <button
              v-for="op in [
                { valor: 'efectivo', label: 'Efectivo', desc: 'Pagas en billetes al repartidor.' },
                { valor: 'transferencia', label: 'Transferencia', desc: 'Transfieres al recibir y muestras el comprobante.' },
              ]"
              :key="op.valor"
              type="button"
              class="border-2 p-5 text-left transition"
              :class="
                metodoPago === op.valor
                  ? 'border-fg bg-fg text-bg'
                  : 'border-line bg-surface text-fg hover:border-fg'
              "
              @click="metodoPago = op.valor as MetodoPago"
            >
              <p class="font-display text-lg uppercase">{{ op.label }}</p>
              <p class="mt-1 text-xs" :class="metodoPago === op.valor ? 'text-bg/70' : 'text-muted'">
                {{ op.desc }}
              </p>
            </button>
          </div>

          <div class="border-2 border-accent bg-accent-soft px-4 py-3 text-sm text-fg">
            <strong class="font-bold uppercase">Recuerda:</strong> No realizas ningún pago ahora.
            El repartidor cobrará cuando entregue tu pedido.
          </div>

          <div class="flex justify-between pt-2">
            <button
              type="button"
              class="flex items-center gap-2 border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-fg transition hover:border-fg"
              @click="paso = 1"
            >
              <ArrowLeft class="h-4 w-4" /> Atrás
            </button>
            <button
              type="button"
              class="flex items-center gap-2 bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg"
              @click="paso = 3"
            >
              Revisar pedido <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- PASO 3: Confirmación -->
        <div v-if="paso === 3" class="space-y-6">
          <h2 class="font-display text-2xl uppercase text-fg">Revisa tu pedido</h2>

          <!-- Resumen de dirección -->
          <div class="border-2 border-line bg-surface p-5">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Entrega en</p>
            <p class="font-bold text-fg">{{ dir.nombreReceptor }} · {{ dir.telefono }}</p>
            <p class="text-sm text-muted">{{ dir.calle }}</p>
            <p class="text-sm text-muted">{{ dir.ciudad }}, {{ dir.provincia }} · {{ dir.pais }}</p>
            <p v-if="dir.referencia" class="text-sm text-muted">Ref: {{ dir.referencia }}</p>
          </div>

          <!-- Resumen de pago -->
          <div class="border-2 border-line bg-surface p-5">
            <p class="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Método de pago</p>
            <p class="font-bold uppercase text-fg">{{ metodoPago }}</p>
            <p class="text-xs text-muted">Al recibir el pedido</p>
          </div>

          <!-- Items del pedido -->
          <div class="border-2 border-line bg-surface">
            <p class="border-b-2 border-line px-5 py-3 text-xs font-bold uppercase tracking-wide text-muted">
              Productos ({{ cart.items.length }})
            </p>
            <div class="divide-y-2 divide-line">
              <div
                v-for="item in cart.items"
                :key="`${item.productoId}-${item.varianteId ?? 'base'}`"
                class="flex gap-4 px-5 py-4"
              >
                <div class="h-16 w-16 shrink-0 overflow-hidden border-2 border-line bg-bg">
                  <img
                    v-if="item.imagen"
                    :src="item.imagen"
                    :alt="item.nombreProducto"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div class="flex flex-1 flex-col justify-center">
                  <p class="font-display text-sm uppercase text-fg">{{ item.nombreProducto }}</p>
                  <p v-if="item.atributos.length" class="text-xs uppercase tracking-wide text-muted">
                    {{ item.atributos.map((a) => a.valor).join(' · ') }}
                  </p>
                  <p class="text-xs text-muted">Cant: {{ item.cantidad }}</p>
                </div>
                <p class="font-display text-base text-fg">
                  {{ formatearPrecio(item.precioUnitario * item.cantidad) }}
                </p>
              </div>
            </div>
          </div>

          <p
            v-if="errorEnvio"
            class="border-2 border-danger px-4 py-3 text-sm font-bold uppercase text-danger"
          >
            {{ errorEnvio }}
          </p>

          <div class="flex justify-between pt-2">
            <button
              type="button"
              class="flex items-center gap-2 border-2 border-line px-5 py-3 text-sm font-bold uppercase tracking-wide text-fg transition hover:border-fg"
              @click="paso = 2"
            >
              <ArrowLeft class="h-4 w-4" /> Atrás
            </button>
            <button
              type="button"
              :disabled="enviando"
              class="flex items-center gap-2 bg-accent px-7 py-3 text-sm font-bold uppercase tracking-wide text-accent-contrast transition hover:bg-fg hover:text-bg disabled:opacity-50"
              @click="confirmarPedido"
            >
              <Package class="h-5 w-5" />
              {{ enviando ? 'Procesando...' : 'Confirmar pedido' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: resumen del carrito (siempre visible) -->
      <aside class="border-2 border-line bg-surface self-start">
        <p class="border-b-2 border-line px-5 py-3 font-display text-sm uppercase tracking-wide text-fg">
          Resumen
        </p>
        <div class="divide-y-2 divide-line">
          <div
            v-for="item in cart.items"
            :key="`${item.productoId}-${item.varianteId ?? 'base'}`"
            class="flex items-center gap-3 px-5 py-3"
          >
            <div class="relative h-12 w-12 shrink-0 overflow-hidden border border-line bg-bg">
              <img
                v-if="item.imagen"
                :src="item.imagen"
                :alt="item.nombreProducto"
                class="h-full w-full object-cover"
              />
              <!-- Cantidad badge -->
              <span
                class="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center bg-fg text-[10px] font-bold text-bg"
              >
                {{ item.cantidad }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate font-display text-xs uppercase text-fg">{{ item.nombreProducto }}</p>
              <p v-if="item.atributos.length" class="truncate text-[10px] uppercase text-muted">
                {{ item.atributos.map((a) => a.valor).join(' · ') }}
              </p>
            </div>
            <p class="text-sm font-bold text-fg">
              {{ formatearPrecio(item.precioUnitario * item.cantidad) }}
            </p>
          </div>
        </div>

        <!-- Totales -->
        <div class="space-y-2 border-t-2 border-line px-5 py-4 text-sm">
          <div class="flex justify-between text-muted">
            <span class="uppercase tracking-wide">Subtotal</span>
            <span>{{ formatearPrecio(cart.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-muted">
            <span class="uppercase tracking-wide">Envío</span>
            <span>{{ formatearPrecio(ENVIO) }}</span>
          </div>
          <div class="flex justify-between border-t-2 border-line pt-2 font-display text-xl text-fg">
            <span>Total</span>
            <span>{{ formatearPrecio(total) }}</span>
          </div>
        </div>

        <div class="border-t-2 border-line px-5 py-3">
          <p class="text-center text-xs font-bold uppercase tracking-wide text-muted">
            Pago contra entrega
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
