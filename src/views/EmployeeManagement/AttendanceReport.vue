<template>
  <div class="container">
    <div class="header">
      <h2 class="title">📋 Reporte de Alertas por Empleados</h2>
    </div>

    <!-- Filtros -->
    <div class="filters mb-4">
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Fecha Inicio</label>
          <input v-model="filters.startDate" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Fecha Fin</label>
          <input v-model="filters.endDate" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label">Empleado (ID)</label>
          <input
            v-model="filters.employeeNo"
            type="text"
            class="form-control"
            placeholder="Ej: 76218"
          />
        </div>
        <div class="col-md-3">
          <label class="form-label">Nombre Empleado</label>
          <input
            v-model="filters.employeeName"
            type="text"
            class="form-control"
            placeholder="Ej: Porfilio Trujillo"
          />
        </div>
        <div class="col-md-3">
          <label class="form-label">Dispositivo</label>
          <select v-model="filters.deviceId" class="form-select">
            <option value="">Todos los dispositivos</option>
            <option
              v-for="device in biometricDevices"
              :key="device.id"
              :value="device.id"
            >
              {{ device.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="actions mb-4">
      <button
        @click="applyFilters"
        class="btn btn-primary me-2"
        :disabled="loading"
      >
        <i class="fa fa-search me-1"></i>
        Filtrar
      </button>
      <button
        @click="exportToCSV"
        class="btn btn-success"
        :disabled="loading || events.length === 0"
      >
        <i class="fa fa-file-export me-1"></i>
        Exportar CSV
      </button>
    </div>

    <!-- Mensajes de estado -->
    <div v-if="error" class="alert alert-error mt-3">
      <i class="fa fa-exclamation-circle me-2"></i>
      {{ error }}
    </div>

    <div v-if="successMessage" class="alert alert-success mt-3" v-html="successMessage"></div>

    <!-- Barra de carga -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      Cargando reporte de asistencia...
    </div>

    <!-- Tabla de asistencia -->
    <div v-else-if="events.length === 0" class="empty-state">
      No hay registros de asistencia para los filtros seleccionados.
    </div>

    <div v-else class="table-container">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>ID Empleado</th>
            <th>Nombre</th>
            <th>Dispositivo</th>
            <th>Puerta</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in paginatedEvents" :key="event.id">
            <td>{{ event.datetime }}</td>
            <td>{{ event.employee_id }}</td>
            <td>{{ event.name }}</td>
            <td>{{ event.device_name }}</td>
            <td>{{ event.door_no || "N/A" }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Paginación -->
      <div v-if="events.length > itemsPerPage" class="pagination mt-3">
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
      
      <div class="table-stats mb-3">
        Mostrando {{ events.length }} registros de asistencia
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from '@/services/api';

const loading = ref(false);
const events = ref([]);
const biometricDevices = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(20);
const successMessage = ref(null);
const error = ref(null);

// Obtener fechas dinámicas
const today = new Date();
const todayString = today.toISOString().split('T')[0];
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);
const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];

const filters = ref({
  startDate: thirtyDaysAgoString,
  endDate: todayString,
  employeeNo: "",
  employeeName: "",
  deviceId: "",
});

// Cargar dispositivos al montar
onMounted(async () => {
  await loadBiometricDevices();
  await loadAttendanceReport();
});

// Cargar dispositivos
const loadBiometricDevices = async () => {
  try {
    const response = await api.get('/biometric-devices');
    biometricDevices.value = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Error al cargar dispositivos:", err);
    error.value = 'No se pudieron cargar los dispositivos: ' + (err.response?.data?.message || err.message);
  }
};

// Cargar reporte de asistencia
const loadAttendanceReport = async () => {
  loading.value = true;
  successMessage.value = null;
  error.value = null;

  try {
    const params = new URLSearchParams();
    params.append("start_date", filters.value.startDate);
    params.append("end_date", filters.value.endDate);
    if (filters.value.employeeNo)
      params.append("employee_no", filters.value.employeeNo);
    if (filters.value.employeeName)
      params.append("employee_name", filters.value.employeeName);
    if (filters.value.deviceId)
      params.append("device_id", filters.value.deviceId);

    const response = await fetch(
      `http://dvsapp.com/api/attendance-report?${params}`
    );
    const data = await response.json();

    if (data.success) {
      // 👇 Ordenar por fecha y hora (más reciente primero)
      const sortedEvents = (data.data || []).sort((a, b) => {
        return new Date(b.datetime) - new Date(a.datetime);
      });
      events.value = sortedEvents;
    }
  } catch (err) {
    error.value = 'Error al cargar reporte: ' + err.message;
    console.error("Error al cargar reporte:", err);
  } finally {
    loading.value = false;
  }
};

// Aplicar filtros
const applyFilters = () => {
  currentPage.value = 1;
  loadAttendanceReport();
};

// Paginación
const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return events.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(events.value.length / itemsPerPage.value);
});

// Exportar a CSV
const exportToCSV = () => {
  if (events.value.length === 0) return;

  const csvContent = [
    [
      "Fecha y Hora",
      "ID Empleado", 
      "Nombre",
      "Dispositivo",
      "Puerta",
    ],
    ...events.value.map((event) => [
      event.datetime,
      event.employee_id,
      event.name,
      event.device_name,
      event.door_no || "N/A",
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `reporte_asistencia_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

.form-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.form-control,
.form-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 10px;
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
  background-color: #4caf50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-success {
  background-color: #2196f3;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1976d2;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
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

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

.attendance-table th,
.attendance-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
  vertical-align: top;
}

.attendance-table thead {
  background-color: #e8f5e8;
  color: #2e7d32;
  font-weight: bold;
}

.attendance-table tbody tr:hover {
  background-color: #f9f9f9;
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

.me-2 {
  margin-right: 8px;
}

.col-md-3 {
  flex: 0 0 25%;
  max-width: 25%;
}

@media (max-width: 768px) {
  .col-md-3 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

/* Estilos para mensajes de estado */
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
</style>