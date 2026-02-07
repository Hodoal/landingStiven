// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export function apiUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return `${base}/${p}`
}

export const API_ENDPOINTS = {
  APPLY_PILOT: apiUrl('/leads/apply-pilot'),
  TRACK_EVENT: apiUrl('/leads/track-event'),
}

export default API_BASE_URL
