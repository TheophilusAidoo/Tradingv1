import { formatCryptoPrice, formatChange } from '../data/crypto'
import type { CryptoPair } from '../data/crypto'
import { CryptoLogo } from './CryptoLogo'

interface PairSelectorModalProps {
  open: boolean
  list: CryptoPair[]
  selectedPair: string
  onSelectPair: (symbol: string) => void
  onClose: () => void
}

export function PairSelectorModal({
  open,
  list,
  selectedPair,
  onSelectPair,
  onClose,
}: PairSelectorModalProps) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Select pair"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 16,
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          maxWidth: 420,
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '0.04em' }}>ALL</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={closeBtnStyle}>
            <CloseIcon />
          </button>
        </div>

        <div
          style={{
            overflowY: 'auto',
            padding: '14px 16px 20px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              padding: '0 4px 12px',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text-muted)',
              letterSpacing: '0.03em',
            }}
          >
            <span>NAME</span>
            <span style={{ textAlign: 'right' }}>LAST PRICE</span>
            <span style={{ textAlign: 'right' }}>24H CHG%</span>
          </div>
          {list.map((row) => (
            <button
              key={row.symbol}
              type="button"
              onClick={() => {
                onSelectPair(row.symbol)
                onClose()
              }}
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                alignItems: 'center',
                padding: '14px 4px',
                border: 'none',
                background: selectedPair === row.symbol ? 'rgba(255,255,255,0.06)' : 'transparent',
                color: 'var(--text)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 14,
                borderRadius: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CryptoLogo symbol={row.symbol} size={28} />
                <span style={{ fontWeight: 500 }}>{row.symbol}</span>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600 }}>
                {formatCryptoPrice(row.lastPrice)}
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  color: row.change24h >= 0 ? 'var(--accent)' : 'var(--negative)',
                }}
              >
                {formatChange(row.change24h)}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const closeBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 10,
  color: 'var(--text)',
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
