<template>
  <div class="container">
    <div class="header">
      <h2 class="title">📋 Dispositivos Biométricos</h2>
      <router-link to="/dispositivos/biometrico" class="btn btn-primary">
        <i class="fa fa-plus"></i> Agregar Nuevo
      </router-link>
    </div>

    <!-- Mensaje de error global -->
    <div v-if="error" class="alert alert-error">
      <i class="fa fa-exclamation-circle"></i>
      {{ error }}
    </div>

    <!-- Tabla de dispositivos -->
    <div v-if="loading" class="loading">Cargando dispositivos...</div>

    <div v-else-if="devices.length === 0" class="empty-state">
      No hay dispositivos registrados.
    </div>

    <div v-else class="table-container">
      <table class="device-table">
        <thead>
          <tr>
            <th>Tipo</th> <!-- 👈 Nueva columna -->
            <th>Nombre</th>
            <th>Marca / Modelo</th>
            <th>IP / Puerto</th>
            <th>Número de Serie</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="device in devices" :key="device.id">
            <td>
              <span :class="`device-type-badge device-type-${device.device_type}`">
                {{ getDeviceTypeLabel(device.device_type) }}
              </span>
            </td>
            <td>{{ device.name }}</td>
            <td>{{ device.brand }} / {{ device.model }}</td>
            <td>{{ device.ip_address }}:{{ device.port }}</td>
            <td>{{ device.serial }}</td>
            <td class="actions">
              <button
                @click="editDevice(device.id)"
                class="btn btn-sm btn-edit"
                title="Editar"
              >
                <i class="fa fa-edit"></i>
              </button>
              <button
                @click="showConfirmDeleteModal(device.id)"
                class="btn btn-sm btn-delete"
                title="Eliminar"
                :disabled="deletingId === device.id"
              >
                <i v-if="deletingId === device.id" class="fa fa-spinner fa-spin"></i>
                <i v-else class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">¿Está seguro?</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro de eliminar este dispositivo? Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfirmModal">Cancelar</button>
          <button class="btn btn-danger" @click="deleteConfirmed">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa fa-check-circle" style="color: #4CAF50; font-size: 48px;"></i>
        </div>
        <h3 class="modal-title">Dispositivo eliminado</h3>
        <button class="btn btn-primary" @click="closeSuccessModal">OK</button>
      </div>
    </div>

    <!-- Modal de error -->
    <div v-if="showErrorModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa fa-exclamation-circle" style="color: #f44336; font-size: 48px;"></i>
        </div>
        <h3 class="modal-title">Error</h3>
        <p class="modal-message">{{ errorMessage }}</p>
        <button class="btn btn-secondary" @click="closeErrorModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const devices = ref([]);
const loading = ref(false);
const error = ref(null);
const deletingId = ref(null);


// Estado de modales
const showConfirmModal = ref(false);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const errorMessage = ref('');
const deviceToDelete = ref(null);

// ✅ CORREGIDO: Añadir credentials: 'include' a TODAS las peticiones fetch
const loadDevices = async () => {
  loading.value = true;
  error.value = null;
  try {
    // ✅ CORREGIDO: Añadir credentials: 'include' (envía cookies)
    const response = await fetch('http://dvsappbackend.test/api/biometric-devices', {
      credentials: 'include' // ✅ ¡CRÍTICO! Para enviar cookies
    });
    
    if (!response.ok) throw new Error('Error al cargar dispositivos');
    const data = await response.json();
    devices.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error:', err);
    error.value = 'No se pudieron cargar los dispositivos: ' + err.message;
  } finally {
    loading.value = false;
  }
};

const deleteConfirmed = async () => {
  if (!deviceToDelete.value) return;

  deletingId.value = deviceToDelete.value;
  try {
    // ✅ CORREGIDO: Añadir credentials: 'include' al DELETE
    const response = await fetch(`http://dvsappbackend.test/api/biometric-devices/${deviceToDelete.value}`, {
      method: 'DELETE',
      credentials: 'include', // ✅ ¡CRÍTICO!
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      }
    });

    if (response.ok || response.status === 204) {
      loadDevices();
      showSuccessModal.value = true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al eliminar el dispositivo');
    }
  } catch (err) {
    errorMessage.value = 'Error al eliminar el dispositivo: ' + err.message;
    showErrorModal.value = true;
  } finally {
    deletingId.value = null;
    closeConfirmModal();
  }
};

// Obtener etiqueta del tipo de dispositivo
const getDeviceTypeLabel = (type) => {
  const labels = {
    'biometrico': 'Biométrico',
    'controladora': 'Controladora'
  };
  return labels[type] || 'Desconocido';
};

// Editar dispositivo
const editDevice = (id) => {
  router.push(`/dispositivos/biometrico/editar/${id}`);
};

// Mostrar modal de confirmación
const showConfirmDeleteModal = (id) => {
  deviceToDelete.value = id;
  showConfirmModal.value = true;
};

// Cerrar modal de confirmación
const closeConfirmModal = () => {
  showConfirmModal.value = false;
  deviceToDelete.value = null;
};

// ✅ CORREGIDO: Añadir credentials: 'include' al DELETE


// Cerrar modales
const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

const closeErrorModal = () => {
  showErrorModal.value = false;
  errorMessage.value = '';
};

// Cargar al montar
onMounted(() => {
  loadDevices();
});
</script>

<style scoped>
.container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 1.5rem;
  color: #333;
  font-weight: bold;
}

.btn {
  padding: 8px 12px;
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

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #d32f2f;
}

.loading,
.empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-error {
  background-color: #ffebee;
  border-left: 4px solid #f44336;
  color: #d32f2f;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.device-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.device-table th,
.device-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.device-table thead {
  background-color: #e8f5e8;
  color: #2e7d32;
  font-weight: bold;
}

.device-table tbody tr:hover {
  background-color: #f9f9f9;
}

.actions {
  display: flex;
  gap: 6px;
}

.btn-sm {
  padding: 6px;
  font-size: 0.8rem;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-edit:hover {
  background-color: #1976D2;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #d32f2f;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estilos para el badge de tipo de dispositivo */
.device-type-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.device-type-biometrico {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-type-controladora {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

/* Estilos para modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.modal-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.modal-title {
  font-size: 1.25rem;
  margin: 0;
  color: #333;
}

.modal-body {
  margin-bottom: 20px;
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.modal-footer .btn {
  flex: 1;
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-message {
  margin-bottom: 20px;
  color: #666;
}
</style>