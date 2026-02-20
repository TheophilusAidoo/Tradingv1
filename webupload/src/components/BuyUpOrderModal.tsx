import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { parseLeverValue } from '../data/featuresConfigStore'
import { useFeaturesConfig } from '../hooks/useApiConfig'
import { useFeaturesOrder } from '../hooks/useApiTrades'

export type FeaturesOrderVariant = 'up' | 'fall'

interface BuyUpOrderModalProps {
  open: boolean
  pair: string
  variant?: FeaturesOrderVariant
  onClose: () => void
  userId?: string
  userEmail?: string
  balanceUsdt?: number
  onOrderPlaced?: () => void
}

export function BuyUpOrderModal({ open, pair, variant = 'up', onClose, userId, userEmail = '', balanceUsdt = 0, onOrderPlaced }: BuyUpOrderModalProps) {
  const { t } = useLanguage()
  const { periods, levers } = useFeaturesConfig()
  const executeOrder = useFeaturesOrder()
  const [selectedPeriod, setSelectedPeriod] = useState<{ seconds: number; percent: number } | null>(null)
  const [lever, setLever] = useState(levers[0] ?? '10x')

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriod) setSelectedPeriod(periods[0])
  }, [periods, selectedPeriod])
  const [amount, setAmount] = useState(variant === 'fall' ? 0 : 1)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const periodNum = selectedPeriod?.seconds ?? 120
  const periodPercent = selectedPeriod?.percent ?? 50
  const leverNum = parseLeverValue(lever)
  const projectedProfit = amount * (periodPercent / 100) * leverNum
  const canConfirm = userId && amount > 0 && balanceUsdt >= amount

  const handleConfirmOrder = async () => {
    setError('')
    if (!userId) {
      setError('Please log in to place an order')
      return
    }
    if (amount <= 0 || balanceUsdt < amount) {
      setError('Insufficient balance')
      return
    }
    setSubmitting(true)
    const result = await executeOrder({
      userId,
      userEmail,
      pair,
      variant,
      amount,
      periodSeconds: periodNum,
      periodPercent,
      lever,
    })
    setSubmitting(false)
    if (result.success) {
      onOrderPlaced?.()
      onClose()
    } else {
      setError(result.error ?? 'Order failed')
    }
  }
  const isFall = variant === 'fall'
  const actionLabel = isFall ? t('order.buyFall') : t('order.buyUp')
  const actionColor = isFall ? 'var(--negative)' : 'var(--accent)'
  const accentBg = isFall ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)'
  const accentBorder = isFall ? 'var(--negative)' : 'var(--accent)'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isFall ? 'Buy Fall order' : 'Buy Up order'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 400,
          minHeight: 520,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar: pair + close */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ width: 32 }} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>{pair}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '22px 18px 26px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* SELECTION PERIOD */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.03em',
                marginBottom: 10,
              }}
            >
              {t('order.selectionPeriod')}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {periods.map((p) => (
                <button
                  key={`${p.seconds}-${p.percent}`}
                  type="button"
                  onClick={() => setSelectedPeriod(p)}
                  style={{
                    flex: '1 1 0',
                    minWidth: 56,
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: selectedPeriod?.seconds === p.seconds ? `2px solid ${accentBorder}` : '1px solid rgba(255,255,255,0.15)',
                    background: selectedPeriod?.seconds === p.seconds ? accentBg : 'rgba(255,255,255,0.04)',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <div>{p.seconds}S</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{p.percent}%</div>
                </button>
              ))}
            </div>
          </div>

          {/* SELECTION LEVER */}
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.03em',
                marginBottom: 10,
              }}
            >
              {t('order.selectionLever')}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {levers.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLever(l)}
                  style={{
                    flex: '1 1 0',
                    minWidth: 48,
                    padding: '10px 8px',
                    borderRadius: 10,
                    border: lever === l ? `2px solid ${accentBorder}` : '1px solid rgba(255,255,255,0.15)',
                    background: lever === l ? accentBg : 'rgba(255,255,255,0.04)',
                    color: 'var(--text)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* ORDER AMOUNT */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.03em',
                marginBottom: 10,
              }}
            >
              {t('order.orderAmount')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => setAmount((a) => Math.max(0, a - 1))}
                style={circleBtnStyle}
                aria-label="Decrease"
              >
                −
              </button>
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text)',
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setAmount((a) => a + 1)}
                style={circleBtnStyle}
                aria-label="Increase"
              >
                +
              </button>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginBottom: 8,
            }}
          >
            {t('order.accountBalance')}: <strong style={{ color: 'var(--text)' }}>{balanceUsdt.toFixed(2)} USDT</strong>
          </div>
          {!userId && (
            <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>Log in to place orders</div>
          )}
          {userId && balanceUsdt <= 0 && (
            <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>Deposit USDT to trade</div>
          )}
          {error && (
            <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12 }}>{error}</div>
          )}

          {/* BUY UP / BUY FALL + PROJECTED PROFIT */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 22,
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: actionColor,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
              }}
            >
              {actionLabel}
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
              {t('order.projectedProfit')}: {projectedProfit.toFixed(2)} USDT
            </span>
          </div>

          {/* CONFIRM ORDER */}
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={!canConfirm || submitting}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: canConfirm ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              color: canConfirm ? '#fff' : 'var(--text-muted)',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              opacity: canConfirm ? 1 : 0.7,
            }}
          >
            {t('order.confirmOrder')}
          </button>
        </div>
      </div>
    </div>
  )
}

const circleBtnStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.08)',
  color: 'var(--text)',
  fontSize: 22,
  fontWeight: 400,
  cursor: 'pointer',
}
