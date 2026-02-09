<template>
  <div class="blank-page">
    <div class="container-fluid">
      <div class="empty-state">
        <i class="fa-solid fa-folder-open fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">Módulo Seleccionado</h4>
        <p class="text-muted">Selecciona una opción del menú superior para comenzar</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Componente vacío para mostrar cuando se selecciona un módulo dinámico
// Sin contenido específico, solo un estado vacío amigable
</script>

<style scoped>
.blank-page {
  padding: 40px 20px;
  min-height: calc(100vh - 200px); /* Ajustar según altura de barras */
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-state i {
  opacity: 0.5;
}

.empty-state h4 {
  margin-bottom: 10px;
}

.empty-state p {
  margin-bottom: 0;
  opacity: 0.7;
}
</style>