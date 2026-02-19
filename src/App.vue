<template>
  <!-- Mostrar barra lateral + contenido solo si hay sesión activa -->
  <div v-if="isAuthenticated" class="d-flex">
    <!-- Barra lateral -->
  <nav :class="['sidebar', { 'collapsed': !isSidebarHovered }]"
       @mouseover="isSidebarHovered = true"
       @mouseleave="isSidebarHovered = false">
    <div class="navbar-brand">
      <!-- Envuelve los logos en un contenedor con fondo verdoso -->
      <div class="logo-container">
        <img v-if="!isSidebarHovered"
             src="/image/DVSAPP_sin_letra_sin_fondo.png"
             alt="Logo Colapsado"
             class="logo-collapsed">
        <img v-else
             src="/image/DVSAPP_sin_fondo.png"
             alt="Logo Completo"
             class="logo-full">
      </div>
    </div>
      <ul class="navbar-nav flex-column">
        <li class="nav-item">
          <router-link class="nav-link" to="/" @click.stop="setTopMenu(null)" exact>
            <i class="fa-solid fa-chart-line"></i>
            <span v-if="isSidebarHovered">Dashboard</span>
          </router-link>
        </li>
        <!-- Módulos dinámicos -->
        <li v-for="module in activeDynamicModules" :key="module.id" class="nav-item">
          <a 
            class="nav-link" 
            :class="{ 'active': topMenu === `dynamic_module_${module.id}` }"
            href="#" 
            @click.prevent="handleDynamicModuleClick(module)"
          >
            <i :class="module.icon || 'fa-solid fa-folder'"></i>
            <span v-if="isSidebarHovered">{{ module.name }}</span>
          </a>
        </li>
      </ul>

      <!-- Información del usuario y botón de cierre de sesión -->
      <div class="sidebar-footer">
        <div v-if="currentUser" class="user-info">
          <div class="user-avatar">
            <i class="fa-solid fa-user-circle"></i>
          </div>
          <div class="user-details" v-if="isSidebarHovered">
            <div class="user-name">{{ currentUser.name }}</div>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="logout-btn"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          <span v-if="isSidebarHovered">Cerrar sesión</span>
        </button>
      </div>
    </nav>
    
    <div class="main-content">
      <!-- Barra superior para módulos dinámicos -->
      <nav v-if="topMenu && topMenu.indexOf('dynamic_module_') === 0" class="navbar navbar-expand-lg top-menu">
        <div class="container-fluid">
          <ul class="navbar-nav">
            <!-- Submódulos -->
            <li v-for="submodule in activeDynamicSubmodules" :key="submodule.id" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#"
                 :id="'submoduleDropdown' + submodule.id"
                 role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i :class="submodule.icon || 'fa-solid fa-folder'"></i> {{ submodule.name }}
              </a>
              <ul class="dropdown-menu" :aria-labelledby="'submoduleDropdown' + submodule.id">
                <!-- Ítems de menú para este submódulo -->
                <li v-for="menuItem in getMenuItemsForSubmodule(submodule.id)"
                    :key="menuItem.id">
                  <router-link class="dropdown-item"
                               :to="getMenuItemRoute(menuItem)"
                               @click="handleMenuItemClick">
                    <i :class="menuItem.icon || 'fa-solid fa-circle'"></i> {{ menuItem.name }}
                  </router-link>
                </li>

                <!-- Si no hay ítems de menú, mostrar mensaje -->
                <li v-if="getMenuItemsForSubmodule(submodule.id).length === 0">
                  <span class="dropdown-item-text text-muted">
                    <i class="fa-solid fa-info-circle"></i> No hay ítems de menú
                  </span>
                </li>
              </ul>
            </li>

            <!-- Si no hay submódulos, mostrar mensaje -->
            <li v-if="activeDynamicSubmodules.length === 0" class="nav-item">
              <span class="nav-link text-muted">
                <i class="fa-solid fa-info-circle"></i> No hay submódulos
              </span>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Contenido dinámico -->
      <div class="container-fluid p-4">
        <router-view />
      </div>
    </div>
  </div>

  <!-- Si no hay sesión activa, mostrar solo el contenido de la vista actual -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import authService from './services/authService'
import sessionService from './services/sessionService'
import api from './services/api'

const router = useRouter()
const route = useRoute()

// ✅ Variables reactivas
const topMenu = ref(null)
const isSidebarHovered = ref(false)

// Variables para submenús de administración
const showAdminMenu = ref(false)
const showPlatformMenu = ref(false)

// ✅ Estado de autenticación reactiva
const isAuthenticated = ref(authService.isAuthenticated());
const currentUser = ref(null);

// Permisos del usuario
const userPermissions = ref([]);

// Módulos dinámicos
const dynamicModules = ref([]);
// Submódulos dinámicos
const dynamicSubmodules = ref([]);
// Ítems de menú dinámicos
const dynamicMenuItems = ref([]);

// Propiedades computadas
const activeDynamicModules = computed(() => {
  if (!dynamicModules.value) return [];
  
  let modulesArray = [];
  if (Array.isArray(dynamicModules.value)) {
    modulesArray = dynamicModules.value;
  } else if (dynamicModules.value.data && Array.isArray(dynamicModules.value.data)) {
    modulesArray = dynamicModules.value.data;
  }
  
  // Filtrar módulos activos
  const activeModules = modulesArray.filter(module => module && module.active);
  
  // Si hay permisos cargados, filtrar solo los módulos que el usuario tiene permiso de ver
  if (userPermissions.value && userPermissions.value.length > 0) {
    const allowedModuleIds = userPermissions.value
      .filter(p => p.actions && p.actions.includes('view'))
      .map(p => p.module_id);
    
    console.log('📋 Módulos permitidos (view):', allowedModuleIds);
    return activeModules.filter(module => allowedModuleIds.includes(module.id));
  }
  
  // Si no hay permisos, devolver todos
  return activeModules;
});

// Submódulos activos para el módulo actual
const activeDynamicSubmodules = computed(() => {
  if (!dynamicSubmodules.value) return [];
  
  let submodulesArray = [];
  if (Array.isArray(dynamicSubmodules.value)) {
    submodulesArray = dynamicSubmodules.value;
  } else if (dynamicSubmodules.value.data && Array.isArray(dynamicSubmodules.value.data)) {
    submodulesArray = dynamicSubmodules.value.data;
  }
  
  // Filtrar submódulos activos
  const activeSubmodules = submodulesArray.filter(submodule => submodule && submodule.active);
  
  // Si hay permisos cargados, filtrar solo los submódulos que el usuario tiene permiso de ver
  if (userPermissions.value && userPermissions.value.length > 0) {
    const allowedSubmoduleIds = userPermissions.value
      .filter(p => p.actions && p.actions.includes('view') && p.submodule_id !== null)
      .map(p => p.submodule_id);
    
    console.log('📋 Submódulos permitidos (view):', allowedSubmoduleIds);
    return activeSubmodules.filter(submodule => allowedSubmoduleIds.includes(submodule.id));
  }
  
  // Si no hay permisos, devolver todos
  return activeSubmodules;
});

// Ítems de menú para un submódulo específico
const getMenuItemsForSubmodule = (submoduleId) => {
  if (!dynamicMenuItems.value) return [];

  let result = [];
  if (Array.isArray(dynamicMenuItems.value)) {
    result = dynamicMenuItems.value.filter(item => {
      return item && item.submodule_id == submoduleId && item.active;
    });
  } else if (dynamicMenuItems.value.data && Array.isArray(dynamicMenuItems.value.data)) {
    result = dynamicMenuItems.value.data.filter(item => {
      return item && item.submodule_id == submoduleId && item.active;
    });
  }

  // Si hay permisos cargados, filtrar solo los menu-items que el usuario tiene permiso de ver
  if (userPermissions.value && userPermissions.value.length > 0) {
    const allowedMenuItemIds = userPermissions.value
      .filter(p => p.actions && p.actions.includes('view') && p.menu_item_id !== null)
      .map(p => p.menu_item_id);
    
    console.log('📋 Menu items permitidos (view):', allowedMenuItemIds);
    result = result.filter(item => allowedMenuItemIds.includes(item.id));
  }

  return result;
};

// Función para cargar la información del usuario
const loadCurrentUser = async () => {
  if (isAuthenticated.value) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        
        // Buscar role_id en diferentes posibles campos
        const roleId = userData.role_id || userData.rol_id || 
                       userData.role?.id || userData.rol?.id ||
                       (userData.role && typeof userData.role === 'object' ? userData.role.id : null);
        
        currentUser.value = {
          name: userData.name || userData.first_name || userData.username || 'Usuario',
          email: userData.email || '',
          role: userData.role || userData.rol || userData.role_name || 'Usuario',
          role_id: roleId
        };
        
        console.log('✅ Usuario cargado:', currentUser.value);
        
        // Cargar permisos del usuario
        if (roleId) {
          await loadUserPermissions(roleId);
        }
      } catch (e) {
        console.error('Error al parsear la información del usuario:', e);
        currentUser.value = {
          name: 'Usuario',
          email: '',
          role: 'Usuario',
          role_id: null
        };
      }
    } else {
      currentUser.value = {
        name: 'Usuario',
        email: '',
        role: 'Usuario',
        role_id: null
      };
    }

    // Cargar módulos dinámicos
    loadDynamicModules();
  } else {
    currentUser.value = null;
    userPermissions.value = [];
    dynamicModules.value = [];
    dynamicSubmodules.value = [];
    dynamicMenuItems.value = [];
  }
};

// Función para cargar los permisos del usuario
const loadUserPermissions = async (roleId) => {
  try {
    console.log('🔑 Cargando permisos para role_id:', roleId);
    const response = await api.get(`/permissions?role_id=${roleId}`);
    const permissions = response.data.data || response.data || [];
    
    userPermissions.value = permissions;
    
    console.log('✅ Permisos cargados:', permissions.length, 'permisos');
    console.log('📋 Permisos:', permissions.map(p => ({
      module_id: p.module_id,
      submodule_id: p.submodule_id,
      menu_item_id: p.menu_item_id,
      actions: p.actions
    })));
  } catch (error) {
    console.error('❌ Error al cargar permisos:', error.message);
    userPermissions.value = [];
  }
};

// Métodos para manejar los submenús
const toggleAdminMenu = () => {
  showAdminMenu.value = !showAdminMenu.value;
  if (!showAdminMenu.value) {
    showPlatformMenu.value = false;
  }
};

const togglePlatformMenu = () => {
  showPlatformMenu.value = !showPlatformMenu.value;
};

// Método para obtener la ruta del módulo
const getModuleRoute = (module) => {
  // Verificar que el módulo sea un objeto válido
  if (!module || typeof module !== 'object') {
    return '#';
  }
  // Si el módulo tiene una ruta específica, usarla (asegurando que empiece con /)
  if (module.route && typeof module.route === 'string') {
    // Asegurar que la ruta empiece con /
    return module.route.startsWith('/') ? module.route : `/${module.route}`;
  }
  // Si no, construir una ruta estándar basada en el ID del módulo
  if (module.id) {
    return `/module/${module.id}`;
  }
  // Si no hay ID, construir una ruta basada en el nombre
  if (module.name && typeof module.name === 'string') {
    const moduleName = module.name.toLowerCase().replace(/\s+/g, '-');
    return `/module/${moduleName}`;
  }
  // Si no hay nombre, devolver una ruta por defecto
  return '#';
};

// Método para obtener la ruta del menu item
const getMenuItemRoute = (menuItem) => {
  // Verificar que el menu item sea un objeto válido
  if (!menuItem || typeof menuItem !== 'object') {
    return '#';
  }
  // Si el menu item tiene una ruta específica, usarla (asegurando que empiece con /)
  if (menuItem.route && typeof menuItem.route === 'string') {
    // Asegurar que la ruta empiece con /
    return menuItem.route.startsWith('/') ? menuItem.route : `/${menuItem.route}`;
  }
  // Si no hay ruta, devolver #
  return '#';
};

// Método para manejar clic en módulo dinámico
const handleDynamicModuleClick = async (module) => {
  console.log('=== CLIC EN MÓDULO DINÁMICO ===');
  console.log('Módulo:', module);
  // Establecer el menú superior y cargar submódulos
  await setTopMenu(module.id);
};

// Método para manejar clic en menu item - cierra el dropdown y navega
const handleMenuItemClick = () => {
  // Cerrar todos los dropdowns abiertos
  // Bootstrap 5 cierra automáticamente los dropdowns cuando se navega con router-link
  // Solo necesitamos asegurarnos de que el comportamiento por defecto ocurra
};

// Método para manejar la selección de submódulo y cargar sus ítems de menú
const selectSubmodule = async (submoduleId) => {
  console.log('=== EJECUTANDO selectSubmodule ===');
  console.log('ID del submódulo recibido:', submoduleId);
  // Los ítems de menú ya están cargados desde loadDynamicSubmodules con include=menu_items
  // No es necesario recargarlos, solo se usa para abrir el dropdown
  console.log('=== FIN EJECUCIÓN selectSubmodule ===');
};

// Método para cargar módulos dinámicos
const loadDynamicModules = async () => {
  console.log('=== CARGANDO MÓDULOS DINÁMICOS ===');
  if (isAuthenticated.value) {
    try {
      console.log('Haciendo petición a /modules...');
      const response = await api.get('/modules');
      console.log('Respuesta recibida:', response.data);

      // Manejar respuesta paginada
      if (response.data && response.data.data) {
        dynamicModules.value = response.data.data;
        console.log('Módulos dinámicos cargados (paginados):', response.data.data);
      } else {
        dynamicModules.value = response.data;
        console.log('Módulos dinámicos cargados (directos):', response.data);
      }
      console.log('Total de módulos dinámicos:', dynamicModules.value.length);
    } catch (error) {
      console.error('Error al cargar módulos dinámicos:', error);
      dynamicModules.value = [];
    }
  } else {
    dynamicModules.value = [];
    console.log('Usuario no autenticado, no se cargan módulos dinámicos');
  }
  console.log('=== FIN CARGA MÓDULOS DINÁMICOS ===');
};

// Método para cargar submódulos dinámicos
const loadDynamicSubmodules = async (moduleId = null) => {
  console.log('=== CARGANDO SUBMÓDULOS DINÁMICOS ===');
  console.log('ID del módulo padre:', moduleId);

  if (isAuthenticated.value) {
    try {
      let url = '/submodules';
      if (moduleId) {
        url += `?module_id=${moduleId}&include=menu_items`;
      } else {
        url += '?include=menu_items';
      }
      console.log('Haciendo petición a:', url);

      const response = await api.get(url);
      console.log('Respuesta recibida:', response.data);

      // Manejar respuesta paginada
      if (response.data && response.data.data) {
        dynamicSubmodules.value = response.data.data;
        console.log('Submódulos dinámicos cargados (paginados):', response.data.data);
      } else {
        dynamicSubmodules.value = response.data;
        console.log('Submódulos dinámicos cargados (directos):', response.data);
      }
      console.log('Total de submódulos dinámicos:', dynamicSubmodules.value.length);

      // Limpiar la variable de ítems de menú antes de cargar nuevos
      dynamicMenuItems.value = [];

      // Verificar si los submódulos tienen ítems de menú embebidos
      dynamicSubmodules.value.forEach(submodule => {
        if (submodule.menu_items && submodule.menu_items.length > 0) {
          console.log(`Submódulo ${submodule.id} (${submodule.name}) tiene ${submodule.menu_items.length} ítems de menú embebidos`);
          // Cargar los ítems de menú embebidos en la variable global
          dynamicMenuItems.value = [...dynamicMenuItems.value, ...submodule.menu_items];
          console.log(`Ítems de menú del submódulo ${submodule.id} agregados a dynamicMenuItems`);
        } else {
          console.log(`Submódulo ${submodule.id} (${submodule.name}) no tiene ítems de menú embebidos`);
        }
      });
    } catch (error) {
      console.error('Error al cargar submódulos dinámicos:', error);
      dynamicSubmodules.value = [];
    }
  } else {
    dynamicSubmodules.value = [];
    console.log('Usuario no autenticado, no se cargan submódulos dinámicos');
  }
  console.log('=== FIN CARGA SUBMÓDULOS DINÁMICOS ===');
};

// Método para cargar ítems de menú dinámicos
const loadDynamicMenuItems = async (submoduleId = null) => {
  console.log('=== CARGANDO ÍTEMS DE MENÚ DINÁMICOS ===');
  console.log('ID del submódulo:', submoduleId);

  if (isAuthenticated.value) {
    try {
      let url = '/menu-items';
      if (submoduleId) {
        url += `?submodule_id=${submoduleId}`;
      }
      console.log('Haciendo petición a:', url);

      const response = await api.get(url);
      console.log('Respuesta recibida:', response.data);

      // Manejar respuesta paginada
      if (response.data && response.data.data) {
        dynamicMenuItems.value = response.data.data;
        console.log('Ítems de menú dinámicos cargados (paginados):', response.data.data);
      } else {
        dynamicMenuItems.value = response.data;
        console.log('Ítems de menú dinámicos cargados (directos):', response.data);
      }
      console.log('Total de ítems de menú dinámicos:', dynamicMenuItems.value.length);
    } catch (error) {
      console.error('Error al cargar ítems de menú dinámicos:', error);
      dynamicMenuItems.value = [];
    }
  } else {
    dynamicMenuItems.value = [];
    console.log('Usuario no autenticado, no se cargan ítems de menú dinámicos');
  }
  console.log('=== FIN CARGA ÍTEMS DE MENÚ DINÁMICOS ===');
};

// Escuchar cambios en localStorage para actualizar la autenticación
onMounted(() => {
  const updateAuthStatus = () => {
    const currentAuthStatus = authService.isAuthenticated();
    if (isAuthenticated.value !== currentAuthStatus) {
      isAuthenticated.value = currentAuthStatus;
      loadCurrentUser(); // Cargar la información del usuario cuando cambia el estado de autenticación
    }
  };

  // Escuchar eventos de almacenamiento (cuando se modifica desde otras ventanas/pestañas)
  window.addEventListener('storage', updateAuthStatus);

  // Actualizar el estado periódicamente para detectar cambios
  const interval = setInterval(updateAuthStatus, 1000); // Cada segundo

  // Escuchar cambios de autenticación desde el servicio de sesión
  sessionService.onAuthChange((isAuth) => {
    isAuthenticated.value = isAuth;
    loadCurrentUser(); // Cargar la información del usuario cuando cambia el estado de autenticación
  });

  // Cargar la información del usuario inicialmente
  loadCurrentUser();

  // Limpiar el intervalo al desmontar
  onUnmounted(() => {
    clearInterval(interval);
    window.removeEventListener('storage', updateAuthStatus);
  });
});

// ✅ Rutas definidas
const employeeRoutes = ['/listClient', '/createClient']
const businessRoutes = ['/listBusiness', '/createBusiness']
const technologyRoutes = ['/createInventory', '/createArticle', '/createSupplier', '/listWriteOff', '/listInventory']
const gestEmpleadosRoutes = [
  '/empleados/lista', '/empleados/nuevo', '/empleados/importar', '/empleados/sincronizar',
  '/accesos/sincronizacion', '/accesos/reporte', '/accesos/tiempo-real', '/accesos/incidencias',
  '/tarjetas/lista', '/tarjetas/asignar', '/tarjetas/bloqueo',
  '/dispositivos/lista', '/dispositivos/biometrico', '/dispositivos/conectar', '/dispositivos/configurar',
  '/config/horarios', '/config/permisos', '/config/zonas', '/config/backup',
  '/GestEmpleados'
]

// ✅ Watch para ruta
watch(() => route.path, (newPath) => {
  updateTopMenu(newPath)
})

// ✅ Métodos
const setTopMenu = async (menu) => {
  console.log('=== EJECUTANDO setTopMenu ===');
  console.log('Menú recibido:', menu);
  console.log('Tipo de menú:', typeof menu);

  // Si el menú es un ID de módulo dinámico, cargar sus submódulos
  if (typeof menu === 'number' || (typeof menu === 'string' && /^\d+$/.test(menu))) {
    console.log('Es un ID de módulo dinámico, cargando submódulos...');
    // Es un ID de módulo dinámico
    topMenu.value = `dynamic_module_${menu}`;
    await loadDynamicSubmodules(parseInt(menu));
    // No cargamos menu items aquí porque se cargarán cuando se seleccione un submódulo
  } else {
    console.log('Es un tipo de menú estático, actualizando topMenu...');
    topMenu.value = menu;
    // Si se cambia a otro tipo de menú, limpiar los submódulos y menú items dinámicos
    if (menu !== topMenu.value && !menu.startsWith('dynamic_module_')) {
      console.log('Cambiando a menú estático, limpiando datos dinámicos...');
      dynamicSubmodules.value = [];
      dynamicMenuItems.value = [];
    }
  }
  console.log('topMenu actualizado a:', topMenu.value);
  console.log('=== FIN EJECUCIÓN setTopMenu ===');
}

const updateTopMenu = (path) => {
  // Si el menú actual es un módulo dinámico, mantenerlo para todas las rutas
  // Esto asegura que la barra superior dinámica permanezca visible
  if (topMenu.value && topMenu.value.startsWith('dynamic_module_')) {
    // Verificar si la ruta actual corresponde a un módulo dinámico
    // Si es así, no modificar el topMenu para preservar el menú dinámico seleccionado
    return;
  }
  
  // Si está en rutas de empleados o empresas
  if (employeeRoutes.includes(path) || businessRoutes.includes(path) || path === '/parametrizacion') {
    topMenu.value = 'parametrizacion'
  }
  // Si está en rutas de tecnología
  else if (technologyRoutes.includes(path) || path === '/tecnologia') {
    topMenu.value = 'tecnologia'
  }
  // Si está en rutas de gestión de empleados
  else if (gestEmpleadosRoutes.includes(path) || path === '/GestEmpleados') {
    topMenu.value = 'gestEmpleados'
  }
  // Para cualquier otra ruta, determinamos el menú superior basado en la ruta
  else {
    // Determinar el menú superior basado en el prefijo de la ruta
    if (path.startsWith('/parametrizacion') || path.startsWith('/list') || path.startsWith('/create')) {
      topMenu.value = 'parametrizacion'
    } else if (path.startsWith('/tecnologia') || path.startsWith('/inventario') || path.startsWith('/dispositivos') || path.startsWith('/bajas') || path.startsWith('/proveedores') || path.startsWith('/red') || path.startsWith('/reportes')) {
      topMenu.value = 'tecnologia'
    } else if (path.startsWith('/empleados') || path.startsWith('/accesos') || path.startsWith('/tarjetas') || path.startsWith('/GestEmpleados')) {
      topMenu.value = 'gestEmpleados'
    } else {
      // Por defecto, mantener el menú actual o mostrar uno genérico si es necesario
      // Si no hay un menú claro, podríamos mantener el anterior o asignar uno por defecto
      // Solo cambiar a null si es absolutamente necesario
      if (topMenu.value === null && path !== '/') {
        // Para la página de inicio, no mostramos menú superior
        topMenu.value = path === '/' ? null : 'parametrizacion' // Asignar parametrizacion como valor por defecto
      } else if (path === '/') {
        // Para la ruta principal (Dashboard), no queremos menú superior
        topMenu.value = null;
      }
    }
  }
}

const handleLogout = async () => {
  // Usar el servicio de autenticación para cerrar sesión
  authService.logout()

  // Redirigir a la página de login
  await router.push('/login')
}
</script>

<style scoped>
/* 🎨 Configuración base del sidebar con degradado verde */
.sidebar {
  width: 250px;
  transition: width 0.3s ease, background 0.3s ease;
  background: linear-gradient(135deg, #1a5f23 0%, #1e7a2b 50%, #259634 100%);
  color: white;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}

/* Configuración cuando la barra está contraída */
.sidebar.collapsed {
  width: 80px;
}

/* Logo */
.sidebar .navbar-brand {
  padding: 1.5rem 1rem;
  text-align: center;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.sidebar.collapsed .navbar-brand {
  margin-top: -20px;
  height: 100px;
}

/* Imagen del logo */
.logo-collapsed {
  width: 45px;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-full {
  width: 180px;
  height: auto;
  display: block;
  margin: 0 auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Enlaces del menú lateral */
.sidebar .nav-link {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1.2rem 1.5rem;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  position: relative;
  border-left: 3px solid transparent;
}

.sidebar .nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

.sidebar .nav-link.router-link-active,
.sidebar .nav-link.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-left: 3px solid #2dc23f;
  transform: translateX(5px);
}

/* Íconos cuando la barra no está contraída */
.sidebar .nav-link i {
  font-size: 1.3rem;
  margin-right: 15px;
  transition: all 0.3s ease;
  width: 24px;
  text-align: center;
}

/* Íconos cuando la barra está contraída */
.sidebar.collapsed .nav-link i {
  font-size: 1.3rem;
  margin-right: 0;
  text-align: center;
}

/* Ocultar texto en la barra contraída */
.sidebar.collapsed .nav-link span {
  display: none;
}

/* Espaciado uniforme entre los enlaces del menú */
.sidebar .navbar-nav .nav-item {
  margin: 0;
  padding: 5px 0;
  transition: padding 0.3s ease;
}

/* Espaciado adicional entre el logo y los íconos */
.sidebar .navbar-nav {
  padding-top: 20px;
  flex-grow: 1;
}

/* NUEVO: Footer del sidebar */
.sidebar-footer {
  margin-top: auto;
  padding: 15px 10px;
  border-top: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

/* Información del usuario en el sidebar */
.user-info {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  font-size: 24px;
  margin-right: 10px;
  color: #ffffff;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: white;
  font-size: 14px;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
}

/* Botón de cierre de sesión */
.logout-btn {
  width: 100%;
  background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(211, 47, 47, 0.3);
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 16px;
  margin: 0 auto 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.logout-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #c62828 0%, #a51c1a 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(211, 47, 47, 0.4);
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Estilo cuando el sidebar está colapsado */
.sidebar.collapsed .logout-btn {
  justify-content: center;
  padding: 12px;
  border-radius: 6px;
}

.sidebar.collapsed .logout-btn span {
  display: none;
}

/* Contenido principal */
.main-content {
  flex-grow: 1;
  margin-left: 250px;
  transition: margin-left 0.3s ease;
}

.sidebar.collapsed + .main-content {
  margin-left: 80px;
}

/* 🎨 Barra superior con degradado verde */
.top-menu {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 50%, #2dc23f 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  padding: 10px 0;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.top-menu .dropdown-toggle {
  color: white !important;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 20px;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.top-menu .dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.top-menu .nav-link {
  padding: 10px 20px;
  transition: all 0.3s ease;
  font-weight: 500;
  border-radius: 6px;
  margin: 0 5px;
}

.top-menu .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  transform: translateY(-2px);
}

/* Menús desplegables */
.dropdown-menu {
  background-color: white;
  border: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 10px 0;
  min-width: 240px;
  border-top: 3px solid #259634;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-menu .dropdown-item {
  padding: 12px 20px;
  color: #333;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-weight: 500;
  border-radius: 6px;
  margin: 0 5px;
}

.dropdown-menu .dropdown-item i {
  width: 24px;
  text-align: center;
  color: #259634;
  font-size: 16px;
}

.dropdown-menu .dropdown-item:hover {
  background-color: #f0f9f1;
  color: #1a5f23;
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(37, 150, 52, 0.2);
}

.dropdown-divider {
  margin: 8px 0;
  border-color: #e2e8f0;
}

/* Efectos de hover */
.navbar-nav .nav-item .nav-link {
  color: white;
  padding: 10px 15px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.navbar-nav .nav-item .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  transform: translateY(-2px);
}

/* Estilos específicos para el menú de Gestión de Empleados */
.top-menu .navbar-nav {
  gap: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    box-shadow: 4px 0 15px rgba(0, 0, 0, 0.25);
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .main-content {
    margin-left: 80px;
  }
  
  .sidebar.collapsed + .main-content {
    margin-left: 60px;
  }
  
  .top-menu .nav-link {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
  
  .logo-full {
    width: 120px;
  }
  
  .sidebar .nav-link {
    padding: 1rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 70px;
  }
  
  .main-content {
    margin-left: 70px;
  }
  
  .top-menu .dropdown-toggle {
    padding: 8px 15px;
    font-size: 0.8rem;
  }
  
  .dropdown-menu {
    min-width: 200px;
  }
}

/* ✅ Contenedor con fondo blanco verdoso para el logo */
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;           /* Tamaño del contenedor */
  height: 120px;          /* Tamaño del contenedor */
  background: rgba(235, 255, 239, 0.452); /* Fondo blanco verdoso */
  border-radius: 16px;   /* Bordes redondeados */
  margin: 0 auto 20px;   /* Margen para separación */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

</style>