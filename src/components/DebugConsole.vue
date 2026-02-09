<template>
  <div v-if="isVisible" class="debug-console-overlay">
    <div class="debug-console">
      <div class="console-header">
        <h3>🔧 Consola de Depuración DVS</h3>
        <div class="console-controls">
          <button @click="toggleVisibility" class="control-btn">Ocultar</button>
          <button @click="clearLogs" class="control-btn">Limpiar</button>
          <button @click="copyLogs" class="control-btn">Copiar</button>
          <button @click="toggleAutoScroll" :class="['control-btn', autoScroll ? 'active' : '']">
            {{ autoScroll ? 'Autoscroll ON' : 'Autoscroll OFF' }}
          </button>
        </div>
      </div>
      
      <div class="console-stats">
        <div class="stat-item">
          <span class="stat-label">Total Logs:</span>
          <span class="stat-value">{{ logs.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Token:</span>
          <span class="stat-value" :class="tokenStatusClass">
            {{ tokenStatus }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Autenticado:</span>
          <span class="stat-value" :class="authStatusClass">
            {{ authStatus }}
          </span>
        </div>
      </div>
      
      <div class="console-body" ref="logContainer">
        <div 
          v-for="(log, index) in logs" 
          :key="index" 
          :class="['log-entry', log.level.toLowerCase()]"
        >
          <span class="log-timestamp">[{{ formatTime(log.timestamp) }}]</span>
          <span class="log-level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
          <div v-if="log.data" class="log-data">
            {{ JSON.stringify(log.data, null, 2) }}
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <button 
    v-else 
    @click="toggleVisibility" 
    class="debug-toggle-btn"
    title="Abrir consola de depuración"
  >
    🔧
  </button>
</template>

<script>
import debugConsole from '@/services/debugConsole'

export default {
  name: 'DebugConsole',
  data() {
    return {
      isVisible: false,
      autoScroll: true,
      logs: [],
      tokenStatus: 'DESCONOCIDO',
      authStatus: 'DESCONOCIDO',
      tokenStatusClass: '',
      authStatusClass: ''
    }
  },
  mounted() {
    // Suscribirse a los logs de la consola de depuración
    this.updateStats()
    
    // Actualizar estadísticas periódicamente
    this.statsInterval = setInterval(this.updateStats, 5000)
  },
  beforeUnmount() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
  },
  methods: {
    toggleVisibility() {
      this.isVisible = !this.isVisible
      if (this.isVisible) {
        this.logs = [...debugConsole.getLogs(50)]
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    clearLogs() {
      debugConsole.clearLogs()
      this.logs = []
    },
    
    copyLogs() {
      const logText = this.logs.map(log => 
        `[${this.formatTime(log.timestamp)}] ${log.level}: ${log.message}` +
        (log.data ? `\n${JSON.stringify(log.data, null, 2)}` : '')
      ).join('\n\n')
      
      navigator.clipboard.writeText(logText)
        .then(() => {
          console.log('Logs copiados al portapapeles')
        })
        .catch(err => {
          console.error('Error al copiar logs:', err)
        })
    },
    
    toggleAutoScroll() {
      this.autoScroll = !this.autoScroll
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString()
    },
    
    scrollToBottom() {
      if (this.autoScroll && this.$refs.logContainer) {
        this.$refs.logContainer.scrollTop = this.$refs.logContainer.scrollHeight
      }
    },
    
    updateStats() {
      const status = debugConsole.checkAuthStatus()
      
      // Actualizar estado del token
      this.tokenStatus = status.tokenValid ? 'VÁLIDO' : 'NO VÁLIDO'
      this.tokenStatusClass = status.tokenValid ? 'valid' : 'invalid'
      
      // Actualizar estado de autenticación
      this.authStatus = status.isAuthenticated ? 'SÍ' : 'NO'
      this.authStatusClass = status.isAuthenticated ? 'valid' : 'invalid'
      
      // Actualizar logs
      this.logs = [...debugConsole.getLogs(50)]
      
      // Auto-scroll si está habilitado
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  },
  
  updated() {
    // Auto-scroll cuando se agregan nuevos logs
    if (this.autoScroll) {
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    }
  }
}
</script>

<style scoped>
.debug-console-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.debug-console {
  background: #1e1e1e;
  color: #d4d4d4;
  width: 90%;
  max-width: 1200px;
  height: 80vh;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
}

.console-header {
  background: #2d2d2d;
  padding: 15px;
  border-bottom: 1px solid #454545;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.console-header h3 {
  margin: 0;
  color: #569cd6;
}

.console-controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  background: #3c3c3c;
  color: #d4d4d4;
  border: 1px solid #454545;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.control-btn:hover {
  background: #454545;
}

.control-btn.active {
  background: #007acc;
}

.console-stats {
  display: flex;
  gap: 20px;
  padding: 10px 15px;
  background: #252526;
  border-bottom: 1px solid #454545;
}

.stat-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-label {
  color: #9cdcfe;
  font-size: 12px;
}

.stat-value {
  font-weight: bold;
}

.stat-value.valid {
  color: #4ec9b0;
}

.stat-value.invalid {
  color: #f48771;
}

.console-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #1e1e1e;
}

.log-entry {
  margin-bottom: 8px;
  padding: 5px;
  border-radius: 3px;
  font-size: 13px;
  line-height: 1.4;
}

.log-entry.error {
  background: rgba(244, 135, 113, 0.1);
  border-left: 3px solid #f48771;
}

.log-entry.warn {
  background: rgba(206, 145, 120, 0.1);
  border-left: 3px solid #d4af6c;
}

.log-entry.success {
  background: rgba(78, 201, 176, 0.1);
  border-left: 3px solid #4ec9b0;
}

.log-entry.info {
  background: rgba(86, 156, 214, 0.1);
  border-left: 3px solid #569cd6;
}

.log-entry.debug {
  background: rgba(86, 156, 214, 0.05);
  border-left: 3px solid #569cd6;
}

.log-timestamp {
  color: #808080;
  margin-right: 8px;
}

.log-level {
  font-weight: bold;
  margin-right: 8px;
  text-transform: uppercase;
}

.log-level.error { color: #f48771; }
.log-level.warn { color: #d4af6c; }
.log-level.success { color: #4ec9b0; }
.log-level.info { color: #569cd6; }
.log-level.debug { color: #9cdcfe; }

.log-message {
  color: #d4d4d4;
}

.log-data {
  margin-top: 5px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-left: 2px solid #454545;
  font-size: 11px;
  color: #9cdcfe;
  white-space: pre-wrap;
}

.debug-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.debug-toggle-btn:hover {
  background: #ff5252;
}
</style>