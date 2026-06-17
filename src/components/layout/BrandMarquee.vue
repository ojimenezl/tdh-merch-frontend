<script setup lang="ts">
withDefaults(
  defineProps<{
    items?: string[]
    variant?: 'accent' | 'fg'
  }>(),
  {
    items: () => ['TDH MERCH', 'MEMBERS ONLY', 'DROP 01', 'EST. 2026', 'WEAR THE CLUB'],
    variant: 'accent',
  },
)
</script>

<template>
  <div
    class="overflow-hidden border-y-2 py-2"
    :class="
      variant === 'accent'
        ? 'border-accent-contrast bg-accent text-accent-contrast'
        : 'border-line bg-fg text-bg'
    "
  >
    <div class="flex w-max animate-marquee">
      <!-- Se duplica el contenido para un loop continuo -->
      <template v-for="rep in 2" :key="rep">
        <span
          v-for="(t, i) in items"
          :key="`${rep}-${i}`"
          class="flex items-center font-display text-sm uppercase tracking-wide"
        >
          {{ t }}
          <span class="mx-4 text-lg leading-none">✦</span>
        </span>
      </template>
    </div>
  </div>
</template>
