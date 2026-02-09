<template>
  <div class="user-form-container">
    <div class="card shadow-sm">
      <div class="card-header bg-primary text-white">
        <h4 class="mb-0">
          <i class="fa-solid fa-user-plus me-2"></i>
          {{ isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario' }}
        </h4>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" autocomplete="off">
          <div class="row">
            <!-- Primer Nombre -->
            <div class="col-md-6 mb-3">
              <label for="first_name" class="form-label fw-bold">Primer Nombre *</label>
              <input
                type="text"
                class="form-control"
                id="first_name"
                v-model="formData.first_name"
                :class="{ 'is-invalid': errors.first_name }"
                placeholder="Ingrese el primer nombre"
                required
                autocomplete="off"
              />
              <div v-if="errors.first_name" class="invalid-feedback">
                {{ errors.first_name }}
              </div>
            </div>

            <!-- Apellido -->
            <div class="col-md-6 mb-3">
              <label for="last_name" class="form-label fw-bold">Apellido *</label>
              <input
                type="text"
                class="form-control"
                id="last_name"
                v-model="formData.last_name"
                :class="{ 'is-invalid': errors.last_name }"
                placeholder="Ingrese el apellido"
                required
                autocomplete="off"
              />
              <div v-if="errors.last_name" class="invalid-feedback">
                {{ errors.last_name }}
              </div>
            </div>

            <!-- Email -->
            <div class="col-md-6 mb-3">
              <label for="email" class="form-label fw-bold">Email *</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="formData.email"
                :class="{ 'is-invalid': errors.email }"
                placeholder="usuario@ejemplo.com"
                required
                autocomplete="off"
              />
              <div v-if="errors.email" class="invalid-feedback">
                {{ errors.email }}
              </div>
            </div>

            <!-- Contraseña (solo visible al crear usuario) -->
            <div v-if="!isEditing" class="col-md-6 mb-3">
              <label for="password" class="form-label fw-bold">Contraseña *</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="formData.password"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Ingrese una contraseña segura"
                required
                autocomplete="new-password"
              />
              <div v-if="errors.password" class="invalid-feedback">
                {{ errors.password }}
              </div>
              <small class="form-text text-muted">
                La contraseña debe tener al menos 8 caracteres.
              </small>
            </div>

            <!-- Confirmar Contraseña (solo visible al crear usuario) -->
            <div v-if="!isEditing" class="col-md-6 mb-3">
              <label for="password_confirmation" class="form-label fw-bold">Confirmar Contraseña *</label>
              <input
                type="password"
                class="form-control"
                id="password_confirmation"
                v-model="formData.password_confirmation"
                :class="{ 'is-invalid': errors.password_confirmation }"
                placeholder="Repita la contraseña"
                required
                autocomplete="new-password"
              />
              <div v-if="errors.password_confirmation" class="invalid-feedback">
                {{ errors.password_confirmation }}
              </div>
            </div>

            <!-- Rol -->
            <div class="col-md-6 mb-3">
              <label for="role_id" class="form-label fw-bold">Rol</label>
              <select
                class="form-select"
                id="role_id"
                v-model="formData.role_id"
                :class="{ 'is-invalid': errors.role_id }"
              >
                <option value="">Seleccione un rol (opcional)</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
              <div v-if="errors.role_id" class="invalid-feedback">
                {{ errors.role_id }}
              </div>
              <small class="form-text text-muted">
                Si no selecciona un rol, se asignará el rol por defecto (ID: 1)
              </small>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <router-link to="/admin/users" class="btn btn-secondary">
              <i class="fa-solid fa-arrow-left me-2"></i>
              Cancelar
            </router-link>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading"
            >
              <i v-if="loading" class="fa-solid fa-spinner fa-spin me-2"></i>
              <i v-else class="fa-solid fa-floppy-disk me-2"></i>
              {{ isEditing ? 'Actualizar Usuario' : 'Crear Usuario' }}
            </button>
          </div>
        </form>
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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

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

// Props
const route = useRoute()
const router = useRouter()
const isEditing = computed(() => !!route.params.id)

// Reactive data
const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role_id: ''
})

const errors = ref({})
const loading = ref(false)
const roles = ref([])

// Load user data if editing
const loadUserData = async () => {
  if (isEditing.value) {
    try {
      loading.value = true
      // IMPORTANTE: Cambiar a /users/ (plural)
      const response = await api.get(`/users/${route.params.id}`)
      const userData = response.data
      
      console.log('Datos del usuario recibidos:', userData)
      
      // Verificar la estructura de los datos
      // Si viene con first_name y last_name separados
      if (userData.first_name && userData.last_name) {
        formData.value = {
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          password: '',
          password_confirmation: '',
          role_id: userData.role_id || ''
        }
      } 
      // Si viene con name completo
      else if (userData.name) {
        const nameParts = userData.name.split(' ')
        formData.value = {
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: userData.email || '',
          password: '',
          password_confirmation: '',
          role_id: userData.role_id || ''
        }
      }
      // Si viene con otros campos
      else {
        formData.value = {
          first_name: '',
          last_name: '',
          email: userData.email || '',
          password: '',
          password_confirmation: '',
          role_id: userData.role_id || ''
        }
      }
      
    } catch (error) {
      console.error('Error al cargar los datos del usuario:', error)
      // Mostrar error específico
      const errorMessage = error.response?.data?.message || 'Error al cargar usuario'
      showNotification('Error', `Error: ${errorMessage}`, 'danger')
      // Redirigir a la lista de usuarios después de un breve momento
      setTimeout(() => {
        router.push('/admin/users')
      }, 1500)
    } finally {
      loading.value = false
    }
  }
}

// Load roles 
const loadData = async () => {
  try {
    // Load roles
    const rolesResponse = await api.get('/roles')
    roles.value = rolesResponse.data
    console.log('Roles cargados:', roles.value)
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
  }
}

// Handle form submission
const handleSubmit = async () => {
  console.log('Enviando formulario...')
  console.log('Modo:', isEditing.value ? 'Edición' : 'Creación')
  console.log('Datos a enviar:', formData.value)
  
  errors.value = {}
  loading.value = true
  
  try {
    let response
    const submitData = { ...formData.value }
    
    // DEPURACIÓN: Mostrar URL completa
    const baseURL = api.defaults.baseURL || 'http://localhost'
    
    if (isEditing.value) {
      // Actualizar usuario existente
      const url = `/users/${route.params.id}`
      console.log(`📤 PUT a: ${baseURL}${url}`)
      console.log('Datos:', submitData)
      
      // Para edición, si password está vacío, eliminarlo
      if (!submitData.password) {
        delete submitData.password
        delete submitData.password_confirmation
      }
      
      response = await api.put(url, submitData)
    } else {
      // Crear nuevo usuario
      const url = '/users'
      console.log(`📤 POST a: ${baseURL}${url}`)
      console.log('Datos:', submitData)
      
      response = await api.post(url, submitData)
    }
    
    console.log('✅ Respuesta exitosa:', response.data)
    
    // Mostrar mensaje de éxito
    const successMessage = isEditing.value ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente'
    showNotification('Éxito', successMessage, 'success')

    // Redirigir a la lista de usuarios después de un breve momento
    setTimeout(() => {
      router.push('/admin/users')
    }, 1500)
    
  } catch (error) {
    console.error('❌ Error completo:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })
    
    // Manejar errores de validación (422)
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {}
      console.log('❌ Errores de validación:', errors.value)
      showNotification('Error', 'Por favor corrija los errores en el formulario', 'danger')
    }
    // Manejar error 405 (Method Not Allowed)
    else if (error.response?.status === 405) {
      console.error('❌ Error 405 - Método HTTP no permitido')
      const errorMessage = error.response?.data?.message || 'La ruta no está configurada correctamente'
      showNotification('Error 405', `Error: ${errorMessage}`, 'danger')
    }
    // Manejar error 404 (Not Found)
    else if (error.response?.status === 404) {
      console.error('❌ Error 404 - Ruta no encontrada')
      showNotification('Error 404', 'Error: La ruta no existe. Verifica las rutas del backend.', 'danger')
    }
    // Otros errores
    else {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Ocurrió un error al guardar el usuario.'
      showNotification('Error', `Error: ${errorMessage}`, 'danger')
    }
  } finally {
    loading.value = false
  }
}

// Métodos para manejar los modales
const showNotification = (title, message, type = 'info') => {
  notificationModal.value.title = title
  notificationModal.value.message = message
  notificationModal.value.show = true
}

const closeNotificationModal = () => {
  notificationModal.value.show = false
  notificationModal.value.message = ''
}

const showConfirmation = (title, message, callback = null) => {
  confirmModal.value.title = title
  confirmModal.value.message = message
  confirmModal.value.callback = callback
  confirmModal.value.show = true
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

// Watch for route changes to reset form when switching between create and edit modes
watch(() => route.params.id, async (newId, oldId) => {
  console.log('Cambio de ruta:', { newId, oldId, isEditing: isEditing.value })
  
  // Si cambia de edición a creación o viceversa
  if ((newId && !oldId) || (!newId && oldId)) {
    // Resetear formulario
    formData.value = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: ''
    }

    // Limpiar errores
    errors.value = {}

    // Cargar roles
    await loadData()

    // Si estamos en modo edición, cargar datos del usuario
    if (isEditing.value) {
      await loadUserData()
    }
  }
}, { immediate: false })

// Initialize data
onMounted(async () => {
  console.log('Componente montado. Modo:', isEditing.value ? 'Edición' : 'Creación')
  await loadData()
  if (isEditing.value) {
    await loadUserData()
  }
})
</script>

<style scoped>
.user-form-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  border: none;
  border-radius: 10px;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
  border: none;
}

.form-label {
  color: #333;
}

.form-control:focus,
.form-select:focus {
  border-color: #259634;
  box-shadow: 0 0 0 0.2rem rgba(37, 150, 52, 0.25);
}

.btn {
  padding: 8px 16px;
  font-weight: 500;
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

.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.form-text {
  color: #6c757d;
  font-size: 0.875em;
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