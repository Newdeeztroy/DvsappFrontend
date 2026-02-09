<template>
  <div class="dashboard-container">
    <!-- Encabezado con degradado verde -->
    <header class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">
          <i class="fa-solid fa-chart-line me-3"></i>
          Panel de Control
        </h1>
        <div class="header-actions">
          <div class="date-display">
            <i class="fa-solid fa-calendar me-2"></i>
            <span>{{ currentDate }}</span>
          </div>
          <div class="user-info">
            <i class="fa-solid fa-user me-2"></i>
            <span>{{ userName }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Widgets estadísticos -->
    <div class="stats-grid">
      <div class="stat-card stat-card-primary" @click="navigateTo('/admin/users')">
        <div class="stat-icon">
          <i class="fa-solid fa-users"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Usuarios Activos</h3>
          <p class="stat-value">{{ stats.activeUsers }}</p>
          <div class="stat-footer">
            <span class="stat-trend positive">
              <i class="fa-solid fa-arrow-up"></i> 12% desde el mes pasado
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-success" @click="navigateTo('/admin/roles')">
        <div class="stat-icon">
          <i class="fa-solid fa-user-tag"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Roles del Sistema</h3>
          <p class="stat-value">{{ stats.roles }}</p>
          <div class="stat-footer">
            <span class="stat-trend neutral">
              <i class="fa-solid fa-equals"></i> Sin cambios este mes
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-warning" @click="navigateTo('/admin/permissions')">
        <div class="stat-icon">
          <i class="fa-solid fa-shield"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Permisos Activos</h3>
          <p class="stat-value">{{ stats.permissions }}</p>
          <div class="stat-footer">
            <span class="stat-trend positive">
              <i class="fa-solid fa-arrow-up"></i> 5 nuevos este mes
            </span>
          </div>
        </div>
      </div>

      <div class="stat-card stat-card-danger">
        <div class="stat-icon">
          <i class="fa-solid fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Alertas del Sistema</h3>
          <p class="stat-value">{{ stats.alerts }}</p>
          <div class="stat-footer">
            <span class="stat-trend negative">
              <i class="fa-solid fa-arrow-down"></i> 3 pendientes de revisión
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Gráficas y tablas -->
    <div class="dashboard-grid">
      <!-- Tabla de últimos usuarios -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>
            <i class="fa-solid fa-users me-2"></i>
            Últimos Usuarios Registrados
          </h2>
          <router-link to="/admin/users" class="btn-view-all">
            Ver todos <i class="fa-solid fa-arrow-right ms-1"></i>
          </router-link>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Fecha de Registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(client, index) in clients" :key="index" class="table-row">
                  <td class="id-cell">{{ client.id }}</td>
                  <td class="name-cell">
                    <div class="user-info">
                      <div class="user-avatar">
                        {{ client.name.charAt(0) }}
                      </div>
                      <span>{{ client.name }}</span>
                    </div>
                  </td>
                  <td class="email-cell">{{ client.email }}</td>
                  <td class="role-cell">
                    <span class="role-badge" :class="'role-' + client.role.toLowerCase()">
                      {{ client.role }}
                    </span>
                  </td>
                  <td class="date-cell">{{ formatDate(client.date) }}</td>
                  <td class="status-cell">
                    <span class="status-badge" :class="client.status">
                      {{ client.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Actividad reciente -->
      <div class="dashboard-card">
        <div class="card-header">
          <h2>
            <i class="fa-solid fa-clock me-2"></i>
            Actividad Reciente
          </h2>
          <button class="btn-view-all">
            Ver historial <i class="fa-solid fa-arrow-right ms-1"></i>
          </button>
        </div>
        <div class="card-body activity-body">
          <div class="activity-item" v-for="(activity, index) in activities" :key="index">
            <div class="activity-icon" :class="activity.type">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p class="activity-text">
                <span class="activity-user">{{ activity.user }}</span>
                {{ activity.action }}
                <span class="activity-target">{{ activity.target }}</span>
              </p>
              <p class="activity-time">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentDate: new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      userName: 'Administrador',
      stats: {
        activeUsers: 42,
        roles: 5,
        permissions: 28,
        alerts: 3
      },
      clients: [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin', date: '2023-01-15', status: 'activo' },
        { id: 2, name: 'María García', email: 'maria@example.com', role: 'Editor', date: '2023-01-16', status: 'activo' },
        { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'Usuario', date: '2023-01-17', status: 'inactivo' },
        { id: 4, name: 'Ana Martínez', email: 'ana@example.com', role: 'Admin', date: '2023-01-18', status: 'activo' },
        { id: 5, name: 'Pedro Rodríguez', email: 'pedro@example.com', role: 'Usuario', date: '2023-01-19', status: 'activo' }
      ],
      activities: [
        { 
          type: 'create', 
          icon: 'fa-solid fa-user-plus', 
          user: 'Administrador', 
          action: 'creó un nuevo usuario', 
          target: 'Carlos López', 
          time: 'Hace 2 horas' 
        },
        { 
          type: 'update', 
          icon: 'fa-solid fa-user-pen', 
          user: 'Ana Martínez', 
          action: 'actualizó el rol de', 
          target: 'Pedro Rodríguez', 
          time: 'Hace 4 horas' 
        },
        { 
          type: 'delete', 
          icon: 'fa-solid fa-user-minus', 
          user: 'Sistema', 
          action: 'eliminó al usuario', 
          target: 'Usuario temporal', 
          time: 'Hace 1 día' 
        },
        { 
          type: 'login', 
          icon: 'fa-solid fa-right-to-bracket', 
          user: 'Juan Pérez', 
          action: 'inició sesión desde', 
          target: 'Dispositivo móvil', 
          time: 'Hace 3 horas' 
        },
        { 
          type: 'permission', 
          icon: 'fa-solid fa-shield-keyhole', 
          user: 'Administrador', 
          action: 'actualizó permisos de', 
          target: 'Rol Editor', 
          time: 'Hace 5 horas' 
        }
      ]
    };
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    navigateTo(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style scoped>
/* Contenedor principal */
.dashboard-container {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

/* Encabezado con degradado verde */
.dashboard-header {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 50%, #2dc23f 100%);
  color: white;
  border-radius: 12px;
  padding: 25px 30px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 25px;
  align-items: center;
}

.date-display, .user-info {
  display: flex;
  align-items: center;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 15px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* Grid de estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: inherit;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 16px;
  color: #6c757d;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: #212529;
}

.stat-footer {
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.stat-trend {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-trend.positive {
  color: #28a745;
}

.stat-trend.negative {
  color: #dc3545;
}

.stat-trend.neutral {
  color: #6c757d;
}

/* Colores específicos para cada tarjeta */
.stat-card-primary .stat-icon {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
}

.stat-card-primary .stat-value {
  color: #1a5f23;
}

.stat-card-success .stat-icon {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.stat-card-success .stat-value {
  color: #28a745;
}

.stat-card-warning .stat-icon {
  background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
}

.stat-card-warning .stat-value {
  color: #e0a800;
}

.stat-card-danger .stat-icon {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.stat-card-danger .stat-value {
  color: #dc3545;
}

/* Grid principal del dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
  margin-top: 20px;
}

.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #1a5f23 0%, #259634 50%, #2dc23f 100%);
  color: white;
  padding: 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.btn-view-all {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-view-all:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.card-body {
  padding: 25px;
}

/* Tabla de datos */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f8f9fa;
}

.data-table th {
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
}

.data-table tbody tr:hover {
  background: #f8f9fa;
  transform: translateX(5px);
}

.data-table td {
  padding: 15px 20px;
  color: #495057;
  font-size: 15px;
}

.id-cell {
  font-weight: 600;
  color: #1a5f23;
  width: 80px;
}

.name-cell {
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a5f23 0%, #259634 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.role-cell .role-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.role-admin {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.role-editor {
  background: rgba(255, 193, 7, 0.15);
  color: #e0a800;
}

.role-usuario {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.status-cell .status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.status-badge.activo {
  background: rgba(40, 167, 69, 0.15);
  color: #28a745;
}

.status-badge.inactivo {
  background: rgba(108, 117, 125, 0.15);
  color: #6c757d;
}

/* Actividad reciente */
.activity-body {
  padding: 0;
}

.activity-item {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 15px;
  transition: all 0.2s ease;
}

.activity-item:hover {
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 18px;
}

.activity-icon.create {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.activity-icon.update {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
}

.activity-icon.delete {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.activity-icon.login {
  background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
}

.activity-icon.permission {
  background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  font-weight: 500;
  color: #212529;
  font-size: 15px;
}

.activity-user {
  color: #1a5f23;
  font-weight: 600;
}

.activity-target {
  color: #259634;
  font-weight: 600;
}

.activity-time {
  margin: 0;
  font-size: 13px;
  color: #6c757d;
}

/* Responsive */
@media (max-width: 992px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 15px;
  }
  
  .dashboard-header {
    padding: 20px;
    border-radius: 10px;
  }
  
  .dashboard-title {
    font-size: 24px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .data-table {
    font-size: 14px;
  }
  
  .data-table th, .data-table td {
    padding: 10px 12px;
  }
}
</style>