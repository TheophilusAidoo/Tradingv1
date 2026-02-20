import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { useFeaturesTrading } from '../hooks/useFeaturesTrading'
import { getOrderEndsAt } from '../data/tradesStore'
import { useUserTrades, useProcessExpiredOrders } from '../hooks/useApiTrades'
import { TradingChart } from './TradingChart'
import { PairSelectorModal } from './PairSelectorModal'
import { BuyUpOrderModal } from './BuyUpOrderModal'
import { OrdersEmptyIcon } from './OrdersEmptyIcon'
import type { CryptoPair } from '../data/crypto'

interface FeaturesViewProps {
  pair?: string
  lastPrice?: number
  change24h?: number
  list?: CryptoPair[]
}

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'] as const
const CHART_HEIGHT = 380

const DEFAULT_PRICE = 2080.55
const DEFAULT_CHANGE = 1.35

const DEFAULT_LIST: CryptoPair[] = []

export function FeaturesView({ pair = 'ETH/USDT', lastPrice: lastPriceProp, change24h: change24hProp, list = DEFAULT_LIST }: FeaturesViewProps) {
  const { t } = useLanguage()
  const { currentUser, refreshUser } = useVerification()
  const [selectedPair, setSelectedPair] = useState(pair)
  const [pairSelectorOpen, setPairSelectorOpen] = useState(false)
  const [buyUpModalOpen, setBuyUpModalOpen] = useState(false)
  const [buyFallModalOpen, setBuyFallModalOpen] = useState(false)
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]>('1m')
  const { candles, stats24h, loading, error } = useFeaturesTrading(selectedPair, timeframe)

  const selectedFromList = list.find((p) => p.symbol === selectedPair)
  const lastPrice =
    stats24h?.lastPrice ??
    selectedFromList?.lastPrice ??
    (selectedPair === pair ? lastPriceProp : undefined) ??
    DEFAULT_PRICE
  const change24h =
    stats24h?.priceChangePercent ??
    selectedFromList?.change24h ??
    (selectedPair === pair ? change24hProp : undefined) ??
    DEFAULT_CHANGE
  const priceStr = lastPrice.toFixed(2)
  const changeStr = change24h >= 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`
  const changeColor = change24h >= 0 ? 'var(--accent)' : 'var(--negative)'
  const displayList = list.length > 0 ? list : [{ symbol: selectedPair, name: '', lastPrice, change24h }]

  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : null
  const candleInfo = lastCandle
    ? `O:${lastCandle.open.toFixed(2)} C:${lastCandle.close.toFixed(2)} H:${lastCandle.high.toFixed(2)} L:${lastCandle.low.toFixed(2)}`
    : `O:${priceStr} C:${priceStr} H:${priceStr} L:${priceStr}`

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10)
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const low24h = stats24h?.lowPrice ?? 1994.94
  const high24h = stats24h?.highPrice ?? 2126.87
  const volume24h = stats24h?.volume ?? 178553963
  const [, setTick] = useState(0)
  const { trades: allTrades, refreshTrades } = useUserTrades(currentUser?.id ?? null)
  const processExpired = useProcessExpiredOrders()

  useEffect(() => {
    const id = setInterval(async () => {
      const n = await processExpired()
      if (n > 0) {
        refreshUser()
        refreshTrades()
      }
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [refreshUser, processExpired, refreshTrades])

  const featuresList = allTrades.filter(
    (tr) => tr.type === 'features' && currentUser?.id && tr.userId === currentUser.id
  )

  return (
    <div className="card" style={{ marginTop: 8, padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button type="button" aria-label="Back" style={iconBtnStyle}>
          <BackIcon />
        </button>
        <h1 style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 700, letterSpacing: '0.04em' }}>
          {t('features.title')}
        </h1>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '16px 16px 20px' }}>
        {error && (
          <div style={{ marginBottom: 12, padding: 8, background: 'rgba(239,68,68,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--negative)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <button type="button" aria-label="Menu" onClick={() => setPairSelectorOpen(true)} style={iconBtnStyle}>
            <MenuIcon />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{selectedPair}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: changeColor,
                  background: change24h >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                {changeStr}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--negative)', marginBottom: 2 }}>
              {loading && !stats24h ? '…' : priceStr}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {changeStr}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <div style={{ fontSize: 10, marginBottom: 2 }}>24H LOW</div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{stats24h ? low24h.toFixed(2) : '…'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, marginBottom: 2 }}>24H HIGH</div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{stats24h ? high24h.toFixed(2) : '…'}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, marginBottom: 2 }}>24H VOLUME</div>
            <div style={{ color: 'var(--text)', fontWeight: 600 }}>{stats24h ? Math.floor(volume24h).toLocaleString() : '…'}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                background: timeframe === tf ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: timeframe === tf ? 'var(--text)' : 'var(--text-muted)',
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
          {dateStr} {timeStr} {candleInfo}
        </div>

        <div style={{ marginBottom: 6 }}>
          <TradingChart candles={candles} height={CHART_HEIGHT} />
        </div>
        <p style={{ margin: 0, fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>
          Scroll to zoom · Drag to pan
        </p>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.03em' }}>ORDER HISTORY</span>
            <DocumentIcon />
          </div>
          {!currentUser ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>
              Log in to see order history
            </div>
          ) : featuresList.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}>
              <OrdersEmptyIcon size={100} />
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{t('trade.noOrder')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {featuresList.slice(0, 10).map((tr) => {
                const endsAt = getOrderEndsAt(tr)
                const timeExpired = Date.now() >= endsAt
                const countdown = !timeExpired
                  ? `${Math.floor((endsAt - Date.now()) / 60000)}:${String(Math.floor(((endsAt - Date.now()) / 1000) % 60)).padStart(2, '0')}`
                  : null
                return (
                  <div
                    key={tr.id}
                    style={{
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 10,
                      fontSize: 13,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span style={{ color: tr.side === 'up' ? 'var(--accent)' : 'var(--negative)', fontWeight: 700 }}>
                      {tr.side.toUpperCase()}
                    </span>
                    <span>{tr.pair} · {tr.amount.toFixed(2)} USDT</span>
                    {!timeExpired ? (
                      <span style={{ color: 'var(--text-muted)' }}>{countdown ? `${countdown} left` : 'Pending'}</span>
                    ) : tr.featuresStatus === 'settled' ? (
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            tr.featuresResult === 'win'
                              ? 'var(--accent)'
                              : tr.featuresResult === 'lose'
                                ? 'var(--negative)'
                                : 'var(--text-muted)',
                        }}
                      >
                        {tr.featuresResult?.toUpperCase()} {(tr.payoutAmount ?? 0) > 0 && `+${tr.payoutAmount!.toFixed(2)} USDT`}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Settling…</span>
                    )}
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {new Date(tr.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={() => !currentUser?.balanceFrozen && setBuyUpModalOpen(true)}
            disabled={!!currentUser?.balanceFrozen}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              opacity: currentUser?.balanceFrozen ? 0.5 : 1,
              cursor: currentUser?.balanceFrozen ? 'not-allowed' : 'pointer',
            }}
            title={currentUser?.balanceFrozen ? 'Balance frozen – contact support' : undefined}
          >
            {t('order.buyUp')}
          </button>
          <button
            type="button"
            onClick={() => !currentUser?.balanceFrozen && setBuyFallModalOpen(true)}
            disabled={!!currentUser?.balanceFrozen}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: 'var(--negative)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              opacity: currentUser?.balanceFrozen ? 0.5 : 1,
              cursor: currentUser?.balanceFrozen ? 'not-allowed' : 'pointer',
            }}
            title={currentUser?.balanceFrozen ? 'Balance frozen – contact support' : undefined}
          >
            {t('order.buyFall')}
          </button>
        </div>
      </div>

      <PairSelectorModal
        open={pairSelectorOpen}
        list={displayList}
        selectedPair={selectedPair}
        onSelectPair={setSelectedPair}
        onClose={() => setPairSelectorOpen(false)}
      />
      <BuyUpOrderModal
        open={buyUpModalOpen}
        pair={selectedPair}
        variant="up"
        onClose={() => setBuyUpModalOpen(false)}
        userId={currentUser?.id}
        userEmail={currentUser?.email}
        balanceUsdt={currentUser?.balanceUsdt ?? 0}
        onOrderPlaced={() => { refreshUser(); refreshTrades() }}
      />
      <BuyUpOrderModal
        open={buyFallModalOpen}
        pair={selectedPair}
        variant="fall"
        onClose={() => setBuyFallModalOpen(false)}
        userId={currentUser?.id}
        userEmail={currentUser?.email}
        balanceUsdt={currentUser?.balanceUsdt ?? 0}
        onOrderPlaced={() => { refreshUser(); refreshTrades() }}
      />
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 8,
  color: 'var(--text)',
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}
