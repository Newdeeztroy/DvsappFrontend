<template>
  <div class="row m-3">
    <div class="col-md-6 offset-md-3">
      <div class="card">
        <div class="card-header bg-success text-white text-center">
          EDITAR EMPRESA
        </div>
        <div class="card-body">
          <form v-on:submit="edit">
            <div class="input-group mb-3">
              <span class="input-group-text"
                ><i class="fa-solid fa-user"></i
              ></span>
              <input
                type="text"
                v-model="name"
                id="name"
                placeholder="Ingrese Nombre"
                required
                maxlength="50"
                class="form-control"
              />
            </div>

            <div class="input-group mb-3">
              <span class="input-group-text"
                ><i class="fa-solid fa-barcode"></i
              ></span>
              <input
                type="text"
                v-model="nit"
                id="nit"
                placeholder="Ingrese Apellido"
                required
                maxlength="50"
                class="form-control"
              />
            </div>

            <div class="d-grid">
              <button class="btn btn-success mb-2">
                <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
              </button>
            </div>
            <div class="d-grid">
              <button type="button" class="btn btn-danger" @click="cancelEdit">
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
import { viewAlert, sendRequest } from "/src/Functions";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

export default {
  data() {
    return {
      id: 0,
      name: "",
      nit: "",
      url: "http://dvsappbackend.test/api/Businesses",
    };
  },

  mounted() {
    const route = useRoute();
    this.id = route.params.id;
    this.url += "/" + this.id;
    this.getBusiness();
  },

  methods: {
    getBusiness() {
      axios.get(this.url).then((res) => {
        this.name = res.data.data.name;
        this.nit = res.data.data.nit;
      });
    },

    edit(event) {
      event.preventDefault();
      var ImgPhoto = document.getElementById("Photoimg");
      this.Photo = ImgPhoto;

      if (this.name.trim() === "") {
        viewAlert("Ingrese un nombre", "warning", "name");
      } else if (this.nit.trim() === "") {
        viewAlert("Ingrese un Nit", "warning", "nit");
      } else {
        var parameter = {
          name: this.name.trim(),
          nit: this.nit.trim(),
        };
        sendRequest(
          "put",
          parameter,
          this.url,
          "registro correcto",
          "/listBusiness"
        );
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
      this.$router.push("/listBusiness");
    },
  },
};
</script>
  
  <style scoped>
.card-header {
  font-weight: bold;
  background-color: #4caf50 !important; /* Fondo verde */
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
  background-color: #4caf50 !important; /* Fondo verde */
  color: white;
}

.btn-success {
  background-color: #4caf50 !important;
  border: none;
}

.btn-danger {
  background-color: #d9534f !important; /* Fondo rojo para el botón de cancelar */
  border: none;
}
</style>
  