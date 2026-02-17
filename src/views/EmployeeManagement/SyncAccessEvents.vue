<template>
  <div class="container">
    <div class="header">
      <h2 class="title">📅 Sincronización de Eventos de Acceso</h2>
    </div>

    <!-- Tipo de sincronización -->
    <div class="form-group mb-4">
      <label class="form-label">Tipo de Sincronización *</label>
      <div class="d-flex gap-3">
        <div class="form-check">
          <input
            type="radio"
            id="syncTotal"
            v-model="syncType"
            value="total"
            class="form-check-input"
          />
          <label class="form-check-label" for="syncTotal">Total</label>
        </div>
        <div class="form-check">
          <input
            type="radio"
            id="syncDeviceDate"
            v-model="syncType"
            value="device_date"
            class="form-check-input"
          />
          <label class="form-check-label" for="syncDeviceDate">Por Dispositivo y Fecha</label>
        </div>
      </div>
    </div>

    <!-- Filtros para sincronización por dispositivo y fecha -->
    <div v-if="syncType === 'device_date'" class="filters mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Dispositivo *</label>
          <select
            v-model="selectedDeviceId"
            class="form-select"
            :disabled="loadingDevices || loading"
          >
            <option value="">-- Elija un dispositivo --</option>
            <option
              v-for="device in biometricDevices"
              :key="device.id"
              :value="device.id"
            >
              {{ device.name }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Fecha Inicio *</label>
          <input
            v-model="filters.startDate"
            type="date"
            class="form-control"
            :disabled="loading"
          />
        </div>
        <div class="col-md-4">
          <label class="form-label">Fecha Fin *</label>
          <input
            v-model="filters.endDate"
            type="date"
            class="form-control"
            :disabled="loading"
          />
        </div>
      </div>
    </div>

    <!-- Barra de carga -->
    <div v-if="loading" class="progress-container mb-4">
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <p class="text-center mt-2">Sincronizando eventos de acceso...</p>
    </div>

    <!-- Botón de sincronización -->
    <div class="d-flex justify-content-end mb-4">
      <button
        @click="syncAccessEvents"
        :disabled="!canSync || loading"
        class="btn btn-primary"
      >
        <i v-if="loading" class="fa fa-spinner fa-spin me-2"></i>
        <i v-else class="fa fa-sync me-2"></i>
        {{ loading ? 'Sincronizando...' : 'Sincronizar Eventos' }}
      </button>
    </div>

    <!-- Mensajes de estado -->
    <div v-if="error" class="alert alert-error">
      <i class="fa fa-exclamation-circle me-2"></i>
      {{ error }}
    </div>

    <!-- Panel de resultados estructurado -->
    <div v-if="syncResults" class="sync-results-panel">
      <div class="results-header">
        <i class="fa fa-check-circle text-success me-2"></i>
        <h3>{{ syncType === 'total' ? 'Sincronización TOTAL completada' : 'Sincronización por dispositivo completada' }}</h3>
        <span class="total-events-badge">{{ totalEvents }} eventos</span>
      </div>
      
      <div class="results-content">
        <div class="device-results">
          <div 
            v-for="result in syncResults" 
            :key="result.device_id"
            class="device-result"
            :class="{ 'has-events': result.events_downloaded > 0 }"
          >
            <div class="device-name">
              <strong>{{ result.device_name }}</strong>
              <span v-if="result.date_range" class="date-range-badge">
                {{ result.date_range }}
              </span>
            </div>
            
            <div class="device-status">
              <span v-if="result.events_downloaded > 0" class="events-count">
                {{ result.events_downloaded }} evento{{ result.events_downloaded !== 1 ? 's' : '' }}
              </span>
              <span v-else class="no-events">
                Sin eventos
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen de eventos -->
    <div v-if="eventSummary" class="summary-card">
      <h4>📊 Resumen de Eventos Sincronizados</h4>
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Total de eventos:</span>
          <span class="stat-value">{{ eventSummary.total_events_synced }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Usuarios únicos:</span>
          <span class="stat-value">{{ eventSummary.unique_users }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Puertas registradas:</span>
          <span class="stat-value">{{ eventSummary.unique_doors }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const syncType = ref('total'); // 'total' o 'device_date'
const selectedDeviceId = ref(null);
const biometricDevices = ref([]);
const loadingDevices = ref(false);
const loading = ref(false);
const error = ref(null);
const syncResults = ref(null);
const totalEvents = ref(0);
const eventSummary = ref(null);

// Fechas para filtro
const today = new Date();
const todayString = today.toISOString().split('T')[0];
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);
const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];

const filters = ref({
  startDate: thirtyDaysAgoString,
  endDate: todayString
});

// Cargar dispositivos al montar
onMounted(async () => {
  await loadBiometricDevices();
});

// Cargar dispositivos
const loadBiometricDevices = async () => {
  loadingDevices.value = true;
  try {
    const response = await api.get('/biometric-devices');
    biometricDevices.value = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Error al cargar dispositivos:', err);
    error.value = 'No se pudieron cargar los dispositivos: ' + (err.response?.data?.message || err.message);
  } finally {
    loadingDevices.value = false;
  }
};

// Computed: si se puede sincronizar
const canSync = computed(() => {
  if (syncType.value === 'total') return true;
  if (syncType.value === 'device_date') {
    return selectedDeviceId.value && 
           filters.value.startDate && 
           filters.value.endDate &&
           filters.value.startDate <= filters.value.endDate;
  }
  return false;
});

// Sincronizar eventos
const syncAccessEvents = async () => {
  if (!canSync.value) return;

  loading.value = true;
  error.value = null;
  syncResults.value = null;
  eventSummary.value = null;

  try {
    let body = { sync_type: syncType.value };
    
    if (syncType.value === 'device_date') {
      body.device_id = selectedDeviceId.value;
      body.start_date = filters.value.startDate;
      body.end_date = filters.value.endDate;
    }

    const response = await fetch('http://dvsapp.com/api/sync-access-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      syncResults.value = data.sync_results;
      totalEvents.value = data.total_events_synced;
      await loadEventSummary();
    } else {
      throw new Error(data.message || 'Error en la sincronización');
    }
  } catch (err) {
    error.value = 'Error: ' + err.message;
  } finally {
    loading.value = false;
  }
};

// Cargar resumen de eventos
const loadEventSummary = async () => {
  try {
    const response = await fetch('http://dvsapp.com/api/access-events/summary');
    const summary = await response.json();
    eventSummary.value = summary;
  } catch (err) {
    console.error('Error loading event summary:', err);
  }
};
</script>

<style scoped>
/* Tus estilos existentes + estos nuevos */

.form-group {
  margin-bottom: 24px;
}

.form-label {
  font-size: 0.875rem;
  color: #666;
  display: block;
  margin-bottom: 0.25rem;
}

.form-check {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-check-input {
  width: 16px;
  height: 16px;
}

.filters .row {
  margin-bottom: 0;
}

.form-control,
.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Estilos para el panel de resultados */
.sync-results-panel {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 24px;
  overflow: hidden;
}

.results-header {
  background: #f8f9fa;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.results-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.total-events-badge {
  background: #e8f5e8;
  color: #2e7d32;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: bold;
  margin-left: auto;
}

.results-content {
  padding: 20px;
}

.device-results {
  display: grid;
  gap: 12px;
}

.device-result {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px;
  border-radius: 6px;
  background: #fafafa;
}

.device-result.has-events {
  background: #e8f5e8;
  border-left: 3px solid #4CAF50;
}

.device-name {
  flex: 1;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-range-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.events-count {
  background: #c8e6c9;
  color: #2e7d32;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
}

.no-events {
  color: #999;
  font-style: italic;
  font-size: 0.875rem;
}

/* Tus otros estilos... */
.summary-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.summary-card h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.1rem;
}

.summary-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-item {
  min-width: 150px;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4CAF50;
}

.progress-container {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
  animation: progressAnimation 2s infinite ease-in-out;
}

@keyframes progressAnimation {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.container {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.title {
  font-size: 1.5rem;
  color: #333;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
}

.d-flex {
  display: flex;
}

.gap-3 {
  gap: 12px;
}

.justify-content-end {
  justify-content: flex-end;
}

.mb-4 {
  margin-bottom: 24px;
}

.text-center {
  text-align: center;
}

.mt-2 {
  margin-top: 8px;
}

.col-md-4 {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
}

@media (max-width: 768px) {
  .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>