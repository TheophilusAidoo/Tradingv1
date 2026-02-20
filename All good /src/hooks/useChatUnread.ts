import { useState, useEffect, useCallback, useRef } from 'react'
import { isApiConfigured, apiChatUserUnread, apiChatAdminUnread } from '../data/apiBridge'
import { hasUserUnread, hasAdminUnread } from '../data/chatStore'

const USER_LAST_SEEN_KEY = 'river_chat_user_last_seen'
const ADMIN_LAST_SEEN_KEY = 'river_chat_admin_last_seen'
const LONG_POLL_WAIT = 35

function getStoredSince(key: string): string {
  try {
    const s = localStorage.getItem(key)
    if (s) return s
  } catch (_) {}
  return new Date().toISOString()
}

function setStoredSince(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch (_) {}
}

export function useChatUnreadForUser(userId: string | null) {
  const [hasUnread, setHasUnread] = useState(false)
  const [restartKey, setRestartKey] = useState(0)
  const runIdRef = useRef(0)

  const markSeen = useCallback(() => {
    if (!userId) return
    const now = new Date().toISOString()
    setStoredSince(`${USER_LAST_SEEN_KEY}_${userId}`, now)
    setHasUnread(false)
    setRestartKey((k) => k + 1)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setHasUnread(false)
      return
    }
    const myRunId = ++runIdRef.current
    const key = `${USER_LAST_SEEN_KEY}_${userId}`

    const run = async () => {
      let since = getStoredSince(key)
      while (runIdRef.current === myRunId) {
        if (isApiConfigured()) {
          try {
            const unread = await apiChatUserUnread(userId, since, LONG_POLL_WAIT)
            if (runIdRef.current !== myRunId) return
            setHasUnread(unread)
            if (unread) return
            since = getStoredSince(key)
          } catch {
            if (runIdRef.current !== myRunId) return
            setHasUnread(hasUserUnread(userId, since))
            await new Promise((r) => setTimeout(r, 2000))
          }
        } else {
          if (runIdRef.current !== myRunId) return
          setHasUnread(hasUserUnread(userId, since))
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }
    run()
  }, [userId, restartKey])

  return { hasUnread, markSeen }
}

export function useChatUnreadForAdmin() {
  const [hasUnread, setHasUnread] = useState(false)
  const [restartKey, setRestartKey] = useState(0)
  const runIdRef = useRef(0)

  const markSeen = useCallback(() => {
    const now = new Date().toISOString()
    setStoredSince(ADMIN_LAST_SEEN_KEY, now)
    setHasUnread(false)
    setRestartKey((k) => k + 1)
  }, [])

  useEffect(() => {
    const myRunId = ++runIdRef.current

    const run = async () => {
      let since = getStoredSince(ADMIN_LAST_SEEN_KEY)
      while (runIdRef.current === myRunId) {
        if (isApiConfigured()) {
          try {
            const unread = await apiChatAdminUnread(since, LONG_POLL_WAIT)
            if (runIdRef.current !== myRunId) return
            setHasUnread(unread)
            if (unread) return
            since = getStoredSince(ADMIN_LAST_SEEN_KEY)
          } catch {
            if (runIdRef.current !== myRunId) return
            setHasUnread(hasAdminUnread(since))
            await new Promise((r) => setTimeout(r, 2000))
          }
        } else {
          if (runIdRef.current !== myRunId) return
          setHasUnread(hasAdminUnread(since))
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }
    run()
  }, [restartKey])

  return { hasUnread, markSeen }
}
