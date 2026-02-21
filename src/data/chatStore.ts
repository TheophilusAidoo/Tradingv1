import { nowUTC, isoStringUTC, parseAsUTC } from '../utils/dateUtils'

export interface ChatMessage {
  id: string
  userId: string
  senderType: 'user' | 'admin'
  content: string
  createdAt: string
}

const CHAT_KEY = 'river_chat_messages'

function load(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function save(messages: ChatMessage[]) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages))
}

export function getChatMessages(userId: string): ChatMessage[] {
  return load().filter((m) => m.userId === userId).sort((a, b) => parseAsUTC(a.createdAt) - parseAsUTC(b.createdAt))
}

export function addChatMessage(userId: string, senderType: 'user' | 'admin', content: string): ChatMessage {
  const messages = load()
  const msg: ChatMessage = {
    id: `chat_${nowUTC()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    senderType,
    content,
    createdAt: isoStringUTC(),
  }
  messages.push(msg)
  save(messages)
  return msg
}

export function hasUserUnread(userId: string, since: string): boolean {
  const messages = load()
  const sinceTime = parseAsUTC(since)
  return messages.some((m) => m.userId === userId && m.senderType === 'admin' && parseAsUTC(m.createdAt) > sinceTime)
}

export function hasAdminUnread(since: string): boolean {
  const messages = load()
  const sinceTime = parseAsUTC(since)
  return messages.some((m) => m.senderType === 'user' && parseAsUTC(m.createdAt) > sinceTime)
}

export function getChatConversations(users?: { id: string; email: string; name: string }[]): { userId: string; email: string; name: string; lastAt: string }[] {
  const messages = load()
  const byUser = new Map<string, { lastAt: string }>()
  for (const m of messages) {
    const existing = byUser.get(m.userId)
    if (!existing || parseAsUTC(m.createdAt) > parseAsUTC(existing.lastAt)) {
      byUser.set(m.userId, { lastAt: m.createdAt })
    }
  }
  return Array.from(byUser.entries()).map(([userId, { lastAt }]) => {
    const u = users?.find((x) => x.id === userId)
    return { userId, email: u?.email ?? userId, name: u?.name ?? 'User', lastAt }
  }).sort((a, b) => parseAsUTC(b.lastAt) - parseAsUTC(a.lastAt))
}
