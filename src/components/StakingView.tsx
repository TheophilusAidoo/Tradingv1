import { useState, useEffect, useCallback } from 'react'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetPledgesForUser, apiGetPledges, apiCreatePledge } from '../data/apiBridge'
import { getPledgesForUser, createPledgeInStore } from '../data/pledgesStore'
import type { PledgeStats } from '../data/apiBridge'

interface StakingViewProps {
  open: boolean
  onClose: () => void
}

const PLEDGE_PLANS = [
  { id: 'newuser' as const, title: 'New user', quota: '10-100', quotaMin: 10, quotaMax: 100, dailyYield: '20%', pledgeCycle: '4DAY', cycleDays: 4 },
  { id: 'olduser' as const, title: 'Old User', quota: '10-1000', quotaMin: 10, quotaMax: 1000, dailyYield: '10%', pledgeCycle: '3DAY', cycleDays: 3 },
  { id: 'small' as const, title: 'Small mining machine', quota: '10-100', quotaMin: 10, quotaMax: 100, dailyYield: '1%', pledgeCycle: '7DAY', cycleDays: 7 },
]

const PLAN_LABELS: Record<string, string> = {
  newuser: 'New user',
  olduser: 'Old User',
  small: 'Small mining machine',
}

const PLAN_YIELDS: Record<string, number> = {
  newuser: 20,
  olduser: 10,
  small: 1,
}

const PLAN_CYCLES: Record<string, number> = {
  newuser: 4,
  olduser: 3,
  small: 7,
}

function computeStatsFromPledges(
  pledges: { planId: string; amount: number; status: string; endsAt: string; createdAt: string; totalEarned?: number }[]
): PledgeStats {
  const now = Date.now()
  let amountMined = 0
  let todayEarnings = 0
  let cumulativeIncome = 0
  for (const p of pledges) {
    const amount = Number(p.amount) || 0
    const dailyYield = PLAN_YIELDS[p.planId] ?? 0
    const cycleDays = PLAN_CYCLES[p.planId] ?? 1
    const created = new Date(p.createdAt).getTime()
    const ends = new Date(p.endsAt).getTime()
    const elapsedDays = Math.min(cycleDays, (now - created) / 86400000)
    const dailyEarn = amount * (dailyYield / 100)
    if (p.status === 'active' && now < ends) {
      amountMined += amount
      todayEarnings += dailyEarn
      cumulativeIncome += dailyEarn * elapsedDays
    } else if (p.status === 'completed') {
      cumulativeIncome += Number(p.totalEarned) || 0
    } else if (p.status === 'active' && now >= ends) {
      cumulativeIncome += amount * (dailyYield / 100) * cycleDays
    }
  }
  return {
    amountMined: Math.round(amountMined * 100) / 100,
    todayEarnings: Math.round(todayEarnings * 100) / 100,
    cumulativeIncome: Math.round(cumulativeIncome * 100) / 100,
    incomeOrder: pledges.length,
  }
}

function mapPledgeFromRaw(p: {
  id?: string
  planId?: string
  plan_id?: string
  amount?: unknown
  status?: string
  endsAt?: string
  ends_at?: string
  createdAt?: string
  created_at?: string
  totalEarned?: number
  total_earned?: number
}): { id: string; planId: string; amount: number; status: string; endsAt: string; createdAt: string; totalEarned?: number } {
  return {
    id: String(p.id ?? ''),
    planId: String(p.planId ?? p.plan_id ?? ''),
    amount: Number(p.amount) || 0,
    status: String(p.status ?? 'active').toLowerCase() === 'completed' ? 'completed' : 'active',
    endsAt: p.endsAt ?? p.ends_at ?? '',
    createdAt: p.createdAt ?? p.created_at ?? '',
    totalEarned: p.totalEarned ?? p.total_earned,
  }
}

function formatCountdown(endsAt: string): string {
  if (!endsAt || typeof endsAt !== 'string') return '0:00:00'
  const normalized = endsAt.includes(' ') && !endsAt.includes('T') ? endsAt.replace(' ', 'T') : endsAt
  const end = new Date(normalized).getTime()
  const now = Date.now()
  if (Number.isNaN(end) || now >= end) return '0:00:00'
  const diff = Math.max(0, Math.floor((end - now) / 1000))
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const normalized = dateStr.includes(' ') && !dateStr.includes('T') ? dateStr.replace(' ', 'T') : dateStr
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString()
}

function safeNum(n: number): string {
  return (Number.isNaN(n) ? 0 : n).toFixed(2)
}

export function StakingView({ open, onClose }: StakingViewProps) {
  const { currentUser, refreshUser } = useVerification()
  const [stats, setStats] = useState<PledgeStats>({ amountMined: 0, todayEarnings: 0, cumulativeIncome: 0, incomeOrder: 0 })
  const [pledges, setPledges] = useState<{ id: string; planId: string; amount: number; status: string; endsAt: string; createdAt: string; totalEarned?: number }[]>([])
  const [pledgeModal, setPledgeModal] = useState<{ planId: string; title: string; quotaMin: number; quotaMax: number } | null>(null)
  const [pledgeAmount, setPledgeAmount] = useState('')
  const [pledgeError, setPledgeError] = useState('')
  const [pledgeLoading, setPledgeLoading] = useState(false)
  const [, setTick] = useState(0)

  const loadPledges = useCallback(async () => {
    if (!currentUser?.id) {
      setStats({ amountMined: 0, todayEarnings: 0, cumulativeIncome: 0, incomeOrder: 0 })
      setPledges([])
      return
    }
    if (isApiConfigured()) {
      try {
        const uid = String(currentUser.id ?? '').trim()
        if (!uid) {
          setPledges([])
          setStats({ amountMined: 0, todayEarnings: 0, cumulativeIncome: 0, incomeOrder: 0 })
          return
        }
        let res = await apiGetPledgesForUser(uid)
        let rawPledges = Array.isArray(res.pledges) ? res.pledges : []
        if (rawPledges.length === 0 && currentUser?.email) {
          try {
            const all = await apiGetPledges()
            rawPledges = Array.isArray(all) ? all.filter((x: { userEmail?: string; user_email?: string }) =>
              String((x as { userEmail?: string }).userEmail ?? (x as { user_email?: string }).user_email ?? '').toLowerCase() ===
              String(currentUser.email ?? '').toLowerCase()
            ) : []
          } catch {
            /* keep empty */
          }
        }
        const mapped = rawPledges.map((p: unknown) => mapPledgeFromRaw(p as Parameters<typeof mapPledgeFromRaw>[0]))
        const deduped = mapped.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        setPledges(deduped)
        setStats(computeStatsFromPledges(deduped))
        refreshUser()
      } catch {
        setStats({ amountMined: 0, todayEarnings: 0, cumulativeIncome: 0, incomeOrder: 0 })
        setPledges([])
      }
    } else {
      const res = getPledgesForUser(String(currentUser.id))
      const mapped = res.pledges.map((p) => mapPledgeFromRaw(p))
      const deduped = mapped.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      setPledges(deduped)
      setStats(computeStatsFromPledges(deduped))
      refreshUser()
    }
  }, [currentUser?.id, refreshUser])

  useEffect(() => {
    if (open && currentUser?.id) loadPledges()
  }, [open, currentUser?.id, loadPledges])

  useEffect(() => {
    if (!open || !currentUser) return
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [open, currentUser])

  const handlePledge = async () => {
    if (!pledgeModal || !currentUser) return
    const amt = parseFloat(pledgeAmount)
    if (Number.isNaN(amt) || amt < pledgeModal.quotaMin || amt > pledgeModal.quotaMax) {
      setPledgeError(`Amount must be between ${pledgeModal.quotaMin} and ${pledgeModal.quotaMax} USDT`)
      return
    }
    setPledgeError('')
    setPledgeLoading(true)
    try {
      const userId = String(currentUser.id)
      const userEmail = String(currentUser.email ?? '')
      const result = isApiConfigured()
        ? await apiCreatePledge({
            userId,
            userEmail,
            planId: pledgeModal.planId,
            amount: amt,
          })
        : createPledgeInStore(userId, userEmail, pledgeModal.planId, amt)
      if (result.success) {
        setPledgeModal(null)
        setPledgeAmount('')
        refreshUser()
        if (result.pledge) {
          const p = result.pledge as { id?: string; userId?: string; user_id?: string; planId?: string; amount?: number; status?: string; endsAt?: string; ends_at?: string; createdAt?: string; created_at?: string }
          const cycleDays = PLAN_CYCLES[pledgeModal.planId] ?? 4
          const defaultEnds = new Date(Date.now() + cycleDays * 86400000).toISOString().slice(0, 19).replace('T', ' ')
          const mapped = {
            id: String(p.id ?? ''),
            planId: String(p.planId ?? pledgeModal.planId),
            amount: Number(p.amount) ?? amt,
            status: p.status ?? 'active',
            endsAt: p.endsAt ?? p.ends_at ?? defaultEnds,
            createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
            totalEarned: undefined,
          }
          setPledges((prev) => {
            const next = [mapped, ...prev]
            setStats(computeStatsFromPledges(next))
            return next
          })
          if (isApiConfigured()) {
            try {
              const fetchUserId = String(p.userId ?? p.user_id ?? currentUser.id ?? '').trim()
              if (fetchUserId) {
                const res = await apiGetPledgesForUser(fetchUserId)
                const raw = Array.isArray(res.pledges) ? res.pledges : []
                if (raw.length > 0) {
                  const mappedList = raw.map((x: unknown) => mapPledgeFromRaw(x as Parameters<typeof mapPledgeFromRaw>[0]))
                  setPledges(mappedList)
                  setStats(computeStatsFromPledges(mappedList))
                }
              }
            } catch {
              /* keep optimistic data if fetch fails */
            }
          }
        } else {
          await loadPledges()
        }
      } else {
        setPledgeError(result.error ?? 'Pledge failed')
      }
    } catch (err) {
      setPledgeError((err as Error)?.message ?? 'Pledge failed. Check your connection and try again.')
    } finally {
      setPledgeLoading(false)
    }
  }

  const balance = currentUser?.balanceUsdt ?? 0
  const canPledge = !currentUser?.locked && !currentUser?.balanceFrozen && balance >= 10

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DeFi Staking"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,11,0.9)',
          flexShrink: 0,
        }}
      >
        <button type="button" onClick={onClose} aria-label="Back" style={headerBtnStyle}>
          <BackIcon />
        </button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text)', flex: 1, textAlign: 'center' }}>
          DEFI
        </h1>
        <div style={{ width: 40 }} />
      </div>

      <div
        style={{
          overflowY: 'auto',
          padding: '20px max(16px, env(safe-area-inset-left)) max(60px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right))',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            justifyContent: 'center',
            width: '100%',
            maxWidth: 880,
          }}
        >
          {/* Pledge plans */}
          <div
            style={{
              flex: '1 1 380px',
              minWidth: 0,
              maxWidth: 420,
              background: 'var(--card)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
          {!currentUser && (
            <div style={{ padding: '14px 18px', background: 'rgba(34,197,94,0.12)', borderBottom: '1px solid rgba(34,197,94,0.2)', fontSize: 13, color: 'var(--accent)' }}>
              Log in from the profile icon to pledge and earn.
            </div>
          )}
          {/* Mining info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 18px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              THE AMOUNT IS BEING MINED(USDT)
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
              {safeNum(stats.amountMined)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 11, color: 'var(--text-muted)', width: '100%' }}>
              <div>
                <div style={{ marginBottom: 4 }}>TODAY EARNINGS(USDT)</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{safeNum(stats.todayEarnings)}</div>
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>CUMULATIVE INCOME(USDT)</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{safeNum(stats.cumulativeIncome)}</div>
              </div>
              <div>
                <div style={{ marginBottom: 4 }}>INCOME ORDER</div>
                <div style={{ color: 'var(--text)', fontWeight: 600 }}>{stats.incomeOrder}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />

          {/* Pledge plans */}
          {PLEDGE_PLANS.map((plan, idx) => {
            const activePledge = pledges.find((p) => p.planId === plan.id && p.status === 'active')
            const hasBalance = balance >= plan.quotaMin
            const disabled = !currentUser || !canPledge || !hasBalance
            return (
              <div key={plan.id}>
                <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', textTransform: 'capitalize' }}>{plan.title}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>QUOTA(USDT)</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{plan.quota}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>DAILY YIELD</span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{plan.dailyYield}</span>
                    </div>
                    {activePledge && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClockIcon />
                        <span style={{ color: 'var(--text)' }}>{formatCountdown(activePledge.endsAt)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>PLEDGE CYCLE</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{plan.pledgeCycle}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser || disabled) return
                      setPledgeModal({ planId: plan.id, title: plan.title, quotaMin: plan.quotaMin, quotaMax: plan.quotaMax })
                    }}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 12,
                      border: 'none',
                      background: disabled ? 'rgba(255,255,255,0.08)' : 'var(--accent)',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.7 : 1,
                    }}
                    title={!currentUser ? 'Log in to pledge' : !canPledge ? 'Account locked or balance frozen' : !hasBalance ? `Minimum ${plan.quotaMin} USDT required` : undefined}
                  >
                    {!currentUser ? 'LOG IN TO PLEDGE' : !hasBalance ? 'INSUFFICIENT BALANCE' : 'PLEDGE'}
                  </button>
                </div>
                {idx < PLEDGE_PLANS.length - 1 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />}
              </div>
            )
          })}
          </div>

          {/* Pledge history - beside pledge plans */}
          {currentUser && (
            <div
              style={{
                flex: '1 1 320px',
                minWidth: 0,
                maxWidth: 400,
                background: 'var(--card)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}
            >
            <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
              Pledge history
            </div>
            <div
              style={{
                ...(pledges.length > 5 ? { maxHeight: 360, overflowY: 'auto' as const } : {}),
              }}
            >
              {pledges.length === 0 ? (
                <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No pledges yet. Start by pledging above.
                </div>
              ) : (
                pledges.map((p) => {
                  const planTitle = PLAN_LABELS[p.planId] ?? p.planId
                  const amt = Number(p.amount) || 0
                  const isActive = p.status === 'active'
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{planTitle}</span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 600,
                            background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                            color: isActive ? '#22c55e' : '#a1a1aa',
                          }}
                        >
                          {isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                        <span>{amt.toFixed(2)} USDT</span>
                        {isActive ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ClockIcon />
                            {formatCountdown(p.endsAt)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent)' }}>
                            +
                            {safeNum(
                              p.totalEarned != null
                                ? Number(p.totalEarned)
                                : (Number(p.amount) || 0) * ((PLAN_YIELDS[p.planId] ?? 0) / 100) * (PLAN_CYCLES[p.planId] ?? 1)
                            )}{' '}
                            earned
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatDate(p.createdAt)}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            </div>
          )}
        </div>
      </div>

      {/* Pledge amount modal */}
      {pledgeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'max(24px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left))',
          }}
          onClick={() => { setPledgeModal(null); setPledgeAmount(''); setPledgeError(''); }}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 24,
              maxWidth: 360,
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700 }}>Pledge - {pledgeModal.title}</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>
              Balance: {balance.toFixed(2)} USDT · Min: {pledgeModal.quotaMin} · Max: {pledgeModal.quotaMax}
            </p>
            <input
              type="number"
              min={pledgeModal.quotaMin}
              max={pledgeModal.quotaMax}
              step="0.01"
              value={pledgeAmount}
              onChange={(e) => { setPledgeAmount(e.target.value); setPledgeError(''); }}
              placeholder="Amount (USDT)"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                color: '#fff',
                fontSize: 16,
                marginBottom: 12,
                boxSizing: 'border-box',
              }}
            />
            {pledgeError && <p style={{ margin: '0 0 12px', fontSize: 13, color: '#ef4444' }}>{pledgeError}</p>}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => { setPledgeModal(null); setPledgeAmount(''); setPledgeError(''); }}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePledge}
                disabled={pledgeLoading}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: pledgeLoading ? 'wait' : 'pointer' }}
              >
                {pledgeLoading ? 'Pledging...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const headerBtnStyle: React.CSSProperties = {
  width: 40,
  height: 40,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 10,
  color: 'var(--text)',
  cursor: 'pointer',
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}
