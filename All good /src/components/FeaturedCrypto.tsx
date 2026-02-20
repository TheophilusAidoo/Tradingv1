import { formatCryptoPrice, formatChange } from '../data/crypto'
import type { CryptoPair } from '../data/crypto'
import { CryptoLogo } from './CryptoLogo'

interface FeaturedCryptoProps {
  pairs: CryptoPair[]
  loading?: boolean
}

export function FeaturedCrypto({ pairs, loading }: FeaturedCryptoProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
        padding: '0 20px 16px',
      }}
    >
      {pairs.map((pair) => (
        <div
          key={pair.symbol}
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <CryptoLogo symbol={pair.symbol} size={20} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pair.symbol}</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
            {loading ? '…' : formatCryptoPrice(pair.lastPrice)}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: pair.change24h >= 0 ? 'var(--accent)' : 'var(--negative)',
            }}
          >
            {loading ? '…' : formatChange(pair.change24h)}
          </div>
        </div>
      ))}
    </div>
  )
}
