<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header" :class="headerClass">
            <h5 class="modal-title text-white">
              <i :class="iconClass" class="me-2"></i>
              {{ title }}
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer" v-if="showActions">
            <button type="button" class="btn btn-secondary" @click="cancelAction" v-if="showCancel">
              {{ cancelText }}
            </button>
            <button type="button" class="btn btn-primary" @click="confirmAction">
              {{ confirmText }}
            </button>
          </div>
          <div class="modal-footer" v-else>
            <button type="button" class="btn btn-primary" @click="closeModal">
              {{ closeText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Notificación'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info', // info, success, warning, danger, confirm
    validator: (value) => ['info', 'success', 'warning', 'danger', 'confirm'].includes(value)
  },
  showActions: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  confirmText: {
    type: String,
    default: 'Aceptar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  closeText: {
    type: String,
    default: 'Cerrar'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const headerClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-success'
    case 'warning':
      return 'bg-warning'
    case 'danger':
    case 'confirm':
      return 'bg-danger'
    default:
      return 'bg-primary'
  }
})

const iconClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'fa-solid fa-check-circle'
    case 'warning':
      return 'fa-solid fa-exclamation-triangle'
    case 'danger':
      return 'fa-solid fa-times-circle'
    case 'confirm':
      return 'fa-solid fa-question-circle'
    default:
      return 'fa-solid fa-info-circle'
  }
})

const confirmAction = () => {
  emit('confirm')
  closeModal()
}

const cancelAction = () => {
  emit('cancel')
  closeModal()
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
}

.modal.d-block {
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dialog {
  max-width: 500px;
  margin: 1.75rem;
  pointer-events: auto;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.2);
  border-radius: 0.3rem;
  outline: 0;
}
</style>