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
        <table class="table table-hover table-bordered align-middle compact-table" id="inventories-table">
          <thead class="table-header">
  <tr>
    <th @click="sortTable('#')">#</th>
    <th @click="sortTable('article_name')">Tipo de Dispositivo</th>
    <th @click="sortTable('brand')">Marca</th>
    <th @click="sortTable('part_number')">Número de Parte</th>
    <th @click="sortTable('serial')">Serial</th>
    <th @click="sortTable('invoice_checked')">Datos de Facturación</th>
    <th>Factura</th> <!-- Nueva columna -->
    <th>Acciones</th>
  </tr>
</thead>
<tbody>
  <tr v-if="changer">
    <td colspan="10" class="text-center">
      <h3>Cargando...</h3>
    </td>
  </tr>
  <tr v-else v-for="(inventory, i) in paginatedData" :key="inventory.id">
    <td>{{ currentPageStart + i }}</td>
    <td>{{ inventory.article_name }}</td>
    <td>{{ inventory.brand }}</td>
    <td>{{ inventory.part_number }}</td>
    <td>{{ inventory.serial }}</td>
    <td class="text-center">
      <span v-if="inventory.invoice_checked" class="badge bg-success">Sí</span>
      <span v-else class="badge bg-danger">No</span>
    </td>
    <td class="text-center"> <!-- Nueva columna -->
      <span v-if="inventory.invoice_image" class="badge bg-success">Cargada</span>
      <span v-else class="badge bg-warning">No Cargada</span>
    </td>
    <td class="text-center">
      <router-link :to="{ path: 'inventoryView/' + inventory.id }" class="btn btn-info btn-sm mx-1">
        <i class="fa-solid fa-eye"></i>
      </router-link>
      <router-link :to="{ path: 'InventoryEdit/' + inventory.group_id }" class="btn btn-warning btn-sm mx-1">
        <i class="fa-solid fa-edit"></i>
      </router-link>
      <button class="btn btn-success btn-sm mx-1" @click="openInvoiceModal(inventory.group_id)">
        <i class="fa-solid fa-file-invoice"></i>
      </button>
      <button
        class="btn btn-danger btn-sm mx-1"
        @click="confirmDelete(inventory.id)"
        v-if="!inventory.deleted_at"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    </td>
  </tr>
</tbody>
</table>
      </div>
      <!-- Modal para cargar factura -->
      <div v-if="showInvoiceModal" class="modal-overlay">
        <div class="modal-content">
          <h5 class="modal-title">Cargar Factura</h5>
          <form @submit.prevent="uploadInvoice">
            <div class="mb-3">
              <label for="invoiceFile" class="form-label">Seleccionar archivo</label>
              <input
                type="file"
                class="form-control"
                id="invoiceFile"
                @change="handleFileChange"
              />
            </div>
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-secondary me-2" @click="closeInvoiceModal">Cancelar</button>
              <button type="submit" class="btn btn-success">Guardar</button>
            </div>
          </form>
        </div>
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
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      inventories: [],
      changer: false,
      rowsPerPage: 10,
      currentPage: 1,
      maxVisiblePages: 20,
      searchQuery: "",
      sortKey: "",
      sortOrder: 1,
      showInvoiceModal: false, // Estado para el modal
      selectedFile: null, // Archivo seleccionado
      currentGroupId: null, // ID del grupo actual
    };
  },
  computed: {
    filteredData() {
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return this.inventories.filter((inventory) =>
        Object.values(inventory).some((value) =>
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
      const end = start + this.rowsPerPage;
      return this.sortedData.slice(start, end);
    },
    totalPages() {
      return this.rowsPerPage === 0
        ? 1
        : Math.ceil(this.sortedData.length / this.rowsPerPage);
    },
    currentPageStart() {
      return (this.currentPage - 1) * this.rowsPerPage + 1;
    },
    visiblePages() {
      const pages = [];
      const startPage = Math.max(
        1,
        this.currentPage - Math.floor(this.maxVisiblePages / 2)
      );
      const endPage = Math.min(
        this.totalPages,
        startPage + this.maxVisiblePages - 1
      );
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    async confirmDelete(inventoryId) {
    const result = await Swal.fire({
      title: "Confirma:",
      text: "Esta acción dará de baja el equipo seleccionado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No, cancelar",
    });

    if (result.isConfirmed) {
      // Redirige a otra página o realiza la acción de eliminación
      this.$router.push({ path: `/inventoryWriteOff/${inventoryId}` });
    }
  },
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(
        this.sortedData.map((inventory) => ({
          "#": inventory.id,
          "Tipo de Dispositivo": inventory.article_name,
          Marca: inventory.brand,
          "Número de Parte": inventory.part_number,
          Serial: inventory.serial,
          "Número de Factura": inventory.invoice_number,
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Inventarios");
      XLSX.writeFile(wb, "Inventarios.xlsx");
    },
    exportToPDF() {
      const doc = new jsPDF();
      doc.text("Lista de Inventarios", 14, 10);

      const columns = [
        "#",
        "Tipo de Dispositivo",
        "Marca",
        "Número de Parte",
        "Serial",
        "Número de Factura",
      ];
      const rows = this.sortedData.map((inventory, i) => [
        i + 1,
        inventory.article_name,
        inventory.brand,
        inventory.part_number,
        inventory.serial,
        inventory.unit_value,
      ]);

      autoTable(doc, { columns, body: rows });
      doc.save("Inventarios.pdf");
    },
    getInventories() {
      this.changer = true;
      axios.get("http://dvsappbackend.test/api/devices").then((res) => {
        this.inventories = res.data.map((inventory) => ({
          ...inventory,
          article_name: inventory.article?.name || "Desconocido",
          supplier_name: inventory.supplier?.name || "Desconocido",
        }));
        this.changer = false;
      });
    },
    sortTable(key) {
      if (this.sortKey === key) {
        this.sortOrder *= -1;
      } else {
        this.sortOrder = 1;
        this.sortKey = key;
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
    openInvoiceModal(groupId) {
      this.showInvoiceModal = true;
      this.currentGroupId = groupId;
    },
    closeInvoiceModal() {
      this.showInvoiceModal = false;
      this.selectedFile = null;
      this.currentGroupId = null;
    },
    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },
    async uploadInvoice() {
      if (!this.selectedFile) {
        alert("Por favor, selecciona un archivo.");
        return;
      }
      const formData = new FormData();
      formData.append("invoice", this.selectedFile);
      formData.append("group_id", this.currentGroupId);

      try {
        await axios.post(
          "http://dvsappbackend.test/api/devices/uploadInvoice",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Factura cargada exitosamente.");
        this.closeInvoiceModal();
        this.getInventories(); // Actualiza la tabla
      } catch (error) {
        console.error("Error al cargar la factura:", error);
        alert("Hubo un error al cargar la factura.");
      }
    },
  },
  mounted() {
    this.getInventories();
  },
};
</script>

<style scoped>
.table-header {
  background-color: #4caf50;
  color: white;
  cursor: pointer;
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

.table-header th {
  text-align: center;
  vertical-align: middle;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}
</style>
