import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// Configurar axios con timeout largo y lógica de reintentos
axios.defaults.timeout = 120000 // 120 segundos de timeout
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Interceptor para reintentos automáticos en caso de timeout
let retryCount = 0
const MAX_RETRIES = 2

axios.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config
    
    // Si no hay config o ya reintentamos, rechazar
    if (!config || retryCount >= MAX_RETRIES) {
      retryCount = 0
      return Promise.reject(error)
    }
    
    // Si es un error de timeout o network, reintentar
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
      retryCount++
      console.log(`⏳ Reintentando solicitud (intento ${retryCount}/${MAX_RETRIES})...`)
      
      // Esperar antes de reintentar (2 segundos * número de intento)
      await new Promise(resolve => setTimeout(resolve, 2000 * retryCount))
      
      return axios(config)
    }
    
    retryCount = 0
    return Promise.reject(error)
  }
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
