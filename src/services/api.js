import axios from 'axios'

// Usar la variable de entorno si está disponible, de lo contrario usar ruta relativa
const API_BASE_URL = process.env.VUE_APP_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
})

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Redirigir al login si no estamos ya ahí
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api