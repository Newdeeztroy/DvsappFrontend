<template>
  <div class="biometric-tester">
    <h2>🔬 Prueba de Dispositivos Biométricos</h2>
    
    <div class="test-section">
      <h3>_estado de Autenticación</h3>
      <div class="auth-status">
        <p>Token disponible: <span :class="{ 'success': hasToken, 'error': !hasToken }">{{ hasToken ? 'SÍ' : 'NO' }}</span></p>
        <p>Usuario autenticado: <span :class="{ 'success': isAuthenticated, 'error': !isAuthenticated }">{{ isAuthenticated ? 'SÍ' : 'NO' }}</span></p>
        <p v-if="tokenPreview">Token (inicio): {{ tokenPreview }}</p>
      </div>
    </div>
    
    <div class="test-section">
      <h3>Acción de Prueba</h3>
      <button @click="runTest" :disabled="testing" class="test-button">
        {{ testing ? 'Probando...' : 'Ejecutar Prueba' }}
      </button>
      <button @click="forceLogin" class="login-button">Forzar Login</button>
    </div>
    
    <div v-if="testResult" class="test-result">
      <h3>Resultado de la Prueba</h3>
      <div v-if="testResult.success" class="result-success">
        <h4>✅ Éxito</h4>
        <p>Número de dispositivos: {{ testResult.data.length }}</p>
        <div v-if="testResult.data.length > 0">
          <h5>Primer dispositivo:</h5>
          <pre>{{ JSON.stringify(testResult.data[0], null, 2) }}</pre>
        </div>
      </div>
      <div v-else class="result-error">
        <h4>❌ Error</h4>
        <p><strong>Status:</strong> {{ testResult.status }}</p>
        <p><strong>Mensaje:</strong> {{ testResult.error }}</p>
        <p><strong>Detalles:</strong></p>
        <pre>{{ JSON.stringify(testResult.rawError, null, 2) }}</pre>
      </div>
    </div>
    
    <div v-if="debugLogs.length > 0" class="debug-logs">
      <h3>Registros de Depuración</h3>
      <div v-for="(log, index) in debugLogs" :key="index" class="log-entry" :class="log.level.toLowerCase()">
        <span class="timestamp">[{{ log.time }}]</span>
        <span class="level">{{ log.level }}</span>: 
        <span class="message">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'
import authService from '@/services/authService'

export default {
  name: 'BiometricTester',
  data() {
    return {
      hasToken: false,
      isAuthenticated: false,
      tokenPreview: '',
      testing: false,
      testResult: null,
      debugLogs: []
    }
  },
  methods: {
    log(level, message) {
      const timestamp = new Date().toLocaleTimeString()
      this.debugLogs.push({ level, message, time: timestamp })
      
      // Mantener solo los últimos 50 logs
      if (this.debugLogs.length > 50) {
        this.debugLogs = this.debugLogs.slice(-50)
      }
    },
    
    updateAuthStatus() {
      const token = authService.getToken()
      this.hasToken = !!token
      this.isAuthenticated = authService.isAuthenticated()
      
      if (token) {
        this.tokenPreview = token.substring(0, 30) + '...'
      } else {
        this.tokenPreview = ''
      }
    },
    
    async forceLogin() {
      this.log('INFO', 'Intentando login forzoso...')
      
      try {
        // Usar credenciales por defecto
        const response = await api.post('/login', {
          email: 'admin@dvsappbackend.test',
          password: 'password123'
        })
        
        if (response.data.token) {
          this.log('SUCCESS', 'Login forzoso exitoso')
          this.updateAuthStatus()
        } else {
          this.log('ERROR', 'No se recibió token en el login forzoso')
        }
      } catch (error) {
        this.log('ERROR', `Error en login forzoso: ${error.message}`)
      }
    },
    
    async runTest() {
      this.testing = true
      this.testResult = null
      this.debugLogs = []
      
      this.log('INFO', 'Iniciando prueba de dispositivos biométricos...')
      
      // Actualizar estado de autenticación
      this.updateAuthStatus()
      
      if (!this.isAuthenticated) {
        this.log('WARN', 'Usuario no autenticado, intentando login...')
        await this.forceLogin()
        
        // Actualizar estado después del login
        this.updateAuthStatus()
        
        if (!this.isAuthenticated) {
          this.log('ERROR', 'No se pudo autenticar al usuario')
          this.testing = false
          return
        }
      }
      
      try {
        this.log('INFO', 'Intentando obtener dispositivos biométricos...')
        
        const response = await api.get('/biometric-devices')
        
        this.log('SUCCESS', `Se obtuvieron ${response.data.length} dispositivos`)
        
        this.testResult = {
          success: true,
          data: response.data
        }
      } catch (error) {
        this.log('ERROR', `Error al obtener dispositivos: ${error.message}`)
        
        this.testResult = {
          success: false,
          error: error.response?.data?.message || error.message,
          status: error.response?.status,
          rawError: error
        }
      }
      
      this.testing = false
    }
  },
  
  mounted() {
    this.updateAuthStatus()
  }
}
</script>

<style scoped>
.biometric-tester {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.auth-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 10px;
}

.auth-status p {
  margin: 5px 0;
}

.success {
  color: #28a745;
  font-weight: bold;
}

.error {
  color: #dc3545;
  font-weight: bold;
}

.test-button, .login-button {
  padding: 10px 20px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.test-button {
  background-color: #007bff;
  color: white;
}

.test-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.test-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.login-button {
  background-color: #28a745;
  color: white;
}

.login-button:hover {
  background-color: #218838;
}

.result-success {
  padding: 15px;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  color: #155724;
}

.result-error {
  padding: 15px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  color: #721c24;
}

.result-error pre {
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 10px;
}

.debug-logs {
  margin-top: 30px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.log-entry {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.error {
  color: #dc3545;
}

.log-entry.warn {
  color: #ffc107;
}

.log-entry.success {
  color: #28a745;
}

.log-entry.info {
  color: #17a2b8;
}

.timestamp {
  color: #6c757d;
  font-size: 0.9em;
}

.level {
  font-weight: bold;
  text-transform: uppercase;
}
</style>