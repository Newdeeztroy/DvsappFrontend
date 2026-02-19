<template>
  <div class="permission-management-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-key me-2 text-primary"></i>
        Gestión de Permisos por Rol
      </h2>
      <button class="btn btn-primary" @click="openAssignPermissionModal">
        <i class="fa-solid fa-plus me-2"></i>
        Asignar Permisos a Rol
      </button>
    </div>

    <!-- Selector de Rol -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-4">
            <label class="form-label fw-bold">
              <i class="fa-solid fa-user-shield me-2"></i>Seleccionar Rol
            </label>
            <select class="form-select form-select-lg" v-model="selectedRoleId" @change="loadRolePermissions">
              <option value="">Seleccione un rol...</option>
              <option v-for="role in roles" :key="role.id" :value="role.id">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="col-md-8">
            <div v-if="selectedRoleId" class="role-info p-3 bg-light rounded">
              <h5 class="mb-2">
                <i class="fa-solid fa-circle-info me-2 text-primary"></i>
                Información del Rol
              </h5>
              <p class="mb-1"><strong>Role ID:</strong> {{ selectedRoleId }}</p>
              <p class="mb-1"><strong>Total Permisos:</strong> {{ rolePermissions.length }}</p>
              <p class="mb-0"><strong>Estado:</strong> 
                <span class="badge bg-success">Activo</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de permisos del rol seleccionado -->
    <div class="card" v-if="selectedRoleId">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">
          <i class="fa-solid fa-list-check me-2"></i>
          Permisos del Rol: {{ getRoleName(selectedRoleId) }}
        </h5>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Módulo</th>
                <th>Submódulo</th>
                <th>Menú</th>
                <th>Acciones</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in rolePermissions" :key="permission.id">
                <td>
                  <span class="badge bg-primary">
                    <i class="fa-solid fa-folder me-1"></i>
                    {{ getModuleName(permission.module_id) }}
                  </span>
                </td>
                <td>
                  <span v-if="permission.submodule_id" class="badge bg-info">
                    <i class="fa-solid fa-folder-open me-1"></i>
                    {{ getSubmoduleName(permission.submodule_id) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="permission.menu_item_id" class="badge bg-secondary">
                    <i class="fa-solid fa-file me-1"></i>
                    {{ getMenuItemName(permission.menu_item_id) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <div class="actions-container">
                    <span v-for="action in permission.actions" :key="action"
                          class="badge me-1 mb-1" :class="getActionBadgeClass(action)">
                      <i :class="getActionIcon(action)"></i> {{ getActionText(action) }}
                    </span>
                  </div>
                </td>
                <td>
                  <span :class="permission.active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ permission.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm me-1"
                      @click="editPermission(permission)"
                      title="Editar permiso"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
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

        <!-- Mensaje cuando no hay permisos -->
        <div v-if="rolePermissions.length === 0" class="text-center py-5">
          <i class="fa-solid fa-key fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">Este rol no tiene permisos asignados</h5>
          <p class="text-muted">Haz clic en "Asignar Permisos a Rol" para comenzar</p>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay rol seleccionado -->
    <div v-else class="text-center py-5">
      <i class="fa-solid fa-user-shield fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">Selecciona un rol para ver sus permisos</h5>
      <p class="text-muted">Utiliza el selector de la parte superior</p>
    </div>
  </div>

  <!-- Modal para Asignar/Editar Permisos -->
  <div v-if="showPermissionModal" class="modal-overlay" @click.self="closePermissionModal">
    <div class="modal-content" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Editar' : 'Asignar' }} Permisos</h3>
        <button class="btn-close" @click="closePermissionModal"></button>
      </div>
      <div class="modal-body">
        <!-- Selección de Rol -->
        <div class="mb-4">
          <label class="form-label fw-bold">
            <i class="fa-solid fa-user-shield me-2"></i>Rol
          </label>
          <select class="form-select form-select-lg" v-model="form.role_id" :disabled="isEditing">
            <option value="">Seleccione un rol...</option>
            <option v-for="role in roles" :key="role.id" :value="role.id">
              {{ role.name }}
            </option>
          </select>
        </div>

        <!-- Árbol de Módulos -->
        <div class="modules-tree">
          <label class="form-label fw-bold">
            <i class="fa-solid fa-folder-tree me-2"></i>Módulos y Permisos
          </label>
          <p class="text-muted small">
            <i class="fa-solid fa-info-circle me-1"></i>
            Marque las casillas para asignar permisos y seleccione las acciones permitidas
          </p>

          <div v-for="module in modules" :key="module.id" class="module-item mb-3">
            <!-- Módulo -->
            <div class="module-header p-3 border rounded mb-2"
                 :class="getModuleHeaderClass(module.id)">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <input 
                    type="checkbox" 
                    :id="'module-' + module.id"
                    class="form-check-input me-2"
                    :checked="isModuleSelected(module.id)"
                    @change="toggleModule(module.id)"
                  >
                  <label :for="'module-' + module.id" class="form-check-label fw-bold mb-0">
                    <i :class="module.icon || 'fa-solid fa-folder'"></i>
                    {{ module.name }}
                  </label>
                </div>
                <div class="permission-checkboxes">
                  <span class="me-2 text-muted small">Permisos:</span>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                           :id="'module-view-' + module.id" value="view"
                           :checked="hasPermission(module.id, null, null, 'view')"
                           @change="togglePermission(module.id, null, null, 'view')">
                    <label class="form-check-label" :for="'module-view-' + module.id">
                      <i class="fa-solid fa-eye"></i> Ver
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                           :id="'module-create-' + module.id" value="create"
                           :checked="hasPermission(module.id, null, null, 'create')"
                           @change="togglePermission(module.id, null, null, 'create')">
                    <label class="form-check-label" :for="'module-create-' + module.id">
                      <i class="fa-solid fa-plus"></i> Crear
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                           :id="'module-edit-' + module.id" value="edit"
                           :checked="hasPermission(module.id, null, null, 'edit')"
                           @change="togglePermission(module.id, null, null, 'edit')">
                    <label class="form-check-label" :for="'module-edit-' + module.id">
                      <i class="fa-solid fa-pen"></i> Editar
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" 
                           :id="'module-delete-' + module.id" value="delete"
                           :checked="hasPermission(module.id, null, null, 'delete')"
                           @change="togglePermission(module.id, null, null, 'delete')">
                    <label class="form-check-label" :for="'module-delete-' + module.id">
                      <i class="fa-solid fa-trash"></i> Eliminar
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submódulos -->
            <div class="submodules-list ms-4">
              <div v-for="submodule in getSubmodulesByModuleId(module.id)" 
                   :key="submodule.id" 
                   class="submodule-item mb-2">
                <div class="submodule-header p-2 border-start border-3 rounded mb-2"
                     :class="getSubmoduleHeaderClass(submodule.id)">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <input 
                        type="checkbox" 
                        :id="'submodule-' + submodule.id"
                        class="form-check-input me-2"
                        :checked="isSubmoduleSelected(submodule.id)"
                        @change="toggleSubmodule(submodule.id, module.id)"
                      >
                      <label :for="'submodule-' + submodule.id" class="form-check-label mb-0">
                        <i :class="submodule.icon || 'fa-solid fa-folder-open'"></i>
                        {{ submodule.name }}
                      </label>
                    </div>
                    <div class="permission-checkboxes">
                      <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" 
                               :id="'submodule-view-' + submodule.id" value="view"
                               :checked="hasPermission(module.id, submodule.id, null, 'view')"
                               @change="togglePermission(module.id, submodule.id, null, 'view')">
                        <label class="form-check-label" :for="'submodule-view-' + submodule.id">Ver</label>
                      </div>
                      <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" 
                               :id="'submodule-create-' + submodule.id" value="create"
                               :checked="hasPermission(module.id, submodule.id, null, 'create')"
                               @change="togglePermission(module.id, submodule.id, null, 'create')">
                        <label class="form-check-label" :for="'submodule-create-' + submodule.id">Crear</label>
                      </div>
                      <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" 
                               :id="'submodule-edit-' + submodule.id" value="edit"
                               :checked="hasPermission(module.id, submodule.id, null, 'edit')"
                               @change="togglePermission(module.id, submodule.id, null, 'edit')">
                        <label class="form-check-label" :for="'submodule-edit-' + submodule.id">Editar</label>
                      </div>
                      <div class="form-check form-check-inline">
                        <input class="form-check-input" type="checkbox" 
                               :id="'submodule-delete-' + submodule.id" value="delete"
                               :checked="hasPermission(module.id, submodule.id, null, 'delete')"
                               @change="togglePermission(module.id, submodule.id, null, 'delete')">
                        <label class="form-check-label" :for="'submodule-delete-' + submodule.id">Eliminar</label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Menu Items -->
                <div class="menu-items-list ms-4">
                  <div v-for="menuItem in getMenuItemsBySubmoduleId(submodule.id)" 
                       :key="menuItem.id" 
                       class="menu-item mb-1">
                    <div class="menu-item-content p-2 border-start border-3 rounded"
                         :class="getMenuItemHeaderClass(menuItem.id)">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                          <input 
                            type="checkbox" 
                            :id="'menuitem-' + menuItem.id"
                            class="form-check-input me-2"
                            :checked="isMenuItemSelected(menuItem.id)"
                            @change="toggleMenuItem(menuItem.id, submodule.id, module.id)"
                          >
                          <label :for="'menuitem-' + menuItem.id" class="form-check-label mb-0">
                            <i :class="menuItem.icon || 'fa-solid fa-circle'"></i>
                            {{ menuItem.name }}
                          </label>
                        </div>
                        <div class="permission-checkboxes">
                          <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" 
                                   :id="'menuitem-view-' + menuItem.id" value="view"
                                   :checked="hasPermission(module.id, submodule.id, menuItem.id, 'view')"
                                   @change="togglePermission(module.id, submodule.id, menuItem.id, 'view')">
                            <label class="form-check-label" :for="'menuitem-view-' + menuItem.id">Ver</label>
                          </div>
                          <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" 
                                   :id="'menuitem-create-' + menuItem.id" value="create"
                                   :checked="hasPermission(module.id, submodule.id, menuItem.id, 'create')"
                                   @change="togglePermission(module.id, submodule.id, menuItem.id, 'create')">
                            <label class="form-check-label" :for="'menuitem-create-' + menuItem.id">Crear</label>
                          </div>
                          <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" 
                                   :id="'menuitem-edit-' + menuItem.id" value="edit"
                                   :checked="hasPermission(module.id, submodule.id, menuItem.id, 'edit')"
                                   @change="togglePermission(module.id, submodule.id, menuItem.id, 'edit')">
                            <label class="form-check-label" :for="'menuitem-edit-' + menuItem.id">Editar</label>
                          </div>
                          <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" 
                                   :id="'menuitem-delete-' + menuItem.id" value="delete"
                                   :checked="hasPermission(module.id, submodule.id, menuItem.id, 'delete')"
                                   @change="togglePermission(module.id, submodule.id, menuItem.id, 'delete')">
                            <label class="form-check-label" :for="'menuitem-delete-' + menuItem.id">Eliminar</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closePermissionModal">Cancelar</button>
        <button class="btn btn-primary" @click="savePermissions" :disabled="loadingSave">
          <i v-if="loadingSave" class="fa-solid fa-spinner fa-spin me-2"></i>
          {{ loadingSave ? 'Guardando...' : 'Guardar Permisos' }}
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

// Reactive data
const permissions = ref([])
const roles = ref([])
const modules = ref([])
const submodules = ref([])
const menuItems = ref([])
const selectedRoleId = ref(null)
const loadingRemove = ref(null)
const loadingSave = ref(false)

// Modal state
const showPermissionModal = ref(false)
const isEditing = ref(false)
const editingPermissionId = ref(null)

const form = ref({
  role_id: '',
  permissions: [] // Array de { module_id, submodule_id, menu_item_id, actions: [] }
})

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  callback: null
})

const notificationModal = ref({
  show: false,
  title: '',
  message: ''
})

// Propiedad computada para obtener permisos del rol seleccionado
const rolePermissions = computed(() => {
  if (!selectedRoleId.value) return []
  return permissions.value.filter(p => p.role_id === selectedRoleId.value)
})

// Methods
const loadPermissions = async () => {
  try {
    const response = await api.get('/permissions')
    permissions.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar permisos:', error)
    permissions.value = []
  }
}

const loadRoles = async () => {
  try {
    const response = await api.get('/roles')
    roles.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
  }
}

const loadModules = async () => {
  try {
    const response = await api.get('/modules')
    modules.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar módulos:', error)
    modules.value = []
  }
}

const loadSubmodules = async () => {
  try {
    const response = await api.get('/submodules')
    submodules.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar submódulos:', error)
    submodules.value = []
  }
}

const loadMenuItems = async () => {
  try {
    const response = await api.get('/menu-items')
    menuItems.value = response.data.data || response.data
  } catch (error) {
    console.error('Error al cargar menu items:', error)
    menuItems.value = []
  }
}

const loadRolePermissions = () => {
  // Los permisos ya están cargados, solo filtramos por el rol seleccionado
  console.log('Permisos del rol', selectedRoleId.value, ':', rolePermissions.value.length)
}

const getRoleName = (roleId) => {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.name : 'Desconocido'
}

const getModuleName = (moduleId) => {
  const module = modules.value.find(m => m.id === moduleId)
  return module ? module.name : 'Desconocido'
}

const getSubmoduleName = (submoduleId) => {
  const submodule = submodules.value.find(s => s.id === submoduleId)
  return submodule ? submodule.name : 'Desconocido'
}

const getMenuItemName = (menuItemId) => {
  const menuItem = menuItems.value.find(item => item.id === menuItemId)
  return menuItem ? menuItem.name : 'Desconocido'
}

const getSubmodulesByModuleId = (moduleId) => {
  return submodules.value.filter(submodule => submodule.module_id === moduleId)
}

const getMenuItemsBySubmoduleId = (submoduleId) => {
  return menuItems.value.filter(item => item.submodule_id === submoduleId)
}

const getActionText = (action) => {
  const actionMap = {
    view: 'Ver',
    create: 'Crear',
    edit: 'Editar',
    delete: 'Eliminar'
  }
  return actionMap[action] || action
}

const getActionIcon = (action) => {
  const iconMap = {
    view: 'fa-solid fa-eye',
    create: 'fa-solid fa-plus',
    edit: 'fa-solid fa-pen',
    delete: 'fa-solid fa-trash'
  }
  return iconMap[action] || 'fa-solid fa-circle'
}

const getActionBadgeClass = (action) => {
  const actionClasses = {
    view: 'bg-info',
    create: 'bg-success',
    edit: 'bg-warning',
    delete: 'bg-danger'
  }
  return `badge ${actionClasses[action] || 'bg-light'}`
}

// Permission management
const openAssignPermissionModal = () => {
  isEditing.value = false
  editingPermissionId.value = null
  form.value = {
    role_id: '',
    permissions: []
  }
  showPermissionModal.value = true
}

const editPermission = (permission) => {
  console.log('=== EDITAR PERMISO ===')
  console.log('Permiso seleccionado:', permission)
  console.log('role_id del permiso:', permission.role_id)

  isEditing.value = true
  editingPermissionId.value = permission.id

  // Obtener TODOS los permisos de este rol
  const rolePerms = permissions.value.filter(p => p.role_id === permission.role_id)
  console.log('Todos los permisos del rol:', rolePerms)
  
  // Convertir los permisos al formato que espera el formulario
  const permissionDetails = rolePerms.map(p => ({
    module_id: p.module_id,
    submodule_id: p.submodule_id || null,
    menu_item_id: p.menu_item_id || null,
    actions: p.actions || []
  }))
  
  console.log('permissionDetails convertidos:', permissionDetails)

  form.value = {
    role_id: permission.role_id,
    permissions: JSON.parse(JSON.stringify(permissionDetails))
  }

  console.log('form.value.permissions:', form.value.permissions)
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
}

const isModuleSelected = (moduleId) => {
  return form.value.permissions.some(p => p.module_id === moduleId)
}

const isSubmoduleSelected = (submoduleId) => {
  return form.value.permissions.some(p => p.submodule_id === submoduleId)
}

const isMenuItemSelected = (menuItemId) => {
  return form.value.permissions.some(p => p.menu_item_id === menuItemId)
}

const hasPermission = (moduleId, submoduleId, menuItemId, action) => {
  const permission = form.value.permissions.find(p => {
    if (menuItemId) return p.menu_item_id === menuItemId
    if (submoduleId) return p.submodule_id === submoduleId
    return p.module_id === moduleId
  })
  return permission ? permission.actions.includes(action) : false
}

const toggleModule = (moduleId) => {
  const existingIndex = form.value.permissions.findIndex(p => p.module_id === moduleId)
  if (existingIndex !== -1) {
    form.value.permissions.splice(existingIndex, 1)
  } else {
    form.value.permissions.push({
      module_id: moduleId,
      submodule_id: null,
      menu_item_id: null,
      actions: []
    })
  }
}

const toggleSubmodule = (submoduleId, moduleId) => {
  const existingIndex = form.value.permissions.findIndex(p => p.submodule_id === submoduleId)
  if (existingIndex !== -1) {
    form.value.permissions.splice(existingIndex, 1)
  } else {
    form.value.permissions.push({
      module_id: moduleId,
      submodule_id: submoduleId,
      menu_item_id: null,
      actions: []
    })
  }
}

const toggleMenuItem = (menuItemId, submoduleId, moduleId) => {
  const existingIndex = form.value.permissions.findIndex(p => p.menu_item_id === menuItemId)
  if (existingIndex !== -1) {
    form.value.permissions.splice(existingIndex, 1)
  } else {
    form.value.permissions.push({
      module_id: moduleId,
      submodule_id: submoduleId,
      menu_item_id: menuItemId,
      actions: []
    })
  }
}

const togglePermission = (moduleId, submoduleId, menuItemId, action) => {
  let permission = form.value.permissions.find(p => {
    if (menuItemId) return p.menu_item_id === menuItemId
    if (submoduleId) return p.submodule_id === submoduleId
    return p.module_id === moduleId
  })

  if (!permission) {
    if (menuItemId) {
      toggleMenuItem(menuItemId, submoduleId, moduleId)
      permission = form.value.permissions.find(p => p.menu_item_id === menuItemId)
    } else if (submoduleId) {
      toggleSubmodule(submoduleId, moduleId)
      permission = form.value.permissions.find(p => p.submodule_id === submoduleId)
    } else {
      toggleModule(moduleId)
      permission = form.value.permissions.find(p => p.module_id === moduleId)
    }
  }

  const actionIndex = permission.actions.indexOf(action)
  if (actionIndex !== -1) {
    permission.actions.splice(actionIndex, 1)
  } else {
    permission.actions.push(action)
  }
}

const savePermissions = async () => {
  if (!form.value.role_id) {
    showNotification('Advertencia', 'Debe seleccionar un rol')
    return
  }

  loadingSave.value = true

  console.log('=== GUARDANDO PERMISOS ===')
  console.log('role_id:', form.value.role_id)
  console.log('permissions:', form.value.permissions)

  // Filtrar permisos que tienen al menos una acción
  const validPermissions = form.value.permissions.filter(p => {
    const hasActions = p.actions && Array.isArray(p.actions) && p.actions.length > 0
    return hasActions
  })

  console.log('validPermissions (con acciones):', validPermissions)

  // Validar que haya al menos un permiso con acciones
  if (!validPermissions || validPermissions.length === 0) {
    showNotification(
      'Advertencia',
      'Debe seleccionar al menos un permiso con una acción (Ver, Crear, Editar o Eliminar)'
    )
    loadingSave.value = false
    return
  }

  try {
    const payload = {
      role_id: form.value.role_id,
      details: validPermissions
    }

    console.log('Payload completo:', payload)

    if (isEditing.value) {
      console.log('Enviando PUT a:', `/permissions/${editingPermissionId.value}`)
      await api.put(`/permissions/${editingPermissionId.value}`, payload)
    } else {
      console.log('Enviando POST a: /permissions')
      await api.post('/permissions', payload)
    }

    await loadPermissions()
    closePermissionModal()
    showNotification('Éxito', 'Permisos guardados exitosamente')
  } catch (error) {
    console.error('Error al guardar permisos:', error)
    console.error('Error response:', error.response?.data)
    showNotification(
      'Error',
      error.response?.data?.message || 'Ocurrió un error al guardar los permisos'
    )
  } finally {
    loadingSave.value = false
  }
}

const removePermission = async (permissionId) => {
  showConfirmation(
    'Confirmación requerida',
    '¿Está seguro de que desea eliminar este permiso?',
    async () => {
      loadingRemove.value = permissionId
      try {
        await api.delete(`/permissions/${permissionId}`)
        permissions.value = permissions.value.filter(p => p.id !== permissionId)
        showNotification('Éxito', 'Permiso eliminado exitosamente')
      } catch (error) {
        console.error('Error al eliminar permiso:', error)
        showNotification('Error', 'Ocurrió un error al eliminar el permiso')
      } finally {
        loadingRemove.value = null
      }
    }
  )
}

// Helper functions for styling
const getModuleHeaderClass = (moduleId) => {
  return isModuleSelected(moduleId) ? 'bg-light border-primary' : 'bg-white'
}

const getSubmoduleHeaderClass = (submoduleId) => {
  return isSubmoduleSelected(submoduleId) ? 'bg-light border-primary' : 'bg-white'
}

const getMenuItemHeaderClass = (menuItemId) => {
  return isMenuItemSelected(menuItemId) ? 'bg-light border-primary' : 'bg-white'
}

// Modal helpers
const showConfirmation = (title, message, callback = null) => {
  confirmModal.value = { title, message, callback, show: true }
}

const handleCancelAction = () => {
  confirmModal.value.show = false
}

const handleConfirmAction = () => {
  if (confirmModal.value.callback) {
    confirmModal.value.callback()
  }
  confirmModal.value.show = false
}

const showNotification = (title, message) => {
  notificationModal.value.title = title
  notificationModal.value.message = message
  notificationModal.value.show = true
}

const closeNotificationModal = () => {
  notificationModal.value.show = false
  notificationModal.value.message = ''
}

onMounted(() => {
  loadPermissions()
  loadRoles()
  loadModules()
  loadSubmodules()
  loadMenuItems()
})
</script>

<style scoped>
.permission-management-container {
  padding: 20px;
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

.role-info {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.badge {
  font-size: 0.85em;
  padding: 0.5em 0.75em;
}

.actions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.modules-tree {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
}

.module-item {
  background: white;
  padding: 10px;
  border-radius: 8px;
}

.module-header {
  background: white;
  border: 1px solid #dee2e6 !important;
  transition: all 0.3s ease;
}

.module-header:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.submodule-header {
  background: white;
  border-left: 3px solid #dee2e6 !important;
  transition: all 0.3s ease;
}

.submodule-header:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.menu-item-content {
  background: white;
  border-left: 3px solid #dee2e6 !important;
  transition: all 0.3s ease;
}

.menu-item-content:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.permission-checkboxes {
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-check-inline {
  margin: 0;
}

.form-check-input:checked {
  background-color: #259634;
  border-color: #259634;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 10px;
  max-height: 90vh;
  overflow-y: auto;
  width: 90%;
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
  color: white;
  border-radius: 10px 10px 0 0;
}

.modal-title {
  margin: 0;
  color: white;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 0 0 10px 10px;
}

.modal-icon {
  text-align: center;
  margin-bottom: 16px;
}

/* Scrollbar personalizado */
.modules-tree::-webkit-scrollbar {
  width: 8px;
}

.modules-tree::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modules-tree::-webkit-scrollbar-thumb {
  background: #259634;
  border-radius: 4px;
}

.modules-tree::-webkit-scrollbar-thumb:hover {
  background: #1a5f23;
}
</style>
