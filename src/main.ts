import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Sincroniza el tema (claro/oscuro) con el <html> al arrancar.
useThemeStore().inicializar()

app.mount('#app')
