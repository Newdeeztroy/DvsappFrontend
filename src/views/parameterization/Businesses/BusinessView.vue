<template>
    <div class="row m-3">
      <div class="col-md-6 offset-md-3">
        <div class="card">
          <div class="card-header bg-success text-white text-center">
            DETALLES DEL EMPRESA
          </div>
          <div class="card-body">
            <form>
  
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
                <input type="text" v-model="name" id="name" placeholder="Nombre" disabled class="form-control">
              </div>
  
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
                <input type="text" v-model="nit" id="nit" placeholder="Nit" disabled class="form-control">
              </div>
  
              <div class="d-grid">
                <button type="button" class="btn btn-primary btn-lightblue" @click="goBack">
                  <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  
  export default {
    data() {
      return {
        id: 0,
        name: "",
        nit: "",
        url: 'http://dvsapp.com/api/Businesses',
      };
    },
  
    mounted() {
      const route = useRoute();
      this.id = route.params.id;
      this.url += '/' + this.id;
      this.getBusiness();
    },
  
    methods: {
      getBusiness() {
        axios.get(this.url).then(res => {
          this.name = res.data.data.name;
          this.nit = res.data.data.nit;
        });
      },
      goBack() {
        this.$router.push('/listBusiness'); // Cambia '/' por la ruta a la que deseas redirigir al presionar "Volver".
      },
    },
  };
  </script>
  
  <style scoped>
  .card-header {
    font-weight: bold;
    background-color: #4CAF50 !important; /* Fondo verde */
  }
  
  .profile-img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
  
  .input-group-text {
    background-color: #4CAF50 !important; /* Fondo verde */
    color: white;
  }
  
  .btn-lightblue {
    background-color: #ADD8E6 !important; /* Azul claro para el botón de regresar */
    border: none;
    color: white;
  }
  
  .btn-lightblue:hover {
    background-color: #87CEEB !important; /* Azul más oscuro al pasar el mouse */
  }
  </style>
  