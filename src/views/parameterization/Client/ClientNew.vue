<template> 
  <div class="row m-3">
    <div class="col-md-6 offset-md-3">
      <div class="card shadow">
        <div class="card-header bg-success text-white text-center">
          <h5>REGISTRAR EMPLEADO</h5>
        </div>
        <div class="card-body">
          <form v-on:submit="save">
            <div class="d-flex justify-content-center mb-3">
              <img v-if="this.photo" :src="this.photo" class="profile-img img-thumbnail" alt="Empleado">
              <img v-else src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-256.png" class="profile-img img-thumbnail" alt="Empleado">
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
      First_name: "",
      last_name: "",
      address: "",
      id_nodum: "",
      id_payroll: "",
      email: "",
      charge: "",
      photo: "",
      businesses: [], 
      selectedBusiness: "",
      url: 'http://dvsappbackend.test/api/Clients',
    };
  },

  mounted() {
    this.fetchBusinesses();
  },

  methods: {
    save(event) {
      event.preventDefault();
      if (this.First_name.trim() === '') {
        viewAlert('Ingrese un nombre', 'warning', 'First_name');
      } else if (this.last_name.trim() === '') {
        viewAlert('Ingrese un apellido', 'warning', 'last_name');
      } else if (this.address.trim() === '') {
        viewAlert('Ingrese Cédula', 'warning', 'address');
      } else if (this.id_nodum.trim() === '') {
        viewAlert('Ingrese un Código Nodum', 'warning', 'id_nodum');
      } else if (this.id_payroll.trim() === '') {
        viewAlert('Ingrese Código de Nómina', 'warning', 'id_payroll');
      } else if (this.email.trim() === '') {
        viewAlert('Ingrese un email', 'warning', 'email');
      } else if (this.charge.trim() === '') {
        viewAlert('Ingrese Cargo', 'warning', 'charge');
      } else if (!this.selectedBusiness) {
        viewAlert('Seleccione una empresa', 'warning', 'business');
      } else {
        const parameter = {
          First_name: this.First_name.trim(),
          last_name: this.last_name.trim(),
          address: this.address.trim(),
          id_nodum: this.id_nodum.trim(),
          id_payroll: this.id_payroll.trim(),
          email: this.email.trim(),
          charge: this.charge.trim(),
          photo: this.photo || "",
          business_id: this.selectedBusiness,
        };
        sendRequest('post', parameter, this.url, 'registro correcto','/listClient');
      }
    },
    async fetchBusinesses() {
      try {
        const response = await fetch('http://dvsappbackend.test/api/Businesses');
        if (!response.ok) throw new Error('Error al cargar las empresas');
        const data = await response.json();
        this.businesses = data; // Asegúrate de que el JSON devuelto tenga el formato correcto
      } catch (error) {
        console.error('Error al obtener empresas:', error);
      }
    },
    cancel() {
      // Aquí puedes limpiar los campos o redirigir a otra página
      this.First_name = "";
      this.last_name = "";
      this.address = "";
      this.id_nodum = "";
      this.id_payroll = "";
      this.email = "";
      this.charge = "";
      this.photo = "";
      this.selectedBusiness = "";
      viewAlert('Registro cancelado', 'info');
      this.$router.push('/listClient');
    },
    previwPhoto(event) {
      const reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = () => {
        this.photo = reader.result;
      };
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

select.form-control {
  color: #6c757d; /* Mismo color que los placeholders de los campos de entrada */
  font-weight: normal; /* Ajusta el grosor del texto */
}

select.form-control:focus {
  color: #495057; /* Color al interactuar */
  outline: none; /* Quita el borde azul predeterminado */
}

select.form-control option {
  color: #000; /* Asegúrate de que las opciones sean visibles */
}
</style>
