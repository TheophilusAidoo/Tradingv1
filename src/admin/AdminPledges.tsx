import { useState, useEffect, useCallback } from 'react'
import { isApiConfigured, apiGetPledges } from '../data/apiBridge'
import { getAllPledges } from '../data/pledgesStore'
import { formatCountdownUTC, formatDateUTC } from '../utils/dateUtils'

const PLAN_LABELS: Record<string, string> = {
  newuser: 'New user',
  olduser: 'Old User',
  small: 'Small mining machine',
}

function formatCountdown(endsAt: string): string {
  const s = formatCountdownUTC(endsAt)
  return s === '0:00:00' ? 'Done' : s
}

function formatDate(dateStr: string): string {
  const s = formatDateUTC(dateStr)
  return s || '-'
}

interface PledgeRow {
  id: string
  userEmail: string
  planId: string
  amount: number
  status: string
  dailyYieldPercent: number
  cycleDays: number
  totalEarned: number
  createdAt: string
  endsAt: string
}

export function AdminPledges() {
  const [pledges, setPledges] = useState<PledgeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      if (isApiConfigured()) {
        const list = await apiGetPledges()
        setPledges(
          (list as unknown as Record<string, unknown>[]).map((p) => ({
            id: String(p.id ?? ''),
            userEmail: String(p.userEmail ?? p.user_email ?? ''),
            planId: String(p.planId ?? p.plan_id ?? ''),
            amount: Number(p.amount) || 0,
            status: String(p.status ?? 'active').toLowerCase(),
            dailyYieldPercent: Number(p.dailyYieldPercent ?? p.daily_yield_percent) || 0,
            cycleDays: Number(p.cycleDays ?? p.cycle_days) || 0,
            totalEarned: Number(p.totalEarned ?? p.total_earned) || 0,
            createdAt: String(p.createdAt ?? p.created_at ?? ''),
            endsAt: String(p.endsAt ?? p.ends_at ?? ''),
          }))
        )
      } else {
        const list = getAllPledges()
        setPledges(
          list.map((p) => ({
            id: p.id,
            userEmail: p.userEmail ?? '',
            planId: p.planId,
            amount: Number(p.amount) || 0,
            status: String(p.status ?? 'active').toLowerCase(),
            dailyYieldPercent: Number(p.dailyYieldPercent) || 0,
            cycleDays: Number(p.cycleDays) || 0,
            totalEarned: Number(p.totalEarned) || 0,
            createdAt: p.createdAt ?? '',
            endsAt: p.endsAt ?? '',
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p className="admin-page-subtitle" style={{ margin: 0 }}>All DEFI staking pledges</p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.06)',
            color: '#e4e4e7',
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div style={{ background: '#16161a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Plan</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Amount (USDT)</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Daily yield</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Cycle</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Timer</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Earned</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Created</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>Ends at</th>
              </tr>
            </thead>
            <tbody>
              {pledges.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#71717a', fontSize: 14 }}>No pledges yet</td>
                </tr>
              )}
              {pledges.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#e4e4e7' }}>{p.userEmail}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#e4e4e7' }}>{PLAN_LABELS[p.planId] ?? p.planId}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 600, color: '#e4e4e7', textAlign: 'right' }}>{(Number(p.amount) || 0).toFixed(2)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa', textAlign: 'center' }}>{p.dailyYieldPercent}%</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa', textAlign: 'center' }}>{p.cycleDays}d</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: p.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                        color: p.status === 'active' ? '#22c55e' : '#a1a1aa',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, fontFamily: 'monospace', color: p.status === 'active' ? '#22c55e' : '#a1a1aa' }}>
                    {p.status === 'active' ? formatCountdown(p.endsAt) : '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: p.status === 'completed' ? '#22c55e' : '#a1a1aa', textAlign: 'right' }}>
                    {p.status === 'completed' ? `+${(Number(p.totalEarned) || 0).toFixed(2)}` : '-'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa' }}>{formatDate(p.createdAt)}</td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: '#a1a1aa' }}>{formatDate(p.endsAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
