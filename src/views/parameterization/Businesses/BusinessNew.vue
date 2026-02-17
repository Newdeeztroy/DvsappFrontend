<template> 
    <div class="row m-3">
      <div class="col-md-6 offset-md-3">
        <div class="card shadow">
          <div class="card-header bg-success text-white text-center">
            <h5>REGISTRAR EMPRESA</h5>
          </div>
          <div class="card-body">
            <form v-on:submit="save"> 
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
                <input type="text" v-model="name" id="name" placeholder="Ingrese Nombre" required maxlength="50" class="form-control">
              </div>
  
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
                <input type="text" v-model="nit" id="nit" placeholder="Ingrese Nit" required maxlength="50" class="form-control">
              </div>
  
              <div class="d-grid mb-3">
                <button class="btn btn-success" type="submit">
                  <i class="fa-solid fa-floppy-disk"></i> Registrar
                </button>
              </div>
  
              <div class="d-grid">
                <button class="btn btn-danger" type="button" @click="cancel">
                  <i class="fa-solid fa-times"></i> Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { viewAlert, sendRequest } from '/src/Functions';
  
  export default {
    data() {
      return {
        name: "",
        nit: "",
        url: 'http://dvsapp.com/api/Businesses',
      };
    },
    methods: {
      save(event) {
        event.preventDefault();
        if (this.name.trim() === '') {
          viewAlert('Ingrese un nombre', 'warning', 'name');
        } else if (this.nit.trim() === '') {
          viewAlert('Ingrese un Nit', 'warning', 'nit');
        } else {
          const parameter = {name: this.name.trim(),nit: this.nit.trim(),
          };
          sendRequest('post', parameter, this.url,'registro correcto','/listBusiness');
        }
      },
      cancel() {
        // Aquí puedes limpiar los campos o redirigir a otra página
        this.name = "";
        this.nit = "";
        viewAlert('Registro cancelado', 'info');
        this.$router.push('/listbusiness');
      },
    },
  };
  </script>
  
  <style scoped>
  .card-header {
    font-weight: bold;
    background-color: #4CAF50 !important; /* Verde para la barra de título */
  }
  
  .profile-img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }
  
  .input-group-text {
    background-color: #4CAF50 !important; /* Verde para el fondo del ícono */
    color: white;
  }
  
  .btn-success {
    background-color: #4CAF50 !important;
    border: none;
  }
  
  .btn-danger {
    background-color: #dc3545 !important; /* Rojo para el botón de cancelar */
    border: none;
  }
  </style>
  