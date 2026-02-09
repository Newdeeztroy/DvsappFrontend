import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/store/authStore'

export function useInactivity() {
  const authStore = useAuthStore()
  const inactivityTimer = ref(null)
  
  // ⚙️ CONFIGURACIÓN DEL TIEMPO DE INACTIVIDAD
  // MODIFICA ESTE VALOR PARA CAMBIAR EL TIEMPO
  const INACTIVITY_TIME = 30 * 60 * 1000 // 30 minutos en milisegundos
  
  // Eventos que resetean el temporizador
  const events = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'click'
  ]

  const resetTimer = () => {
    clearTimeout(inactivityTimer.value)
    inactivityTimer.value = setTimeout(() => {
      handleInactivity()
    }, INACTIVITY_TIME)
  }

  const handleInactivity = () => {
    console.log('⏰ Sesión cerrada por inactividad')
    authStore.logout()
  }

  onMounted(() => {
    if (authStore.isAuthenticated) {
      events.forEach(event => {
        window.addEventListener(event, resetTimer)
      })
      resetTimer()
    }
  })

  onUnmounted(() => {
    events.forEach(event => {
      window.removeEventListener(event, resetTimer)
    })
    clearTimeout(inactivityTimer.value)
  })

  return {
    resetTimer,
    inactivityTimer
  }
}