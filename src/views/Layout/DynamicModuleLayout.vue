<template>
  <div class="dynamic-module-layout">
    <!-- Contenido principal -->
    <div class="main-content">
      <div class="container-fluid p-4">
        <!-- Slot para contenido dinámico -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
// Este componente sirve como layout base para módulos dinámicos
// No carga ningún contenido específico, solo proporciona el contenedor
</script>

<style scoped>
.dynamic-module-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  margin-left: 80px; /* Ajuste para la barra lateral colapsada por defecto */
  transition: margin-left 0.3s ease;
}

/* Ajuste cuando la barra lateral está expandida */
.expanded .main-content {
  margin-left: 250px;
}

.container-fluid {
  padding: 20px;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
}
</style>