// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const API_ENDPOINTS = {
  APPLY_PILOT: `${API_BASE_URL}/leads/apply-pilot`,
  TRACK_EVENT: `${API_BASE_URL}/leads/track-event`,
}

export default API_BASE_URL
