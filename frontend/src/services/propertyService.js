import api from './api'

export function listProperties() {
  return api.get('/api/v1/properties')
}
