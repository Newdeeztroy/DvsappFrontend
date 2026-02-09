<template>
  <div class="permission-management-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-key me-2 text-primary"></i>
        Gestión de Permisos
      </h2>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="filterUser" class="form-label">Filtrar por Usuario</label>
            <select class="form-select" id="filterUser" v-model="filters.userId">
              <option value="">Todos los usuarios</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="filterModule" class="form-label">Filtrar por Módulo</label>
            <select class="form-select" id="filterModule" v-model="filters.moduleId">
              <option value="">Todos los módulos</option>
              <option v-for="module in modules" :key="module.id" :value="module.id">
                {{ module.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="filterAction" class="form-label">Filtrar por Acción</label>
            <select class="form-select" id="filterAction" v-model="filters.action">
              <option value="">Todas las acciones</option>
              <option value="view">Ver</option>
              <option value="create">Crear</option>
              <option value="edit">Editar</option>
              <option value="delete">Eliminar</option>
              <option value="deactivate">Desactivar</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de permisos -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Usuario</th>
                <th>Módulo</th>
                <th>Submódulo</th>
                <th>Acción</th>
                <th>Estado</th>
                <th>Fecha de Asignación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in filteredPermissions" :key="permission.id">
                <td>{{ getUserById(permission.user_id)?.name || 'Usuario Desconocido' }}</td>
                <td>{{ getModuleById(permission.module_id)?.name || 'Módulo Desconocido' }}</td>
                <td>{{ permission.submodule || 'N/A' }}</td>
                <td>
                  <span class="badge" :class="getActionBadgeClass(permission.action)">
                    {{ getActionText(permission.action) }}
                  </span>
                </td>
                <td>
                  <span :class="permission.active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ permission.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(permission.created_at) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="removePermission(permission.id)"
                      title="Eliminar permiso"
                      :disabled="loadingRemove === permission.id"
                    >
                      <i v-if="loadingRemove === permission.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="filteredPermissions.length === 0" class="text-center py-5">
          <i class="fa-solid fa-key fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron permisos</h5>
          <p class="text-muted">
            {{ permissions.length === 0 ? 'No hay permisos registrados aún.' : 'No hay permisos que coincidan con los filtros aplicados.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Botón para exportar a Excel -->
    <div class="mt-4 text-end">
      <button @click="exportToExcel" class="btn btn-success">
        <i class="fa-solid fa-file-excel me-2"></i>
        Exportar a Excel
      </button>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="confirmModal.show" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ confirmModal.title }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmModal.message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="handleCancelAction">Cancelar</button>
          <button class="btn btn-primary" @click="handleConfirmAction">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de notificación -->
    <div v-if="notificationModal.show" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa-solid fa-check-circle" style="color: #4CAF50; font-size: 48px;"></i>
        </div>
        <h3 class="modal-title">{{ notificationModal.title }}</h3>
        <p class="modal-message">{{ notificationModal.message }}</p>
        <button class="btn btn-primary" @click="closeNotificationModal">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

// Reactive data
const permissions = ref([])
const users = ref([])
const modules = ref([])
const submodules = ref([])
const filters = ref({
  userId: '',
  moduleId: '',
  action: ''
})
const loadingRemove = ref(null)

// Variables para modales
const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  callback: null
})

const notificationModal = ref({
  show: false,
  title: 'Notificación',
  message: '',
  type: 'info'
})

// Computed properties
const filteredPermissions = computed(() => {
  return permissions.value.filter(permission => {
    // Filter by user
    if (filters.value.userId && permission.user_id.toString() !== filters.value.userId) {
      return false
    }

    // Filter by module
    if (filters.value.moduleId && permission.module_id.toString() !== filters.value.moduleId) {
      return false
    }

    // Filter by action
    if (filters.value.action && permission.action !== filters.value.action) {
      return false
    }

    return true
  })
})

// Methods
const loadPermissions = async () => {
  try {
    const response = await api.get('/permissions')
    permissions.value = response.data
  } catch (error) {
    console.error('Error al cargar permisos:', error)
    permissions.value = []
  }
}

const loadUsers = async () => {
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    users.value = []
  }
}

const loadModules = async () => {
  try {
    const response = await api.get('/modules')
    modules.value = response.data
  } catch (error) {
    console.error('Error al cargar módulos:', error)
    modules.value = []
  }
}

const loadSubmodules = async () => {
  try {
    const response = await api.get('/submodules')
    submodules.value = response.data
  } catch (error) {
    console.error('Error al cargar submódulos:', error)
    submodules.value = []
  }
}

const getUserById = (userId) => {
  return users.value.find(user => user.id === userId)
}

const getModuleById = (moduleId) => {
  return modules.value.find(module => module.id === moduleId)
}

const getActionText = (action) => {
  const actionMap = {
    view: 'Ver',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar',
    deactivate: 'Desactivar'
  }
  return actionMap[action] || action
}

const getActionBadgeClass = (action) => {
  const actionClasses = {
    view: 'badge bg-info',
    create: 'badge bg-success',
    edit: 'badge bg-warning',
    delete: 'badge bg-danger',
    deactivate: 'badge bg-secondary'
  }
  return actionClasses[action] || 'badge bg-light'
}

const removePermission = async (permissionId) => {
  showConfirmation(
    'Confirmación requerida',
    '¿Está seguro de que desea eliminar este permiso?',
    async () => {
      loadingRemove.value = permissionId

      try {
        await api.delete(`/permissions/${permissionId}`)
        
        // Remove permission from local array
        permissions.value = permissions.value.filter(p => p.id !== permissionId)
        
        showNotification(
          'Éxito',
          'Permiso eliminado exitosamente',
          'success'
        )
      } catch (error) {
        console.error('Error al eliminar permiso:', error)
        showNotification(
          'Error',
          'Ocurrió un error al eliminar el permiso. Por favor inténtelo de nuevo.',
          'danger'
        )
      } finally {
        loadingRemove.value = null
      }
    }
  )
}

const exportToExcel = async () => {
  try {
    // Simular descarga de Excel
    showNotification(
      'Exportación',
      'La funcionalidad de exportación a Excel está en desarrollo.',
      'info'
    )
    
    // Aquí iría la lógica real para exportar a Excel
    // await api.get('/permissions/export/excel', { responseType: 'blob' })
    // const url = window.URL.createObjectURL(new Blob([response.data]))
    // const link = document.createElement('a')
    // link.href = url
    // link.setAttribute('download', 'permisos.xlsx')
    // document.body.appendChild(link)
    // link.click()
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    showNotification(
      'Error',
      'Ocurrió un error al exportar a Excel. Por favor inténtelo de nuevo.',
      'danger'
    )
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos para manejar los modales
const showConfirmation = (title, message, callback = null) => {
  confirmModal.value.title = title
  confirmModal.value.message = message
  confirmModal.value.callback = callback
  confirmModal.value.show = true
}

const showNotification = (title, message, type = 'info') => {
  notificationModal.value.title = title
  notificationModal.value.message = message
  notificationModal.value.show = true
}

const closeNotificationModal = () => {
  notificationModal.value.show = false
  notificationModal.value.message = ''
}

const handleConfirmAction = () => {
  if (confirmModal.value.callback) {
    confirmModal.value.callback()
  }
  confirmModal.value.show = false
}

const handleCancelAction = () => {
  confirmModal.value.show = false
  confirmModal.value.callback = null
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    loadPermissions(),
    loadUsers(),
    loadModules(),
    loadSubmodules()
  ])
})
</script>

<style scoped>
.permission-management-container {
  padding: 20px;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.badge {
  font-size: 0.8em;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.btn-outline-danger {
  color: #dc3545;
  border-color: #dc3545;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.table-hover tbody tr:hover {
  background-color: rgba(37, 150, 52, 0.05);
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
  border: none;
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
  border: none;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #17521f 0%, #21852f 100%);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #28a745 0%, #218c3d 100%);
  border: none;
}

.btn-success:hover {
  background: linear-gradient(135deg, #218c3d 0%, #1c7a35 100%);
  transform: translateY(-2px);
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