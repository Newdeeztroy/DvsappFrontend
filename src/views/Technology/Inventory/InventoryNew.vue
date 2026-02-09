<template>
  <div class="container-fluid">
    <div class="card">
      <div class="card-header bg-success text-white">
        <h4>Agregar Dispositivo Biométrico</h4>
      </div>
      <div class="card-body">
        <!-- Información Básica del Dispositivo -->
        <div class="mb-4">
          <h5 class="text-success">Información del Dispositivo</h5>
          
          <!-- Nombre y Tipo -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Nombre del Dispositivo *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.name"
                placeholder="Ej: Biométrico Recepción"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Tipo de Dispositivo *</span>
              <select
                class="form-select"
                v-model="device.type"
                required
                :disabled="loading"
              >
                <option value="" disabled>Seleccione tipo...</option>
                <option value="huella">Huella Digital</option>
                <option value="facial">Reconocimiento Facial</option>
                <option value="tarjeta">Lector de Tarjetas</option>
                <option value="mixto">Mixto (Huella + Tarjeta)</option>
              </select>
            </div>
            <div class="col-md-4">
              <span>Modelo *</span>
              <select
                class="form-select"
                v-model="device.model"
                required
                :disabled="loading"
                @change="handleModelChange"
              >
                <option value="" disabled>Seleccione modelo...</option>
                <option value="ZK4500">ZK4500</option>
                <option value="ZK9500">ZK9500</option>
                <option value="ZKTime8">ZKTime 8.0</option>
                <option value="UFace">UFace 202</option>
                <option value="R2">R2</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <!-- Modelo Personalizado -->
          <div v-if="device.model === 'otro'" class="row g-3 align-items-center mb-3">
            <div class="col-md-6">
              <span>Especificar Modelo</span>
              <input
                type="text"
                class="form-control"
                v-model="device.customModel"
                placeholder="Ingrese el modelo del dispositivo"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Serial y Firmware -->
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-4">
              <span>Número de Serie *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.serial"
                placeholder="Ej: SN123456789"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-4">
              <span>Número de Parte</span>
              <input
                type="text"
                class="form-control"
                v-model="device.partNumber"
                placeholder="Número de Parte"
                :disabled="loading"
              />
            </div>
              <div class="col-md-4">
                <span>Marca</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="device.brand"
                  placeholder="Marca del dispositivo"
                  :disabled="loading"
                />
              </div>
</div>
          <div class="row g-3 align-items-center mb-3">
            <div class="col-md-3">
              <span>Dirección IP *</span>
              <input
                type="text"
                class="form-control"
                v-model="device.ipAddress"
                placeholder="192.168.1.100"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-3">
              <span>Puerto *</span>
              <input
                type="number"
                class="form-control"
                v-model="device.port"
                placeholder="4370"
                min="1"
                max="65535"
                required
                :disabled="loading"
              />
            </div>
            <div class="col-md-3">
              <span>Usuario</span>
              <input
                type="text"
                class="form-control"
                v-model="device.username"
                placeholder="admin"
                :disabled="loading"
              />
            </div>
            <div class="col-md-3">
              <span>Contraseña</span>
              <input
                type="password"
                class="form-control"
                v-model="device.password"
                placeholder="Contraseña"
                :disabled="loading"
              />
            </div>
          </div>
        </div>      
        <div class="mb-4">
          <div class="row g-3 align-items-center mb-3">

            <div class="col-md-6">
              <span>Comentarios / Especificaciones</span>
              <textarea
                class="form-control"
                v-model="device.comment"
                placeholder="Observaciones, configuración especial, etc."
                rows="2"
                :disabled="loading"
              ></textarea>
            </div>
          </div>
        </div>
        <!-- Botones de Acción -->
        <div class="d-flex justify-content-end mt-4">
          <button
            class="btn btn-secondary me-2"
            @click="cancelForm"
            :disabled="loading"
          >
            <i class="fas fa-times me-1"></i> Cancelar
          </button>
          <button
            class="btn btn-primary"
            @click="checkAndSubmit"
            :disabled="loading"
          >
            <i class="fas fa-save me-1"></i>
            {{ loading ? 'Guardando...' : 'Guardar Dispositivo' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { viewAlert } from '/src/Functions';
import axios from "axios";

export default {
  name: 'AddBiometricDevice',
  data() {
    return {
      loading: false,
      device: {
        name: '',
        type: '',
        model: '',
        customModel: '',
        serial: '',
        partNumber: '',
        firmwareVersion: '',
        ipAddress: '',
        port: 4370,
        username: '',
        password: '',
        location: '',
        customLocation: '',
        status: 'active',
        installationDate: new Date().toISOString().split('T')[0],
        brand: '',
        comment: ''
      },
      invoiceEnabled: false,
      invoice: {
        date: '',
        number: '',
        supplier_id: '',
        totalValue: '',
        invoice_checked: false,
        oc_number: '',
        image: null
      },
      suppliers: []
    };
  },
  mounted() {
    this.fetchSuppliers();
  },
  methods: {
    async fetchSuppliers() {
      try {
        const response = await axios.get("http://dvsappbackend.test/api/suppliers");
        this.suppliers = response.data;
      } catch (error) {
        viewAlert("Error al cargar proveedores: " + error.message, "error");
      }
    },

    handleModelChange() {
      // Si selecciona un modelo específico, se puede auto-completar la marca
      if (this.device.model === 'ZK4500' || this.device.model === 'ZK9500' || 
          this.device.model === 'ZKTime8' || this.device.model === 'UFace' || 
          this.device.model === 'R2') {
        this.device.brand = 'ZKTecko';
      }
    },

    handleLocationChange() {
      // Resetear ubicación personalizada si no es "other"
      if (this.device.location !== 'other') {
        this.device.customLocation = '';
      }
    },

    syncInvoiceChecked() {
      this.invoice.invoice_checked = this.invoiceEnabled;
    },

    async checkAndSubmit() {
      // Validación básica
      if (!this.device.name || !this.device.name.trim()) {
        viewAlert("El nombre del dispositivo es requerido", "error");
        return;
      }

      if (!this.device.type) {
        viewAlert("El tipo de dispositivo es requerido", "error");
        return;
      }

      if (!this.device.model) {
        viewAlert("El modelo del dispositivo es requerido", "error");
        return;
      }

      if (!this.device.serial || !this.device.serial.trim()) {
        viewAlert("El número de serie es requerido", "error");
        return;
      }

      // Validar IP
      const ipRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}$/;
      if (!ipRegex.test(this.device.ipAddress)) {
        viewAlert("Por favor ingrese una dirección IP válida", "error");
        return;
      }

      // Validar puerto
      const port = parseInt(this.device.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        viewAlert("El puerto debe estar entre 1 y 65535", "error");
        return;
      }

      if (!this.device.location) {
        viewAlert("La ubicación es requerida", "error");
        return;
      }

      if (!this.device.status) {
        viewAlert("El estado es requerido", "error");
        return;
      }

      // Validar serial único si es necesario
      const serialValid = await this.validateSerial();
      if (!serialValid) {
        return;
      }

      // Validar factura si está habilitada
      if (this.invoiceEnabled) {
        if (!this.invoice.number) {
          viewAlert("Debe ingresar un número de factura", "error");
          return;
        }

        if (!this.invoice.supplier_id) {
          viewAlert("Debe seleccionar un proveedor", "error");
          return;
        }

        // Verificar si la factura ya existe
        try {
          const response = await axios.post("http://dvsappbackend.test/api/devices/check-invoice", {
            number: this.invoice.number,
            supplier_id: this.invoice.supplier_id,
          });
          if (response.data.exists) {
            viewAlert("El número de factura ya existe con este proveedor", "error");
            return;
          }
        } catch (error) {
          viewAlert("Error al verificar la factura: " + error.message, "error");
          return;
        }

        if (!this.invoice.image) {
          viewAlert("Debe cargar una imagen de la factura", "error");
          return;
        }
      }

      this.submitForm();
    },

    async validateSerial() {
      if (!this.device.serial || this.device.serial.trim() === "") {
        viewAlert("El campo 'Serial' debe tener datos", "error");
        return false;
      }

      try {
        const response = await axios.post("http://dvsappbackend.test/api/devices/check-serial", {
          serial: this.device.serial,
          part_number: this.device.partNumber || ''
        });

        if (response.data.exists) {
          viewAlert(
            `El serial "${this.device.serial}" ya existe en la base de datos`,
            "error"
          );
          return false;
        }
      } catch (error) {
        viewAlert("Error al verificar el serial en la base de datos: " + error.message, "error");
        return false;
      }

      return true;
    },

    async submitForm() {
      this.loading = true;

      const formData = new FormData();

      // Datos del dispositivo
      const deviceData = {
        name: this.device.name,
        type: this.device.type,
        model: this.device.model === 'otro' ? this.device.customModel : this.device.model,
        serial: this.device.serial,
        part_number: this.device.partNumber,
        firmware_version: this.device.firmwareVersion,
        ip_address: this.device.ipAddress,
        port: this.device.port,
        username: this.device.username,
        password: this.device.password,
        location: this.device.location === 'other' ? this.device.customLocation : this.device.location,
        status: this.device.status,
        installation_date: this.device.installationDate,
        brand: this.device.brand,
        comment: this.device.comment,
        created_at: new Date().toISOString()
      };

      Object.keys(deviceData).forEach(key => {
        formData.append(`device[${key}]`, deviceData[key]);
      });

      // Factura
      if (this.invoiceEnabled) {
        formData.append("invoice[date]", this.invoice.date || "");
        formData.append("invoice[number]", this.invoice.number || "");
        formData.append("invoice[supplier_id]", this.invoice.supplier_id || "");
        formData.append("invoice[total_value]", this.unformatCurrency(this.invoice.totalValue) || 0);
        formData.append("invoice[invoice_checked]", "true");
        formData.append("invoice[oc_number]", this.invoice.oc_number || "");
        
        if (this.invoice.image) {
          formData.append("invoice[image]", this.invoice.image);
        }
      } else {
        formData.append("invoice[invoice_checked]", "false");
      }

      try {
        const response = await axios.post("http://dvsappbackend.test/api/biometric-devices", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        viewAlert("Dispositivo biométrico agregado con éxito", "success");
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.$router.push('/dispositivos/lista');
        }, 2000);

      } catch (error) {
        const errors = error.response?.data?.errors || {};
        console.error("Errores del servidor:", errors);
        
        if (error.response?.data?.message) {
          viewAlert("Error: " + error.response.data.message, "error");
        } else {
          viewAlert("Error al guardar el dispositivo. Revise los campos e intente nuevamente.", "error");
        }
      } finally {
        this.loading = false;
      }
    },

    updateTotalValue(value) {
      const unformatted = this.unformatCurrency(value);
      this.invoice.totalValue = unformatted ? this.formatCurrency(unformatted) : "";
    },

    formatCurrency(value) {
      if (!value) return "0";
      const number = parseInt(value.toString().replace(/[^0-9]/g, ""), 10);
      return isNaN(number) ? "0" : number.toLocaleString("es-CO");
    },

    unformatCurrency(value) {
      return value ? parseInt(value.toString().replace(/[^0-9]/g, ""), 10) : null;
    },

    cancelForm() {
      if (confirm('¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.')) {
        this.resetForm();
        this.$router.push('/dispositivos/lista');
      }
    },

    resetForm() {
      this.device = {
        name: '',
        type: '',
        model: '',
        customModel: '',
        serial: '',
        partNumber: '',
        firmwareVersion: '',
        ipAddress: '',
        port: 4370,
        username: '',
        password: '',
        location: '',
        customLocation: '',
        status: 'active',
        installationDate: new Date().toISOString().split('T')[0],
        brand: '',
        comment: ''
      };
      
      this.invoiceEnabled = false;
      this.invoice = {
        date: '',
        number: '',
        supplier_id: '',
        totalValue: '',
        invoice_checked: false,
        oc_number: '',
        image: null
      };
    },

    handleInvoiceImageUpload(event) {
      const file = event.target.files[0];
      if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
        const extension = file.name.split('.').pop();
        const uniqueNumber = Date.now();
        const newFileName = `Factura_biometrico_${uniqueNumber}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });

        this.invoice.image = renamedFile;
      } else {
        viewAlert("El archivo seleccionado debe ser una imagen o un PDF válido.", "error");
        event.target.value = "";
      }
    }
  }
};
</script>

<style scoped>
.card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-header {
  border-radius: 8px 8px 0 0 !important;
  font-weight: 600;
}

.form-control:disabled,
.form-select:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.btn {
  min-width: 120px;
}

.text-success {
  color: #198754 !important;
}

h5 {
  font-weight: 600;
  margin-bottom: 1rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
}

span {
  font-weight: 500;
  color: #495057;
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.table-success {
  background-color: #d1e7dd;
}
</style>