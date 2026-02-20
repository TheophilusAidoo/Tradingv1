import { formatCryptoPrice, formatChange } from '../data/crypto'
import type { CryptoPair } from '../data/crypto'
import { CryptoLogo } from './CryptoLogo'

interface CryptoTableProps {
  list: CryptoPair[]
  loading?: boolean
}

export function CryptoTable({ list, loading }: CryptoTableProps) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 12,
          padding: '12px 0',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted)',
          letterSpacing: '0.03em',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span>NAME</span>
        <span style={{ textAlign: 'right' }}>LAST PRICE</span>
        <span style={{ textAlign: 'right' }}>24H CHG%</span>
      </div>
      <ul>
        {list.map((row) => (
          <li
            key={row.symbol}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              alignItems: 'center',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              fontSize: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CryptoLogo symbol={row.symbol} size={28} />
              <span style={{ fontWeight: 500 }}>{row.symbol}</span>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 600 }}>
              {loading ? '…' : formatCryptoPrice(row.lastPrice)}
            </div>
            <div
              style={{
                textAlign: 'right',
                fontWeight: 600,
                color: row.change24h >= 0 ? 'var(--accent)' : 'var(--negative)',
              }}
            >
              {loading ? '…' : formatChange(row.change24h)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
