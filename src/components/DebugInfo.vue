<template>
  <div class="debug-info">
    <h2>🔧 Información de Depuración</h2>
    
    <div class="debug-section">
      <h3>Estado de Autenticación</h3>
      <p><strong>Token disponible:</strong> {{ authState.tokenAvailable }}</p>
      <p><strong>Usuario autenticado:</strong> {{ authState.isAuthenticated }}</p>
      <p><strong>Token (inicio):</strong> {{ authState.tokenPreview }}</p>
    </div>
    
    <div class="debug-section">
      <h3>Prueba de Conexión</h3>
      <button @click="runTest" :disabled="loading" class="test-btn">
        {{ loading ? 'Ejecutando...' : 'Ejecutar Prueba' }}
      </button>
      
      <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
        <h4>{{ testResult.success ? '✅ Éxito' : '❌ Error' }}</h4>
        <pre>{{ JSON.stringify(testResult, null, 2) }}</pre>
      </div>
    </div>
    
    <div class="debug-section">
      <h3>Comandos de Consola</h3>
      <p>Abre la consola del navegador (F12) y ejecuta:</p>
      <code>window.testBiometricConnection()</code>
      <p>Para ver información detallada sobre la conexión.</p>
    </div>
  </div>
</template>

<script>
// Importar directamente el contenido del archivo testConnection.js
async function testConnection() {
  console.log('🔍 Iniciando prueba de conexión...');
  
  // Mostrar estado actual
  console.log('📋 Estado actual:');
  const token = localStorage.getItem('dvs_auth_token');
  const isAuthenticated = !!token;
  console.log('- Token en localStorage:', token);
  console.log('- Usuario autenticado:', isAuthenticated);
  console.log('- Ruta actual:', window.location.pathname);

  try {
    console.log('📡 Intentando obtener dispositivos biométricos...');
    
    // Importar dinámicamente la API para evitar problemas de ciclo
    const { default: api } = await import('@/services/api');
    const response = await api.get('/biometric-devices');
    
    console.log('✅ Petición exitosa!');
    console.log('📊 Status:', response.status);
    console.log('📦 Número de dispositivos:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('🏷️ Primer dispositivo:', response.data[0]);
    }
    
    return {
      success: true,
      status: response.status,
      count: response.data.length,
      firstDevice: response.data[0] || null
    };
  } catch (error) {
    console.error('❌ ERROR DETECTADO:');
    console.error('- Tipo de error:', error.constructor.name);
    
    if (error.response) {
      console.error('- Status HTTP:', error.response.status);
      console.error('- Mensaje:', error.response.data?.message || 'No disponible');
      console.error('- Datos completos:', error.response.data);
      console.error('- Headers:', error.response.headers);
      console.error('- URL solicitada:', error.config?.url);
    } else if (error.request) {
      console.error('- Error de red:', error.request);
      console.error('- No se recibió respuesta del servidor');
    } else {
      console.error('- Error de configuración:', error.message);
    }
    
    console.error('- Configuración de la petición:', error.config);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error desconocido',
      status: error.response?.status,
      rawError: error
    };
  }
}

// Hacer disponible globalmente
window.testBiometricConnection = testConnection;

export default {
  name: 'DebugInfo',
  data() {
    return {
      authState: {
        tokenAvailable: false,
        isAuthenticated: false,
        tokenPreview: ''
      },
      loading: false,
      testResult: null
    }
  },
  methods: {
    updateAuthState() {
      const token = localStorage.getItem('dvs_auth_token');
      this.authState.tokenAvailable = !!token;
      this.authState.isAuthenticated = !!token;
      this.authState.tokenPreview = token ? token.substring(0, 30) + '...' : '';
    },
    
    async runTest() {
      this.loading = true;
      this.testResult = null;
      
      this.testResult = await testConnection();
      
      this.loading = false;
    }
  },
  
  mounted() {
    this.updateAuthState();
    console.log('🔧 Componente de depuración montado');
    console.log('Usa window.testBiometricConnection() en la consola para probar la conexión');
  }
}
</script>

<style scoped>
.debug-info {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.debug-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.test-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.test-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.test-result {
  margin-top: 15px;
  padding: 15px;
  border-radius: 4px;
}

.test-result.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.test-result.error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

code {
  display: block;
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  font-family: monospace;
}
</style>