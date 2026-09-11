import { useRef, useState } from 'react'
import { askAssistant } from '../services/assistantService'

const SUGGESTED_QUESTIONS = [
  'Which dishes are nut-free?',
  'What is in the Grilled Salmon Bowl?',
  'Which dishes contain dairy?',
  'What is on the menu?',
]

const INITIAL_MESSAGE = {
  role: 'bot',
  text: 'I can answer questions about menu items and allergens. Ask me something below.',
  sources: [],
}

export default function Assistant() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [messageInput, setMessageInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const chatWindowRef = useRef(null)

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
      }
    })
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isSubmitting) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setMessageInput('')
    setIsSubmitting(true)
    scrollToBottom()
    try {
      const result = await askAssistant(text)
      setMessages((prev) => [...prev, { role: 'bot', text: result.answer, sources: result.sources }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Something went wrong answering that question. Please try again.', sources: [] },
      ])
    } finally {
      setIsSubmitting(false)
      scrollToBottom()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    sendMessage(messageInput)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Menu and allergen assistant</h1>
          <p>Answers are grounded in the current menu items and their listed ingredients.</p>
        </div>
      </div>

      <div className="suggested-questions">
        {SUGGESTED_QUESTIONS.map((question) => (
          <button key={question} type="button" onClick={() => sendMessage(question)}>
            {question}
          </button>
        ))}
      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((message, index) => (
          <div key={index} className={`chat-message ${message.role}`}>
            <div>{message.text}</div>
            {message.sources && message.sources.length > 0 && (
              <div className="chat-sources">Sources: {message.sources.map((source) => source.title).join(', ')}</div>
            )}
          </div>
        ))}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <textarea
          value={messageInput}
          onChange={(event) => setMessageInput(event.target.value)}
          placeholder="Ask about a dish or allergen..."
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              sendMessage(messageInput)
            }
          }}
        />
        <button type="submit" className="btn" disabled={isSubmitting}>
          Send
        </button>
      </form>
    </div>
  )
}

