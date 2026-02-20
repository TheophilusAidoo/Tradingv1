import { useState, useEffect, useRef } from 'react'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetChatMessages, apiSendChatMessage } from '../data/apiBridge'
import { getChatMessages, addChatMessage } from '../data/chatStore'
import type { ChatMessage } from '../data/apiBridge'

const LONG_POLL_WAIT = 25

interface RiverCustomerServiceChatViewProps {
  open: boolean
  onClose: () => void
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function RiverCustomerServiceChatView({ open, onClose }: RiverCustomerServiceChatViewProps) {
  const { currentUser } = useVerification()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !currentUser) return
    if (!isApiConfigured()) {
      const sync = () => setMessages(getChatMessages(currentUser.id))
      sync()
      const id = setInterval(sync, 800)
      return () => clearInterval(id)
    }
    let cancelled = false
    const runLongPoll = async (since: string) => {
      if (cancelled) return
      try {
        const list = await apiGetChatMessages(currentUser.id, since, LONG_POLL_WAIT)
        if (cancelled) return
        setMessages(list)
        const nextSince = list.length > 0 ? list[list.length - 1].createdAt : since
        runLongPoll(nextSince)
      } catch {
        if (!cancelled) setTimeout(() => runLongPoll(since), 2000)
      }
    }
    apiGetChatMessages(currentUser.id)
      .then((list) => {
        if (cancelled) return
        setMessages(list)
        const since = list.length > 0 ? list[list.length - 1].createdAt : '1970-01-01T00:00:00Z'
        runLongPoll(since)
      })
      .catch(() => setMessages(getChatMessages(currentUser!.id)))
    return () => { cancelled = true }
  }, [open, currentUser?.id])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !currentUser || sending) return
    setError(null)
    setSending(true)
    setInput('')
    try {
      if (isApiConfigured()) {
        const msg = await apiSendChatMessage(currentUser.id, content, 'user')
        if (msg) setMessages((prev) => [...prev, msg])
      } else {
        const msg = addChatMessage(currentUser.id, 'user', content)
        setMessages((prev) => [...prev, msg])
      }
    } catch (e) {
      setError((e as Error).message)
      setInput(content)
    } finally {
      setSending(false)
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="River Customer Service"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header - same as Account Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,11,0.9)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 10,
            color: 'var(--text)',
          }}
        >
          <BackIcon />
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text)',
          }}
        >
          River Customer Service
        </h1>
        <span style={{ width: 40 }} />
      </div>

      {/* Content - centered card like Account Info */}
      <div
        style={{
          overflowY: 'auto',
          padding: '20px 16px 60px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - 160px)',
          }}
        >
          {!currentUser ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                color: 'var(--text-muted)',
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              Please log in to chat with support.
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '18px 18px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  minHeight: 0,
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: 14,
                      padding: '24px 0',
                    }}
                  >
                    Start a conversation. Our team typically responds within minutes.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: m.senderType === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: 16,
                        background: m.senderType === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                        color: m.senderType === 'user' ? '#fff' : 'var(--text)',
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ marginBottom: 4, fontSize: 10, opacity: 0.85 }}>
                        {m.senderType === 'admin' ? 'Support' : 'You'}
                      </div>
                      {m.content}
                    </div>
                  ))
                )}
              </div>

              {error && (
                <div
                  style={{
                    padding: '10px 18px',
                    background: 'rgba(239,68,68,0.15)',
                    color: 'var(--negative)',
                    fontSize: 12,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  padding: '14px 18px 18px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  gap: 10,
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  style={{
                    width: 44,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    borderRadius: 12,
                    background: 'var(--accent)',
                    color: '#fff',
                    cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                    opacity: sending || !input.trim() ? 0.6 : 1,
                  }}
                >
                  <SendIcon />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Version footer - same as Account Info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 16px',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        0.3.7
      </div>
    </div>
  )
}
