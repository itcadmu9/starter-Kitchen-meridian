import api from './api'

export function getLoyaltyAccount(guestId) {
  return api.get(`/api/v1/loyalty/${guestId}`)
}

export function adjustLoyaltyPoints(guestId, pointsDelta) {
  return api.post(`/api/v1/loyalty/${guestId}/adjust`, { points_delta: pointsDelta })
}
