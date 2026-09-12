import { useState } from 'react'
import { askAssistant } from '../services/assistantService'

export default function Assistant() {
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      const result = await askAssistant(prompt)
      setReply(result.response)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h1>Assistant</h1>
      <form onSubmit={handleSubmit}>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        <button type="submit">Ask</button>
      </form>
      {error && <p role="alert">{error}</p>}
      {reply && <p>{reply}</p>}
    </div>
  )
}
