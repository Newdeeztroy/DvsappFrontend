<template>
    <div class="row">
      <div class="col-12">
        <!-- Botones de exportación, selector de cantidad de elementos y campo de búsqueda -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <button class="btn btn-success" @click="exportToExcel">
              <i class="fa-solid fa-file-excel"></i> Exportar a Excel
            </button>
            <button class="btn btn-danger" @click="exportToPDF">
              <i class="fa-solid fa-file-pdf"></i> Exportar a PDF
            </button>
          </div>
          <div class="d-flex align-items-center">
            <label for="rowsPerPage" class="me-2">Mostrar:</label>
            <select id="rowsPerPage" class="form-select d-inline-block w-auto me-3" v-model="rowsPerPage" @change="changePageSize">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="0">Todos</option>
            </select>
            <input
              type="text"
              class="form-control w-auto"
              placeholder="Buscar..."
              v-model="searchQuery"
            />
          </div>
        </div>
  
        <!-- Tabla -->
        <div class="table-responsive">
          <table class="table table-hover table-bordered align-middle compact-table" id="businesses-table">
            <thead class="table-header">
              <tr>
                <th @click="sortTable('#')">#</th>
                <th @click="sortTable('id')">ID</th>
                <th @click="sortTable('name')">Nombre</th>
                <th @click="sortTable('nit')">Nit</th>
                <th @click="sortTable('created_at')">Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="changer">
                <td colspan="12" class="text-center"><h3>Cargando...</h3></td>
              </tr>
              <tr v-else v-for="(bus, i) in paginatedData" :key="bus.id">
                <td>{{ currentPageStart + i }}</td>
                <td>{{ bus.id }}</td>
                <td>{{ bus.name }}</td>
                <td>{{ bus.nit }}</td>

                <td>{{ new Date(bus.created_at).toLocaleDateString() }}</td>
               <td class="text-center">
                <router-link :to="{ path: 'viewBusiness/' + bus.id }" class="btn btn-info btn-sm mx-1">
                  <i class="fa-solid fa-eye"></i>
                </router-link>
                <router-link :to="{ path: 'editBusiness/' + bus.id }" class="btn btn-warning btn-sm mx-1">
                  <i class="fa-solid fa-edit"></i>
                </router-link>
                <button
                  class="btn btn-danger btn-sm mx-1"
                  @click="deleteclie(bus.id, bus.name)"
                  v-if="!bus.deleted_at"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button
                  class="btn btn-success btn-sm mx-1"
                  @click="restoreBusiness(bus.id, bus.name)"
                  v-if="bus.deleted_at"
                >
                  <i class="fa-solid fa-undo"></i> 
                </button>
              </td>

              </tr>
            </tbody>
          </table>
        </div>
  
        <!-- Paginación -->
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
  </template>
  
  <script>
  import axios from "axios";
  import * as XLSX from "xlsx";
  import jsPDF from "jspdf";
  import autoTable from "jspdf-autotable";
  import {confirm, confirmRestore} from '/src/Functions'
  
  export default {
    data() {
      return {
        businesses: [],
        changer: false,
        rowsPerPage: 10,
        currentPage: 1,
        maxVisiblePages: 20,
        searchQuery: "",
        sortKey: "", // Columna por la que se ordena
        sortOrder: 1, // Orden ascendente (1) o descendente (-1)
      };
    },
    computed: {
      filteredData() {
        const lowerCaseQuery = this.searchQuery.toLowerCase();
        return this.businesses.filter((business) =>
          Object.values(business).some((value) =>
            String(value).toLowerCase().includes(lowerCaseQuery)
          )
        );
      },
      sortedData() {
        if (!this.sortKey) {
          return this.filteredData;
        }
        return [...this.filteredData].sort((a, b) => {
          const valueA = a[this.sortKey];
          const valueB = b[this.sortKey];
          if (typeof valueA === "string") {
            return this.sortOrder * valueA.localeCompare(valueB);
          }
          return this.sortOrder * (valueA > valueB ? 1 : -1);
        });
      },
      paginatedData() {
        if (this.rowsPerPage === 0) {
          return this.sortedData;
        }
        const start = (this.currentPage - 1) * this.rowsPerPage;
        return this.sortedData.slice(start, start + this.rowsPerPage);
      },
      totalPages() {
        if (this.rowsPerPage === 0) {
          return 1;
        }
        return Math.ceil(this.sortedData.length / this.rowsPerPage);
      },
      currentPageStart() {
        return this.rowsPerPage === 0 ? 1 : (this.currentPage - 1) * this.rowsPerPage + 1;
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
    mounted() {
      this.getBusinesses();
    },
    methods: {
      getBusinesses() {
        this.changer = true;
        axios.get("http://dvsappbackend.test/api/businesses").then((res) => {
          this.businesses = res.data;
          this.changer = false;
        });
      },
      deleteclie(id) {
      confirm('http://dvsappbackend.test/api/businesses/',id,'Eliminar Registro','¿Realmente dese eliminar el registro?');
      this.changer = false;
    },

    restoreBusiness(id) {
      confirmRestore('http://dvsappbackend.test/api/businesses/',id,'Habilitar Registro','¿Realmente desea Habilitar el registro?');
      this.changer = false;
    },

      sortTable(column) {
        if (this.sortKey === column) {
          this.sortOrder = -this.sortOrder;
        } else {
          this.sortKey = column;
          this.sortOrder = 1;
        }
      },
      changePage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
      changePageSize() {
        this.currentPage = 1;
      },
      exportToExcel() {
        const worksheet = XLSX.utils.json_to_sheet(this.businesses);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Empresas");
        XLSX.writeFile(workbook, "Empresas.xlsx");
      },
      exportToPDF() {
        const doc = new jsPDF();
        doc.text("Lista de Empresas", 14, 10);
  
        const columns = [
          "#",
          "ID",
          "Nombres",
          "Nit",
          "Fecha de registro",
        ];
        const rows = this.businesses.map((bus, i) => [
          i + 1,
          bus.id,
          bus.name,
          bus.nit,
          new Date(bus.created_at).toLocaleDateString(),
        ]);
  
        autoTable(doc, {
          head: [columns],
          body: rows,
          startY: 20,
        });
  
        doc.save("Empresas.pdf");
      },
    },
  };
  </script>
  
  <style scoped>
  .table-header {
    background-color: #4CAF50;
    color: white;
    cursor: pointer; /* Cursor de mano en los encabezados */
  }
  
  .table-photo {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 50%;
  }
  
  .pagination-container {
    text-align: center;
  }
  
  .pagination {
    justify-content: center;
  }
  </style>
  