<template>
  <div class="forgot-password-container">
    <h2>Recuperar Contraseña</h2>
    
    <div v-if="success" class="success">
      {{ success }}
    </div>
    
    <form @submit.prevent="requestReset">
      <div v-if="error" class="error">{{ error }}</div>
      
      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar enlace de recuperación' }}
      </button>
    </form>
    
    <router-link to="/login" class="back-link">
      Volver al login
    </router-link>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  data() {
    return {
      email: '',
      error: null,
      success: null,
      loading: false
    }
  },
  methods: {
    async requestReset() {
      this.loading = true
      this.error = null
      this.success = null

      try {
        await authService.forgotPassword(this.email)

        this.success = 'Se ha enviado un enlace de recuperación a tu email'
        setTimeout(() => {
          this.$router.push('/login')
        }, 3000)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al enviar el email'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>