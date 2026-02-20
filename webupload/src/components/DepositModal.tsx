import { usePaymentMethods } from '../hooks/usePaymentMethods'

interface DepositModalProps {
  open: boolean
  onClose: () => void
  onSelectCurrency?: (currency: string) => void
}

export function DepositModal({ open, onClose, onSelectCurrency }: DepositModalProps) {
  const paymentMethods = usePaymentMethods()
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add Payment Deposit"
      className="deposit-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="deposit-modal-card"
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 420,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: '0.04em' }}>
            Add Payment Deposit
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: 'var(--text)',
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="deposit-modal-body" style={{ overflowY: 'auto', padding: '20px 20px 28px' }}>
          {paymentMethods.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              No payment methods configured. Please contact support.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelectCurrency?.(m.id)
                    onClose()
                  }}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

