import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { OrdersEmptyIcon } from './OrdersEmptyIcon'
import { useUserTrades, useSpotTrade } from '../hooks/useApiTrades'
import type { Trade } from '../types/admin'
import { PairSelectorModal } from './PairSelectorModal'
import type { CryptoPair } from '../data/crypto'

interface TradeViewProps {
  pair?: string
  lastPrice?: number
  change24h?: number
  list?: CryptoPair[]
  onSelectPair?: (symbol: string) => void
}

const MOCK_ORDER_BOOK = [
  { price: 2085.77, amount: 0.756, side: 'ask' as const },
  { price: 2085.46, amount: 1.9179, side: 'ask' as const },
  { price: 2085.41, amount: 2.4457, side: 'ask' as const },
  { price: 2085.4, amount: 0.5, side: 'ask' as const },
  { price: 2085.14, amount: 1.2, side: 'ask' as const },
  { price: 2085.13, amount: 0.88, side: 'bid' as const },
  { price: 2084.85, amount: 1.5, side: 'bid' as const },
  { price: 2084.84, amount: 2.1, side: 'bid' as const },
  { price: 2084.79, amount: 0.65, side: 'bid' as const },
  { price: 2084.78, amount: 3.2, side: 'bid' as const },
]

const DEFAULT_PRICE = 2085.12
const DEFAULT_CHANGE = 1.56

export function TradeView({ pair = 'ETH/USDT', lastPrice, change24h, list = [], onSelectPair }: TradeViewProps) {
  const { t } = useLanguage()
  const { currentUser, refreshUser } = useVerification()
  const pairData = list.find((p) => p.symbol === pair)
  const priceNum = pairData?.lastPrice ?? lastPrice ?? DEFAULT_PRICE
  const changeNum = pairData?.change24h ?? change24h ?? DEFAULT_CHANGE
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [price, setPrice] = useState(priceNum.toFixed(2))
  const [quantity, setQuantity] = useState('')
  const [pairModalOpen, setPairModalOpen] = useState(false)
  const [tradeError, setTradeError] = useState('')

  const amount = quantity && price ? (parseFloat(quantity) * parseFloat(price)).toFixed(2) : '0.00'
  const numAmount = parseFloat(amount) || 0
  const numQty = parseFloat(quantity) || 0
  const numPrice = parseFloat(price) || 0

  const balanceUsdt = currentUser?.balanceUsdt ?? 0
  const holdings = currentUser?.cryptoHoldings ?? {}
  const baseAsset = pair.split('/')[0] || 'ETH'
  const baseHolding = holdings[baseAsset] ?? 0

  const balanceFrozen = !!currentUser?.balanceFrozen
  const canBuy = currentUser && !balanceFrozen && balanceUsdt >= numAmount && numAmount > 0 && numQty > 0
  const canSell = currentUser && !balanceFrozen && baseHolding >= numQty && numQty > 0
  const { trades } = useUserTrades(currentUser?.id ?? null)
  const myTrades = trades.filter(
    (t) => t.type === 'spot' && currentUser?.id && t.userId === currentUser.id
  ).slice(0, 20)
  const executeSpot = useSpotTrade()

  useEffect(() => {
    setPrice(priceNum.toFixed(2))
  }, [priceNum])

  const handleTrade = async () => {
    setTradeError('')
    if (!currentUser) {
      setTradeError('Please log in to trade')
      return
    }
    if (currentUser.balanceFrozen) {
      setTradeError('Your balance has been frozen. Please contact support.')
      return
    }
    const result = await executeSpot({
      userId: currentUser.id,
      pair,
      side,
      price: numPrice,
      quantity: numQty,
    })
    if (result.success) {
      setQuantity('')
      refreshUser()
    } else {
      setTradeError(result.error ?? 'Trade failed')
    }
  }

  const changeStr = changeNum >= 0 ? `+${changeNum.toFixed(2)}%` : `${changeNum.toFixed(2)}%`
  const changePositive = changeNum >= 0

  return (
    <div className="card trade-section" style={{ marginTop: 8, padding: 0, overflow: 'hidden' }}>
      {/* Top bar – match screenshot: SPOT, then menu + pair + change */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 10 }}>
          {t('trade.spot')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              aria-label="Menu"
              style={iconBtnStyle}
              onClick={() => setPairModalOpen(true)}
            >
              <MenuIcon />
            </button>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{pair}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: changePositive ? 'var(--accent)' : 'var(--negative)',
                background: changePositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                padding: '4px 10px',
                borderRadius: 6,
              }}
            >
              {changeStr}
            </span>
          </div>
          <button type="button" aria-label="Chart" style={iconBtnStyle}>
            <ChartIcon />
          </button>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        {/* Trading panel + Order book row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: Trading panel – match screenshot */}
          <div>
            {/* Buy/Sell tabs: active green with angled right edge overlapping SELL */}
            <div className="spot-tabs" style={{ display: 'flex', marginBottom: 16, position: 'relative' }}>
              <button
                type="button"
                onClick={() => setSide('buy')}
                className={side === 'buy' ? 'spot-tab spot-tab-buy' : 'spot-tab spot-tab-inactive'}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: side === 'buy' ? 2 : 1,
                  background: side === 'buy' ? 'var(--accent)' : 'transparent',
                  color: side === 'buy' ? '#fff' : 'var(--text-muted)',
                  clipPath: side === 'buy' ? 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 0 100%)' : 'none',
                  borderRadius: side === 'buy' ? '10px 0 0 10px' : '0',
                }}
              >
                {t('trade.buy')}
              </button>
              <button
                type="button"
                onClick={() => setSide('sell')}
                className={side === 'sell' ? 'spot-tab spot-tab-sell' : 'spot-tab spot-tab-inactive'}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: side === 'sell' ? 2 : 1,
                  background: side === 'sell' ? 'var(--negative)' : 'rgba(255,255,255,0.06)',
                  color: side === 'sell' ? '#fff' : 'var(--text-muted)',
                  clipPath: side === 'sell' ? 'polygon(0 0, 100% 0, 100% 100%, 12px 100%)' : 'none',
                  borderRadius: side === 'sell' ? '0 10px 10px 0' : '0',
                }}
              >
                {t('trade.sell')}
              </button>
            </div>

            {/* LIMITED PRICE – dropdown style with down arrow */}
            <button
              type="button"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                marginBottom: 14,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text)',
                fontSize: 14,
                fontWeight: 500,
                textAlign: 'left',
              }}
            >
              {t('trade.limitedPrice')}
              <DownArrowIcon />
            </button>

            {/* PRICE */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('trade.price')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button type="button" onClick={() => setPrice((p) => (parseFloat(p) - 0.01).toFixed(2))} style={smallBtnStyle}>−</button>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ ...inputStyle, flex: 1, textAlign: 'center' }}
              />
              <button type="button" onClick={() => setPrice((p) => (parseFloat(p) + 0.01).toFixed(2))} style={smallBtnStyle}>+</button>
            </div>

            {/* QUANTITY */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('trade.quantity')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <button type="button" onClick={() => setQuantity((q) => Math.max(0, (parseFloat(q) || 0) - 0.1).toFixed(4))} style={smallBtnStyle}>−</button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button type="button" onClick={() => setQuantity((q) => ((parseFloat(q) || 0) + 0.1).toFixed(4))} style={smallBtnStyle}>+</button>
            </div>

            {/* Total in USDT */}
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{t('trade.total')}</div>
            <div
              style={{
                ...inputStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span>{amount}</span>
              <span style={{ color: 'var(--text-muted)' }}>USDT</span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              {t('trade.available')} {side === 'buy' ? balanceUsdt.toFixed(2) : baseHolding.toFixed(6)} {side === 'buy' ? 'USDT' : baseAsset}
            </div>

            {!currentUser && (
              <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>
                Log in to trade
              </div>
            )}
            {currentUser && balanceUsdt <= 0 && side === 'buy' && (
              <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>
                Deposit USDT to trade
              </div>
            )}
            {tradeError && (
              <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>
                {tradeError}
              </div>
            )}

            <button
              type="button"
              onClick={handleTrade}
              disabled={!(side === 'buy' ? canBuy : canSell)}
              style={{
                width: '100%',
                padding: 16,
                borderRadius: 10,
                border: 'none',
                background: side === 'buy' ? 'var(--accent)' : 'var(--negative)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.04em',
                opacity: (side === 'buy' ? canBuy : canSell) ? 1 : 0.5,
                cursor: (side === 'buy' ? canBuy : canSell) ? 'pointer' : 'not-allowed',
              }}
            >
              {side === 'buy' ? t('trade.buy') : t('trade.sell')}
            </button>
          </div>

          {/* Right: Order book */}
          <div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: 10,
              }}
            >
              <span>PRICE (USDT)</span>
              <span style={{ textAlign: 'right' }}>AMOUNT (ETH)</span>
            </div>
            {MOCK_ORDER_BOOK.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  fontSize: 13,
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <span style={{ color: row.side === 'ask' ? 'var(--negative)' : 'var(--accent)', fontWeight: 600 }}>
                  {row.price.toFixed(2)}
                </span>
                <span style={{ textAlign: 'right' }}>{row.amount.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trade history */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.03em' }}>TRADE HISTORY</span>
            <DocumentIcon />
          </div>
          {!currentUser ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Log in to see trade history
            </div>
          ) : myTrades.length === 0 ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <OrdersEmptyIcon size={120} />
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 14 }}>{t('trade.noOrder')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myTrades.map((trade) => (
                <TradeHistoryRow key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </div>
      </div>

      <PairSelectorModal
        open={pairModalOpen}
        list={list}
        selectedPair={pair}
        onSelectPair={(symbol) => {
          onSelectPair?.(symbol)
          setPairModalOpen(false)
        }}
        onClose={() => setPairModalOpen(false)}
      />
    </div>
  )
}

function TradeHistoryRow({ trade }: { trade: Trade }) {
  const isBuy = trade.side === 'buy'
  const date = new Date(trade.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        fontSize: 13,
      }}
    >
      <div>
        <span style={{ fontWeight: 700, color: isBuy ? 'var(--accent)' : 'var(--negative)' }}>
          {trade.side.toUpperCase()}
        </span>
        {' '}{trade.pair} · {trade.quantity.toFixed(4)} @ {trade.price.toFixed(2)}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{date}</div>
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 42,
  height: 42,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 10,
  color: 'var(--text)',
}

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--text)',
  fontSize: 15,
  outline: 'none',
}

const smallBtnStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 20,
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  )
}

function DownArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}
