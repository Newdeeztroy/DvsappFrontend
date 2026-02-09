<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-header bg-success text-white d-flex align-items-center justify-content-between">
        <h4>Gestión de Proveedores Tecnológicos</h4>
      </div>
      <div class="card-body">
        <!-- Formulario para agregar proveedores -->
        <form @submit.prevent="save" class="mb-4">
          <div class="row g-3">
            <div class="col-md-3">
              <input
                type="text"
                v-model="name"
                placeholder="Nombre del proveedor"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-3">
              <input
                type="text"
                v-model="nit"
                placeholder="NIT del proveedor"
                class="form-control"
                required
              />
            </div>
            <div class="col-md-3">
              <input
                type="text"
                v-model="phone"
                placeholder="Teléfono del proveedor"
                class="form-control"
              />
            </div>
            <div class="col-md-3">
              <input
                type="email"
                v-model="email"
                placeholder="Correo del proveedor"
                class="form-control"
              />
            </div>
            <div class="col-md-12 text-end">
              <button type="submit" class="btn btn-primary">Crear</button>
            </div>
          </div>
        </form>

        <!-- Tabla de proveedores -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">Artículos Creados:</h5>
          <div class="d-flex align-items-center">
            <label for="rowsPerPage" class="me-2 mb-0">Mostrar:</label>
            <select id="rowsPerPage" class="form-select d-inline-block w-auto" v-model="rowsPerPage" @change="changePageSize">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="0">Todos</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered">
            <thead class="table-success">
              <tr>
                <th>ID</th>
                <th>Proveedor</th>
                <th>NIT</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="changer">
              <td colspan="12" class="text-center"><h3>Cargando...</h3></td>
              </tr>
              <tr v-else-if="suppliers.length === 0">
                  <td colspan="6" class="text-center">No hay proveedores creados.</td>
              </tr>
              <tr v-for="(supplier, index) in suppliers" :key="supplier.id">
                  <td>{{ supplier.id }}</td>
                  <td>
                      <span v-if="editIndex !== index">{{ supplier.name }}</span>
                      <input
                          v-else
                          type="text"
                          v-model="editSupplier.name"
                          class="form-control"
                      />
                  </td>
                  <td>
                      <span v-if="editIndex !== index">{{ supplier.nit }}</span>
                      <input
                          v-else
                          type="text"
                          v-model="editSupplier.nit"
                          class="form-control"
                      />
                  </td>
                  <td>
                      <span v-if="editIndex !== index">{{ supplier.phone }}</span>
                      <input
                          v-else
                          type="text"
                          v-model="editSupplier.phone"
                          class="form-control"
                      />
                  </td>
                  <td>
                      <span v-if="editIndex !== index">{{ supplier.email }}</span>
                      <input
                          v-else
                          type="email"
                          v-model="editSupplier.email"
                          class="form-control"
                      />
                  </td>
                  <td>
                      <div v-if="editIndex !== index">
                          <button
                              class="btn btn-warning btn-sm me-2"
                              v-if="!supplier.deleted_at"
                              @click="startEditing(index, supplier)"
                          >
                              Editar
                          </button>
                          <button
                              class="btn btn-danger btn-sm"
                              v-if="!supplier.deleted_at"
                              @click="disableSupplier(supplier.id)"
                          >
                              Deshabilitar
                          </button>
                          <button
                              class="btn btn-success btn-sm"
                              v-if="supplier.deleted_at"
                              @click="enableSupplier(supplier.id)"
                          >
                              Habilitar
                          </button>
                      </div>
                      <div v-else>
                          <button
                              class="btn btn-success btn-sm me-2"
                              @click="saveEdit(supplier.id, index)"
                          >
                              Guardar
                          </button>
                          <button
                              class="btn btn-secondary btn-sm"
                              @click="cancelEdit"
                          >
                              Cancelar
                          </button>
                      </div>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- paginacion -->
        <nav v-if="totalPages > 1" class="mt-3 pagination-container">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(1)">Primero</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)">Anterior</button>
              </li>
              <li
                class="page-item"
                v-for="page in visiblePages"
                :key="page"
                :class="{ active: currentPage === page }"
              >
                <button class="page-link" @click="changePage(page)">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)">Siguiente</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(totalPages)">Último</button>
              </li>
            </ul>
          </nav>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { viewAlert, sendRequest } from "/src/Functions";

export default {
data() {
  return {
    rowsPerPage: 10, 
    currentPage: 1, 
    maxVisiblePages: 5, 
    changer: false,
    name: "", 
    nit: "", 
    phone: "", 
    email: "", 
    suppliers: [], 
    editIndex: null,
    editSupplier: null,
    url: "http://dvsappbackend.test/api/suppliers", 
  };
},
mounted() {
  this.fetchSuppliers(); 
},

computed: {
      paginatedData() {
        if (this.rowsPerPage === 0) {
          // Mostrar todos los datos si rowsPerPage es 0
          return this.suppliers;
        }
        const start = (this.currentPage - 1) * this.rowsPerPage;
        return this.suppliers.slice(start, start + this.rowsPerPage);
      },
      totalPages() {
        if (this.rowsPerPage === 0) {
          return 1; // Solo una página si se muestran todos los datos
        }
        return Math.ceil(this.suppliers.length / this.rowsPerPage);
      },
      visiblePages() {
        const startPage = Math.max(this.currentPage - Math.floor(this.maxVisiblePages / 2), 1);
        const endPage = Math.min(startPage + this.maxVisiblePages - 1, this.totalPages);
        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
          pages.push(i);
        }
        return pages;
      },
    },
methods: {
  goBack() {
    window.history.back(); 
  },
  async fetchSuppliers() {
    this.changer = true;
    axios.get(this.url).then((res) => {
        console.log(res.data); // Verifica que `deleted_at` está presente
        this.suppliers = res.data;
        this.changer = false;
    });
},
  save(event) {
    event.preventDefault();
    if (this.name.trim() === "" || this.nit.trim() === "") {
      viewAlert("Por favor complete los campos obligatorios (Nombre y NIT)", "warning");
      return;
    }
    const parameter = { 
      name: this.name.trim(),
      nit: this.nit.trim(),
      phone: this.phone.trim(),
      email: this.email.trim(),
    };
    sendRequest("POST", parameter, this.url, "Proveedor agregado correctamente", "/createSupplier");
  },
  startEditing(index, supplier) {
    this.editIndex = index;
    this.editSupplier = { ...supplier }; // Copiar datos actuales
  },
  saveEdit(id, index) {
    if (!this.editSupplier.name || !this.editSupplier.nit) {
      viewAlert("El nombre y el NIT son obligatorios", "warning");
      return;
    }
    const parameter = { 
      name: this.editSupplier.name.trim(),
      nit: this.editSupplier.nit.trim(),
      phone: this.editSupplier.phone.trim(),
      email: this.editSupplier.email.trim(),
    };
    sendRequest("PUT", parameter, `${this.url}/${id}`, "Proveedor actualizado correctamente", "/createSupplier");
    this.cancelEdit();
  },
  cancelEdit() {
    this.editIndex = null;
    this.editSupplier = null;
  },
  disableSupplier(id) {
    sendRequest("PATCH", {}, `${this.url}/${id}/disable`, "Proveedor deshabilitado correctamente", "/createSupplier")
  },
  enableSupplier(id) {
      sendRequest("PATCH", {}, `${this.url}/${id}/enable`, "Proveedor habilitado correctamente", "/createSupplier")
  },
  changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
  changePageSize(event) {
    this.rowsPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1; // Reinicia a la primera página
  },
  },
};
</script>

<style scoped>
.container-fluid {
  width: 100%;
  padding: 0;
  }
.btn-outline-success {
  font-size: 18px;
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-outline-success i {
  font-size: 20px;
}

.card-header {
  font-weight: bold;
  font-size: 1.25rem;
}

.table {
  margin-top: 20px;
}

.table-success {
  background-color: #d4edda;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-responsive {
  margin-top: 15px;
}
.pagination-container {
  text-align: center;
}

.pagination .page-item.active .page-link {
  background-color: #28a745; /* Verde para la página activa */
  border-color: #28a745;
  color: white;
}

.pagination .page-item .page-link {
  color: #28a745; /* Verde para los botones */
}
</style>
