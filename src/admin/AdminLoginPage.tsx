import { useState } from 'react'
import { useAdminAuth } from '../contexts/AdminAuthContext'

const APP_BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'

function LockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function AdminLoginPage() {
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) return
      setError(result.error ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-root">
      <div className="admin-login-bg" />
      <div className="admin-login-card">
        <div className="admin-login-icon-wrap">
          <LockIcon />
        </div>
        <div className="admin-login-brand">
          <span className="admin-login-logo">RIVER</span>
          <span className="admin-login-badge">Admin</span>
        </div>
        <h1 className="admin-login-title">Admin sign in</h1>
        <p className="admin-login-subtitle">Enter your admin credentials to access the dashboard</p>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rivertrading.com"
              disabled={loading}
              required
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>
          {error && (
            <div className="admin-login-error-wrap">
              <span className="admin-login-error-icon">!</span>
              <p className="admin-login-error">{error}</p>
            </div>
          )}
          <button type="submit" className="admin-login-submit" disabled={loading}>
            {loading ? (
              <span className="admin-login-spinner" />
            ) : (
              'Sign in'
            )}
          </button>
          <a href={APP_BASE.replace(/\/$/, '') || '/'} className="admin-login-back">
            ← Back to main app
          </a>
        </form>
      </div>

      <style>{`
        .admin-login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0c;
          color: #e4e4e7;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }
        .admin-login-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(34, 197, 94, 0.04) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0c 0%, #0f0f11 100%);
          pointer-events: none;
        }
        .admin-login-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, #16161a 0%, #141416 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 48px 40px;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 10px 40px -15px rgba(0, 0, 0, 0.5);
        }
        .admin-login-icon-wrap {
          width: 72px;
          height: 72px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.08) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
          margin: 0 auto 24px;
          flex-shrink: 0;
        }
        .admin-login-brand {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .admin-login-logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #fff;
        }
        .admin-login-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .admin-login-title {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          letter-spacing: -0.02em;
        }
        .admin-login-subtitle {
          margin: 0 0 32px;
          font-size: 14px;
          color: #71717a;
          text-align: center;
          line-height: 1.5;
        }
        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .admin-login-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .admin-login-field label {
          font-size: 13px;
          font-weight: 600;
          color: #a1a1aa;
          letter-spacing: 0.01em;
        }
        .admin-login-field input {
          width: 100%;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .admin-login-field input::placeholder {
          color: #52525b;
        }
        .admin-login-field input:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
        }
        .admin-login-field input:focus {
          border-color: rgba(34, 197, 94, 0.5);
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        .admin-login-field input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .admin-login-error-wrap {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
        }
        .admin-login-error-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .admin-login-error {
          margin: 0;
          font-size: 13px;
          color: #fca5a5;
          line-height: 1.4;
        }
        .admin-login-submit {
          margin-top: 4px;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 14px rgba(34, 197, 94, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
        }
        .admin-login-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.35);
        }
        .admin-login-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .admin-login-submit:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
        }
        .admin-login-spinner {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: admin-login-spin 0.7s linear infinite;
        }
        @keyframes admin-login-spin {
          to { transform: rotate(360deg); }
        }
        .admin-login-back {
          display: block;
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: #71717a;
          text-decoration: none;
          transition: color 0.15s;
          padding: 8px 0;
        }
        .admin-login-back:hover {
          color: #22c55e;
        }
        @media (max-width: 480px) {
          .admin-login-card {
            padding: 36px 24px;
          }
        }
      `}</style>
    </div>
  )
}
