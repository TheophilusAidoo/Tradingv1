import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiSetWithdrawalPassword } from '../data/apiBridge'
import { setUserWithdrawalPassword } from '../data/verificationStore'

interface WithdrawalPasswordViewProps {
  open: boolean
  onClose: () => void
}

export function WithdrawalPasswordView({ open, onClose }: WithdrawalPasswordViewProps) {
  const { t } = useLanguage()
  const { currentUser, refreshUser } = useVerification()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (!currentUser?.id) {
      setError('Please log in to set withdrawal password')
      return
    }
    setError(null)
    setSaving(true)
    try {
      if (isApiConfigured()) {
        await apiSetWithdrawalPassword(currentUser.id, password)
      } else {
        setUserWithdrawalPassword(currentUser.id)
      }
      refreshUser()
      setPassword('')
      setConfirmPassword('')
      onClose()
    } catch (e) {
      setError((e as Error).message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Withdrawal password"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 66,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
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
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.03em',
            color: 'var(--text)',
            flex: 1,
            textAlign: 'center',
          }}
        >
          {t('withdrawalPassword.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 60px',
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
            padding: 24,
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Set a withdrawal password. You will need this when requesting withdrawals.
          </p>
          {error && (
            <div style={{ padding: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 13 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>{t('withdrawalPassword.password')}</label>
            <div style={inputWrapStyle}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null) }}
                placeholder={t('withdrawalPassword.enterNewPassword')}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide' : 'Show'}
                style={eyeBtnStyle}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('withdrawalPassword.confirmPassword')}</label>
            <div style={inputWrapStyle}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(null) }}
                placeholder={t('withdrawalPassword.enterNewPassword')}
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide' : 'Show'}
                style={eyeBtnStyle}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!password || !confirmPassword || saving}
            style={{
              ...confirmBtnStyle,
              background: password && confirmPassword && !saving ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
              color: password && confirmPassword && !saving ? '#fff' : 'var(--text-muted)',
              cursor: password && confirmPassword && !saving ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Saving…' : t('withdrawalPassword.confirm')}
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text)',
  marginBottom: 8,
}

const inputWrapStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 48px 14px 16px',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'var(--card)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'transparent',
  color: 'var(--text-muted)',
}

const confirmBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: 16,
  borderRadius: 12,
  border: 'none',
  fontSize: 15,
  fontWeight: 700,
  letterSpacing: '0.04em',
  marginTop: 8,
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
