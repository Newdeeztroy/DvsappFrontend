<template>
  <div class="device-test-container">
    <!-- Título -->
    <h2 class="title">🔄 Prueba de Conexión - Dispositivo Biométrico</h2>

    <!-- Selector de dispositivo -->
    <div class="form-group">
      <label class="label">Seleccionar Dispositivo *</label>
      <select
        v-model="selectedDeviceId"
        class="select"
        :disabled="loadingDevices || loading"
      >
        <option value="">-- Elija un dispositivo --</option>
        <option
          v-for="device in biometricDevices"
          :key="device.id"
          :value="device.id"
        >
          {{ device.name }} ({{ device.ip_address }})
        </option>
      </select>
    </div>

    <!-- Botón de prueba -->
    <button
      @click="testConnection"
      :disabled="!selectedDeviceId || loading"
      class="btn btn-primary"
    >
      <i v-if="loading" class="fa fa-spinner fa-spin"></i>
      <i v-else class="fa fa-plug"></i>
      {{ loading ? 'Conectando...' : 'Probar Conexión' }}
    </button>

    <!-- Mensaje de error -->
    <div v-if="error" class="alert alert-error">
      <i class="fa fa-exclamation-circle"></i>
      <span><strong>Error:</strong> {{ error }}</span>
    </div>

    <!-- Resultado exitoso -->
    <div v-if="deviceInfo" class="success-card">
      <h3 class="success-title">
        <i class="fa fa-check-circle"></i>
        Conexión Exitosa - Información del Dispositivo
      </h3>

      <div class="table-container">
        <table class="info-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="field-label">Nombre del Dispositivo</td>
              <td>{{ deviceInfo.deviceName || '—' }}</td>
            </tr>
            <tr class="alt-row">
              <td class="field-label">ID del Dispositivo</td>
              <td>{{ deviceInfo.deviceID || '—' }}</td>
            </tr>
            <tr>
              <td class="field-label">Modelo</td>
              <td>{{ deviceInfo.model || '—' }}</td>
            </tr>
            <tr class="alt-row">
              <td class="field-label">Número de Serie</td>
              <td>{{ deviceInfo.serialNumber || '—' }}</td>
            </tr>
            <tr>
              <td class="field-label">Dirección MAC</td>
              <td>{{ formatMacAddress(deviceInfo.macAddress) || '—' }}</td>
            </tr>
            <tr class="alt-row">
              <td class="field-label">Versión de Firmware</td>
              <td>{{ deviceInfo.firmwareVersion || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const loadingDevices = ref(false);
const loading = ref(false);
const error = ref(null);
const biometricDevices = ref([]);
const selectedDeviceId = ref(null);
const connectionResult = ref(null);

// Cargar lista de dispositivos al montar
onMounted(async () => {
  await loadBiometricDevices();
});

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

// Extraer solo los datos del dispositivo (sin .DeviceInfo)
const deviceInfo = computed(() => {
  return connectionResult.value?.data || null;
});

// Formatear dirección MAC
const formatMacAddress = (mac) => {
  if (!mac) return '';
  return mac.replace(/\s+/g, '').toUpperCase();
};

const testConnection = async () => {
  if (!selectedDeviceId.value) return;

  const device = biometricDevices.value.find(d => d.id == selectedDeviceId.value);
  if (!device) return;

  loading.value = true;
  error.value = null;
  connectionResult.value = null;

  try {
    const response = await fetch('http://dvsapp.com/api/test-device-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip_address: device.ip_address,
        port: device.port,
        username: device.username,
        password: device.password
      })
    });

    const data = await response.json();

    if (data.success) {
      connectionResult.value = data;
    } else {
      error.value = data.error || `Error: ${data.status || 'desconocido'}`;
    }
  } catch (err) {
    error.value = err.message || 'Error de red o conexión';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.device-test-container {
  padding: 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  margin-bottom: 10px;
}

.label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 4px;
}

.select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
  transition: border-color 0.2s;
}

.select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.select:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
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
  margin-top: 16px;
  display: flex;
  align-items: start;
  gap: 8px;
  font-size: 0.875rem;
}

.alert-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
}

.alert-error i {
  color: #f44336;
  margin-top: 2px;
}

.success-card {
  margin-top: 24px;
  padding: 16px;
  background-color: #f1f8e9;
  border: 1px solid #81c784;
  border-radius: 8px;
}

.success-title {
  font-size: 1.125rem;
  font-weight: bold;
  color: #2e7d32;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-title i {
  color: #2e7d32;
}

.table-container {
  overflow-x: auto;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.info-table th,
.info-table td {
  padding: 8px;
  text-align: left;
}

.info-table thead {
  background-color: #e8f5e8;
  font-weight: bold;
  color: #2e7d32;
}

.info-table tbody tr {
  border-top: 1px solid #eee;
}

.info-table tbody tr.alt-row {
  background-color: #f1f8e9;
}

.field-label {
  font-weight: 600;
  color: #333;
}

/* Iconos FontAwesome */
.fa {
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
}
</style>