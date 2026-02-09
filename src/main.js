import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap'
import './assets/main.css'
import sessionService from './services/sessionService'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')

// Inicializar el servicio de sesión después de que la aplicación se haya montado
router.isReady().then(() => {
  sessionService.initializeSession();
});