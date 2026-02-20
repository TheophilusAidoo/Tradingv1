import { useState, useEffect } from 'react'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetUserNotifications } from '../data/apiBridge'
import type { UserNotification } from '../data/apiBridge'

interface NotificationsViewProps {
  open: boolean
  onClose: () => void
}

export function NotificationsView({ open, onClose }: NotificationsViewProps) {
  const { currentUser } = useVerification()
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !currentUser?.id) return
    if (isApiConfigured()) {
      setLoading(true)
      apiGetUserNotifications(currentUser.id)
        .then(setNotifications)
        .catch(() => setNotifications([]))
        .finally(() => setLoading(false))
    } else {
      const derived: UserNotification[] = []
      if (currentUser.locked) {
        derived.push({
          id: 'local-locked',
          userId: currentUser.id,
          type: 'account_locked',
          message: 'Your account has been locked. You cannot perform any actions. Contact customer support.',
          createdAt: new Date().toISOString(),
        })
      }
      if (currentUser.balanceFrozen) {
        derived.push({
          id: 'local-frozen',
          userId: currentUser.id,
          type: 'balance_frozen',
          message: 'Your balance has been frozen. You cannot withdraw, deposit, or trade.',
          createdAt: new Date().toISOString(),
        })
      }
      setNotifications(derived)
    }
  }, [open, currentUser?.id, currentUser?.locked, currentUser?.balanceFrozen])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
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
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: 'var(--text)',
            flex: 1,
            textAlign: 'center',
          }}
        >
          Notifications
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div style={{ overflowY: 'auto', padding: '20px 16px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--card)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '32px 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: 'var(--card)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '20px 18px',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #1a0a2e 100%)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BellIcon />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 6,
                  }}
                >
                  No notifications yet
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    lineHeight: 1.4,
                  }}
                >
                  When your account is locked, balance frozen, or other changes are made, you will see them here.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: 'var(--card)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '16px 18px',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {new Date(n.createdAt).toLocaleString()}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                  {n.message}
                </div>
              </div>
            ))}
          </div>
        )}
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

function BellIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
