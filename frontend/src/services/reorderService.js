import api from './api'

export function listReorderRequests(propertyId) {
  const query = propertyId ? `?property_id=${propertyId}` : ''
  return api.get(`/api/v1/reorder${query}`)
}

export function createReorderRequest(payload) {
  return api.post('/api/v1/reorder', payload)
}
