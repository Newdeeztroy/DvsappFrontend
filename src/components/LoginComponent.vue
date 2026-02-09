<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Iniciar Sesión</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email"
            v-model="form.email" 
            type="email" 
            required 
            placeholder="tu@email.com"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input 
            id="password"
            v-model="form.password" 
            type="password" 
            required 
            placeholder="••••••••"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="!loading">Iniciar Sesión</span>
          <span v-else>Autenticando...</span>
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'LoginComponent',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true
      this.error = null
      
      try {
        const result = await authService.login(this.form.email, this.form.password)
        
        if (result.success) {
          // Redirigir al usuario a la página principal después del login exitoso
          this.$router.push('/')
        } else {
          this.error = result.message
        }
      } catch (err) {
        this.error = 'Error de conexión con el servidor'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.login-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.login-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}
</style>