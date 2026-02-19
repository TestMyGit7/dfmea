import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL as string

if (!API_URL) {
  console.error('VITE_API_URL is not defined in .env')
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – attach auth token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dfmea_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401 / global errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dfmea_token')
      localStorage.removeItem('dfmea_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
