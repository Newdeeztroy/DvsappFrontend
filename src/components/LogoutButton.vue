<template>
  <button 
    @click="handleLogout" 
    class="logout-icon-btn"
    :disabled="isLoggingOut"
    title="Cerrar sesión"
  >
    <i v-if="isLoggingOut" class="fas fa-spinner fa-spin"></i>
    <i v-else class="fas fa-sign-out-alt"></i>
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()
const router = useRouter()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  if (isLoggingOut.value) return

  try {
    isLoggingOut.value = true
    await authStore.logout()
    
    router.push({
      name: 'login',
      query: { loggedOut: 'true' }
    })
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    alert('Error al cerrar sesión')
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
.logout-icon-btn {
  background: transparent;
  color: #dc3545;
  border: 2px solid #dc3545;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  position: relative;
  overflow: hidden;
}

.logout-icon-btn:hover:not(:disabled) {
  background: rgba(220, 53, 69, 0.1);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.logout-icon-btn:active:not(:disabled) {
  transform: scale(1);
}

.logout-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.logout-icon-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(220, 53, 69, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.logout-icon-btn:hover::before {
  width: 80px;
  height: 80px;
}
</style>