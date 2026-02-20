import { useState, useEffect } from 'react'
import { adminPageStyles } from './adminStyles'
import { getOrderEndsAt } from '../data/tradesStore'
import { useAdminFeaturesOrders, useSettleFeaturesOrder, useProcessExpiredOrders } from '../hooks/useApiTrades'
import { parseLeverValue } from '../data/featuresConfigStore'
import type { FeaturesOrderResult } from '../types/admin'

export function AdminFeaturesOrders() {
  const { trades, load } = useAdminFeaturesOrders()
  const settleOrder = useSettleFeaturesOrder()
  const processExpired = useProcessExpiredOrders()
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pending = trades.filter((t) => (t.featuresStatus ?? '') === 'pending')
  const settled = trades.filter((t) => (t.featuresStatus ?? '') === 'settled')

  useEffect(() => {
    const id = setInterval(() => {
      processExpired()
        .then(() => load())
        .catch(() => {})
    }, 1000)
    return () => clearInterval(id)
  }, [processExpired, load])

  const handleSettle = async (tradeId: string, result: FeaturesOrderResult) => {
    setError(null)
    setSettlingId(tradeId)
    try {
      const outcome = await settleOrder(tradeId, result)
      if (outcome && typeof outcome === 'object' && 'success' in outcome && outcome.success === false && 'error' in outcome) {
        setError(String(outcome.error))
        return
      }
      await load()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to set result'
      setError(msg)
    } finally {
      setSettlingId(null)
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Features orders (Buy Up / Buy Fall). When time is up, set each order as Win, Lose, or Draw. Win credits payout (stake × period% × lever), Draw returns stake, Lose keeps the stake.
      </p>

      {error && (
        <div
          className="admin-badge admin-badge-danger"
          style={{ marginBottom: 16, display: 'block', padding: 12 }}
          role="alert"
        >
          {error}
        </div>
      )}

      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Pending orders</h3>
      <div className="admin-card" style={{ marginBottom: 32 }}>
        {pending.length === 0 ? (
          <div className="admin-empty">No pending orders</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Set result</th>
                <th>User</th>
                <th>Pair</th>
                <th>Side</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Lever</th>
                <th>Expected Payout (Win)</th>
                <th>Time left</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => {
                const periodPercent = t.periodPercent ?? 50
                const leverNum = parseLeverValue(t.lever ?? '1x')
                const payoutWin = t.amount + t.amount * (periodPercent / 100) * leverNum
                const endsAt = getOrderEndsAt(t)
                const now = Date.now()
                const secLeft = Math.max(0, Math.floor((endsAt - now) / 1000))
                const timeStr = secLeft > 0 ? `${Math.floor(secLeft / 60)}:${String(secLeft % 60).padStart(2, '0')}` : 'Expired'
                const isSettling = settlingId === t.id
                return (
                  <tr key={t.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleSettle(t.id, 'win')}
                        disabled={isSettling}
                        className="admin-btn admin-btn-primary"
                        style={{ marginRight: 6, marginBottom: 4 }}
                      >
                        {isSettling ? '…' : 'Win'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettle(t.id, 'draw')}
                        disabled={isSettling}
                        className="admin-btn"
                        style={{ marginRight: 6, marginBottom: 4, background: 'rgba(255,255,255,0.15)' }}
                      >
                        {isSettling ? '…' : 'Draw'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSettle(t.id, 'lose')}
                        disabled={isSettling}
                        className="admin-btn admin-btn-danger"
                        style={{ marginBottom: 4 }}
                      >
                        {isSettling ? '…' : 'Lose'}
                      </button>
                    </td>
                    <td>{t.userEmail ?? t.userId}</td>
                    <td>{t.pair}</td>
                    <td>
                      <span style={{ color: t.side === 'up' ? 'var(--accent)' : 'var(--negative)', fontWeight: 600 }}>{t.side.toUpperCase()}</span>
                    </td>
                    <td>{t.amount.toFixed(2)} USDT</td>
                    <td>{t.period}s ({periodPercent}%)</td>
                    <td>{t.lever}</td>
                    <td>{payoutWin.toFixed(2)} USDT</td>
                    <td style={{ fontSize: 12, fontWeight: secLeft <= 0 ? 700 : 500 }}>{timeStr}</td>
                    <td style={{ fontSize: 12 }}>{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Order history</h3>
      <div className="admin-card">
        {settled.length === 0 ? (
          <div className="admin-empty">No settled orders yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Pair</th>
                <th>Side</th>
                <th>Amount</th>
                <th>Result</th>
                <th>Payout</th>
                <th>Settled</th>
              </tr>
            </thead>
            <tbody>
              {settled.map((t) => (
                <tr key={t.id}>
                  <td>{t.userEmail ?? t.userId}</td>
                  <td>{t.pair}</td>
                  <td>
                    <span style={{ color: t.side === 'up' ? 'var(--accent)' : 'var(--negative)' }}>{t.side.toUpperCase()}</span>
                  </td>
                  <td>{t.amount.toFixed(2)} USDT</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        t.featuresResult === 'win'
                          ? 'admin-badge-success'
                          : t.featuresResult === 'lose'
                            ? 'admin-badge-danger'
                            : 'admin-badge-pending'
                      }`}
                    >
                      {t.featuresResult?.toUpperCase() ?? '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{(t.payoutAmount ?? 0).toFixed(2)} USDT</td>
                  <td style={{ fontSize: 12 }}>{t.settledAt ? new Date(t.settledAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
