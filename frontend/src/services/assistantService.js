import api from './api'

export async function askAssistant(prompt) {
  const result = await api.post('/api/v1/assistant', { prompt })
  return { answer: result.response }
}


