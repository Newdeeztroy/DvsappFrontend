<template>
  <div class="container">
    <div class="header">
      <h2 class="title">👥 Usuarios Sincronizados</h2>
    </div>

    <!-- Filtros -->
    <div class="filters mb-4">
      <div class="row g-3">
        <div class="col-md-4">
          <input
            v-model="searchTerm"
            type="text"
            class="form-control"
            placeholder="Buscar por nombre o ID..."
          />
        </div>
        <div class="col-md-3">
          <select v-model="statusFilter" class="form-select">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="deviceFilter" class="form-select">
            <option value="">Todos los dispositivos</option>
            <option
              v-for="device in uniqueDevices"
              :key="device.id"
              :value="device.id"
            >
              {{ device.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Cargando usuarios...
    </div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      No hay usuarios sincronizados.
    </div>

    <div v-else class="table-container">
      <div class="table-stats mb-3">
        Mostrando {{ filteredUsers.length }} de {{ users.length }} usuarios
      </div>
      
      <table class="users-table">
        <thead>
          <tr>
            <th>ID Empleado</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Vigencia</th>
            <th>Dispositivos</th>
            <th>Acceso</th>
            <th>Biometría</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.employee_no">
            <td>{{ user.employee_no }}</td>
            <td>{{ user.name }}</td>
            <td>
              <span :class="`status-badge status-${user.status}`">
                {{ user.status === 'activo' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div v-if="user.valid_from && user.valid_to">
                {{ formatDate(user.valid_from) }} - {{ formatDate(user.valid_to) }}
              </div>
              <div v-else class="text-muted">Sin vigencia</div>
            </td>
            <td>
              <div class="device-list">
                <span
                  v-for="(deviceName, index) in user.device_names"
                  :key="index"
                  class="device-tag"
                >
                  {{ deviceName }}
                </span>
              </div>
            </td>
            <td>
              <div v-if="user.door_access" class="door-access">
                Puerta(s): {{ user.door_access }}
              </div>
              <div v-else class="text-muted">Sin acceso</div>
            </td>
            <td>
              <div class="biometric-info">
                <span v-if="getBiometricCount(user, 'cards') > 0">
                  🃏 {{ getBiometricCount(user, 'cards') }}
                </span>
                <span v-if="getBiometricCount(user, 'faces') > 0">
                  👤 {{ getBiometricCount(user, 'faces') }}
                </span>
                <span v-if="getBiometricCount(user, 'fingerprints') > 0">
                  👆 {{ getBiometricCount(user, 'fingerprints') }}
                </span>
                <span v-if="totalBiometricCount(user) === 0" class="text-muted">
                  Sin datos
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="filteredUsers.length > itemsPerPage" class="pagination mt-3">
        <button
          @click="currentPage--"
          :disabled="currentPage <= 1"
          class="btn btn-sm btn-outline-secondary"
        >
          ← Anterior
        </button>
        <span class="page-info mx-2">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="btn btn-sm btn-outline-secondary"
        >
          Siguiente →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const loading = ref(false);
const users = ref([]);
const searchTerm = ref('');
const statusFilter = ref('');
const deviceFilter = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(20);

// Cargar usuarios al montar
onMounted(() => {
  loadUsers();
});

// Cargar usuarios desde la API
const loadUsers = async () => {
  loading.value = true;

  try {
    const response = await fetch(`${process.env.VUE_APP_API_URL || process.env.VITE_API_URL || 'http://dvsapp.com/api'}/device-users`);
    if (!response.ok) throw new Error('Error al cargar usuarios');
    const data = await response.json();
    users.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  } finally {
    loading.value = false;
  }
};

// Obtener dispositivos únicos para el filtro
const uniqueDevices = computed(() => {
  const devices = new Map();
  users.value.forEach(user => {
    if (user.device_ids && user.device_names) {
      user.device_ids.forEach((id, index) => {
        const name = user.device_names[index] || `Dispositivo ${id}`;
        if (!devices.has(id)) {
          devices.set(id, { id, name });
        }
      });
    }
  });
  return Array.from(devices.values());
});

// Filtrar usuarios
const filteredUsers = computed(() => {
  let filtered = users.value;
  
  // Búsqueda por nombre o ID
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.employee_no.toString().includes(term)
    );
  }
  
  // Filtro por estado
  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value);
  }
  
  // Filtro por dispositivo
  if (deviceFilter.value) {
    filtered = filtered.filter(user =>
      user.device_ids && user.device_ids.includes(deviceFilter.value)
    );
  }
  
  return filtered;
});

// Paginación
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredUsers.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value);
});

// Resetear página cuando cambian los filtros
watch([searchTerm, statusFilter, deviceFilter], () => {
  currentPage.value = 1;
});

// Funciones auxiliares
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO');
};

const getBiometricCount = (user, type) => {
  if (!user.biometric_data) return 0;
  const data = user.biometric_data[type];
  return Array.isArray(data) ? data.length : (data || 0);
};

const totalBiometricCount = (user) => {
  return getBiometricCount(user, 'cards') +
         getBiometricCount(user, 'faces') +
         getBiometricCount(user, 'fingerprints');
};
</script>

<style scoped>
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
  margin: 0;
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

.table-stats {
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}

.table-container {
  overflow-x: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.users-table th,
.users-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.users-table thead {
  background-color: #e8f5e8;
  color: #2e7d32;
  font-weight: bold;
}

.users-table tbody tr:hover {
  background-color: #f9f9f9;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
}

.status-activo {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.status-inactivo {
  background-color: #ffebee;
  color: #c62828;
}

.device-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.device-tag {
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.door-access {
  font-size: 0.875rem;
  color: #455a64;
}

.biometric-info {
  display: flex;
  gap: 8px;
  font-size: 0.875rem;
  color: #5d4037;
}

.text-muted {
  color: #999;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.page-info {
  font-size: 0.875rem;
  color: #666;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.mb-4 {
  margin-bottom: 24px;
}
</style>