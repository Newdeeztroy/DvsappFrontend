import authService from './authService'

class SessionService {
  constructor() {
    this.timeoutDuration = 10 * 60 * 1000; // 10 minutos en milisegundos
    this.timeoutId = null;
    this.events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    this.authChangeCallbacks = [];
  }

  // Iniciar el temporizador de inactividad
  startTimeout() {
    this.clearTimeout();

    this.timeoutId = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.timeoutDuration);
  }

  // Limpiar el temporizador actual
  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Manejar el tiempo de expiración de la sesión
  handleSessionTimeout() {
    console.log('Sesión expirada por inactividad');

    // Cerrar sesión
    authService.logout();

    // Redirigir al login
    window.location.href = '/login';
  }

  // Reiniciar el temporizador de inactividad
  resetTimeout() {
    this.startTimeout();
  }

  // Iniciar el seguimiento de actividad
  startTracking() {
    // Reiniciar el temporizador cada vez que haya actividad
    this.events.forEach(event => {
      document.addEventListener(event, () => {
        this.resetTimeout();
      }, true);
    });

    // Iniciar el temporizador inicial
    this.startTimeout();
  }

  // Detener el seguimiento de actividad
  stopTracking() {
    this.clearTimeout();

    // Remover los listeners
    this.events.forEach(event => {
      document.removeEventListener(event, () => {
        this.resetTimeout();
      }, true);
    });
  }

  // Verificar si el usuario está autenticado y comenzar el seguimiento
  initializeSession() {
    if (authService.isAuthenticated()) {
      this.startTracking();
    }
  }

  // Actualizar la sesión cuando el usuario inicia sesión
  onLogin() {
    this.startTracking();
  }

  // Limpiar la sesión cuando el usuario cierra sesión
  onLogout() {
    this.stopTracking();
  }

  // Método para registrar callbacks de cambio de autenticación
  onAuthChange(callback) {
    this.authChangeCallbacks.push(callback);
  }

  // Método para notificar cambios de autenticación
  notifyAuthChange(isAuthenticated) {
    this.authChangeCallbacks.forEach(callback => callback(isAuthenticated));
  }
}

const sessionService = new SessionService();
export default sessionService;