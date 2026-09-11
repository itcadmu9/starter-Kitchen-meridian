import api from './api'

export function listInventory(propertyId) {
  const query = propertyId ? `?property_id=${propertyId}` : ''
  return api.get(`/api/v1/inventory${query}`)
}

export function listLowStock(propertyId) {
  const query = propertyId ? `?property_id=${propertyId}` : ''
  return api.get(`/api/v1/inventory/low-stock${query}`)
}

export function getInventoryItem(itemId) {
  return api.get(`/api/v1/inventory/${itemId}`)
}

export function createInventoryItem(payload) {
  return api.post('/api/v1/inventory', payload)
}

export function adjustQuantity(itemId, quantityDelta) {
  return api.patch(`/api/v1/inventory/${itemId}/quantity`, { quantity_delta: quantityDelta })
}

export function inventoryStatus(item) {
  if (Number(item.quantity) <= 0) return 'out_of_stock'
  if (Number(item.quantity) <= Number(item.reorder_threshold)) return 'low_stock'
  return 'in_stock'
}


