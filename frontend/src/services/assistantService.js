import api from './api'

const FAQ_ANSWERS = [
  ['allergen', 'Each menu item lists its allergens below the ingredients. Ask about a specific dish for more detail.'],
  ['vegetarian', 'Check the ingredients and dietary details on each menu item, or ask about a specific dish.'],
  ['gluten-free', 'Check the ingredients and allergen information shown on each menu item before ordering.'],
  ['dietary', 'I can help with ingredients, allergens, and dietary options listed for menu items.'],
]

export function askAssistant(prompt) {
  return api.post('/api/v1/assistant', { prompt })
}

export function getFaqAnswer(prompt) {
  const question = prompt.trim().toLowerCase()
  if (!question) return 'Type a question or choose an FAQ to begin.'
  const match = FAQ_ANSWERS.find(([keyword]) => question.includes(keyword))
  return match?.[1] || null
}
