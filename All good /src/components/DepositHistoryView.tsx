import { useState, useEffect } from 'react'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetDepositsForUser } from '../data/apiBridge'

interface DepositHistoryViewProps {
  open: boolean
  onClose: () => void
}

export function DepositHistoryView({ open, onClose }: DepositHistoryViewProps) {
  const { currentUser } = useVerification()
  const [deposits, setDeposits] = useState<{ id: string; amount: number; currency: string; network: string; status: string; createdAt: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && currentUser && isApiConfigured()) {
      setLoading(true)
      apiGetDepositsForUser(currentUser.id)
        .then(setDeposits)
        .catch(() => setDeposits([]))
        .finally(() => setLoading(false))
    } else if (!open) {
      setDeposits([])
    }
  }, [open, currentUser?.id])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deposit History"
      className="deposit-history-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 66,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="deposit-history-card"
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
            DEPOSIT HISTORY
          </h1>
          <span style={{ width: 40 }} />
        </div>

        <div
          className="deposit-history-body"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            minHeight: 200,
          }}
        >
          {loading ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>Loading…</p>
          ) : deposits.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
              No deposit history yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {deposits.map((d) => (
                <div
                  key={d.id}
                  style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{d.amount} {d.currency}</span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: d.status === 'accepted' ? 'rgba(34,197,94,0.2)' : d.status === 'declined' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                        color: d.status === 'accepted' ? '#22c55e' : d.status === 'declined' ? '#ef4444' : '#eab308',
                        fontWeight: 600,
                      }}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {d.network} · {new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
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
