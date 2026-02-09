<template>
  <div class="prueba-container">
    <h1 class="prueba-text">PRUEBA</h1>
    <p class="subtitle">Este es un componente Vue que muestra una palabra grande</p>
    
    <div class="controls">
      <label for="color-select">Cambiar color:</label>
      <select id="color-select" v-model="selectedColor" @change="updateColor">
        <option value="#3498db">Azul</option>
        <option value="#e74c3c">Rojo</option>
        <option value="#2ecc71">Verde</option>
        <option value="#f39c12">Naranja</option>
        <option value="#9b59b6">Morado</option>
      </select>
      
      <label for="size-slider">Tamaño:</label>
      <input 
        id="size-slider" 
        type="range" 
        min="50" 
        max="200" 
        v-model="fontSize" 
        @input="updateSize"
      >
      <span>{{ fontSize }}px</span>
    </div>
    
    <div class="info">
      <p>Este archivo Vue contiene:</p>
      <ul>
        <li>Template con el HTML del componente</li>
        <li>Script con la lógica de Vue</li>
        <li>Estilos específicos para este componente</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Prueba',
  data() {
    return {
      selectedColor: '#3498db',
      fontSize: 100
    }
  },
  methods: {
    updateColor() {
      // Este método se llama cuando cambia el color
      console.log(`Color cambiado a: ${this.selectedColor}`);
    },
    updateSize() {
      // Este método se llama cuando cambia el tamaño
      console.log(`Tamaño cambiado a: ${this.fontSize}px`);
    }
  }
}
</script>

<style scoped>
.prueba-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.prueba-text {
  font-size: 100px;
  font-weight: 900;
  color: #3498db;
  text-transform: uppercase;
  letter-spacing: 5px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.subtitle {
  font-size: 18px;
  color: #555;
  margin-bottom: 40px;
  text-align: center;
  max-width: 600px;
}

.controls {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
  align-items: center;
}

.controls label {
  font-weight: 600;
  color: #333;
}

.controls select, .controls input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 16px;
}

.info {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.info p {
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.info ul {
  text-align: left;
  color: #555;
  line-height: 1.6;
}

.info li {
  margin-bottom: 8px;
}

/* Estilos responsivos */
@media (max-width: 768px) {
  .prueba-text {
    font-size: 70px;
  }
  
  .controls {
    width: 90%;
  }
}

@media (max-width: 480px) {
  .prueba-text {
    font-size: 50px;
    letter-spacing: 3px;
  }
  
  .subtitle {
    font-size: 16px;
  }
}
</style>