<template>
  <div class="row m-3">
    <div class="col-md-6 offset-md-3">
      <div class="card">
        <div class="card-header bg-success text-white text-center">
          EDITAR EMPLEADO
        </div>
        <div class="card-body">
          <form v-on:submit="edit">
            <div class="d-flex justify-content-center mb-3">
              <img v-if="this.photo" :src="this.photo" id="Photoimg" class="profile-img img-thumbnail" alt="Foto">
              <img v-else src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-256.png" id="Photoimg" class="profile-img img-thumbnail" alt="Foto predeterminada">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
              <input type="text" v-model="First_name" id="First_name" placeholder="Ingrese Nombre" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
              <input type="text" v-model="last_name" id="last_name" placeholder="Ingrese Apellido" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-id-card"></i></span>
              <input type="text" v-model="address" id="address" placeholder="Ingrese Cédula" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-barcode"></i></span>
              <input type="text" v-model="id_nodum" id="id_nodum" placeholder="Ingrese Código Nodum" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-file-invoice-dollar"></i></span>
              <input type="text" v-model="id_payroll" id="id_payroll" placeholder="Ingrese Código de Nómina" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
              <input type="email" v-model="email" id="email" placeholder="Ingrese Email" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-briefcase"></i></span>
              <input type="text" v-model="charge" id="charge" placeholder="Ingrese Cargo" required maxlength="50" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-upload"></i></span>
              <input v-on:change="previwPhoto" type="file" accept="image/png, image/jpeg" class="form-control">
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"><i class="fa-solid fa-building"></i></span>
              <select v-model="selectedBusiness" id="business" class="form-control" required>
                <option value="" disabled>Agregar empresa</option>
                <option v-for="business in businesses" :key="business.id" :value="business.id">
                  {{ business.name }}
                </option>
              </select>
            </div>

            <div class="d-grid">
              <button class="btn btn-success mb-2"><i class="fa-solid fa-floppy-disk"></i> Guardar Cambios</button>
            </div>
            <div class="d-grid">
              <button type="button" class="btn btn-danger" @click="cancelEdit"><i class="fa-solid fa-times"></i> Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { viewAlert, sendRequest } from '/src/Functions';
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
      photo: "https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-256.png",
      url: 'http://dvsapp.com/api/Clients',
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
        const response = await fetch('http://dvsapp.com/api/Businesses');
        if (!response.ok) throw new Error('Error al cargar las empresas');
        const data = await response.json();
        this.businesses = data; // Asegúrate de que el JSON devuelto tenga el formato correcto
      } catch (error) {
        console.error('Error al obtener empresas:', error);
      }
    },

    edit(event) {
      event.preventDefault();
      var ImgPhoto = document.getElementById('Photoimg');
      this.Photo = ImgPhoto;

      if (this.First_name.trim() === '') {
        viewAlert('Ingrese un nombre', 'warning', 'First_name');
      } else if (this.last_name.trim() === '') {
        viewAlert('Ingrese un apellido', 'warning', 'last_name');
      } else if (this.address.trim() === '') {
        viewAlert('Ingrese Cédula', 'warning', 'address');
      } else if (this.id_nodum.trim() === '') {
        viewAlert('Ingrese un Código de Nodum', 'warning', 'id_nodum');
      } else if (this.id_payroll.trim() === '') {
        viewAlert('Ingrese Código de Nómina', 'warning', 'id_payroll');
      } else if (this.email.trim() === '') {
        viewAlert('Ingrese un email', 'warning', 'email');
      } else if (this.charge.trim() === '') {
        viewAlert('Ingrese Cargo', 'warning', 'charge');
      } else if (!this.selectedBusiness) {
        viewAlert('Seleccione una empresa', 'warning', 'business');
      } else {
        var parameter = {
          First_name: this.First_name.trim(),
          last_name: this.last_name.trim(),
          address: this.address.trim(),
          id_nodum: this.id_nodum.trim(),
          id_payroll: this.id_payroll.trim(),
          email: this.email.trim(),
          charge: this.charge.trim(),
          business_id: this.selectedBusiness,
          photo: this.photo || ""
        };
        sendRequest('put', parameter, this.url, 'registro correcto','/listClients');
      }
    },
    
    previwPhoto(event) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        var imgPhoto = document.getElementById("Photoimg");
        imgPhoto.src = reader.result;
        this.photo = imgPhoto.src;
      };
    },
    
    cancelEdit() {
      this.$router.push('/listClient'); 
    }
  }
};
</script>

<style scoped>
.card-header {
  font-weight: bold;
  background-color: #4CAF50 !important; /* Fondo verde */
}

.profile-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.d-flex.justify-content-center.mb-3 {
  display: flex;
  justify-content: center;
}

.input-group-text {
  background-color: #4CAF50 !important; /* Fondo verde */
  color: white;
}

.btn-success {
  background-color: #4CAF50 !important;
  border: none;
}

.btn-danger {
  background-color: #d9534f !important; /* Fondo rojo para el botón de cancelar */
  border: none;
}
</style>
