import api from './api'

export function listInventory(propertyId) {
  const query = propertyId ? `?property_id=${propertyId}` : ''
  return api.get(`/api/v1/inventory${query}`)
}

export function listLowStock(propertyId) {
  const query = propertyId ? `?property_id=${propertyId}` : ''
  return api.get(`/api/v1/inventory/low-stock${query}`)
}

export function createInventoryItem(payload) {
  return api.post('/api/v1/inventory', payload)
}
