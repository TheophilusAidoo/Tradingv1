import { useState, useMemo, useEffect } from 'react'
import { validateReferralCode } from '../data/referralCodesStore'
import { isApiConfigured } from '../data/apiBridge'
import { api } from '../api/client'

type AuthMode = 'login' | 'signup'

interface AuthModalProps {
  open: boolean
  mode: AuthMode
  onClose: () => void
  onSwitchToSignUp: () => void
  onSwitchToLogin: () => void
  /** Called after successful login. (email, password) for API. Returns userId or null. */
  onLoginSuccess?: (email: string, password: string) => string | null | void | Promise<string | null | void>
  /** Called after successful sign up. Returns userId or null. */
  onSignupSuccess?: (data: { email: string; password: string; referralCode: string }) => string | null | void | Promise<string | null | void>
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  color: 'var(--text-muted)',
  marginBottom: 8,
}

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CaptchaDisplay({ value }: { value: string }) {
  return (
    <div
      style={{
        padding: '8px 16px',
        borderLeft: '1px solid rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <span
        className="auth-captcha-text"
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 4,
          color: 'var(--accent)',
          textShadow: '0 0 20px rgba(34,197,94,0.3)',
        }}
      >
        {value}
      </span>
    </div>
  )
}

export function AuthModal({ open, mode, onClose, onSwitchToSignUp, onSwitchToLogin, onLoginSuccess, onSignupSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [referralError, setReferralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [apiConnected, setApiConnected] = useState<boolean | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref && /^\d{5}$/.test(ref)) setReferralCode(ref)
  }, [open, mode])

  useEffect(() => {
    if (!open || !isApiConfigured()) return
    setApiConnected(null)
    api.health()
      .then(() => setApiConnected(true))
      .catch(() => setApiConnected(false))
  }, [open])

  const captchaValue = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), [mode])

  if (!open) return null

  const isLogin = mode === 'login'
  const referralValid = referralCode.length === 5
    ? isApiConfigured()
      ? /^\d{5}$/.test(referralCode)
      : validateReferralCode(referralCode) !== null
    : false
  const canSubmit = isLogin
    ? email.length > 0 && password.length > 0
    : email.length > 0 &&
      password.length > 0 &&
      captcha.length > 0 &&
      referralCode.length === 5 &&
      referralValid

  return (
    <div
      className="auth-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? 'Login' : 'Sign up'}
    >
      <div className="auth-modal-card">
        {/* Header */}
        <div className="auth-modal-header">
          <button type="button" aria-label="Back" onClick={isLogin ? onClose : onSwitchToLogin} style={headerBtnStyle}>
            <BackIcon />
          </button>
          <h1 className="auth-modal-title">{isLogin ? 'LOGIN' : 'SIGN UP'}</h1>
          <button type="button" aria-label="Language" style={headerBtnStyle}>
            <GlobeIcon />
          </button>
        </div>
        {isApiConfigured() && apiConnected !== null && (
          <div
            style={{
              padding: '8px 16px',
              margin: '0 20px 12px',
              borderRadius: 8,
              fontSize: 12,
              background: apiConnected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: apiConnected ? '#22c55e' : '#ef4444',
            }}
          >
            {apiConnected ? '✓ Connected to server' : '✗ Cannot reach server. Check XAMPP and API URL in .env'}
          </div>
        )}

        {/* Form */}
        <form
          className="auth-modal-form"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!canSubmit || loading) return
            setAuthError('')
            setReferralError('')
            if (mode === 'login') {
              setLoading(true)
              try {
                const result = await onLoginSuccess?.(email, password)
                if (result === null) {
                  setAuthError('Invalid email or password.')
                } else {
                  onClose()
                }
              } catch (err) {
                setAuthError((err as Error).message || 'Login failed. Please try again.')
              } finally {
                setLoading(false)
              }
            } else {
              if (!isApiConfigured()) {
                const valid = validateReferralCode(referralCode)
                if (!valid) {
                  setReferralError('This code is invalid or has already been used.')
                  return
                }
              }
              setLoading(true)
              try {
                const result = await onSignupSuccess?.({ email, password, referralCode: referralCode.trim() })
                if (result === null) {
                  setReferralError(isApiConfigured() ? 'Sign up failed. Check your referral code.' : 'Sign up failed.')
                } else {
                  onClose()
                }
              } catch (err) {
                setReferralError((err as Error).message || 'Sign up failed. Please try again.')
              } finally {
                setLoading(false)
              }
            }
          }}
        >
          <div className="auth-field">
            <label style={labelStyle}>EMAIL</label>
            <input
              type="email"
              placeholder="ENTER EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label style={labelStyle}>GRAPHICAL CAPTCHA</label>
              <div style={{ display: 'flex', alignItems: 'stretch', background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
                <input
                  type="text"
                  placeholder="ENTER GRAPHICAL CAPTCHA"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  style={{ ...inputStyle, border: 'none', flex: 1 }}
                  maxLength={4}
                />
                <CaptchaDisplay value={captchaValue} />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label style={labelStyle}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="ENTER PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 48 }}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted)',
                  padding: 4,
                }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label style={labelStyle}>REFERRAL CODE (5 digits, required)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="ENTER 5-DIGIT CODE"
                value={referralCode}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 5)
                  setReferralCode(v)
                  setReferralError('')
                }}
                style={{
                  ...inputStyle,
                  ...(referralError ? { borderColor: 'var(--negative, #ef4444)' } : {}),
                }}
                maxLength={5}
              />
              {referralError && (
                <span style={{ fontSize: 12, color: 'var(--negative, #ef4444)', marginTop: 6, display: 'block' }}>
                  {referralError}
                </span>
              )}
              {referralCode.length === 5 && !referralValid && !referralError && (
                <span style={{ fontSize: 12, color: 'var(--negative, #ef4444)', marginTop: 6, display: 'block' }}>
                  Invalid or already used. Ask the admin for a valid code.
                </span>
              )}
            </div>
          )}

          {authError && (
            <div style={{ fontSize: 12, color: 'var(--negative, #ef4444)', marginBottom: 8 }}>
              {authError}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={!canSubmit || loading}
          >
            {loading ? 'PLEASE WAIT...' : isLogin ? 'LOGIN' : 'SIGN UP'}
          </button>

          {isLogin && (
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onSwitchToSignUp} className="auth-footer-link">
                SIGN UP
              </button>
            </div>
          )}
        </form>

        {/* Footer – signup only (agreement link) */}
        {!isLogin && (
          <div className="auth-modal-footer" style={{ justifyContent: 'center' }}>
            <button type="button" className="auth-footer-link">
              《USERSERVICE AGREEMENTS》
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const headerBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'var(--text)',
}
