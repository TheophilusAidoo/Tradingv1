import { useState, useEffect } from 'react'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetWithdrawalsForUser } from '../data/apiBridge'
import { getWithdrawals } from '../data/withdrawalsStore'
import type { WithdrawalRequest } from '../types/admin'

interface WithdrawalHistoryViewProps {
  open: boolean
  onClose: () => void
}

export function WithdrawalHistoryView({ open, onClose }: WithdrawalHistoryViewProps) {
  const { currentUser } = useVerification()
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && currentUser) {
      if (isApiConfigured()) {
        setLoading(true)
        apiGetWithdrawalsForUser(currentUser.id)
          .then(setWithdrawals)
          .catch(() => setWithdrawals([]))
          .finally(() => setLoading(false))
      } else {
        const all = getWithdrawals()
        setWithdrawals(all.filter((w) => w.userId === currentUser.id))
      }
    } else if (!open) {
      setWithdrawals([])
    }
  }, [open, currentUser?.id])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Withdrawal History"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 66,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
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
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--text)',
              flex: 1,
              textAlign: 'center',
            }}
          >
            WITHDRAWAL HISTORY
          </h1>
          <span style={{ width: 40 }} />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            minHeight: 200,
          }}
        >
          {loading ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>Loading…</p>
          ) : withdrawals.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
              No withdrawal history yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{w.amount} {w.currency}</span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: w.status === 'accepted' ? 'rgba(34,197,94,0.2)' : w.status === 'declined' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                        color: w.status === 'accepted' ? '#22c55e' : w.status === 'declined' ? '#ef4444' : '#eab308',
                        fontWeight: 600,
                      }}
                    >
                      {w.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {w.walletNetwork ?? '—'} · {new Date(w.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                  {w.walletAddress && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, wordBreak: 'break-all' }}>
                      {w.walletAddress}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}
