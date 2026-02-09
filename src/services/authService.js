import api from './api';
import sessionService from './sessionService';

const authService = {
  // Iniciar sesión
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials);

      // Almacenar el token de autenticación
      const token = response.data.token || response.data.access_token;
      if (token) {
        localStorage.setItem('auth_token', token);
      }

      // Almacenar información del usuario si está disponible
      if (response.data.user) {
        // Verificar si el usuario está activo antes de permitir el login
        const userStatus = response.data.user.status || response.data.user.Status || response.data.user.estado;
        if (userStatus === 'inactive' || userStatus === 'inactivo') {
          // Eliminar cualquier token que se haya almacenado
          localStorage.removeItem('auth_token');

          // Lanzar un error específico para usuarios inactivos
          const error = new Error('Tu cuenta está inactiva. Por favor contacta al administrador.');
          error.status = 401;
          throw error;
        }

        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      // Iniciar el seguimiento de sesión con tiempo de inactividad
      sessionService.onLogin();

      // Notificar el cambio de estado de autenticación
      sessionService.notifyAuthChange(true);

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Detener el seguimiento de sesión
    sessionService.onLogout();

    // Notificar el cambio de estado de autenticación
    sessionService.notifyAuthChange(false);
  },

  // Obtener token de autenticación
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }

    // Verificar también si el usuario está activo
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userStatus = user.status || user.Status || user.estado;
        // Permitir la autenticación solo si el usuario está activo
        return userStatus !== 'inactive' && userStatus !== 'inactivo';
      } catch (e) {
        // Si hay un error al parsear, asumimos que no está autenticado
        return false;
      }
    }

    return !!token;
  },

  // Recuperar información del usuario
  getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userStatus = user.status || user.Status || user.estado;
        // Devolver la información del usuario solo si está activo
        if (userStatus !== 'inactive' && userStatus !== 'inactivo') {
          return user;
        }
      } catch (e) {
        console.error('Error al parsear la información del usuario:', e);
      }
    }
    return null;
  },

  // Actualizar información del usuario
  updateUser(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  },

  // Solicitar restablecimiento de contraseña
  async forgotPassword(email) {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(data) {
    try {
      const response = await api.post('/reset-password', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default authService;