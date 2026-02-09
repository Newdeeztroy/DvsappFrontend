<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo en la parte superior -->
      <div class="logo-container">
        <img src="/image/DVSAPP_sin_fondo.png" alt="Logo DVSAPP" class="logo">
      </div>

      <h2 class="login-title">Iniciar Sesión</h2>
      
      <form @submit.prevent="login">
        <div v-if="error" class="error-box">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <div class="form-group">
          <label for="email">
            <i class="fas fa-envelope"></i> Email
          </label>
          <div class="input-wrapper">
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="Ingresa tu email"
              required 
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">
            <i class="fas fa-lock"></i> Contraseña
          </label>
          <div class="input-wrapper">
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="Ingresa tu contraseña"
              required 
            />
          </div>
        </div>

        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" />
            <label for="remember" class="checkbox-label">Recordarme</label>
          </div>
          
          <router-link to="/forgot-password" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Mostrar nombre del usuario si ya está logeado -->
        <div v-if="currentUser" class="user-info">
          <p>Inicio de sesión como:</p>
          <h3 class="current-user-name">{{ currentUser.name }}</h3>
          <p class="current-user-email">{{ currentUser.email }}</p>
        </div>

        <button type="submit" :disabled="loading" class="btn-login">
          <i class="fas fa-sign-in-alt"></i>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="login-footer">
        <p>© DVSAPP 2026</p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false,
      currentUser: null
    }
  },
  mounted() {
    // Verificar si hay un usuario logeado
    this.checkCurrentUser();
  },
  methods: {
    checkCurrentUser() {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          this.currentUser = JSON.parse(user);
        } catch (e) {
          console.error('Error al parsear el usuario del localStorage:', e);
        }
      }
    },
    async login() {
      this.loading = true
      this.error = null

      try {
        const credentials = {
          email: this.email,
          password: this.password
        }

        await authService.login(credentials)

        // Redirigir al dashboard o a la ruta previa
        const redirect = this.$route.query.redirect || '/'
        this.$router.push(redirect)
      } catch (error) {
        console.error('Error en el login:', error)

        // Manejar diferentes tipos de errores
        if (error.response) {
          // Error de respuesta del servidor
          if (error.response.status === 422) {
            // Validación fallida
            this.error = error.response.data.message || 'Datos de entrada inválidos'
          } else if (error.response.status === 401) {
            // Credenciales incorrectas
            this.error = 'Credenciales incorrectas. Por favor verifica tus datos.'
          } else if (error.response.status >= 500) {
            // Error del servidor
            this.error = 'Error del servidor. Inténtalo más tarde.'
          } else {
            // Otro error
            this.error = error.response.data.message || 'Error al iniciar sesión'
          }
        } else if (error.request) {
          // Error de red
          this.error = 'No se pudo conectar con el servidor. Verifica tu conexión.'
        } else {
          // Otro tipo de error
          // Verificar si es un error específico del authService
          if (error.message && error.message.includes('Tu cuenta está inactiva')) {
            this.error = error.message;
          } else {
            this.error = 'Ocurrió un error inesperado. Inténtalo más tarde.'
          }
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
/* 🎨 Fondo con degradado verde */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a5f23 0%, #1e7a2b 30%, #259634 60%, #2dc23f 100%);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  padding: 20px;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 📦 Tarjeta de login */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  padding: 50px 40px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(37, 150, 52, 0.2);
}

.login-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(37, 150, 52, 0.1) 0%, transparent 70%);
  z-index: 0;
}

.login-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  background: linear-gradient(90deg, #1a5f23, #259634, #2dc23f);
  z-index: 1;
}

/* 🖼️ Logo */
.logo-container {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
}

.logo {
  width: 220px;
  height: auto;
  display: block;
  margin: 0 auto;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 12px rgba(37, 150, 52, 0.3));
}

/* 📝 Título */
.login-title {
  color: #1a5f23;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 📧 Formulario */
.form-group {
  margin-bottom: 25px;
  position: relative;
  z-index: 2;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group label i {
  color: #259634;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #1a5f23, #259634);
  transition: width 0.3s ease;
  z-index: 1;
}

.input-wrapper:focus-within::before {
  width: 100%;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f7fafc;
  color: #2d3748;
}

.form-group input:focus {
  outline: none;
  border-color: #259634;
  box-shadow: 0 0 0 3px rgba(37, 150, 52, 0.1);
  background: #fff;
}

.form-group input::placeholder {
  color: #a0aec0;
}

/* ⚙️ Opciones del formulario */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  position: relative;
  z-index: 2;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #259634;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.checkbox-label {
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  user-select: none;
}

.forgot-link {
  color: #259634;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.forgot-link:hover {
  color: #1a5f23;
  text-decoration: underline;
  transform: translateX(3px);
}

/* 🔘 Botón de login */
.btn-login {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1a5f23 0%, #259634 50%, #2dc23f 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(37, 150, 52, 0.3);
}

.btn-login::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.btn-login:hover:not(:disabled)::before {
  left: 100%;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 150, 52, 0.4);
  background: linear-gradient(135deg, #185520 0%, #228a30 50%, #29b53a 100%);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  background: #9ae6b4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ❌ Mensaje de error */
.error-box {
  background: rgba(254, 242, 242, 0.95);
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  animation: shake 0.5s ease;
  position: relative;
  z-index: 2;
}

.error-box i {
  font-size: 18px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* 📇 Información del usuario */
.user-info {
  text-align: center;
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(220, 248, 220, 0.5);
  border: 1px solid #c6f6c6;
  border-radius: 10px;
  position: relative;
  z-index: 2;
}

.current-user-name {
  color: #1a5f23;
  margin: 10px 0 5px 0;
  font-size: 18px;
  font-weight: 600;
}

.current-user-email {
  color: #259634;
  margin: 5px 0 0 0;
  font-size: 14px;
  font-weight: 500;
}

/* 📝 Footer */
.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
  position: relative;
  z-index: 2;
}

.login-footer p {
  color: #4a5568;
  font-size: 14px;
  margin: 0;
}

.register-link {
  color: #259634;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #1a5f23;
  text-decoration: underline;
}

/* 📱 Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 35px 25px;
    margin: 10px;
  }

  .logo {
    width: 180px;
  }

  .login-title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .form-options {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .btn-login {
    padding: 14px;
    font-size: 15px;
  }
}

@media (max-width: 360px) {
  .logo {
    width: 150px;
  }

  .login-title {
    font-size: 22px;
  }

  .form-group input {
    padding: 12px 14px;
    font-size: 14px;
  }
}
</style>