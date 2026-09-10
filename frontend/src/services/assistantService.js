import api from './api'

export function askAssistant(prompt) {
  return api.post('/api/v1/assistant', { prompt })
}
