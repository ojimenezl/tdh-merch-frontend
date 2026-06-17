<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CartDrawer from '@/components/cart/CartDrawer.vue'
</script>

<template>
  <div class="flex min-h-full flex-col">
    <!-- Skip link for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-accent focus:text-accent-contrast focus:px-3 focus:py-2">
      Ir al contenido
    </a>
    <AppHeader />
    <main id="main-content" class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <CartDrawer />
  </div>
</template>
