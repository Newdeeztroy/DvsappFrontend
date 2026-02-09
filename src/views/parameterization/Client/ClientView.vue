<template>
  <div class="row m-3">
    <div class="col-md-6 offset-md-3">
      <div class="card">
        <div class="card-header bg-success text-white text-center">
          DETALLES DEL EMPLEADO
        </div>
        <div class="card-body">
          <form>
            <div class="d-flex justify-content-center mb-3">
              <img v-if="photo" :src="photo" id="Photoimg" class="profile-img img-thumbnail" alt="Foto">
              <img v-else src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-256.png" id="Photoimg" class="profile-img img-thumbnail" alt="Foto predeterminada">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
              <input type="text" v-model="First_name" id="First_name" placeholder="Nombre" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
              <input type="text" v-model="last_name" id="last_name" placeholder="Apellido" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-id-card"></i></span>
              <input type="text" v-model="address" id="address" placeholder="Cédula" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
              <input type="text" v-model="id_nodum" id="id_nodum" placeholder="Código Nodum" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-file-invoice-dollar"></i></span>
              <input type="text" v-model="id_payroll" id="id_payroll" placeholder="Código de Nómina" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
              <input type="email" v-model="email" id="email" placeholder="Email" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-briefcase"></i></span>
              <input type="text" v-model="charge" id="charge" placeholder="Cargo" disabled class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-building"></i></span>
              <select v-model="selectedBusiness" id="business" disabled class="form-control" required>
                <option value="" disabled>Agregar empresa</option>
                <option v-for="business in businesses" :key="business.id" :value="business.id">
                  {{ business.name }}
                </option>
              </select>
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
      First_name: "",
      last_name: "",
      address: "",
      id_nodum: "",
      id_payroll: "",
      email: "",
      charge: "",
      businesses: [], 
      selectedBusiness: "",
      photo: "",
      url: 'http://dvsappbackend.test/api/Clients',
    };
  },

  mounted() {
    const route = useRoute();
    this.id = route.params.id;
    this.url += '/' + this.id;
    this.fetchBusinesses();
    this.getClient();
  },

  methods: {
    getClient() {
      axios.get(this.url).then(res => {
        const client = res.data.data;
        this.First_name = res.data.data.First_name;
        this.last_name = res.data.data.last_name;
        this.address = res.data.data.address;
        this.id_nodum = res.data.data.id_nodum;
        this.id_payroll = res.data.data.id_payroll;
        this.email = res.data.data.email;
        this.charge = res.data.data.charge;
        this.selectedBusiness = client.business_id;
        this.photo = res.data.data.photo;
      });
    },
    async fetchBusinesses() {
      try {
        const response = await fetch('http://dvsappbackend.test/api/Businesses');
        if (!response.ok) throw new Error('Error al cargar las empresas');
        const data = await response.json();
        this.businesses = data; 
      } catch (error) {
        console.error('Error al obtener empresas:', error);
      }
    },
    goBack() {
      this.$router.push('/listClient'); // Cambia '/' por la ruta a la que deseas redirigir al presionar "Volver".
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
