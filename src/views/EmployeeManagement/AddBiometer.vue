<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h4>{{ isEditing ? 'Editar Dispositivo Biométrico' : 'Agregar Dispositivo Biométrico' }}</h4>
      </div>
      <div class="card-body">
        <!-- Información Básica del Dispositivo -->
        <div class="mb-4">
          <h5 class="text-success">Información del Dispositivo</h5>
          
          <!-- Tipo de Dispositivo -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Tipo de Dispositivo *</span>
              <select
                class="form-select"
                v-model="device.deviceType"
                required
                :disabled="loading"
              >
                <option value="">-- Seleccione un tipo --</option>
                <option value="biometrico">Biométrico</option>
                <option value="controladora">Controladora</option>
              </select>
            </div>
            <div class="col-md-4">
              <span>Nombre del Dispositivo *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.name"
                placeholder="Ej: Biométrico Recepción"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Marca *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.brand"
                placeholder="Marca del dispositivo"
                required
                :disabled="loading"
              />
            </div>
          </div>
          
          <!-- Modelo y Serie -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Modelo *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.model"
                placeholder="Ej: ZK4500, UFace 202, etc."
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Número de Serie *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.serial"
                placeholder="Ej: SN123456789"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Número de Parte</span>
              <input
                type="text"
                class="form-control"
                v-model="device.partNumber"
                placeholder="Número de Parte"
                :disabled="loading"
              />
            </div>
          </div>
          
          <!-- Conexión -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Dirección IP *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.ipAddress"
                placeholder="192.168.1.100"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Puerto *</span>
              <input
                type="number"
                class="form-control"
                v-model="device.port"
                placeholder="80"
                min="1"
                max="65535"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Usuario</span>
              <input
                type="text"
                class="form-control"
                v-model="device.username"
                placeholder="admin"
                :disabled="loading"
              />
            </div>
          </div>
          
          <!-- Contraseña -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Contraseña</span>
              <div class="input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control"
                  v-model="device.password"
                  placeholder="Contraseña"
                  :disabled="loading"
                />
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="togglePassword"
                  :disabled="loading"
                >
                  <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Comentarios -->
        <div class="row">
          <div class="col-md-12">
            <span>Comentarios / Especificaciones</span>
            <textarea
              class="form-control"
              v-model="device.comment"
              placeholder="Observaciones, configuración especial, etc."
              rows="2"
              :disabled="loading"
            ></textarea>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="d-flex justify-content-end mt-4">
          <button
            class="btn btn-secondary me-2"
            @click="cancelForm"
            :disabled="loading"
          >
            <i class="fas fa-times me-1"></i> Cancelar
          </button>
          <button
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="loading"
          >
            <i class="fas fa-save me-1"></i>
            {{ loading ? 'Guardando...' : (isEditing ? 'Actualizar Dispositivo' : 'Guardar Dispositivo') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { viewAlert } from '/src/Functions';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const showPassword = ref(false);

const device = ref({
  deviceType: 'biometrico', // 👈 Valor por defecto
  name: '',
  brand: '',
  model: '',
  serial: '',
  partNumber: '',
  ipAddress: '',
  port: 80,
  username: '',
  password: '',
  comment: ''
});

// Determinar si es modo edición
const isEditing = computed(() => !!route.params.id);

// Alternar visibilidad de contraseña
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Cargar datos si es edición
const loadDeviceData = async () => {
  if (!isEditing.value) return;

  try {
    const response = await fetch(`http://dvsapp.com/api/biometric-devices/${route.params.id}`);
    if (!response.ok) throw new Error('Error al cargar el dispositivo');
    const data = await response.json();

    device.value = {
      deviceType: data.device_type || 'biometrico',
      name: data.name || '',
      brand: data.brand || '',
      model: data.model || '',
      serial: data.serial || '',
      partNumber: data.part_number || '',
      ipAddress: data.ip_address || '',
      port: data.port || 80,
      username: data.username || '',
      password: '', // No se muestra la contraseña actual por seguridad
      comment: data.comment || ''
    };
  } catch (error) {
    viewAlert('Error al cargar el dispositivo: ' + error.message, 'error');
    router.push({ name: 'listBiometricDevice' });
  }
};

// Guardar (crear o actualizar)
const handleSubmit = async () => {
  // Validaciones básicas
  if (!device.value.deviceType) {
    viewAlert('El tipo de dispositivo es requerido', 'error');
    return;
  }
  if (!device.value.name.trim()) {
    viewAlert('El nombre es requerido', 'error');
    return;
  }
  if (!device.value.brand.trim()) {
    viewAlert('La marca es requerida', 'error');
    return;
  }
  if (!device.value.model.trim()) {
    viewAlert('El modelo es requerido', 'error');
    return;
  }
  if (!device.value.serial.trim()) {
    viewAlert('El número de serie es requerido', 'error');
    return;
  }
  if (!device.value.ipAddress.trim()) {
    viewAlert('La dirección IP es requerida', 'error');
    return;
  }
  if (!device.value.port || device.value.port < 1 || device.value.port > 65535) {
    viewAlert('El puerto debe estar entre 1 y 65535', 'error');
    return;
  }

  loading.value = true;

  try {
    const url = isEditing.value 
      ? `http://dvsapp.com/api/biometric-devices/${route.params.id}`
      : 'http://dvsapp.com/api/biometric-devices';

    const formData = new FormData();
    
    // Campos obligatorios
    formData.append('device[device_type]', device.value.deviceType);
    formData.append('device[name]', device.value.name.trim());
    formData.append('device[brand]', device.value.brand.trim());
    formData.append('device[model]', device.value.model.trim());
    formData.append('device[serial]', device.value.serial.trim());
    formData.append('device[ip_address]', device.value.ipAddress.trim());
    formData.append('device[port]', device.value.port);

    // Campos opcionales
    if (device.value.partNumber) formData.append('device[part_number]', device.value.partNumber);
    if (device.value.username) formData.append('device[username]', device.value.username);
    if (device.value.password) formData.append('device[password]', device.value.password);
    if (device.value.comment) formData.append('device[comment]', device.value.comment);

    // Para métodos PUT en Laravel
    if (isEditing.value) {
      formData.append('_method', 'PUT');
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      viewAlert(isEditing.value ? 'Dispositivo actualizado' : 'Dispositivo creado', 'success');
      setTimeout(() => {
        router.push({ name: 'listBiometricDevice' });
      }, 2000);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al guardar el dispositivo');
    }
  } catch (error) {
    viewAlert('Error: ' + error.message, 'error');
  } finally {
    loading.value = false;
    showPassword.value = false;
  }
};

// Cancelar y regresar a la lista
const cancelForm = () => {
  router.push({ name: 'listBiometricDevice' });
};

// Cargar datos al montar
onMounted(() => {
  loadDeviceData();
});
</script>

<style scoped>
.card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  border-radius: 8px 8px 0 0 !important;
  font-weight: 600;
}

.form-control:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.btn {
  min-width: 120px;
}

.text-success {
  color: #198754 !important;
}

h5 {
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
}

span {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.input-group .btn {
  min-width: auto;
  padding: 0.375rem 0.75rem;
}
</style>