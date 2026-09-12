import api from './api'

const FAQ_ANSWERS = [
  ['needs attention', 'The items needing attention are the ingredients with zero stock. Open Inventory Stock and look for the Out of stock status.'],
  ['low stock', 'Open Inventory Stock to see ingredients below their reorder threshold. Use the outlet filter to narrow the list.'],
  ['out of stock', 'Items with zero quantity are marked Out of stock and appear in the inventory status summary.'],
  ['add stock', 'Open Inventory Stock, select Add stock beside an ingredient, enter the quantity received, and submit.'],
  ['loyalty', 'Loyalty Program shows the top members first, followed by the guest points balance list.'],
  ['outlet', 'Inventory combines all Bangalore cloud-kitchen outlets by default. Use the Outlet menu to view one location at a time.'],
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
