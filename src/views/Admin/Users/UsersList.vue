<template>
  <div class="users-list-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-users me-2 text-primary"></i>
        Gestión de Usuarios
      </h2>
      <router-link to="/admin/users/create" class="btn btn-primary">
        <i class="fa-solid fa-user-plus me-2"></i>
        Nuevo Usuario
      </router-link>
    </div>

    <!-- Filtros -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="filterName" class="form-label">Buscar por nombre</label>
            <input
              type="text"
              class="form-control"
              id="filterName"
              v-model="filters.name"
              placeholder="Nombre del usuario"
            />
          </div>
          <div class="col-md-3">
            <label for="filterEmail" class="form-label">Buscar por email</label>
            <input
              type="text"
              class="form-control"
              id="filterEmail"
              v-model="filters.email"
              placeholder="Email del usuario"
            />
          </div>
          <div class="col-md-3">
            <label for="filterRole" class="form-label">Filtrar por rol</label>
            <select class="form-select" id="filterRole" v-model="filters.role_id">
              <option value="">Todos los roles</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="filterStatus" class="form-label">Estado</label>
            <select class="form-select" id="filterStatus" v-model="filters.status">
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Última conexión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge bg-info">{{ getRoleName(user.role_id) }}</span>
                </td>
                <td>
                  <span :class="getStatusClass(user.status)">
                    {{ getStatusText(user.status) }}
                  </span>
                </td>
                <td>
                  {{ formatDate(user.last_login_at) || 'Nunca' }}
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <router-link
                      :to="`/admin/users/edit/${user.id}`"
                      class="btn btn-outline-primary btn-sm"
                      title="Editar usuario"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </router-link>
                    <button
                      class="btn btn-outline-warning btn-sm"
                      @click="showToggleConfirmation(user.id, user.status)"
                      title="Activar/Desactivar usuario"
                      :disabled="loadingToggle === user.id"
                    >
                      <i v-if="loadingToggle === user.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else :class="user.status === 'active' ? 'fa-solid fa-ban' : 'fa-solid fa-check-circle'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="filteredUsers.length === 0" class="text-center py-5">
          <i class="fa-solid fa-users fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron usuarios</h5>
          <p class="text-muted">
            {{ users.length === 0 ? 'No hay usuarios registrados aún.' : 'No hay usuarios que coincidan con los filtros aplicados.' }}
          </p>
          <router-link v-if="users.length > 0" to="/admin/users/create" class="btn btn-primary">
            <i class="fa-solid fa-user-plus me-2"></i>
            Crear primer usuario
          </router-link>
        </div>
      </div>
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

    <!-- Modal de notificación de éxito -->
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
import { useRouter } from 'vue-router'
import api from '@/services/api'

// Router
const router = useRouter()

// Reactive data
const users = ref([])
const roles = ref([])
const filters = ref({
  name: '',
  email: '',
  role_id: '',
  status: ''
})
const loadingDelete = ref(null)
const loadingToggle = ref(null)

// Variables para modales
const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  type: 'confirm',
  callback: null
})

const notificationModal = ref({
  show: false,
  title: 'Notificación',
  message: '',
  type: 'info'
})

// Computed properties
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Filter by name
    if (filters.value.name && !user.name.toLowerCase().includes(filters.value.name.toLowerCase())) {
      return false
    }
    
    // Filter by email
    if (filters.value.email && !user.email.toLowerCase().includes(filters.value.email.toLowerCase())) {
      return false
    }
    
    // Filter by role
    if (filters.value.role_id && user.role_id.toString() !== filters.value.role_id) {
      return false
    }
    
    // Filter by status
    if (filters.value.status && user.status !== filters.value.status) {
      return false
    }
    
    return true
  })
})

// Methods
const loadUsers = async () => {
  try {
    const response = await api.get('/users')
    users.value = response.data
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    users.value = []
  }
}

const loadRoles = async () => {
  try {
    const response = await api.get('/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
  }
}

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

const showToggleConfirmation = (userId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'activar' : 'desactivar'

  showConfirmation(
    'Confirmación requerida',
    `¿Está seguro de que desea ${action} este usuario?`,
    () => toggleUserStatus(userId, currentStatus)
  )
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

const closeNotificationModal = () => {
  notificationModal.value.show = false
  notificationModal.value.message = ''
}

const deleteUser = async (userId) => {
  showConfirmation(
    'Confirmación requerida',
    '¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer.',
    async () => {
      loadingDelete.value = userId

      try {
        await api.delete(`/user/${userId}`)
        // Remove user from local array
        users.value = users.value.filter(user => user.id !== userId)
        showNotification(
          'Operación exitosa',
          'Usuario eliminado exitosamente',
          'success'
        )
      } catch (error) {
        console.error('Error al eliminar usuario:', error)
        showNotification(
          'Error',
          'Ocurrió un error al eliminar el usuario. Por favor inténtelo de nuevo.',
          'danger'
        )
      } finally {
        loadingDelete.value = null
      }
    }
  )
}

const toggleUserStatus = async (userId, currentStatus) => {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const action = newStatus === 'active' ? 'activar' : 'desactivar'

  console.log(`Intentando cambiar estado del usuario ID: ${userId} de "${currentStatus}" a "${newStatus}"`)

  loadingToggle.value = userId

  try {
    console.log(`Enviando solicitud para actualizar usuario ID: ${userId} con estado: ${newStatus}`);
    console.log(`Endpoint completo: /users/${userId}/status`);
    console.log(`Datos enviados:`, { status: newStatus });

    const response = await api.patch(`/users/${userId}/status`, {
      status: newStatus
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Usuario ID: ${userId} ${action}do exitosamente:`, response);
    console.log(`Respuesta del servidor:`, response.data);

    // Actualizar el estado del usuario en la lista local
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].status = newStatus
    }

    showNotification(
      'Operación exitosa',
      `Usuario ${action}do exitosamente`,
      'success'
    )
  } catch (error) {
    console.error(`Error al ${action} usuario:`, error)
    
    // **CORRECCIÓN PRINCIPAL AQUÍ:**
    // Obtener el mensaje específico del backend
    let errorMessage = 'Ocurrió un error. Por favor inténtelo de nuevo.'
    
    // Verificar si hay respuesta del backend
    if (error.response && error.response.data) {
      const errorData = error.response.data
      
      // Mostrar el mensaje EXACTO que viene del backend
      if (errorData.message) {
        errorMessage = errorData.message
      } else if (errorData.error) {
        errorMessage = errorData.error
      } else if (typeof errorData === 'string') {
        errorMessage = errorData
      }
      
      // Si es un error de validación, mostrar los errores específicos
      if (errorData.errors) {
        const validationErrors = Object.values(errorData.errors).flat()
        errorMessage = validationErrors.join(', ')
      }
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // **MOSTRAR LA NOTIFICACIÓN CON EL MENSAJE CORRECTO**
    showNotification(
      'Error',
      errorMessage,  // ← Esto mostrará "No puedes eliminar tu propio usuario"
      'danger'
    )
    
  } finally {
    loadingToggle.value = null
  }
}

const getRoleName = (roleId) => {
  if (!roles.value || !Array.isArray(roles.value)) {
    return 'Cargando...'
  }
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : 'Sin rol'
}

const getStatusText = (status) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'pending':
      return 'Pendiente'
    default:
      return status
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'active':
      return 'badge bg-success'
    case 'inactive':
      return 'badge bg-secondary'
    case 'pending':
      return 'badge bg-warning'
    default:
      return 'badge bg-secondary'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Initialize data
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadRoles()
  ])
})
</script>

<style scoped>
.users-list-container {
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

.btn-outline-primary {
  color: #259634;
  border-color: #259634;
}

.btn-outline-primary:hover {
  background-color: #259634;
  border-color: #259634;
  color: white;
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