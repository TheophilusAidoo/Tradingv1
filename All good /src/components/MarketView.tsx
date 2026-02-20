import { useLanguage } from '../contexts/LanguageContext'
import { CryptoTable } from './CryptoTable'
import type { CryptoPair } from '../data/crypto'

interface MarketViewProps {
  list: CryptoPair[]
  loading?: boolean
}

export function MarketView({ list, loading }: MarketViewProps) {
  const { t } = useLanguage()
  return (
    <div className="card" style={{ marginTop: 8 }}>
      <div
        style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          {t('market.title')}
        </h1>
      </div>
      <CryptoTable list={list} loading={loading} />
    </div>
  )
}
