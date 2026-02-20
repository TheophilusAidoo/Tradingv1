import { useState, useEffect, useCallback } from 'react'
import { LanguageProvider } from './contexts/LanguageContext'
import { VerificationProvider } from './contexts/VerificationContext'
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext'
import { AppWithVerification } from './AppWithVerification'
import { AdminDashboard } from './admin/AdminDashboard'
import { AdminLoginPage } from './admin/AdminLoginPage'

const BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'

function stripBase(path: string): string {
  const normalized = path.replace(/^\/River%20trading\/?/, '/').replace(/^\/River trading\/?/, '/')
  return normalized || '/'
}

function AdminRoute({ pathname, onNavigate }: { pathname: string; onNavigate: (path: string) => void }) {
  const { isLoggedIn } = useAdminAuth()
  if (!isLoggedIn) return <AdminLoginPage />
  return <AdminDashboard pathname={pathname} onNavigate={onNavigate} />
}

export function Router() {
  const [pathname, setPathname] = useState(() => stripBase(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setPathname(stripBase(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path: string) => {
    const p = path.startsWith('/') ? path : '/' + path
    const base = BASE.replace(/\/$/, '')
    const full = base ? base + p : p
    window.history.pushState({}, '', full)
    setPathname(p)
  }, [])

  if (pathname.startsWith('/admin')) {
    return (
      <LanguageProvider>
        <AdminAuthProvider>
          <AdminRoute pathname={pathname} onNavigate={navigate} />
        </AdminAuthProvider>
      </LanguageProvider>
    )
  }

  return (
    <LanguageProvider>
      <VerificationProvider>
        <AppWithVerification />
      </VerificationProvider>
    </LanguageProvider>
  )
}
