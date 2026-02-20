import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AdminUser } from '../types/admin'
import { getUsers } from '../data/verificationStore'
import { isApiConfigured, apiAuthAdminLogin } from '../data/apiBridge'

const ADMIN_SESSION_KEY = 'river_admin_session'

function loadAdminSession(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AdminUser
      if (parsed?.id && parsed?.email) return parsed
    }
  } catch (_) {}
  return null
}

function saveAdminSession(user: AdminUser | null) {
  if (user) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(user))
  else localStorage.removeItem(ADMIN_SESSION_KEY)
}

interface AdminAuthContextValue {
  adminUser: AdminUser | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(loadAdminSession)

  useEffect(() => {
    const stored = loadAdminSession()
    if (stored && !adminUser) setAdminUser(stored)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const trimmed = email.trim()
    if (!trimmed || !password) {
      return { success: false, error: 'Email and password required' }
    }
    if (isApiConfigured()) {
      try {
        const user = await apiAuthAdminLogin(trimmed, password)
        if (user) {
          setAdminUser(user)
          saveAdminSession(user)
          return { success: true }
        }
        return { success: false, error: 'Invalid email or password' }
      } catch {
        return { success: false, error: 'Login failed. Please try again.' }
      }
    }
    // Mock mode: accept any registered user by email (any non-empty password for local dev)
    const users = getUsers()
    const match = users.find((u) => u.email.toLowerCase() === trimmed.toLowerCase())
    if (match) {
      setAdminUser(match)
      saveAdminSession(match)
      return { success: true }
    }
    return { success: false, error: 'User not found. Sign up in the main app first.' }
  }, [])

  const logout = useCallback(() => {
    setAdminUser(null)
    saveAdminSession(null)
  }, [])

  const value: AdminAuthContextValue = {
    adminUser,
    isLoggedIn: !!adminUser,
    login,
    logout,
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}
