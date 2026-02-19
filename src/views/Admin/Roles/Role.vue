<template>
  <div class="roles-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-shield-alt me-2 text-primary"></i>
        Gestión de Roles
      </h2>
      <button @click="showForm = true" class="btn btn-primary">
        <i class="fa-solid fa-plus me-2"></i>
        Nuevo Rol
      </button>
    </div>

    <!-- Formulario para crear/editar rol -->
    <div v-if="showForm" class="card mb-4">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="fa-solid fa-shield-plus me-2"></i>
          {{ editingRole ? 'Editar Rol' : 'Crear Nuevo Rol' }}
        </h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <!-- Nombre del rol -->
            <div class="col-md-6 mb-3">
              <label for="name" class="form-label fw-bold">Nombre *</label>
              <input
                type="text"
                class="form-control"
                id="name"
                v-model="form.name"
                :class="{ 'is-invalid': errors.name }"
                placeholder="Ingrese el nombre del rol"
                required
              />
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Descripción del rol -->
            <div class="col-md-6 mb-3">
              <label for="description" class="form-label fw-bold">Descripción</label>
              <input
                type="text"
                class="form-control"
                id="description"
                v-model="form.description"
                :class="{ 'is-invalid': errors.description }"
                placeholder="Ingrese una descripción del rol"
              />
              <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
            >
              <i class="fa-solid fa-times me-2"></i>
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              <i v-if="loading" class="fa-solid fa-spinner fa-spin me-2"></i>
              <i v-else class="fa-solid fa-floppy-disk me-2"></i>
              {{ editingRole ? 'Actualizar Rol' : 'Crear Rol' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de roles -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Usuarios</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td>{{ role.id }}</td>
                <td>{{ role.name }}</td>
                <td>{{ role.description || '-' }}</td>
                <td>{{ role.users_count || 0 }}</td>
                <td>{{ formatDate(role.created_at) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="editRole(role)"
                      title="Editar rol"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger btn-sm"
                      @click="deleteRole(role.id)"
                      title="Eliminar rol"
                      :disabled="loadingDelete === role.id"
                    >
                      <i v-if="loadingDelete === role.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="roles.length === 0" class="text-center py-5">
          <i class="fa-solid fa-shield-alt fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron roles</h5>
          <p class="text-muted">No hay roles registrados aún.</p>
          <button @click="showForm = true" class="btn btn-primary">
            <i class="fa-solid fa-plus me-2"></i>
            Crear primer rol
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="modal-overlay" @click.self="cancelAction">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ confirmModalTitle }}</h3>
        </div>
        <div class="modal-body">
          <p>{{ confirmModalMessage }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelAction">Cancelar</button>
          <button class="btn btn-primary" @click="confirmAction">Aceptar</button>
        </div>
      </div>
    </div>

    <!-- Modal de notificación -->
    <div v-if="showNotificationModal" class="modal-overlay" @click.self="closeNotification">
      <div class="modal-content">
        <div class="modal-icon">
          <i class="fa-solid fa-check-circle" style="color: #4CAF50; font-size: 48px;"></i>
        </div>
        <h3 class="modal-title">{{ notificationTitle }}</h3>
        <p class="modal-message">{{ notificationMessage }}</p>
        <button class="btn btn-primary" @click="closeNotification">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// Reactive data
const roles = ref([])
const showForm = ref(false)
const editingRole = ref(null)
const loading = ref(false)
const loadingDelete = ref(null)
const errors = ref({})

// Modal de confirmación
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmCallback = ref(null)

// Modal de notificación
const showNotificationModal = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')

const form = ref({
  name: '',
  description: ''
})

// Funciones para modales
const showNotification = (title, message) => {
  notificationTitle.value = title
  notificationMessage.value = message
  showNotificationModal.value = true
}

const closeNotification = () => {
  showNotificationModal.value = false
  notificationTitle.value = ''
  notificationMessage.value = ''
}

const showConfirmation = (title, message, callback) => {
  confirmModalTitle.value = title
  confirmModalMessage.value = message
  confirmCallback.value = callback
  showConfirmModal.value = true
}

const cancelAction = () => {
  showConfirmModal.value = false
  confirmCallback.value = null
}

const confirmAction = () => {
  if (confirmCallback.value) {
    confirmCallback.value()
  }
  showConfirmModal.value = false
}

// Methods
const loadRoles = async () => {
  try {
    const response = await api.get('/roles')
    roles.value = response.data
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
  }
}

const handleSubmit = async () => {
  errors.value = {}
  loading.value = true

  try {
    let response
    if (editingRole.value) {
      // Update existing role
      response = await api.put(`/roles/${editingRole.value.id}`, form.value)
    } else {
      // Create new role
      response = await api.post('/roles', form.value)
    }

    // Show success message
    showNotification('Éxito', editingRole.value ? 'Rol actualizado correctamente' : 'Rol creado exitosamente')

    // Reset form and reload roles
    resetForm()
    await loadRoles()
  } catch (error) {
    console.error('Error al guardar el rol:', error)

    // Handle validation errors
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      showNotification('Advertencia', 'Por favor corrija los errores en el formulario')
    } else {
      showNotification('Error', 'Ocurrió un error al guardar el rol. Por favor inténtelo de nuevo.')
    }
  } finally {
    loading.value = false
  }
}

const editRole = (role) => {
  editingRole.value = role
  form.value = {
    name: role.name,
    description: role.description || ''
  }
  showForm.value = true
}

const deleteRole = (roleId) => {
  showConfirmation(
    'Confirmación requerida',
    '¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer.',
    async () => {
      loadingDelete.value = roleId

      try {
        await api.delete(`/roles/${roleId}`)

        // Remove role from local array
        roles.value = roles.value.filter(role => role.id !== roleId)
        showNotification('Éxito', 'Rol eliminado exitosamente')
      } catch (error) {
        console.error('Error al eliminar rol:', error)
        showNotification('Error', 'Ocurrió un error al eliminar el rol. Por favor inténtelo de nuevo.')
      } finally {
        loadingDelete.value = null
      }
    }
  )
}

const resetForm = () => {
  form.value = {
    name: '',
    description: ''
  }
  errors.value = {}
  showForm.value = false
  editingRole.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Initialize data
onMounted(async () => {
  await loadRoles()
})
</script>

<style scoped>
.roles-container {
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

.btn-secondary {
  background-color: #6c757d;
  border: none;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.form-label {
  color: #333;
}

.form-control:focus,
.form-select:focus {
  border-color: #259634;
  box-shadow: 0 0 0 0.2rem rgba(37, 150, 52, 0.25);
}

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
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
  max-width: 500px;
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

.modal-message {
  margin: 0;
}

.modal-icon {
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}
</style>