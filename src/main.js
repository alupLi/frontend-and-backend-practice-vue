// main.js - если используем глобальную регистрацию
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Глобально регистрируем компоненты
app.component('LibraryManager', () => import('./components/LibraryManager.vue'))
app.component('ExportPanel', () => import('./components/ExportPanel.vue'))

app.use(router)
app.mount('#app')