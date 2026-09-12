import { useEffect, useRef, useState } from 'react'
import { askAssistant, getFaqAnswer } from '../services/assistantService'
import '../styles/assistant.css'

export default function Assistant() {
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello. Ask me about inventory, stock, outlets, or loyalty.' },
  ])
  const chatBodyRef = useRef(null)
  const faqQuestions = ['What needs attention?', 'How do I add stock?', 'How does loyalty work?', 'What outlets are included?']

  useEffect(() => {
    const chatBody = chatBodyRef.current
    if (chatBody) chatBody.scrollTop = chatBody.scrollHeight
  }, [messages, isSending])

  const submitQuestion = async (question) => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      setError('Type a question or choose an FAQ to begin.')
      return
    }
    setError(null)
    setPrompt('')
    setMessages((currentMessages) => [...currentMessages, { role: 'user', text: trimmedQuestion }])
    const faqAnswer = getFaqAnswer(trimmedQuestion)
    if (faqAnswer) {
      setMessages((currentMessages) => [...currentMessages, { role: 'assistant', text: faqAnswer }])
      return
    }
    setMessages((currentMessages) => [...currentMessages, { role: 'assistant', text: 'Checking that for you...' }])
    setIsSending(true)
    try {
      const result = await askAssistant(trimmedQuestion)
      setMessages((currentMessages) => [...currentMessages.slice(0, -1), { role: 'assistant', text: result.response }])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitQuestion(prompt)
  }

  const askQuestion = (question) => {
    submitQuestion(question)
    requestAnimationFrame(() => document.querySelector('.chat-form input')?.focus())
  }

  return (
    <div className="page">
      <div className="page-heading"><div><p className="eyebrow">Staff support</p><h1>Menu assistant</h1><p>Quick answers for everyday kitchen operations.</p></div></div>
      <section className="assistant-layout">
        <div className="panel faq-panel"><p className="eyebrow">Frequently asked</p><h2>How can I help?</h2><div className="faq-list">{faqQuestions.map((question) => <button type="button" className="faq-button" key={question} onClick={() => askQuestion(question)}>{question}<span>›</span></button>)}</div></div>
        <div className="panel chat-panel"><div className="chat-header"><span className="assistant-mark">✦</span><div><h2>Meridian assistant</h2><span className="muted">FAQ support</span></div></div><div className="chat-body" ref={chatBodyRef}>{messages.map((message, index) => <div className={`chat-bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`} key={`${message.role}-${index}`}>{message.text}</div>)}{isSending && <p className="muted">Thinking...</p>}{error && <p className="alert" role="alert">{error}</p>}</div><form className="chat-form" onSubmit={handleSubmit}><input aria-label="Ask a question" placeholder="Ask a question..." value={prompt} onChange={(event) => setPrompt(event.target.value)} /><button className="primary-button" type="submit" disabled={isSending}>{isSending ? 'Sending...' : 'Send'}</button></form></div>
      </section>
    </div>
  )
}
