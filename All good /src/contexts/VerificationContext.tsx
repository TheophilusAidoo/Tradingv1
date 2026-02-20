import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AdminUser } from '../types/admin'
import { getUsers, getCurrentUserId, setCurrentUserId, addDocumentForUser } from '../data/verificationStore'
import { isApiConfigured, apiGetUser, apiAddDocument } from '../data/apiBridge'

interface VerificationContextValue {
  currentUser: AdminUser | null
  setCurrentUserId: (id: string | null) => void
  uploadDocument: (type: string, url: string) => void
  refreshUser: () => void
}

const VerificationContext = createContext<VerificationContextValue | null>(null)

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() => getCurrentUserId())
  const [users, setUsers] = useState<AdminUser[]>(() => getUsers())
  const [apiUser, setApiUser] = useState<AdminUser | null>(null)

  const currentUser = isApiConfigured()
    ? (currentUserId ? apiUser : null)
    : (currentUserId ? users.find((u) => u.id === currentUserId) ?? null : null)

  const setUserId = useCallback((id: string | null) => {
    setCurrentUserId(id)
    setCurrentUserIdState(id)
    if (!isApiConfigured()) setUsers(getUsers())
    else setApiUser(null)
  }, [])

  const refreshUser = useCallback(() => {
    if (isApiConfigured() && currentUserId) {
      apiGetUser(currentUserId).then(setApiUser).catch(() => setApiUser(null))
    } else {
      setUsers([...getUsers()])
    }
  }, [currentUserId])

  const uploadDocument = useCallback(
    async (type: string, url: string) => {
      if (!currentUserId) return
      if (isApiConfigured()) {
        await apiAddDocument(currentUserId, type, url)
        refreshUser()
      } else {
        const next = addDocumentForUser(currentUserId, { id: `doc-${Date.now()}`, type, url })
        setUsers(next)
      }
    },
    [currentUserId, refreshUser]
  )

  useEffect(() => {
    if (isApiConfigured() && currentUserId) {
      apiGetUser(currentUserId).then(setApiUser).catch(() => setApiUser(null))
    } else {
      setUsers(getUsers())
    }
  }, [currentUserId])

  const value: VerificationContextValue = {
    currentUser,
    setCurrentUserId: setUserId,
    uploadDocument,
    refreshUser,
  }

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const ctx = useContext(VerificationContext)
  if (!ctx) throw new Error('useVerification must be used within VerificationProvider')
  return ctx
}
