<template>
  <div class="reset-password-container">
    <h2>Nueva Contraseña</h2>
    
    <form @submit.prevent="resetPassword">
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="success" class="success">{{ success }}</div>
      
      <input type="hidden" v-model="token" />
      
      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>
      
      <div class="form-group">
        <label>Nueva Contraseña:</label>
        <input type="password" v-model="password" required />
      </div>
      
      <div class="form-group">
        <label>Confirmar Contraseña:</label>
        <input type="password" v-model="password_confirmation" required />
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Cambiar Contraseña' }}
      </button>
    </form>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  data() {
    return {
      token: this.$route.query.token,
      email: this.$route.query.email || '',
      password: '',
      password_confirmation: '',
      error: null,
      success: null,
      loading: false
    }
  },
  methods: {
    async resetPassword() {
      this.loading = true
      this.error = null
      this.success = null

      try {
        const resetData = {
          token: this.token,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation
        }

        await authService.resetPassword(resetData)

        this.success = 'Contraseña cambiada correctamente'
        setTimeout(() => {
          this.$router.push('/login')
        }, 2000)
      } catch (error) {
        this.error = error.response?.data?.error || 'Error al cambiar la contraseña'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>