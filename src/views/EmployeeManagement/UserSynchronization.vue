<template>
  <div class="sync-container">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h3 class="mb-0">🔄 Sincronización de Usuarios</h3>
      </div>
      
      <div class="card-body">
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
                id="syncLocal"
                v-model="syncType"
                value="local"
                class="form-check-input"
              />
              <label class="form-check-label" for="syncLocal">Local</label>
            </div>
          </div>
        </div>

        <!-- Selector de dispositivo (solo para sincronización local) -->
        <div v-if="syncType === 'local'" class="form-group mb-4">
          <label class="form-label">Seleccionar Dispositivo *</label>
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
              {{ device.name }} ({{ device.ip_address }})
            </option>
          </select>
        </div>

        <!-- Botón de sincronización -->
        <div class="d-flex justify-content-end">
          <button
            @click="startSynchronization"
            :disabled="!canSync || loading"
            class="btn btn-primary"
          >
            <i v-if="loading" class="fa fa-spinner fa-spin me-2"></i>
            <i v-else class="fa fa-sync me-2"></i>
            {{ loading ? 'Sincronizando...' : 'Sincronizar' }}
          </button>
        </div>

        <!-- Mensajes de estado -->
        <div v-if="error" class="alert alert-error mt-3">
          <i class="fa fa-exclamation-circle me-2"></i>
          {{ error }}
        </div>

        <div v-if="successMessage" class="alert alert-success mt-3">
          <i class="fa fa-check-circle me-2"></i>
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const syncType = ref('total'); // 'total' o 'local'
const selectedDeviceId = ref(null);
const biometricDevices = ref([]);
const loadingDevices = ref(false);
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

// Cargar lista de dispositivos al montar
onMounted(async () => {
  await loadBiometricDevices();
});

// Cargar dispositivos biométricos
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
  if (syncType.value === 'local') return !!selectedDeviceId.value;
  return false;
});

// Iniciar sincronización
const startSynchronization = async () => {
  if (!canSync.value) return;

  loading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    let url = 'http://dvsapp.com/api/sync-users';
    let method = 'POST';
    let body = null;

    if (syncType.value === 'local') {
      // Sincronización local: enviar ID del dispositivo
      body = JSON.stringify({
        device_id: selectedDeviceId.value
      });
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body
    });

    const data = await response.json();

    if (response.ok) {
      successMessage.value = data.message || 'Sincronización completada exitosamente';
    } else {
      throw new Error(data.message || 'Error en la sincronización');
    }
  } catch (err) {
    error.value = 'Error: ' + err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.sync-container {
  padding: 20px;
}

.card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #fff;
}

.card-header {
  border-radius: 8px 8px 0 0 !important;
  font-weight: 600;
}

.form-label {
  font-weight: 500;
  color: #495057;
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

.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #fff;
}

.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
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

.alert-success {
  background-color: #e8f5e8;
  border-left: 4px solid #4CAF50;
  color: #2e7d32;
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

.mb-0 {
  margin-bottom: 0;
}

.mb-4 {
  margin-bottom: 24px;
}
</style>