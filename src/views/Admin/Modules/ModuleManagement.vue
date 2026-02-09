<template>
  <div class="module-management-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-th-large me-2 text-primary"></i>
        Administración de Módulos
      </h2>
      <button @click="openCreateModal" class="btn btn-primary">
        <i class="fa-solid fa-plus me-2"></i>
        Nuevo Módulo
      </button>
    </div>

    <!-- Tabla de módulos -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Icono</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="module in validModules" :key="module.id">
                <td>{{ module?.id || '-' }}</td>
                <td>{{ module?.name || '-' }}</td>
                <td>{{ module?.description || '-' }}</td>
                <td>
                  <i :class="module?.icon || 'fa-solid fa-folder'"></i>
                  {{ module?.icon || 'Sin icono' }}
                </td>
                <td>
                  <span :class="module?.active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ module?.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(module?.created_at) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="openEditModal(module)"
                      title="Editar módulo"
                      v-if="module && module.id"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-warning btn-sm"
                      @click="toggleModuleStatus(module?.id, module?.active)"
                      title="Desactivar/Activar módulo"
                      :disabled="loadingDelete === module?.id"
                    >
                      <i v-if="loadingDelete === module?.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else :class="module?.active ? 'fa-solid fa-ban' : 'fa-solid fa-check-circle'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="modules.length === 0" class="text-center py-5">
          <i class="fa-solid fa-th-large fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">No se encontraron módulos</h5>
          <p class="text-muted">No hay módulos registrados aún.</p>
          <button @click="openCreateModal" class="btn btn-primary">
            <i class="fa-solid fa-plus me-2"></i>
            Crear primer módulo
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo' }}</h3>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="moduleName" class="form-label">Nombre *</label>
              <input
                type="text"
                class="form-control"
                id="moduleName"
                v-model="form.name"
                :class="{ 'is-invalid': errors.name }"
                placeholder="Ingrese el nombre del módulo"
                required
              />
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="moduleDescription" class="form-label">Descripción</label>
              <textarea
                class="form-control"
                id="moduleDescription"
                v-model="form.description"
                :class="{ 'is-invalid': errors.description }"
                placeholder="Ingrese una descripción del módulo"
                rows="3"
              ></textarea>
              <div v-if="errors.description" class="invalid-feedback">
                {{ errors.description }}
              </div>
            </div>
            
            <div class="mb-3">
              <label for="moduleIcon" class="form-label">Icono</label>
              <input
                type="text"
                class="form-control"
                id="moduleIcon"
                v-model="form.icon"
                :class="{ 'is-invalid': errors.icon }"
                placeholder="Ej: fa-solid fa-home"
              />
              <div v-if="errors.icon" class="invalid-feedback">
                {{ errors.icon }}
              </div>
              <small class="form-text text-muted">
                Puede usar cualquier icono de Font Awesome (ej: fa-solid fa-home)
              </small>
            </div>
            
            <div class="mb-3 form-check">
              <input
                type="checkbox"
                class="form-check-input"
                id="moduleActive"
                v-model="form.active"
              />
              <label class="form-check-label" for="moduleActive">
                Activo
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="loadingSave">
            <i v-if="loadingSave" class="fa-solid fa-spinner fa-spin me-2"></i>
            {{ editingModule ? 'Actualizar' : 'Guardar' }}
          </button>
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
const modules = ref([])
const showModal = ref(false)
const editingModule = ref(null)
const loadingDelete = ref(null)
const loadingSave = ref(false)
const errors = ref({})

// Form data
const form = ref({
  name: '',
  description: '',
  icon: '',
  active: true
})

// Variables para modales
const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  callback: null
})

// Propiedades computadas
const validModules = computed(() => {
  if (!modules.value) return []
  // Si es un array, filtrar directamente
  if (Array.isArray(modules.value)) {
    return modules.value.filter(module =>
      module &&
      typeof module === 'object' &&
      module.id != null &&
      module.id !== undefined &&
      !isNaN(module.id)
    )
  }
  // Si es un objeto de respuesta paginada, usar la propiedad data
  if (modules.value.data && Array.isArray(modules.value.data)) {
    return modules.value.data.filter(module =>
      module &&
      typeof module === 'object' &&
      module.id != null &&
      module.id !== undefined &&
      !isNaN(module.id)
    )
  }
  // Si no es ni array ni objeto paginado, devolver array vacío
  return []
})

const notificationModal = ref({
  show: false,
  title: 'Notificación',
  message: '',
  type: 'info'
})

// Methods
const loadModules = async () => {
  try {
    console.log('Cargando módulos...')
    const response = await api.get('/modules')
    console.log('Respuesta del backend:', response)

    // Manejar respuesta paginada del backend
    if (response.data && response.data.data) {
      // Es una respuesta paginada
      modules.value = response.data.data
      console.log('Módulos cargados (paginados):', response.data.data)
    } else {
      // Es una respuesta directa
      modules.value = response.data
      console.log('Módulos cargados (directos):', response.data)
    }
  } catch (error) {
    console.error('Error al cargar módulos:', error)
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
    modules.value = []
  }
}

const openCreateModal = () => {
  editingModule.value = null
  form.value = {
    name: '',
    description: '',
    icon: '',
    active: true
  }
  errors.value = {}
  showModal.value = true
}

const openEditModal = (module) => {
  editingModule.value = module
  form.value = {
    name: module.name,
    description: module.description || '',
    icon: module.icon || '',
    active: module.active
  }
  errors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingModule.value = null
  errors.value = {}
}

const handleSubmit = async () => {
  errors.value = {}
  loadingSave.value = true

  try {
    let response
    const submitData = { ...form.value }

    if (editingModule.value) {
      // Update existing module
      response = await api.put(`/modules/${editingModule.value.id}`, submitData)
    } else {
      // Create new module
      response = await api.post('/modules', submitData)
    }

    // Show success message
    showNotification(
      'Éxito',
      editingModule.value ? 'Módulo actualizado correctamente' : 'Módulo creado exitosamente',
      'success'
    )

    // Reload modules and close modal
    await loadModules()
    closeModal()
  } catch (error) {
    console.error('Error al guardar el módulo:', error)

    // Handle validation errors
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      showNotification(
        'Error',
        'Por favor corrija los errores en el formulario',
        'danger'
      )
    } else {
      showNotification(
        'Error',
        'Ocurrió un error al guardar el módulo. Por favor inténtelo de nuevo.',
        'danger'
      )
    }
  } finally {
    loadingSave.value = false
  }
}

const toggleModuleStatus = async (moduleId, currentStatus) => {
  const newStatus = currentStatus ? false : true;
  const action = newStatus ? 'activar' : 'desactivar';
  const actionTitle = newStatus ? 'Activar' : 'Desactivar';

  showConfirmation(
    'Confirmación requerida',
    `¿Está seguro de que desea ${action} este módulo?`,
    async () => {
      loadingDelete.value = moduleId

      try {
        // Enviar solicitud para cambiar el estado del módulo
        await api.patch(`/modules/${moduleId}/activate`, {
          active: newStatus
        })

        // Actualizar el estado del módulo en la lista local
        if (Array.isArray(modules.value)) {
          const moduleIndex = modules.value.findIndex(m => m.id === moduleId);
          if (moduleIndex !== -1) {
            modules.value[moduleIndex].active = newStatus;
          }
        } else if (modules.value && modules.value.data && Array.isArray(modules.value.data)) {
          // Si es una respuesta paginada, actualizar la propiedad data
          const moduleIndex = modules.value.data.findIndex(m => m.id === moduleId);
          if (moduleIndex !== -1) {
            modules.value.data[moduleIndex].active = newStatus;
          }
        }

        showNotification(
          'Éxito',
          `Módulo ${action} exitosamente`,
          'success'
        )
      } catch (error) {
        console.error(`Error al ${action} módulo:`, error)
        showNotification(
          'Error',
          `Ocurrió un error al ${action} el módulo. Por favor inténtelo de nuevo.`,
          'danger'
        )
      } finally {
        loadingDelete.value = null
      }
    }
  )
}

const deleteModule = async (moduleId) => {
  showConfirmation(
    'Confirmación requerida',
    '¿Está seguro de que desea eliminar este módulo? Esta acción no se puede deshacer.',
    async () => {
      loadingDelete.value = moduleId

      try {
        await api.delete(`/modules/${moduleId}`)

        // Remove module from local array
        if (Array.isArray(modules.value)) {
          modules.value = modules.value.filter(m => m.id !== moduleId)
        } else if (modules.value && modules.value.data && Array.isArray(modules.value.data)) {
          // Si es una respuesta paginada, actualizar la propiedad data
          modules.value.data = modules.value.data.filter(m => m.id !== moduleId)
        }

        showNotification(
          'Éxito',
          'Módulo eliminado exitosamente',
          'success'
        )
      } catch (error) {
        console.error('Error al eliminar módulo:', error)
        showNotification(
          'Error',
          'Ocurrió un error al eliminar el módulo. Por favor inténtelo de nuevo.',
          'danger'
        )
      } finally {
        loadingDelete.value = null
      }
    }
  )
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
  await loadModules()
})
</script>

<style scoped>
.module-management-container {
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
  text-align: left;
}

.modal-body .form-label {
  font-weight: 600;
  margin-bottom: 5px;
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

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>