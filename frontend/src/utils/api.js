// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API_ENDPOINTS = {
  APPLY_PILOT: `${API_BASE_URL}/api/leads/apply-pilot`,
  TRACK_EVENT: `${API_BASE_URL}/api/leads/track-event`,
}

export default API_BASE_URL
