<template>
  <div class="gest-empleados-container">
    <div class="page-header">
      <h1 class="page-title">
        <i class="fa-solid fa-users me-2"></i>
        Gestión de Empleados
      </h1>
      <p class="page-subtitle">Bienvenido al módulo de gestión de empleados</p>
    </div>

    <div class="dashboard-grid">
      
      <!-- Tarjeta de Lista de Empleados -->
      <div class="card card-dashboard">
        <div class="card-body">
          <div class="card-icon bg-success">
            <i class="fa-solid fa-list"></i>
          </div>
          <div class="card-content">
            <h3>Lista de Empleados</h3>
            <p>Ver y gestionar todos los empleados registrados</p>
            <router-link to="/empleados/lista" class="btn btn-success">
              Ver Lista
            </router-link>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Reportes -->
      <div class="card card-dashboard">
        <div class="card-body">
          <div class="card-icon bg-warning">
            <i class="fa-solid fa-chart-bar"></i>
          </div>
          <div class="card-content">
            <h3>Reportes</h3>
            <p>Generar reportes de asistencia y eventos</p>
            <router-link to="/accesos/reporte" class="btn btn-warning">
              Ver Reportes
            </router-link>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Dispositivos -->
      <div class="card card-dashboard">
        <div class="card-body">
          <div class="card-icon bg-danger">
            <i class="fa-solid fa-microchip"></i>
          </div>
          <div class="card-content">
            <h3>Dispositivos</h3>
            <p>Administrar dispositivos biométricos</p>
            <router-link to="/dispositivos/lista" class="btn btn-danger">
              Gestionar
            </router-link>
          </div>
        </div>
      </div>

      <!-- Tarjeta de Tarjetas -->
      <div class="card card-dashboard">
        <div class="card-body">
          <div class="card-icon bg-secondary">
            <i class="fa-solid fa-id-card"></i>
          </div>
          <div class="card-content">
            <h3>Tarjetas</h3>
            <p>Asignar y gestionar tarjetas de acceso</p>
            <router-link to="/tarjetas/lista" class="btn btn-secondary">
              Gestionar
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Página de Gestión de Empleados cargada')
})
</script>

<style scoped>
.gest-empleados-container {
  padding: 20px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-title {
  color: #2d3748;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.page-subtitle {
  color: #718096;
  font-size: 1.1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.card-dashboard {
  border: none;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-dashboard:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-body {
  display: flex;
  align-items: center;
  padding: 20px;
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
  font-size: 1.5rem;
}

.card-content {
  flex: 1;
}

.card-content h3 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 1.2rem;
}

.card-content p {
  margin: 0 0 15px 0;
  color: #718096;
  font-size: 0.9rem;
}

.btn {
  padding: 8px 16px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-2px);
  text-decoration: none;
}
</style>