<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h4>Gestión de Dispositivos y Facturas</h4>
      </div>
      <div class="card-body">
        <!-- Dispositivos -->
        <div class="mb-4">
         <h5 class="text-success">Dispositivos</h5>
         <div v-for="(device, index) in devices" :key="index" class="row g-3 align-items-center mb-3">
          <div class="col-md-2">
            <span v-if="index === 0">Dispositivo</span>
            <select class="form-select" v-model="device.device_type_id" required>
              <option value="" disabled>Seleccione un dispositivo</option>
              <option v-for="option in deviceOptions" :key="option.id" :value="option.id">
                {{ option.name }}
              </option>
            </select>
          </div>
    <div class="col-md-2">
      <span v-if="index === 0">Marca</span>
      <input
        type="text"
        class="form-control"
        v-model="device.brand"
        placeholder="Marca"
        required
      />     
    </div>
    <div class="col-md-2">
      <span v-if="index === 0">Número de Parte</span>
      <input
        type="text"
        class="form-control"
        v-model="device.part_number"
        placeholder="Número de Parte"
        required
      />
    </div>
    <div class="col-md-2">
      <span v-if="index === 0">Serial</span>
      <input
        type="text"
        class="form-control"
        v-model="device.serial"
        placeholder="Serial"
        required
      />
    </div>
    <div class="col-md-2">
      <span v-if="index === 0">Especificaciones</span>
      <textarea
        class="form-control"
        v-model="device.comment"
        placeholder="Especificaciones"
        style="height: 38px; font-size: 0.875rem;"
      ></textarea>
    </div>
    <div class="col-md-2 d-flex justify-content-start">
      <button
        class="btn btn-outline-success me-2"
        @click="addDevice"
        v-if="index === devices.length - 1"
        style="border-radius: 50%; padding: 5px 10px;"
      >
        <i class="fas fa-plus"></i>
      </button>
      <button
        class="btn btn-outline-danger"
        @click="removeDevice(index)"
        v-if="devices.length > 1"
        style="border-radius: 50%; padding: 5px 10px;"
      >
        <i class="fas fa-minus"></i>
      </button>
    </div>
  </div>
</div>
<!-- Factura -->
        <div>
          <h5 class="text-success">
            Factura
            <input
            type="checkbox"
            v-model="invoiceEnabled"
            class="ms-2"
            @change="syncInvoiceChecked"
          />
          </h5>
          <div v-if="invoiceEnabled" class="mb-4">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Fecha de Factura</label>
                <input type="date" class="form-control" v-model="invoice.date" required />
              </div>
              <div class="col-md-3">
                <label class="form-label">Número de Factura</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="invoice.number"
                  placeholder="Número de Factura"
                  required
                />
              </div>
              <div class="col-md-3">
                <label class="form-label">Proveedor</label>
                <select class="form-select" v-model="invoice.supplier_id" required>
                  <option value="" disabled>Seleccione un proveedor</option>
                  <option v-for="supplier in suppliers" :key="supplier.id" :value="supplier.id">
                    {{ supplier.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Valor Total</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input
                    type="text"
                    class="form-control"
                    v-model="invoice.totalValue"
                    @input="updateTotalValue($event.target.value)"
                    placeholder="Valor Total"
                    required
                  />
                </div>
              </div><div class="col-md-3">
                <label class="form-label">Número de Orden de Compra</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="invoice.oc_number"
                  placeholder="Número de Orden de Compra"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla Resumen -->
        <div v-if="invoiceEnabled && devices.length > 0" class="table-responsive mt-4">
          <h5 class="text-success">Resumen de Dispositivos</h5>
          <table class="table table-bordered">
            <thead class="table-success">
              <tr>
                <th>Dispositivo</th>
                <th>Serial</th>
                <th>Comentario</th>
                <th>Valor Unitario</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(device, index) in devices" :key="'summary-' + index">
                <td>{{ getDeviceName(device.device_type_id) }}</td>
                <td>{{ device.serial }}</td>
                <td>{{ device.comment }}</td>
                <td>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input
                      type="text"
                      class="form-control"
                      :value="device.unit_value"
                      @input="updateDeviceValue(index, $event.target.value)"
                      placeholder="Valor Unitario"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Botones -->
        <div class="d-flex justify-content-end mt-3">
          <button class="btn btn-primary me-2" @click="checkAndSubmit">Guardar</button>
          <button class="btn btn-secondary" @click="cancelForm">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { viewAlert } from '/src/Functions';
import axios from "axios";

export default {
  data() {
    return {
      devices: [
        {
          device_type_id: "",
          brand: "",
          part_number: "",
          serial: "",
          comment: "",
          unit_value: null,
        },
      ],
      deviceOptions: [],
      invoiceEnabled: false,
      invoice: {
        date: "",
        number: "",
        supplier_id: "",
        totalValue: "",
        invoice_checked: false,
        oc_number:"",
        image:"",
      },
      suppliers: [],
    };
  },
  mounted() {
    this.groupId = this.$route.params.group_id;
  if (!this.groupId) {
      viewAlert("El group_id no está definido en la ruta.", "error");
  } else {
      this.loadExistingData(); // Cargar datos si el groupId está presente
  }
    this.fetchDeviceOptions();
    this.fetchSuppliers();
    this.loadExistingData();
  },
  methods: {

    async loadExistingData() { 
  try {
    const groupId = this.$route.params.group_id;
    if (!groupId) {
      throw new Error("El group_id no está definido en la ruta");
    }

    const response = await axios.get(`http://dvsappbackend.test/api/devices/group/${groupId}`);
    const data = response.data;

    if (!data || !Array.isArray(data.devices)) {
      throw new Error("La respuesta del servidor no es válida.");
    }

    // Procesar los dispositivos
    this.devices = data.devices.map(device => ({
      id: device.id || null, // Asegúrate de incluir el campo `id`
      device_type_id: device.device_type_id || "",
      brand: device.brand || "",
      part_number: device.part_number || "",
      serial: device.serial || "",
      comment: device.comment || "",
      unit_value: this.removeTrailingZeros(device.unit_value || null),
    }));

    // Procesar los datos de la factura
    if (data.invoice) {
      this.invoiceEnabled = data.invoice.invoice_checked || false;
      this.invoice = {
          date: data.invoice.date || "",
          number: data.invoice.number || "",
          supplier_id: data.invoice.supplier_id || "",
          totalValue: this.removeTrailingZeros(data.invoice.total_value || ""),
          invoice_checked: data.invoice.invoice_checked || false,
          oc_number: data.invoice.oc_number || "",
          image: data.invoice.image || "",
      };
    } else {
      this.resetInvoiceData();
    }
  } catch (error) {
    console.error("Error al cargar los datos:", error.message);
    viewAlert(`Error al cargar los datos: ${error.message}`, "error");
  }
},



removeTrailingZeros(value) {
  if (!value) return value; // Retornar el valor si es nulo o vacío
  const parsedValue = parseFloat(value); // Convertir a número
  return isNaN(parsedValue) ? value : parsedValue.toString(); // Retornar como string eliminando ceros innecesarios
},

  async downloadInvoice(filename) {
          try {
              const response = await axios({
              url: `http://dvsappbackend.test/api/download-invoice/${filename}`,
              method: 'GET',
              responseType: 'blob',
              });

              const url = window.URL.createObjectURL(new Blob([response.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', filename);
              document.body.appendChild(link);
              link.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(link);
          } catch (error) {
              console.error('Error al descargar la factura:', error);
              viewAlert(`Hubo un error al descargar la factura: ${error.response?.data?.message || error.message}`, "error");
          }
  },

  removeInvoiceImage() {
      const confirmDelete = confirm("¿Estás seguro de que deseas eliminar la factura cargada?");
      if (confirmDelete) {
          this.invoice.image = null; // Eliminar la factura cargada
      }
  },
  async fetchDeviceOptions() {
      try {
        const response = await axios.get("http://dvsappbackend.test/api/articles");
        this.deviceOptions = response.data;
      } catch (error) {
        viewAlert("Error al cargar dispositivos: " + error.message, "error"); // Sin `this`
      }
  },

  async fetchSuppliers() {
      try {
        const response = await axios.get("http://dvsappbackend.test/api/suppliers");
        this.suppliers = response.data;
      } catch (error) {
        viewAlert("Error al cargar proveedores: " + error.message, "error"); // Sin `this`
      }
  },

  async validateSerialsInDatabase() {
    for (const [index, device] of this.devices.entries()) {
    // Verificar si el número de parte está vacío
    if (!device.part_number || device.part_number.trim() === "") {
      viewAlert(`El campo "Número de Parte" del dispositivo ${index + 1} debe tener datos.`, "error");
      return false;
    }
    // Verificar si el serial está vacío
    if (!device.serial || device.serial.trim() === "") {
      viewAlert(`El campo "Serial" del dispositivo ${index + 1} debe tener datos.`, "error");
      return false;
    }
    try {
      // Enviar la solicitud al servidor para verificar si el serial ya existe
      const response = await axios.post("http://dvsappbackend.test/api/devices/check-serial", {
        part_number: device.part_number,
        serial: device.serial,
      });

      if (response.data.exists) {
        viewAlert(
          `El serial "${device.serial}" ya existe para el número de parte "${device.part_number}" en la base de datos.`,
          "error"
        );
        return false;
      }
    } catch (error) {
      viewAlert("Error al verificar seriales en la base de datos: " + error.message, "error");
      return false;
    }
    }
    // Si pasa todas las validaciones
    return true;
  },

  syncInvoiceChecked() {
      this.invoice.invoice_checked = this.invoiceEnabled;
  },

  async checkAndSubmit() {
    if (!this.groupId) {
        viewAlert("El group_id no está definido.", "error");
        return;
    }

    // Crear un objeto JSON con los datos del formulario
    const data = {
        invoice: {
            invoice_checked: this.invoiceEnabled ? true : false,
            date: this.invoice.date || "",
            number: this.invoice.number || "",
            supplier_id: this.invoice.supplier_id || "",
            total_value: this.unformatCurrency(this.invoice.totalValue) || 0,
            oc_number: this.invoice.oc_number || "",
        },
        devices: this.devices.map((device) => ({
            id: device.id || null, // Incluir el ID si está disponible
            device_type_id: device.device_type_id,
            brand: device.brand,
            part_number: device.part_number,
            serial: device.serial,
            comment: device.comment,
            unit_value: device.unit_value,
        })),
    };

    // Verificar que haya al menos un dispositivo
    if (this.devices.length === 0) {
        viewAlert("Debes agregar al menos un dispositivo.", "error");
        return;
    }

    try {
        // Enviar datos del formulario como JSON
        await axios.put(
            `http://dvsappbackend.test/api/devices/group/${this.groupId}`,
            data,
            { headers: { "Content-Type": "application/json" } }
        );

        // Si hay una imagen de factura, enviarla como FormData
        if (this.invoice.image && this.invoice.image.startsWith("data:image")) {
        const formData = new FormData();
        const blob = this.dataURItoBlob(this.invoice.image);
        formData.append("invoice_image", blob, "factura_image.jpg");

        console.log([...formData.entries()]); // Verifica el contenido del FormData

        // Enviar la imagen al backend
        try {
            await axios.put(
                `http://dvsappbackend.test/api/devices/group/${this.groupId}/upload-image`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            console.log("Imagen cargada exitosamente");
        } catch (error) {
            console.error("Error al cargar la imagen:", error);
            viewAlert("Error al cargar la imagen de la factura.", "error");
        }
    } else {
        console.warn("No se está enviando ninguna imagen.");
    }
            viewAlert("Datos actualizados con éxito", "success");
            this.$router.go(-1);
        } catch (error) {
            console.error("Error al realizar la solicitud:", error.response || error.message);
            viewAlert("Error al actualizar los datos.", "error");
        }
  },

// Conversión de base64 a Blob para FormData
dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]); // Decodificar base64
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]; // Obtener el tipo MIME
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i); // Rellenar el array
    }
    return new Blob([ab], { type: mimeString }); // Crear Blob con el tipo MIME
},

unformatCurrency(value) {
  return value ? parseFloat(value.toString().replace(/[^0-9.]/g, "")) : null;
},

async convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
},

  validateUniqueSerials() {
        const seen = new Map();

        for (const device of this.devices) {
          const key = `${device.part_number}-${device.serial}`;
          if (seen.has(key)) {
            viewAlert(
              `El serial "${device.serial}" ya existe para el número de parte "${device.part_number}".`,
              "error"
            );
            return false;
          }
          seen.set(key, true);
        }
        return true;
  },
      
  updateTotalValue(value) {
  const unformatted = this.unformatCurrency(value);
  // Comparar el valor actual con el nuevo
  if (unformatted === parseFloat(this.invoice.totalValue)) {
      return; // Si no hay cambios, no procesar el valor
  }
  // Guardar el valor desformateado en el modelo
  this.invoice.totalValue = unformatted !== null ? unformatted : "";
},


updateDeviceValue(index, value) {
  const unformatted = this.unformatCurrency(value);
  this.devices[index].unit_value = unformatted; // Guardar como número puro
},

  formatCurrency(value) {
      if (!value) return "0";
      const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
      return isNaN(number) ? "0" : number.toLocaleString("es-CO");
  },

  unformatCurrency(value) {
      return value ? parseInt(value.toString().replace(/[^0-9]/g, ""), 10) : null;
  },

  getDeviceName(deviceTypeId) {
      const device = this.deviceOptions.find((option) => option.id === deviceTypeId);
      return device ? device.name : "Desconocido";
  },

  addDevice() {
      this.devices.push({
        device_type_id: "",
        brand: "",
        part_number: "",
        serial: "",
        comment: "",
        unit_value: null,
      });
  },

  removeDevice(index) {
      this.devices.splice(index, 1);
  },

  cancelForm() {
      this.devices = [
      {
          device_type_id: "",
          brand: "",
          part_number: "",
          serial: "",
          comment: "",
          unit_value: null,
      },
        ];
        this.invoiceEnabled = false;
        this.invoice = {
          date: "",
          number: "",
          supplier_id: "",
          totalValue: "",
          oc_number: "",
          image: null, 
          invoice_checked: false,
        };
        // Volver a la página anterior
     this.$router.go(-1);
  },

  handleInvoiceImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        const maxSize = 2 * 1024 * 1024; // 2 MB

        if (!allowedTypes.includes(file.type)) {
            viewAlert("Formato de archivo no permitido. Use JPEG, PNG o PDF.", "error");
            return;
        }

        if (file.size > maxSize) {
            viewAlert("El archivo supera el tamaño máximo de 2 MB.", "error");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            this.invoice.image = reader.result;
        };
        reader.readAsDataURL(file);
    }
},

async convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file); // Leemos el archivo como base64
        reader.onload = () => resolve(reader.result); // Resolvemos con la cadena base64
        reader.onerror = (error) => reject(error); // Si ocurre un error, lo rechazamos
    });
},
  },
};
</script>
