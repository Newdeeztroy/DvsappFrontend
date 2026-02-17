<template>
  <div class="connection-tester">
    <h2>🔍 Prueba de Conexión</h2>
    
    <div class="status-section">
      <h3>Estado Actual</h3>
      <p><strong>Token disponible:</strong> {{ tokenAvailable ? 'SÍ' : 'NO' }}</p>
      <p><strong>Usuario autenticado:</strong> {{ isAuthenticated ? 'SÍ' : 'NO' }}</p>
      <p><strong>Ruta actual:</strong> {{ currentPath }}</p>
      <p v-if="token"><strong>Token (inicio):</strong> {{ tokenPreview }}</p>
    </div>
    
    <div class="action-section">
      <button @click="testConnection" :disabled="loading" class="test-btn">
        {{ loading ? 'Probando...' : 'Probar Conexión' }}
      </button>
      <button @click="forceLogin" :disabled="loading" class="login-btn">
        Forzar Login
      </button>
      <button @click="clearToken" class="clear-btn">
        Limpiar Token
      </button>
    </div>
    
    <div v-if="result" class="result-section" :class="result.success ? 'success' : 'error'">
      <h3>{{ result.success ? '✅ Éxito' : '❌ Error' }}</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
    
    <div v-if="errorLog.length > 0" class="error-log">
      <h3>Errores Recientes</h3>
      <div 
        v-for="(error, index) in errorLog" 
        :key="index" 
        class="error-item"
      >
        <p><strong>[{{ error.time }}]</strong> {{ error.message }}</p>
        <pre v-if="error.details">{{ JSON.stringify(error.details, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import authService from '@/services/authService'

export default {
  name: 'ConnectionTester',
  data() {
    return {
      tokenAvailable: false,
      isAuthenticated: false,
      currentPath: '',
      token: '',
      tokenPreview: '',
      loading: false,
      result: null,
      errorLog: []
    }
  },
  methods: {
    updateStatus() {
      this.token = authService.getToken()
      this.tokenAvailable = !!this.token
      this.isAuthenticated = authService.isAuthenticated()
      this.currentPath = window.location.pathname
      
      if (this.token) {
        this.tokenPreview = this.token.substring(0, 30) + '...'
      } else {
        this.tokenPreview = ''
      }
    },
    
    addToErrorLog(message, details = null) {
      const timestamp = new Date().toLocaleTimeString()
      this.errorLog.unshift({ time: timestamp, message, details })
      
      // Mantener solo los últimos 10 errores
      if (this.errorLog.length > 10) {
        this.errorLog = this.errorLog.slice(0, 10)
      }
    },
    
    async testConnection() {
      this.loading = true
      this.result = null
      
      try {
        console.log('📡 Iniciando prueba de conexión...')
        const response = await api.get('/biometric-devices')
        
        console.log('✅ Conexión exitosa!', response)
        
        this.result = {
          success: true,
          status: response.status,
          deviceCount: response.data.length,
          firstDevice: response.data[0] || null
        }
        
        this.addToErrorLog('Conexión exitosa a dispositivos biométricos', {
          status: response.status,
          count: response.data.length
        })
      } catch (error) {
        console.error('❌ Error en la conexión:', error)
        
        let errorMessage = 'Error desconocido'
        let errorDetails = null
        
        if (error.response) {
          errorMessage = `HTTP ${error.response.status}: ${error.response.data?.message || 'Error en la respuesta'}`
          errorDetails = {
            status: error.response.status,
            message: error.response.data?.message,
            data: error.response.data,
            headers: error.response.headers
          }
        } else if (error.request) {
          errorMessage = 'Error de red: No se recibió respuesta'
          errorDetails = { request: error.request }
        } else {
          errorMessage = error.message
          errorDetails = { message: error.message }
        }
        
        this.result = {
          success: false,
          error: errorMessage,
          rawError: error
        }
        
        this.addToErrorLog(errorMessage, errorDetails)
      } finally {
        this.loading = false
      }
    },
    
    async forceLogin() {
      this.loading = true
      this.result = null
      
      try {
        console.log('🔐 Forzando login...')
        const result = await authService.login(
          'admin@dvsapp.com',
          'password123'
        )
        
        if (result.success) {
          console.log('✅ Login forzoso exitoso')
          this.addToErrorLog('Login forzoso exitoso', result)
          this.result = { success: true, message: 'Login exitoso', ...result }
        } else {
          console.log('❌ Login forzoso fallido:', result.message)
          this.addToErrorLog('Login forzoso fallido', result)
          this.result = { success: false, ...result }
        }
      } catch (error) {
        console.error('❌ Error en login forzoso:', error)
        this.addToErrorLog('Error en login forzoso', error.message)
        this.result = { success: false, error: error.message }
      } finally {
        this.loading = false
        this.updateStatus()
      }
    },
    
    clearToken() {
      localStorage.removeItem('dvs_auth_token')
      localStorage.removeItem('dvs_auth')
      localStorage.removeItem('dvs_token')
      
      console.log('🗑️ Tokens eliminados')
      this.addToErrorLog('Tokens eliminados manualmente')
      this.updateStatus()
    }
  },
  
  mounted() {
    this.updateStatus()
  }
}
</script>

<style scoped>
.connection-tester {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.status-section, .action-section, .result-section, .error-log {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.action-section button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-btn {
  background-color: #007bff;
  color: white;
}

.login-btn {
  background-color: #28a745;
  color: white;
}

.clear-btn {
  background-color: #dc3545;
  color: white;
}

button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.result-section.success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.result-section.error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.error-item {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f9fa;
  border-left: 4px solid #dc3545;
}

.error-item pre {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
  margin-top: 5px;
}
</style>