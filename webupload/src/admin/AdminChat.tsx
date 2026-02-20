import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { isApiConfigured, apiGetChatMessages, apiSendChatMessage, apiGetChatConversations } from '../data/apiBridge'
import { getChatMessages, addChatMessage, getChatConversations } from '../data/chatStore'
import { adminPageStyles } from './adminStyles'
import type { ChatMessage } from '../data/apiBridge'

const LONG_POLL_WAIT = 25

export function AdminChat() {
  const { users } = useAdmin()
  const [conversations, setConversations] = useState<{ userId: string; email: string; name: string; lastAt: string }[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    if (isApiConfigured()) {
      try {
        const list = await apiGetChatConversations()
        setConversations(list)
      } catch {
        setConversations(getChatConversations(users))
      }
    } else {
      setConversations(getChatConversations(users))
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [users])

  useEffect(() => {
    if (!selectedUserId) return
    if (!isApiConfigured()) {
      const sync = () => setMessages(getChatMessages(selectedUserId))
      sync()
      const id = setInterval(sync, 800)
      return () => clearInterval(id)
    }
    let cancelled = false
    const runLongPoll = async (since: string) => {
      if (cancelled) return
      try {
        const list = await apiGetChatMessages(selectedUserId, since, LONG_POLL_WAIT)
        if (cancelled) return
        setMessages(list)
        const nextSince = list.length > 0 ? list[list.length - 1].createdAt : since
        runLongPoll(nextSince)
      } catch {
        if (!cancelled) setTimeout(() => runLongPoll(since), 2000)
      }
    }
    apiGetChatMessages(selectedUserId)
      .then((list) => {
        if (cancelled) return
        setMessages(list)
        const since = list.length > 0 ? list[list.length - 1].createdAt : '1970-01-01T00:00:00Z'
        runLongPoll(since)
      })
      .catch(() => setMessages(getChatMessages(selectedUserId)))
    return () => { cancelled = true }
  }, [selectedUserId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const content = input.trim()
    if (!content || !selectedUserId || sending) return
    setSending(true)
    setInput('')
    try {
      if (isApiConfigured()) {
        const msg = await apiSendChatMessage(selectedUserId, content, 'admin')
        if (msg) setMessages((prev) => [...prev, msg])
      } else {
        const msg = addChatMessage(selectedUserId, 'admin', content)
        setMessages((prev) => [...prev, msg])
      }
      fetchConversations()
    } finally {
      setSending(false)
    }
  }

  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) ?? conversations.find((c) => c.userId === selectedUserId) : null

  return (
    <div className="admin-page">
      <p className="admin-page-desc">Chat with users in real time. Select a conversation to view and respond.</p>
      <div
        className="admin-card"
        style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          minHeight: 480,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            borderRight: '1px solid rgba(255,255,255,0.08)',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: 12, fontSize: 11, fontWeight: 700, color: '#71717a', letterSpacing: '0.05em' }}>
            CONVERSATIONS
          </div>
          {conversations.length === 0 ? (
            <div style={{ padding: 24, color: '#71717a', fontSize: 13 }}>
              No conversations yet. Users can start a chat from Services → River Customer Service.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                type="button"
                onClick={() => setSelectedUserId(c.userId)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: selectedUserId === c.userId ? 'rgba(34,197,94,0.12)' : 'transparent',
                  color: selectedUserId === c.userId ? '#22c55e' : '#e4e4e7',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{c.name || c.email}</div>
                <div style={{ fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.email}
                </div>
              </button>
            ))
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
          {selectedUserId ? (
            <>
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {selectedUser?.name ?? selectedUser?.email ?? selectedUserId}
              </div>
              <div
                ref={scrollRef}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.senderType === 'admin' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: m.senderType === 'admin' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
                      color: '#e4e4e7',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ marginBottom: 4, fontSize: 10, color: '#71717a' }}>
                      {m.senderType === 'admin' ? 'You' : 'User'}
                    </div>
                    {m.content}
                  </div>
                ))}
              </div>
              <div
                style={{
                  padding: 12,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
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
                  className="admin-form-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !input.trim()}
                  className="admin-btn admin-btn-primary"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#71717a',
                fontSize: 14,
              }}
            >
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
