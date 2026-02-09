import Swal from "sweetalert2";
import axios from "axios";
import { customRef } from "vue";

export function viewAlert(title,icon,focus=""){
    if(focus!=''){
        document.getElementById(focus).focus();
    }

    Swal.fire({
        title:title,
        icon:icon,
        customClass:{confirmButton:'btn btn-primary',popup:'animated zoomIn'},
        buttonsStyling:false
        
    });
}

export function confirm(urlSlash,id,title,message){
        var url = urlSlash+id;
        const swalWithBootstrapButton = Swal.mixin({
            customClass:{confirmButton:'btn btn-success me-3',cancelButton:'btn btn-danger'}
        });

        swalWithBootstrapButton.fire({
            title: title,
            text: message,
            icon:'question',
            showCancelButton:true,
            confirmButtonText:'<i class="fa-solid fa-check"></i> Si, Eliminar',
            cancelButtonText:'<i class="fa-solid fa-ban"></i> Si, Cancelar'
        }).then((res)=>{
            if(res.isConfirmed){
                sendRequest('DELETE',{id:id},url,'Eliminado con exito', window.location.href);
            }else{
                viewAlert('Operacion Cancelada','info')
            }
        });
}

export function confirmRestore(urlSlash, id, title, message) {
  var url = urlSlash + id + '/restore'; // Construye la URL con el endpoint correcto
  const swalWithBootstrapButton = Swal.mixin({
      customClass: {
          confirmButton: 'btn btn-success me-3',
          cancelButton: 'btn btn-danger'
      }
  });

  swalWithBootstrapButton.fire({
      title: title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-check"></i> Sí, Habilitar',
      cancelButtonText: '<i class="fa-solid fa-ban"></i> Cancelar'
  }).then((res) => {
      if (res.isConfirmed) {
          sendRequest('PATCH', {}, url, 'Habilitado con éxito', window.location.href);
      } else {
          viewAlert('Operación Cancelada', 'info');
      }
  });
}



export function sendRequest(method, parameter, url, message, redirectUrl) {
    axios({
      method: method,
      url: url,
      data: parameter,
    })
      .then(function (res) {
        var status = res.status;
        if (status === 200) {
          viewAlert(message, 'success');
          window.setTimeout(function () {
            window.location.href = redirectUrl; 
          }, 1000);
        } else {
          viewAlert('No se pudo recuperar la respuesta', 'error');
        }
      })
      .catch(function (error) {
        viewAlert('Servidor no disponible', 'error');
      });
  }