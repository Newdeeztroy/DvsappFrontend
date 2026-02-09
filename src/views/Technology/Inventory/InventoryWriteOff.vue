<template>
    <div class="container-fluid my-2 px-0">
    <div class="card shadow">
        <!-- Cabecera del card -->
        <div class="card-header text-center text-white" style="background-color: #007bff; font-weight: bold;">
        DETALLES DEL DISPOSITIVO
        </div>
        <div class="card-body">
          <!-- Información general del dispositivo -->
          <form>
            <h5 style="color: #4CAF50;" class="mt-4">Información del dispositivo</h5>
            <div class="row mb-3">
                <!-- Tipo de dispositivo -->
                <div class="col-md-3">
                    <label class="form-label">Tipo de dispositivo</label>
                        <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-cogs"></i>
                        </span>
                        <input
                            type="text"
                            :value="device.article_name || 'Aún no ingresado'"
                            disabled
                            class="form-control"
                            placeholder="Tipo de dispositivo"
                        />
                        </div>
                </div>

                <!-- Marca -->
                <div class="col-md-3">
                    <label class="form-label">Marca</label>
                        <div class="input-group">
                            <span class="input-group-text" style="background-color: #007bff; color: white;">
                                <i class="fa-solid fa-tag"></i>
                            </span>
                            <input
                                type="text"
                                :value="device.brand || 'Aún no ingresado'"
                                disabled
                                class="form-control"
                                placeholder="Marca"
                            />
                        </div>
                </div>

                <!--Número de Parte-->
                <div class="col-md-3">
                    <label class="form-label">Número de Parte</label>
                        <div class="input-group">
                            <span class="input-group-text" style="background-color: #007bff; color: white;">
                                <i class="fa-solid fa-hashtag"></i>
                            </span>
                            <input
                                type="text"
                                :value="device.part_number || 'Aún no ingresado'"
                                disabled
                                class="form-control"
                                placeholder="Número de Parte"
                            />
                        </div>
                </div>
            
                <!--Serial -->
                <div class="col-md-3">
                    <label class="form-label">Número de Serial</label>
                        <div class="input-group">
                            <span class="input-group-text" style="background-color: #007bff; color: white;">
                                <i class="fa-solid fa-barcode"></i>
                            </span>
                            <input
                                type="text"
                                :value="device.serial || 'Aún no ingresado'"
                                disabled
                                class="form-control"
                                placeholder="Serial"
                            />
                        </div>
                </div>
            </div>

            Especificaciones
            <div class="input-group mb-3">
              <span class="input-group-text" style="background-color: #007bff; color: white;">
                <i class="fa-solid fa-comment-dots"></i>
              </span>
              <textarea
                :value="device.comment || 'Aún no ingresado'"
                disabled
                class="form-control"
                placeholder="Comentario"
                rows="3"
              ></textarea>
            </div>

            <h5 style="color: #4CAF50;" class="mt-4">Datos de Factura</h5>
            <div class="row mb-4"> 
            <!-- Proveedor -->
            <div class="col-md-3">
                <label class="form-label">Proveedor</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-building"></i>
                        </span>
                        <input
                            type="text"
                            :value="device.supplier?.name || 'Aún no ingresado'"
                            disabled
                            class="form-control"
                            placeholder="Proveedor"
                        />
                    </div> 
            </div>

            <!-- Fecha de Factura -->
            <div class="col-md-3">
                <label class="form-label">Fecha de Factura</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-calendar"></i>
                        </span>
                        <input
                            type="text"
                            :value="formatDate(device.invoice_date)"
                            disabled
                            class="form-control"
                            placeholder="Fecha de Factura"
                        />
                    </div>
            </div>

            <!-- Número de Factura -->
            <div class="col-md-3">
                <label class="form-label">Número de Factura</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-receipt"></i>
                        </span>
                        <input
                            type="text"
                            :value="device.invoice_number || 'Aún no ingresado'"
                            disabled
                            class="form-control"
                            placeholder="Número de Factura"
                        />
                    </div>
            </div>

            <!-- Orden de Compra -->
            <div class="col-md-3">
                <label class="form-label">Orden de Compra</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-receipt"></i>
                        </span>
                        <input
                            type="text"
                            :value="device.oc_number || 'Aún no ingresado'"
                            disabled
                            class="form-control"
                            placeholder="Orden de Compra"
                        />
                    </div>
            </div>
            </div>

            <!-- Segunda fila -->
            <div class="row mb-4"> 

            <!-- Valor Unitario -->
            <div class="col-md-3">
                <label class="form-label">Valor Unitario</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-dollar-sign"></i>
                        </span>
                        <input
                            type="text"
                            :value="formatCurrency(device.unit_value)"
                            disabled
                            class="form-control"
                            placeholder="Valor Unitario"
                        />
                    </div>
            </div>

            <!-- Valor total de la Factura -->
            <div class="col-md-3">
                <label class="form-label">Valor total de la Factura</label>
                    <div class="input-group">
                        <span class="input-group-text" style="background-color: #007bff; color: white;">
                            <i class="fa-solid fa-file-invoice-dollar"></i>
                        </span>
                        <input
                            type="text"
                            :value="formatCurrency(device.invoice_total_value)"
                            disabled
                            class="form-control"
                            placeholder="Total de la Factura"
                        />
                    </div>
            </div>
            </div>   

            <!-- Descarga de factura -->
              <div class="input-group mb-3">
                <span class="input-group-text" style="background-color: #007bff; color: white;">
                  <i class="fa-solid fa-download"></i>
                </span>
                <button
                  v-if="device.invoice_image"
                  @click.prevent="downloadInvoice(device.invoice_image)"
                  class="btn btn-success"
                >
                  Descargar Factura
                </button>
                <span v-else class="form-control text-center">Factura no subida</span>
              </div>

           <!-- Detalles de baja de equipo -->
           <h5 style="color: #4CAF50;" class="mt-4">Detalles de baja de equipo</h5>
           <div class="row mb-4 align-items-center">
                <!-- Campo para Estado -->
                <div class="col-md-8">
                            <label class="form-label">Estado</label>
                            <div class="input-group">
                                <input
                                    type="text"
                                    :value="writeOff.status"
                                    disabled
                                    class="form-control"
                                    placeholder="En solicitud"
                                />
                            </div>
                        </div>

                <!-- Botones al lado -->
                <div class="col-md-4 d-flex justify-content-end align-items-center">
                    <button type="button" class="btn btn-success me-2" style="min-width: 120px;" @click="someAction">
                        <i class="fa-solid fa-headset"></i> Tickets
                    </button>
                    <button type="button" class="btn btn-success" style="min-width: 120px;" @click="someAction">
                        <i class="fa-solid fa-clipboard-list"></i> Hoja de Vida
                    </button>
                </div>
            </div>
            <div class="row mb-4">
                <!-- Campo para Causa de baja -->
                <div class="col-md-12 mb-4">
                    <label class="form-label">Causa de baja del equipo</label>
                    <textarea
                        class="form-control"
                        v-model="writeOff.decommission_reason"
                        placeholder="Especificaciones"
                        style="height: 100px; font-size: 0.875rem; width: 100%"
                    ></textarea>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Adjuntos</label>
                    <input
                        type="file"
                        class="form-control"
                        @change="handleInvoiceImageUpload"
                    />
                    </div>
            </div>

            <!-- Botón de regreso -->
            <div class="col-md-4 d-flex  align-items-center">
                <button type="button" class="btn btn-primary btn-lightblue me-2 uniform-btn" @click="goBack">
                    <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
                <button type="button" class="btn btn-primary uniform-btn me-2" @click="requestApproval">
                    <i class="fa-solid fa-check-circle"></i> Solicitar
                </button>
                <button type="button" class="btn btn-success uniform-btn me-2" @click="approveWriteOff">
                            <i class="fa-solid fa-thumbs-up"></i> Aprobar
                </button>
                <button type="button" class="btn btn-danger uniform-btn" @click="denyWriteOff">
                      <i class="fa-solid fa-times-circle"></i> Denegar
                </button>

            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  
  export default {
    data() {
      return {
        device: {
          device_type: "",
          supplier: "",
          brand: "",
          part_number: "",
          serial: "",
          comment: "",
          unit_value: "",
          invoice_date: "",
          invoice_number: "",
          invoice_total_value: "",
          invoice_image: "",
        },
        writeOff: {
          idDevice: null,
          status: '',
          decommission_reason: '',
          invoice_image: null,
        }
      }
    },
  
    mounted() {
      const route = useRoute();
      const id = route.params.id;
      this.fetchDeviceData(id);
        this.writeOff = {
            idDevice: id,
            status: '',
            decommission_reason: '',
            invoice_image: null,
        };
        this.fetchDeviceData(id);
    },
  
    methods: {
      async fetchDeviceData(id) {
        try {
            const response = await axios.get(`http://dvsappbackend.test/api/devices/${id}`);
            const device = response.data;
            this.device = {
            ...device,
            article_name: device.article?.name || "Aún no ingresado",
            supplier_name: device.supplier?.name || "Aún no ingresado",
            formatted_unit_value: device.formatted_unit_value || "Aún no ingresado",
            formatted_invoice_total_value: device.formatted_invoice_total_value || "Aún no ingresado",
            oc_number: device.oc_number || "Aún no ingresado",
            };
        } catch (error) {
            console.error("Error al cargar los datos del dispositivo:", error);
        }
      },
  
      goBack() {
        this.$router.push("/listInventory");
      },
      formatDate(date) {
            if (!date) return "Aún no ingresado";
            return new Date(date).toISOString().split('T')[0];
      },
      formatCurrency(value) {
            if (!value) return "Aún no ingresado";
            return `$${parseFloat(value).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      },
        
      async downloadInvoice(filename) {
        try {
          console.log(`URL de descarga: http://dvsappbackend.test/api/download-invoice/${filename}`);

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
          alert(`Hubo un error al descargar la factura: ${error.response?.data?.message || error.message}`);
        }
      },
      async submitWriteOff() {
            try {
                const formData = new FormData();
                formData.append('idDevice', this.writeOff.idDevice);
                formData.append('status', this.writeOff.status);
                formData.append('decommission_reason', this.writeOff.decommission_reason);
                if (this.writeOff.invoice_image) {
                    formData.append('invoice_image', this.writeOff.invoice_image);
                }

                await axios.post('http://dvsappbackend.test/api/inventory-write-offs', formData);
                alert('Baja de equipo registrada exitosamente.');
                this.$router.push('/listInventory');
            } catch (error) {
                console.error('Error al guardar la baja de equipo:', error);
            }
        },
    },
  };
  </script>
  
  <style scoped>
  .card-header {
    font-weight: bold;
    background-color: #4CAF50 !important; /* Fondo verde */
  }
  
  .input-group-text {
    background-color: #4CAF50 !important; /* Fondo verde */
    color: white;
  }
  
  .btn-lightblue {
    background-color: #ADD8E6 !important; /* Azul claro */
    border: none;
    color: white;
  }
  
  .btn-lightblue:hover {
    background-color: #87CEEB !important; /* Azul más oscuro */
  }
  .btn-success {
  display: inline-block;
  padding: 0.5rem 1rem;
  white-space: nowrap;
  font-size: 1rem;
}

.input-group .btn-success {
  border-radius: 0 0.25rem 0.25rem 0; /* Bordes redondeados solo a la derecha */
}

.input-group-text {
  border-radius: 0.25rem 0 0 0.25rem; /* Bordes redondeados solo a la izquierda */
}
.container-fluid {
  padding-left: 0;
  padding-right: 0;
}

.card {
  margin: 0;
  border-radius: 0;
}

.card-body {
  padding: 1rem;
}

.input-group {
  width: 100%;
}

.input-group-text {
  min-width: 50px;
  justify-content: center;
  background-color: #4CAF50 !important; /* Verde para coherencia con el diseño */
  color: white;
}

.form-control {
  flex: 1;
  border-left: none;
}

.uniform-btn {
    min-width: 150px;
    height: 40px; /* Ajusta según el tamaño deseado */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px; /* Tamaño de fuente para consistencia */
}

  </style>
  