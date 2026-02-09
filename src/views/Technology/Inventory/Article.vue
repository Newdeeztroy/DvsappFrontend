<template>
    <div class="container-fluid mt-2">
      <div class="card">
        <div class="card-header bg-success text-white d-flex align-items-center justify-content-between">
          <h4>Gestión de Artículos Tecnológicos</h4>
        </div>
        <div class="card-body">
          <!-- Formulario para agregar artículos -->
          <form @submit.prevent="save" class="d-flex justify-content-between align-items-center mb-4">
            <input
              type="text"
              v-model="name"
              placeholder="Ingrese el nombre del artículo"
              class="form-control me-2"
              required
            />
            <button type="submit" class="btn btn-primary">Crear</button>
          </form>
          <!-- Tabla de artículos -->
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
                  <th>Artículo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="changer">
              <td colspan="12" class="text-center"><h3>Cargando...</h3></td>
              </tr>
                <tr v-else-if="articles.length === 0">
                    <td colspan="3" class="text-center">No hay artículos creados.</td>
                </tr>
                <tr v-for="(article, index) in paginatedData" :key="article.id">
                    <td>{{ article.id }}</td>
                    <td>
                    <!-- Mostrar texto o campo de entrada según el estado -->
                    <span v-if="editIndex !== index">{{ article.name }}</span>
                    <input
                        v-else
                        type="text"
                        v-model="editArticle"
                        class="form-control"
                    />
                    </td>
                    <td>
                    <!-- Botones dependiendo del estado -->
                    <div v-if="editIndex !== index">
                        <!-- Botón para editar (solo si habilitado) -->
                        <button
                        class="btn btn-warning btn-sm me-2"
                        v-if="!article.deleted_at"
                        @click="startEditing(index, article.name)"
                        >
                        Editar
                        </button>
                        <!-- Botón para deshabilitar -->
                        <button
                        class="btn btn-danger btn-sm"
                        v-if="!article.deleted_at"
                        @click="disableArticle(article.id)"
                        >
                        Deshabilitar
                        </button>
                        <!-- Botón para habilitar -->
                        <button
                        class="btn btn-success btn-sm"
                        v-if="article.deleted_at"
                        @click="enableArticle(article.id)"
                        >
                        Habilitar
                        </button>
                    </div>
                    <div v-else>
                        <!-- Botones de guardar y cancelar cuando se edita -->
                        <button
                        class="btn btn-success btn-sm me-2"
                        @click="saveEdit(article.id, index)"
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
        articles: [], 
        rowsPerPage: 10, 
        currentPage: 1, 
        maxVisiblePages: 5, 
        changer: false,
        name: "", 
        editArticle: "", 
        articles: [], 
        editIndex: null,
        url: "http://dvsappbackend.test/api/articles", 
      };
    },
    mounted() {
      this.fetchArticles(); 
    },

    computed: {
      paginatedData() {
        if (this.rowsPerPage === 0) {
          // Mostrar todos los datos si rowsPerPage es 0
          return this.articles;
        }
        const start = (this.currentPage - 1) * this.rowsPerPage;
        return this.articles.slice(start, start + this.rowsPerPage);
      },
      totalPages() {
        if (this.rowsPerPage === 0) {
          return 1; // Solo una página si se muestran todos los datos
        }
        return Math.ceil(this.articles.length / this.rowsPerPage);
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

      async fetchArticles() {
        this.changer = true;
        axios.get(this.url).then((res) => {
          this.articles = res.data;
          this.changer = false;
        });
      },

      save(event) {
        event.preventDefault();
        if (this.name.trim() === "") {
          viewAlert("Ingrese un nombre", "warning", "name");
          return;
        }
        const parameter = { name: this.name.trim() };
        sendRequest("POST",parameter,this.url,"Artículo agregado correctamente",'/createArticle')
      },

      removeArticle(id) {
        sendRequest("DELETE",{},`${this.url}/${id}`,"Artículo eliminado correctamente",'/createArticle');
      },
      startEditing(index, name) {
        this.editIndex = index;
        this.editArticle = name;
      },
      saveEdit(id, index) {
        if (this.editArticle.trim() === "") {
          viewAlert("El nombre no puede estar vacío", "warning");
          return;
        }
        const parameter = { name: this.editArticle.trim() };
        sendRequest("PUT",parameter,`${this.url}/${id}`,"Artículo actualizado correctamente",'/createArticle')
      },

      cancelEdit() {
        this.editIndex = null;
        this.editArticle = "";
      },

      disableArticle(id) {
        sendRequest("PATCH",{},`${this.url}/${id}/disable`,"Artículo deshabilitado correctamente",'/createArticle');
        },

      enableArticle(id) {
        sendRequest("PATCH",{},`${this.url}/${id}/enable`,"Artículo habilitado correctamente",'/createArticle');
        },

      changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
      changePageSize(event) {
        this.rowsPerPage = parseInt(event.target.value, 10);
        this.currentPage = 1; 
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
  background-color: #28a745; 
  border-color: #28a745;
  color: white;
}

.pagination .page-item .page-link {
  color: #28a745;
}
  </style>
  