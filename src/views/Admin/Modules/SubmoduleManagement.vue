<template>
  <div class="submodule-management-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">
        <i class="fa-solid fa-layer-group me-2 text-primary"></i>
        Administración de Submódulos e Ítems de Menú
      </h2>
      <button @click="openCreateModal('submodule')" class="btn btn-primary">
        <i class="fa-solid fa-plus me-2"></i>
        Nuevo Submódulo
      </button>
    </div>

    <!-- Selector de módulo padre -->
    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="fa-solid fa-list me-2"></i>
          Filtrar por Módulo Padre
        </h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <select
              class="form-select"
              v-model="selectedModule"
              @change="onModuleChange"
            >
              <option value="">Todos los módulos</option>
              <option v-for="module in validModules" :key="module.id" :value="module.id">
                {{ module.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla de submódulos -->
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fa-solid fa-cubes me-2"></i>
          Submódulos
        </h5>
        <button v-if="selectedModule" @click="openCreateModal('submodule')" class="btn btn-sm btn-primary">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Submódulo
        </button>
        <button v-else disabled class="btn btn-sm btn-outline-secondary">
          <i class="fa-solid fa-info-circle me-1"></i>
          Seleccione módulo
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Módulo Padre</th>
                <th>Descripción</th>
                <th>Icono</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(submodule, index) in validFilteredSubmodules" :key="submodule?.id || index">
                <td>{{ submodule?.id || '-' }}</td>
                <td>{{ submodule?.name || '-' }}</td>
                <td>{{ submodule?.module_id ? getModuleName(submodule.module_id) : '-' }}</td>
                <td>{{ submodule?.description || '-' }}</td>
                <td>
                  <i :class="submodule?.icon || 'fa-solid fa-folder'"></i>
                  {{ submodule?.icon || 'Sin icono' }}
                </td>
                <td>
                  <span :class="submodule?.active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ submodule?.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(submodule?.created_at) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="openEditModal(submodule, 'submodule')"
                      title="Editar submódulo"
                      v-if="submodule && submodule.id"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-info btn-sm"
                      @click="openManageMenuItems(submodule)"
                      title="Ver/Gestionar submenús"
                      v-if="submodule && submodule.id"
                    >
                      <i class="fa-solid fa-sitemap"></i>
                    </button>
                    <button
                      class="btn btn-outline-warning btn-sm"
                      @click="toggleSubmoduleStatus(submodule?.id, submodule?.active)"
                      title="Desactivar/Activar submódulo"
                      :disabled="loadingDelete === submodule?.id"
                      v-if="submodule"
                    >
                      <i v-if="loadingDelete === submodule?.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else :class="submodule?.active ? 'fa-solid fa-ban' : 'fa-solid fa-check-circle'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay resultados -->
        <div v-if="validFilteredSubmodules.length === 0" class="text-center py-5">
          <i class="fa-solid fa-layer-group fa-3x text-muted mb-3"></i>
          <h5 class="text-muted">{{ selectedModule ? 'No se encontraron submódulos' : 'Seleccione un módulo para ver sus submódulos' }}</h5>
          <p class="text-muted">{{ selectedModule ? 'No hay submódulos registrados para este módulo.' : 'Por favor seleccione un módulo del filtro superior para ver sus submódulos asociados.' }}</p>
          <button v-if="selectedModule" @click="openCreateModal('submodule')" class="btn btn-primary">
            <i class="fa-solid fa-plus me-2"></i>
            Crear primer submódulo
          </button>
        </div>
      </div>
    </div>

    <!-- Sección de ítems de menú del submódulo seleccionado -->
    <div v-if="selectedSubmodule" class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">
          <i class="fa-solid fa-sitemap me-2"></i>
          Submenús del Submódulo: {{ selectedSubmodule.name }}
        </h5>
        <button @click="openCreateModal('menuItem')" class="btn btn-sm btn-success">
          <i class="fa-solid fa-plus me-1"></i>
          Nuevo Ítem de Menú
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Submódulo Padre</th>
                <th>Ruta</th>
                <th>Icono</th>
                <th>Estado</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(menuItem, index) in validFilteredMenuItems" :key="menuItem?.id || index">
                <td>{{ menuItem?.id || '-' }}</td>
                <td>{{ menuItem?.name || '-' }}</td>
                <td>{{ menuItem?.submodule_id ? getSubmoduleName(menuItem.submodule_id) : '-' }}</td>
                <td>{{ menuItem?.route || '-' }}</td>
                <td>
                  <i :class="menuItem?.icon || 'fa-solid fa-folder'"></i>
                  {{ menuItem?.icon || 'Sin icono' }}
                </td>
                <td>
                  <span :class="menuItem?.active ? 'badge bg-success' : 'badge bg-secondary'">
                    {{ menuItem?.active ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td>{{ formatDate(menuItem?.created_at) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      class="btn btn-outline-primary btn-sm"
                      @click="openEditModal(menuItem, 'menuItem')"
                      title="Editar ítem de menú"
                      v-if="menuItem && menuItem.id"
                    >
                      <i class="fa-solid fa-edit"></i>
                    </button>
                    <button
                      class="btn btn-outline-warning btn-sm"
                      @click="toggleMenuItemStatus(menuItem?.id, menuItem?.active)"
                      title="Desactivar/Activar ítem de menú"
                      :disabled="loadingDelete === menuItem?.id"
                      v-if="menuItem"
                    >
                      <i v-if="loadingDelete === menuItem?.id" class="fa-solid fa-spinner fa-spin"></i>
                      <i v-else :class="menuItem?.active ? 'fa-solid fa-ban' : 'fa-solid fa-check-circle'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mensaje cuando no hay ítems de menú -->
        <div v-if="validFilteredMenuItems.length === 0" class="text-center py-3">
          <i class="fa-solid fa-list fa-2x text-muted mb-2"></i>
          <p class="text-muted">{{ selectedSubmodule ? 'No hay ítems de menú para este submódulo.' : 'Seleccione un submódulo para ver sus ítems de menú.' }}</p>
          <button v-if="selectedSubmodule" @click="openCreateModal('menuItem')" class="btn btn-success">
            <i class="fa-solid fa-plus me-2"></i>
            Crear primer ítem de menú
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingItem ? `Editar ${itemType === 'submodule' ? 'Submódulo' : 'Ítem de Menú'}` : `Crear Nuevo ${itemType === 'submodule' ? 'Submódulo' : 'Ítem de Menú'}` }}</h3>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="mb-3">
              <label for="itemName" class="form-label">Nombre *</label>
              <input
                type="text"
                class="form-control"
                id="itemName"
                v-model="form.name"
                :class="{ 'is-invalid': errors.name }"
                :placeholder="`Ingrese el nombre del ${itemType === 'submodule' ? 'submódulo' : 'ítem de menú'}`"
                required
              />
              <div v-if="errors.name" class="invalid-feedback">
                {{ errors.name }}
              </div>
            </div>

            <!-- Campos específicos para submódulos -->
            <div v-if="itemType === 'submodule'">
              <div class="mb-3">
                <label for="itemModule" class="form-label">Módulo Padre *</label>
                <select
                  class="form-select"
                  id="itemModule"
                  v-model="form.module_id"
                  :class="{ 'is-invalid': errors.module_id }"
                  required
                >
                  <option value="">Seleccione un módulo</option>
                  <option v-for="module in validModules" :key="module.id" :value="module.id">
                    {{ module.name }}
                  </option>
                </select>
                <div v-if="errors.module_id" class="invalid-feedback">
                  {{ errors.module_id }}
                </div>
              </div>

              <div class="mb-3">
                <label for="itemDescription" class="form-label">Descripción</label>
                <textarea
                  class="form-control"
                  id="itemDescription"
                  v-model="form.description"
                  :class="{ 'is-invalid': errors.description }"
                  placeholder="Ingrese una descripción del submódulo"
                  rows="3"
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
              </div>
            </div>

            <!-- Campos específicos para ítems de menú -->
            <div v-if="itemType === 'menuItem'">
              <div class="mb-3">
                <label for="itemSubmodule" class="form-label">Submódulo Padre *</label>
                <select
                  class="form-select"
                  id="itemSubmodule"
                  v-model="form.submodule_id"
                  :class="{ 'is-invalid': errors.submodule_id }"
                  required
                >
                  <option value="">Seleccione un submódulo</option>
                  <option v-for="submodule in validFilteredSubmodules" :key="submodule.id" :value="submodule.id">
                    {{ submodule.name }}
                  </option>
                </select>
                <div v-if="errors.submodule_id" class="invalid-feedback">
                  {{ errors.submodule_id }}
                </div>
              </div>

              <div class="mb-3">
                <label for="itemRoute" class="form-label">Ruta</label>
                <input
                  type="text"
                  class="form-control"
                  id="itemRoute"
                  v-model="form.route"
                  :class="{ 'is-invalid': errors.route }"
                  placeholder="Ej: /submodulo/ruta"
                />
                <div v-if="errors.route" class="invalid-feedback">
                  {{ errors.route }}
                </div>
              </div>
            </div>

            <div class="mb-3">
              <label for="itemIcon" class="form-label">Icono</label>
              <input
                type="text"
                class="form-control"
                id="itemIcon"
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
                id="itemActive"
                v-model="form.active"
              />
              <label class="form-check-label" for="itemActive">
                Activo
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="handleSubmit" :disabled="loadingSave">
            <i v-if="loadingSave" class="fa-solid fa-spinner fa-spin me-2"></i>
            {{ editingItem ? 'Actualizar' : 'Guardar' }}
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

// Función para limpiar campos duplicados en objetos anidados
const cleanDuplicateFields = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanDuplicateFields);
  }

  // Creamos un nuevo objeto para evitar problemas de mutación
  const cleanedObj = {};
  const seenKeys = new Set();

  // Procesamos las claves en orden para mantener solo la primera ocurrencia
  Object.keys(obj).forEach(key => {
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      cleanedObj[key] = cleanDuplicateFields(obj[key]);
    }
  });

  return cleanedObj;
};

// Reactive data
const submodules = ref([])
const menuItems = ref([]) // Variable para almacenar ítems de menú (si la funcionalidad está disponible)
const modules = ref([])
const showModal = ref(false)
const editingItem = ref(null)
const loadingDelete = ref(null)
const loadingSave = ref(false)
const errors = ref({})
const selectedModule = ref('')
const selectedSubmodule = ref(null)
const itemType = ref('submodule') // 'submodule' o 'menuItem'
const form = ref({
  name: '',
  module_id: '', // Para submódulos
  submodule_id: '', // Para ítems de menú
  description: '',
  route: '', // Para ítems de menú
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

const notificationModal = ref({
  show: false,
  title: 'Notificación',
  message: '',
  type: 'info'
})

// Propiedades computadas
const validModules = computed(() => {
  // Asegurar que modules.value sea un array antes de filtrar
  let modulesArray = [];

  if (Array.isArray(modules.value)) {
    modulesArray = modules.value;
  } else if (modules.value && typeof modules.value === 'object' && Array.isArray(modules.value.data)) {
    // Si modules.value es un objeto con una propiedad data que es un array
    modulesArray = modules.value.data;
  } else {
    // Si no es ni array ni objeto con data como array, usar array vacío
    modulesArray = [];
  }

  // Filtrar módulos para excluir valores nulos o indefinidos
  return modulesArray.filter(module => module != null && typeof module === 'object' && module.id != null);
})

const filteredSubmodules = computed(() => {
  // Asegurar que submodules.value sea un array antes de filtrar
  let submodulesArray = [];

  if (Array.isArray(submodules.value)) {
    submodulesArray = submodules.value;
  } else if (submodules.value && typeof submodules.value === 'object' && Array.isArray(submodules.value.data)) {
    submodulesArray = submodules.value.data;
  } else {
    submodulesArray = [];
  }

  if (!selectedModule.value) {
    // Si no hay filtro, mostrar array vacío
    return []
  } else {
    // Si hay filtro, mostrar solo los submódulos del módulo seleccionado
    const filtered = submodulesArray.filter(submodule => {
      const matches = submodule && submodule.module_id == selectedModule.value;
      return matches;
    });
    return filtered;
  }
})

const validFilteredSubmodules = computed(() => {
  // Asegurar que filteredSubmodules.value sea un array antes de filtrar
  let filteredSubmodulesArray = [];

  if (Array.isArray(filteredSubmodules.value)) {
    filteredSubmodulesArray = filteredSubmodules.value;
  } else if (filteredSubmodules.value && typeof filteredSubmodules.value === 'object' && Array.isArray(filteredSubmodules.value.data)) {
    filteredSubmodulesArray = filteredSubmodules.value.data;
  } else {
    filteredSubmodulesArray = filteredSubmodules.value || [];
  }

  // Filtrar submódulos para excluir valores nulos o indefinidos
  const validSubmodules = filteredSubmodulesArray.filter(submodule => {
    const isValid = submodule != null && typeof submodule === 'object' && submodule.id != null;
    return isValid;
  });

  return validSubmodules;
})

const filteredMenuItems = computed(() => {
  if (!selectedSubmodule.value || !selectedSubmodule.value.id) {
    // Si no hay submódulo seleccionado, mostrar array vacío
    return []
  } else {
    // Si hay submódulo seleccionado, mostrar los ítems de menú ya asignados
    // Ya que openManageMenuItems ya asignó los ítems correctos a menuItems.value
    return menuItems.value;
  }
})

const validFilteredMenuItems = computed(() => {
  // Asegurar que filteredMenuItems.value sea un array antes de filtrar
  let filteredMenuItemsArray = [];

  if (Array.isArray(filteredMenuItems.value)) {
    filteredMenuItemsArray = filteredMenuItems.value;
  } else if (filteredMenuItems.value && typeof filteredMenuItems.value === 'object' && Array.isArray(filteredMenuItems.value.data)) {
    filteredMenuItemsArray = filteredMenuItems.value.data;
  } else {
    filteredMenuItemsArray = filteredMenuItems.value || [];
  }

  // Filtrar ítems de menú para excluir valores nulos o indefinidos
  const validItems = filteredMenuItemsArray.filter(item => {
    const isValid = item != null && typeof item === 'object' && item.id != null;
    return isValid;
  });

  return validItems;
})


// Methods
const loadSubmodules = async () => {
  try {
    console.log('Cargando submódulos...')
    const response = await api.get('/submodules?include=menu_items') // Intentar incluir los ítems de menú

    // Extraer los submódulos de la respuesta paginada
    const rawData = response.data.data; // Tomar directamente response.data.data que es el array de submódulos

    // Limpiar campos duplicados
    const cleanedData = Array.isArray(rawData)
      ? rawData.map(item => cleanDuplicateFields(item))
      : [];

    submodules.value = cleanedData;

  } catch (error) {
    console.error('Error al cargar submódulos:', error)
    console.error('Detalles del error:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
    submodules.value = []
  }
}

const loadMenuItems = async () => {
  try {
    console.log('Cargando ítems de menú...')
    // Intentar cargar ítems de menú, pero manejar el caso donde la ruta no exista
    const response = await api.get('/menu-items') // Ruta para ítems de menú

    let rawData;

    // Manejar respuesta paginada del backend
    if (response.data && response.data.data) {
      // Es una respuesta paginada
      rawData = response.data.data
    } else {
      // Es una respuesta directa
      rawData = response.data
    }

    // Asegurarse de que rawData sea un array plano (por si viene con estructura paginada)
    if (rawData && rawData.data && Array.isArray(rawData.data)) {
      rawData = rawData.data;
    }

    // Limpiar campos duplicados
    const cleanedData = Array.isArray(rawData)
      ? rawData.map(item => cleanDuplicateFields(item))
      : cleanDuplicateFields(rawData);

    menuItems.value = cleanedData;
  } catch (error) {
    console.warn('No se pudieron cargar los ítems de menú. La ruta /menu-items puede no estar disponible.', error)
    // Si la ruta no existe, inicializar con un array vacío
    menuItems.value = []

    // Opcional: podrías implementar una solución alternativa aquí
    // Por ejemplo, cargar los ítems de menú desde otra fuente si existe
  }
}

const loadModules = async () => {
  try {
    console.log('Cargando módulos para submódulos...')
    const response = await api.get('/modules')
    console.log('Respuesta del backend (módulos para submódulos):', response)

    let rawData;

    // Manejar respuesta paginada del backend
    if (response.data && response.data.data) {
      // Es una respuesta paginada
      rawData = response.data.data
    } else {
      // Es una respuesta directa
      rawData = response.data
    }

    // Asegurarse de que rawData sea un array plano (por si viene con estructura paginada)
    if (rawData && rawData.data && Array.isArray(rawData.data)) {
      rawData = rawData.data;
    }

    // Limpiar campos duplicados
    const cleanedData = Array.isArray(rawData)
      ? rawData.map(item => cleanDuplicateFields(item))
      : cleanDuplicateFields(rawData);

    modules.value = cleanedData;
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

const getModuleName = (moduleId) => {
  if (!moduleId || !modules.value || !Array.isArray(modules.value)) {
    return 'Módulo no encontrado'
  }
  const module = modules.value.find(m => m && m.id != null && m.id === moduleId)
  return module ? module.name : 'Módulo no encontrado'
}

const getSubmoduleName = (submoduleId) => {
  if (!submoduleId || !submodules.value || !Array.isArray(submodules.value)) {
    return 'Submódulo no encontrado'
  }
  const submodule = submodules.value.find(s => s && s.id != null && s.id === submoduleId)
  return submodule ? submodule.name : 'Submódulo no encontrado'
}

const onModuleChange = () => {
  // Reiniciar la selección de submódulo cuando cambia el módulo
  selectedSubmodule.value = null
  // También reiniciar los ítems de menú
  menuItems.value = []
}

const openManageMenuItems = async (submodule) => {
  console.log('*** FUNCION openManageMenuItems EJECUTADA ***');
  console.log('Botón "Ver/Gestionar submenús" presionado para el submódulo:', submodule);

  // Cerrar el modal si está abierto
  closeModal()

  // Actualizar el submódulo seleccionado (esto hará que se actualicen las propiedades computadas)
  selectedSubmodule.value = submodule;
  console.log('selectedSubmodule actualizado a:', selectedSubmodule.value);

  // Cargar los ítems de menú específicos para este submódulo desde los datos embebidos
  if (submodule.menu_items && Array.isArray(submodule.menu_items)) {
    // Limpiar campos duplicados de los ítems de menú embebidos
    const cleanedMenuItems = submodule.menu_items.map(item => cleanDuplicateFields(item));

    // Asignar directamente los ítems de menú del submódulo
    menuItems.value = cleanedMenuItems;

    console.log('Ítems de menú asignados directamente desde los datos embebidos:', cleanedMenuItems);
  } else {
    // Si no hay ítems embebidos, cargarlos por separado
    try {
      console.log('Cargando todos los ítems de menú...');
      const response = await api.get('/menu-items')

      let rawData;
      if (response.data && response.data.data) {
        // Es una respuesta paginada
        rawData = response.data.data;
        console.log('Ítems de menú cargados (paginados):', response.data.data);
      } else {
        // Es una respuesta directa
        rawData = response.data;
        console.log('Ítems de menú cargados (directos):', response.data);
      }

      // Asegurarse de que rawData sea un array plano (por si viene con estructura paginada)
      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      // Limpiar campos duplicados
      const cleanedData = Array.isArray(rawData)
        ? rawData.map(item => cleanDuplicateFields(item))
        : cleanDuplicateFields(rawData);

      menuItems.value = cleanedData;
    } catch (error) {
      console.warn('No se pudieron cargar los ítems de menú.', error)
      menuItems.value = []
    }
  }

  // Forzar actualización de la interfaz
  // Actualizar la referencia para forzar re-renderizado
  menuItems.value = [...menuItems.value];
  selectedSubmodule.value = {...selectedSubmodule.value}; // Forzar actualización del objeto

  // Mostrar información adicional para debugging
  console.log('Ítems de menú disponibles después de cargar:', menuItems.value);
  console.log('ID del submódulo seleccionado:', selectedSubmodule.value?.id);
  console.log('menu_items del submódulo:', submodule.menu_items);

  // Mostrar notificación para indicar que se ha seleccionado el submódulo
  showNotification(
    'Información',
    `Ahora puede gestionar los submenús del submódulo: ${submodule.name}`,
    'info'
  )
}

// Función para cargar submenús automáticamente cuando se selecciona un submódulo
const loadSubmenuItems = async (submodule) => {
  // Actualizar el submódulo seleccionado
  selectedSubmodule.value = submodule;

  // Cargar los ítems de menú específicos para este submódulo desde los datos embebidos
  if (submodule.menu_items && Array.isArray(submodule.menu_items)) {
    // Limpiar campos duplicados de los ítems de menú embebidos
    const cleanedMenuItems = submodule.menu_items.map(item => cleanDuplicateFields(item));

    // Asignar directamente los ítems de menú del submódulo
    menuItems.value = cleanedMenuItems;
  } else {
    // Si no hay ítems embebidos, cargarlos por separado
    try {
      const response = await api.get('/menu-items')

      let rawData;
      if (response.data && response.data.data) {
        // Es una respuesta paginada
        rawData = response.data.data;
      } else {
        // Es una respuesta directa
        rawData = response.data;
      }

      // Asegurarse de que rawData sea un array plano (por si viene con estructura paginada)
      if (rawData && rawData.data && Array.isArray(rawData.data)) {
        rawData = rawData.data;
      }

      // Limpiar campos duplicados
      const cleanedData = Array.isArray(rawData)
        ? rawData.map(item => cleanDuplicateFields(item))
        : cleanDuplicateFields(rawData);

      menuItems.value = cleanedData;
    } catch (error) {
      menuItems.value = []
    }
  }

  // Forzar actualización de la interfaz
  // Actualizar la referencia para forzar re-renderizado
  menuItems.value = [...menuItems.value];
  selectedSubmodule.value = {...selectedSubmodule.value}; // Forzar actualización del objeto
}

const openCreateModal = (type) => {
  itemType.value = type
  editingItem.value = null

  if (type === 'submodule') {
    form.value = {
      name: '',
      module_id: selectedModule.value || '', // Preseleccionar módulo si se ha seleccionado uno
      description: '',
      icon: '',
      active: true
    }
  } else if (type === 'menuItem') {
    form.value = {
      name: '',
      submodule_id: selectedSubmodule?.value?.id || '', // Preseleccionar submódulo si está seleccionado
      route: '',
      icon: '',
      active: true
    }
  }

  errors.value = {}
  showModal.value = true
}

const openEditModal = (item, type) => {
  itemType.value = type
  editingItem.value = item

  if (type === 'submodule') {
    form.value = {
      name: item.name,
      module_id: item.module_id,
      description: item.description || '',
      icon: item.icon || '',
      active: item.active
    }
  } else if (type === 'menuItem') {
    form.value = {
      name: item.name,
      submodule_id: item.submodule_id,
      route: item.route || '',
      icon: item.icon || '',
      active: item.active
    }
  }

  errors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = null
  errors.value = {}
}

const handleSubmit = async () => {
  errors.value = {}
  loadingSave.value = true

  try {
    let response
    const submitData = { ...form.value }

    if (itemType.value === 'submodule') {
      // Manejar operaciones de submódulos normalmente
      if (editingItem.value) {
        // Update existing submodule
        response = await api.put(`/submodules/${editingItem.value.id}`, submitData)
      } else {
        // Create new submodule
        response = await api.post('/submodules', submitData)
      }

      // Show success message for submodule
      showNotification(
        'Éxito',
        editingItem.value
          ? 'Submódulo actualizado correctamente'
          : 'Submódulo creado exitosamente',
        'success'
      )

      // Reload submodules and close modal
      await loadSubmodules()
    } else {
      // Manejar operaciones de ítems de menú con verificación de disponibilidad
      if (editingItem.value) {
        // Update existing menu item
        try {
          response = await api.put(`/menu-items/${editingItem.value.id}`, submitData)

          // Show success message for menu item
          showNotification(
            'Éxito',
            'Ítem de menú actualizado correctamente',
            'success'
          )
        } catch (menuError) {
          console.error('Error al actualizar ítem de menú:', menuError)
          showNotification(
            'Error',
            'La funcionalidad de ítems de menú no está disponible en este momento.',
            'danger'
          )
          throw new Error('La funcionalidad de ítems de menú no está disponible en este momento.')
        }
      } else {
        // Create new menu item
        try {
          response = await api.post('/menu-items', submitData)

          // Show success message for menu item
          showNotification(
            'Éxito',
            'Ítem de menú creado exitosamente',
            'success'
          )
        } catch (menuError) {
          console.error('Error al crear ítem de menú:', menuError)
          showNotification(
            'Error',
            'La funcionalidad de ítems de menú no está disponible en este momento.',
            'danger'
          )
          throw new Error('La funcionalidad de ítems de menú no está disponible en este momento.')
        }
      }

      // Reload menu items for the currently selected submodule if there is one
      if (selectedSubmodule.value) {
        const currentSubmodule = selectedSubmodule.value;
        // Reload menu items specifically for the current submodule
        try {
          const response = await api.get(`/submodules/${currentSubmodule.id}/menu-items`)

          if (response.data && response.data.data) {
            // Es una respuesta paginada
            menuItems.value = response.data.data
          } else {
            // Es una respuesta directa
            menuItems.value = response.data
          }
        } catch (error) {
          console.warn(`Error reloading menu items for submodule ${currentSubmodule.id}:`, error)
          // Fallback to loading all menu items and let the computed property filter them
          await loadMenuItems()
        }
      } else {
        await loadMenuItems()
      }
    }

    closeModal()
  } catch (error) {
    console.error(`Error al guardar el ${itemType.value}:`, error)

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
        error.message || `Ocurrió un error al guardar el ${itemType.value}. Por favor inténtelo de nuevo.`,
        'danger'
      )
    }
  } finally {
    loadingSave.value = false
  }
}

const toggleSubmoduleStatus = async (submoduleId, currentStatus) => {
  const newStatus = currentStatus ? false : true;
  const action = newStatus ? 'activar' : 'desactivar';

  showConfirmation(
    'Confirmación requerida',
    `¿Está seguro de que desea ${action} este submódulo?`,
    async () => {
      loadingDelete.value = submoduleId

      try {
        // Enviar solicitud para cambiar el estado del submódulo
        await api.patch(`/submodules/${submoduleId}/status`, {
          active: newStatus
        })

        // Actualizar el estado del submódulo en la lista local
        const submoduleIndex = submodules.value.findIndex(s => s.id === submoduleId);
        if (submoduleIndex !== -1) {
          submodules.value[submoduleIndex].active = newStatus;
        }

        showNotification(
          'Éxito',
          `Submódulo ${action} exitosamente`,
          'success'
        )
      } catch (error) {
        console.error(`Error al ${action} submódulo:`, error)
        showNotification(
          'Error',
          `Ocurrió un error al ${action} el submódulo. Por favor inténtelo de nuevo.`,
          'danger'
        )
      } finally {
        loadingDelete.value = null
      }
    }
  )
}

const toggleMenuItemStatus = async (menuItemId, currentStatus) => {
  const newStatus = currentStatus ? false : true;
  const action = newStatus ? 'activar' : 'desactivar';

  showConfirmation(
    'Confirmación requerida',
    `¿Está seguro de que desea ${action} este ítem de menú?`,
    async () => {
      loadingDelete.value = menuItemId

      try {
        // Enviar solicitud para cambiar el estado del ítem de menú
        await api.patch(`/menu-items/${menuItemId}/status`, {
          active: newStatus
        })

        // Refresh menu items for the currently selected submodule to reflect the status change
        if (selectedSubmodule.value) {
          const currentSubmodule = selectedSubmodule.value;
          // Reload menu items specifically for the current submodule
          try {
            const response = await api.get(`/submodules/${currentSubmodule.id}/menu-items`)

            if (response.data && response.data.data) {
              // Es una respuesta paginada
              menuItems.value = response.data.data
            } else {
              // Es una respuesta directa
              menuItems.value = response.data
            }
          } catch (error) {
            console.warn(`Error reloading menu items for submodule ${currentSubmodule.id}:`, error)
            // Fallback to loading all menu items and let the computed property filter them
            await loadMenuItems()
          }
        } else {
          await loadMenuItems()
        }

        showNotification(
          'Éxito',
          `Ítem de menú ${action} exitosamente`,
          'success'
        )
      } catch (error) {
        console.error(`Error al ${action} ítem de menú:`, error)
        showNotification(
          'Error',
          'La funcionalidad de ítems de menú no está disponible en este momento.',
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
  await Promise.all([
    loadSubmodules(),
    loadMenuItems(),
    loadModules()
  ])
})
</script>

<style scoped>
.submodule-management-container {
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