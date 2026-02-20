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
  return load().filter((m) => m.userId === userId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export function addChatMessage(userId: string, senderType: 'user' | 'admin', content: string): ChatMessage {
  const messages = load()
  const msg: ChatMessage = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    senderType,
    content,
    createdAt: new Date().toISOString(),
  }
  messages.push(msg)
  save(messages)
  return msg
}

export function hasUserUnread(userId: string, since: string): boolean {
  const messages = load()
  const sinceTime = new Date(since).getTime()
  return messages.some((m) => m.userId === userId && m.senderType === 'admin' && new Date(m.createdAt).getTime() > sinceTime)
}

export function hasAdminUnread(since: string): boolean {
  const messages = load()
  const sinceTime = new Date(since).getTime()
  return messages.some((m) => m.senderType === 'user' && new Date(m.createdAt).getTime() > sinceTime)
}

export function getChatConversations(users?: { id: string; email: string; name: string }[]): { userId: string; email: string; name: string; lastAt: string }[] {
  const messages = load()
  const byUser = new Map<string, { lastAt: string }>()
  for (const m of messages) {
    const existing = byUser.get(m.userId)
    if (!existing || new Date(m.createdAt) > new Date(existing.lastAt)) {
      byUser.set(m.userId, { lastAt: m.createdAt })
    }
  }
  return Array.from(byUser.entries()).map(([userId, { lastAt }]) => {
    const u = users?.find((x) => x.id === userId)
    return { userId, email: u?.email ?? userId, name: u?.name ?? 'User', lastAt }
  }).sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
}
