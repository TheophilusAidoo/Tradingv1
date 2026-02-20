import { useState, useEffect } from 'react'
import { createWithdrawal } from '../data/withdrawalsStore'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiCreateWithdrawal } from '../data/apiBridge'

interface WithdrawalModalProps {
  open: boolean
  onClose: () => void
  /** Called when user needs to set withdrawal address (opens profile withdrawal section) */
  onOpenWithdrawalAddress?: () => void
  /** Called when user needs to set withdrawal password */
  onOpenWithdrawalPassword?: () => void
}

export function WithdrawalModal({
  open,
  onClose,
  onOpenWithdrawalAddress,
  onOpenWithdrawalPassword,
}: WithdrawalModalProps) {
  const { currentUser, refreshUser } = useVerification()
  const [amount, setAmount] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) refreshUser()
  }, [open, refreshUser])

  useEffect(() => {
    if (!open) {
      setAmount('')
      setPassword('')
      setError(null)
    }
  }, [open])

  const numAmount = parseFloat(amount) || 0
  const balanceUsdt = currentUser?.balanceUsdt ?? 0
  const frozenUsdt = currentUser?.frozenUsdt ?? 0
  const availableBalance = balanceUsdt - frozenUsdt
  const mainAddress = currentUser?.mainWithdrawalAddress ?? ''
  const mainNetwork = currentUser?.mainWithdrawalNetwork ?? 'USDT (TRC20)'
  const hasWithdrawalPassword = currentUser?.hasWithdrawalPassword ?? false

  const needsAddress = !mainAddress && isApiConfigured()
  const needsPassword = !hasWithdrawalPassword && isApiConfigured()

  const balanceFrozen = !!currentUser?.balanceFrozen
  const canSubmit =
    currentUser &&
    !balanceFrozen &&
    numAmount > 0 &&
    numAmount <= availableBalance &&
    mainAddress &&
    hasWithdrawalPassword &&
    password.length > 0 &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !currentUser) return
    setError(null)
    setSubmitting(true)
    try {
      if (isApiConfigured()) {
        const res = await apiCreateWithdrawal({
          userId: currentUser.id,
          userEmail: currentUser.email ?? '',
          amount: numAmount,
          currency: 'USDT',
          withdrawalPassword: password,
        })
        if (res.success) {
          setSubmitted(true)
          refreshUser()
        } else {
          setError(res.error ?? 'Failed to submit')
        }
      } else {
        createWithdrawal(
          currentUser.id,
          currentUser.email ?? '',
          numAmount,
          'USDT',
          currentUser.mainWithdrawalAddress ?? undefined,
          currentUser.mainWithdrawalNetwork ?? undefined
        )
        setSubmitted(true)
        refreshUser()
      }
    } catch (err) {
      setError((err as Error).message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setPassword('')
    setSubmitted(false)
    setError(null)
    onClose()
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Withdraw"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
          padding: 24,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Withdraw USDT</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        {!currentUser ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Please log in to withdraw.</p>
        ) : balanceFrozen ? (
          <p style={{ color: 'var(--negative)', fontSize: 14 }}>Your balance has been frozen. You cannot withdraw. Please contact support.</p>
        ) : submitted ? (
          <div>
            <p style={{ color: 'var(--accent)', marginBottom: 16 }}>Withdrawal request submitted. We will process it shortly.</p>
            <button type="button" onClick={handleClose} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 13 }}>
                {error}
              </div>
            )}

            {needsAddress && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(251,191,36,0.15)', borderRadius: 10, color: 'var(--accent)', fontSize: 13 }}>
                Please set your main withdrawal address first.{' '}
                <button type="button" onClick={() => { onClose(); onOpenWithdrawalAddress?.() }} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Set address
                </button>
              </div>
            )}

            {!needsAddress && needsPassword && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(251,191,36,0.15)', borderRadius: 10, color: 'var(--accent)', fontSize: 13 }}>
                Please set your withdrawal password first.{' '}
                <button type="button" onClick={() => { onClose(); onOpenWithdrawalPassword?.() }} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                  Set password
                </button>
              </div>
            )}

            {!needsAddress && mainAddress && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Main withdrawal address</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{mainNetwork}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{mainAddress}</div>
              </div>
            )}

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              Available: <strong style={{ color: 'var(--text)' }}>{availableBalance.toFixed(2)} USDT</strong>
            </p>
            {numAmount > 0 && numAmount > availableBalance && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 13 }}>
                Insufficient balance
              </div>
            )}
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Amount (USDT)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'var(--bg)',
                color: 'var(--text)',
                fontSize: 16,
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />

            {hasWithdrawalPassword && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Withdrawal password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your withdrawal password"
                    style={{
                      width: '100%',
                      padding: '14px 48px 14px 16px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: 'var(--bg)',
                      color: 'var(--text)',
                      fontSize: 16,
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide' : 'Show'}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <EyeIcon />
                  </button>
                </div>
              </div>
            )}

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Your request will be reviewed by admin. Funds are deducted when approved.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={handleClose} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={!canSubmit} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
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
