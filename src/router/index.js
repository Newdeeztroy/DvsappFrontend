import { createRouter, createWebHistory } from 'vue-router'

// Importar vistas existentes
import Home from '../views/Dashboard/Dashboard.vue'
import listClient from '../views/parameterization/Client/ListClient.vue'
import ClientNew from '../views/parameterization/Client/ClientNew.vue'
import ClientView from '../views/parameterization/Client/ClientView.vue'
import ClientEdit from '../views/parameterization/Client/ClientEdit.vue'
import listBusiness from '../views/parameterization/Businesses/ListBusiness.vue'
import BusinessNew from '../views/parameterization/Businesses/BusinessNew.vue'
import BusinessView from '../views/parameterization/Businesses/BusinessView.vue'
import BusinessEdit from '../views/parameterization/Businesses/BusinessEdit.vue'
import InventoryNew from '../views/Technology/Inventory/InventoryNew.vue'
import Article from '../views/Technology/Inventory/Article.vue'
import Supplier from '../views/Technology/Inventory/Supplier.vue'
import listInventory from '../views/Technology/Inventory/ListInventory.vue'
import inventoryView from '../views/Technology/Inventory/InventoryView.vue'
import inventoryEdit from '../views/Technology/Inventory/InventoryEdit.vue'
import inventoryWriteOff from '../views/Technology/Inventory/InventoryWriteOff.vue'
import listWriteOff from '../views/Technology/Inventory/ListWriteOff.vue'
import DeviceSynchronization from '../views/EmployeeManagement/DeviceSynchronization.vue'
import AddBiometer from '../views/EmployeeManagement/AddBiometer.vue'
import ListBiometer from '../views/EmployeeManagement/ListBiometer.vue'
import UserSynchronization from '../views/EmployeeManagement/UserSynchronization.vue'
import ListDeviceUsers from '../views/EmployeeManagement/ListDeviceUsers.vue'
import SyncAccessEvents from '../views/EmployeeManagement/SyncAccessEvents.vue'
import AttendanceReport from '../views/EmployeeManagement/AttendanceReport.vue'
import GestEmpleados from '../views/EmployeeManagement/GestEmpleados.vue'

// Importar vistas de administración
import UsersList from '../views/Admin/Users/UsersList.vue'
import UserForm from '../views/Admin/Users/UserForm.vue'
import Role from '../views/Admin/Roles/Role.vue'
import PermissionManagement from '../views/Admin/Permissions/PermissionManagement.vue'
import ModuleManagement from '../views/Admin/Modules/ModuleManagement.vue'
import SubmoduleManagement from '../views/Admin/Modules/SubmoduleManagement.vue'

// Importar vistas de autenticación
import Login from '../views/Login/Login.vue'
import ForgotPassword from '../views/Login/PassRecover.vue'
import ResetPassword from '../views/Login/PassReset.vue'

const routes = [
  // Rutas de autenticación (NO requieren autenticación)
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Iniciar Sesión',
      requiresAuth: false,
      hideLayout: true
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: {
      title: 'Recuperar Contraseña',
      requiresAuth: false,
      hideLayout: true
    }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: {
      title: 'Nueva Contraseña',
      requiresAuth: false,
      hideLayout: true
    },
    props: route => ({ 
      token: route.query.token, 
      email: route.query.email 
    })
  },

  {
  path: '/Prueba2/prueba3',  // Esta ruta debe coincidir con la que definas en la BD
  name: 'Prueba',
  component: () => import('@/views/Prueba/prueba.vue'),
  meta: { requiresAuth: true } // Si requiere autenticación
  },

  // Ruta principal (requiere autenticación)
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: {
      title: 'Dashboard',
      requiresAuth: true
    }
  },
  // Ruta para módulos dinámicos (página en blanco con barra superior)
  {
    path: '/module/:moduleId',
    name: 'dynamicModule',
    component: () => import('@/views/BlankPage.vue'),
    meta: {
      title: 'Módulo',
      requiresAuth: true
    },
    props: true
  },

  // Rutas - Gestión de Dispositivos Biométricos
  {
    path: '/dispositivos/biometrico',
    name: 'addBiometricDevice',
    component: AddBiometer,
    meta: {
      title: 'Agregar Dispositivo Biométrico',
      requiresAuth: true
    }
  },
  {
    path: '/dispositivos/lista',
    name: 'listBiometricDevice',
    component: ListBiometer,
    props: true,
    meta: {
      title: 'Lista Dispositivo Biométrico',
      requiresAuth: true
    }
  },
  {
    path: '/dispositivos/biometrico/editar/:id',
    name: 'editBiometricDevice',
    component: AddBiometer,
    props: true,
    meta: {
      title: 'Editar Dispositivo Biométrico',
      requiresAuth: true
    }
  },
  {
    path: '/dispositivos/conectar',
    name: 'deviceSynchronization',
    component: DeviceSynchronization,
    meta: {
      title: 'Sincronización con Dispositivo',
      requiresAuth: true
    }
  },

  // Ruta principal de Gestión de Empleados
  {
    path: '/GestEmpleados',
    name: 'gestEmpleados',
    component: GestEmpleados,
    meta: {
      title: 'Gestión de Empleados',
      requiresAuth: true
    }
  },

  // Rutas - Gestión de Accesos
  {
    path: '/accesos/sincronizacionE',
    name: 'userSynchronization',
    component: UserSynchronization,
    meta: {
      title: 'Sincronización de Usuarios',
      requiresAuth: true
    }
  },
  {
    path: '/accesos/sincronizacionA',
    name: 'syncAccessEvents',
    component: SyncAccessEvents,
    meta: {
      title: 'Sincronización de Eventos de Acceso',
      requiresAuth: true
    }
  },
  {
    path: '/accesos/reporte',
    name: 'attendanceReport',
    component: AttendanceReport,
    meta: {
      title: 'Reporte de Asistencia',
      requiresAuth: true
    }
  },
  {
    path: '/empleados/lista',
    name: 'listDeviceUsers',
    component: ListDeviceUsers,
    meta: {
      title: 'Usuarios Sincronizados',
      requiresAuth: true
    }
  },

  // Rutas - Parametrización - Clientes
  {
    path: '/listClient',
    name: 'listClient',
    component: listClient,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/createClient',
    name: 'createClient',
    component: ClientNew,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/viewClient/:id',
    name: 'viewClient',
    component: ClientView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/editClient/:id',
    name: 'editClient',
    component: ClientEdit,
    meta: {
      requiresAuth: true
    }
  },

  // Rutas - Parametrización - Negocios
  {
    path: '/listBusiness',
    name: 'listBusiness',
    component: listBusiness,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/createBusiness',
    name: 'createBusiness',
    component: BusinessNew,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/viewBusiness/:id',
    name: 'viewBusiness',
    component: BusinessView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/editBusiness/:id',
    name: 'editBusiness',
    component: BusinessEdit,
    meta: {
      requiresAuth: true
    }
  },

  // Rutas - Inventario
  {
    path: '/createInventory',
    name: 'createInventory',
    component: InventoryNew,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/createArticle',
    name: 'createArticle',
    component: Article,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/createSupplier',
    name: 'createSupplier',
    component: Supplier,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/listInventory',
    name: 'listInventory',
    component: listInventory,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inventoryView/:id',
    name: 'inventoryView',
    component: inventoryView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inventoryEdit/:group_id',
    name: 'inventoryEdit',
    component: inventoryEdit,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/inventoryWriteOff/:id',
    name: 'inventoryWriteOff',
    component: inventoryWriteOff,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/listWriteOff',
    name: 'listWriteOff',
    component: listWriteOff,
    meta: {
      requiresAuth: true
    }
  },

  // Rutas - Administración de Usuarios
  {
    path: '/admin/users',
    name: 'adminUsers',
    component: UsersList,
    meta: {
      title: 'Gestión de Usuarios',
      requiresAuth: true
    }
  },
  {
    path: '/admin/users/create',
    name: 'adminUsersCreate',
    component: UserForm,
    meta: {
      title: 'Crear Usuario',
      requiresAuth: true
    }
  },
  {
    path: '/admin/users/edit/:id',
    name: 'adminUsersEdit',
    component: UserForm,
    props: true,
    meta: {
      title: 'Editar Usuario',
      requiresAuth: true
    }
  },

  // Rutas - Administración de Roles
  {
    path: '/admin/roles',
    name: 'adminRoles',
    component: Role,
    meta: {
      title: 'Gestión de Roles',
      requiresAuth: true
    }
  },
  {
    path: '/admin/roles/create',
    name: 'adminRolesCreate',
    component: Role,
    meta: {
      title: 'Crear Rol',
      requiresAuth: true
    }
  },
  {
    path: '/admin/roles/edit/:id',
    name: 'adminRolesEdit',
    component: Role,
    props: true,
    meta: {
      title: 'Editar Rol',
      requiresAuth: true
    }
  },

  // Rutas - Administración de Permisos
  {
    path: '/admin/permissions',
    name: 'adminPermissions',
    component: PermissionManagement,
    meta: {
      title: 'Gestión de Permisos',
      requiresAuth: true
    }
  },
  {
    path: '/admin/permissions/create',
    name: 'adminPermissionsCreate',
    component: PermissionManagement,
    meta: {
      title: 'Crear Permiso',
      requiresAuth: true
    }
  },
  {
    path: '/admin/permissions/edit/:id',
    name: 'adminPermissionsEdit',
    component: PermissionManagement,
    props: true,
    meta: {
      title: 'Editar Permiso',
      requiresAuth: true
    }
  },

  // Rutas - Administración de Módulos
  {
    path: '/admin/modules',
    name: 'adminModules',
    component: ModuleManagement,
    meta: {
      title: 'Administración de Módulos',
      requiresAuth: true
    }
  },
  {
    path: '/admin/modules/create',
    name: 'adminModulesCreate',
    component: ModuleManagement,
    meta: {
      title: 'Crear Módulo',
      requiresAuth: true
    }
  },
  {
    path: '/admin/modules/edit/:id',
    name: 'adminModulesEdit',
    component: ModuleManagement,
    props: true,
    meta: {
      title: 'Editar Módulo',
      requiresAuth: true
    }
  },

  // Rutas - Administración de Submódulos
  {
    path: '/admin/submodules',
    name: 'adminSubmodules',
    component: SubmoduleManagement,
    meta: {
      title: 'Administración de Submódulos',
      requiresAuth: true
    }
  },
  {
    path: '/admin/submodules/create',
    name: 'adminSubmodulesCreate',
    component: SubmoduleManagement,
    meta: {
      title: 'Crear Submódulo',
      requiresAuth: true
    }
  },
  {
    path: '/admin/submodules/edit/:id',
    name: 'adminSubmodulesEdit',
    component: SubmoduleManagement,
    props: true,
    meta: {
      title: 'Editar Submódulo',
      requiresAuth: true
    }
  },

  // Ruta catch-all - redirigir al dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Guard global para verificar autenticación
router.beforeEach((to, from, next) => {
  // 📝 Establecer título de la página
  if (to.meta.title) {
    document.title = `${to.meta.title} | DVSApp Control de Acceso`
  } else {
    document.title = 'DVSApp Control de Acceso'
  }

  // 🔐 Verificar si la ruta requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const token = localStorage.getItem('auth_token')

  // Si la ruta requiere autenticación y NO hay token
  if (requiresAuth && !token) {
    // Guardar la ruta de destino para redirigir después del login
    const redirect = to.fullPath !== '/' ? to.fullPath : '/GestEmpleados'
    next({
      name: 'Login',
      query: { redirect }
    })
    return
  }

  // Si está autenticado y va a login, redirigir al dashboard o ruta guardada
  if (!requiresAuth && token && to.name === 'Login') {
    const redirect = to.query.redirect || from.query.redirect || '/'
    next(redirect)
    return
  }

  next()
})

// Interceptor de respuesta para manejar tokens expirados
import api from '@/services/api'

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default router