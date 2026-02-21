import { IoPeopleOutline, IoArrowDownCircleOutline, IoArrowUpCircleOutline, IoWalletOutline, IoStatsChartOutline, IoGiftOutline, IoCheckmarkCircleOutline, IoRefreshOutline } from './adminIcons'
import { AdminProvider, useAdmin } from '../contexts/AdminContext'
import { AdminLayout } from './AdminLayout'
import { AdminUsers } from './AdminUsers'
import { AdminVerification } from './AdminVerification'
import { AdminDeposits } from './AdminDeposits'
import { AdminWithdrawals } from './AdminWithdrawals'
import { AdminBalance } from './AdminBalance'
import { AdminPaymentMethods } from './AdminPaymentMethods'
import { AdminCustomerService } from './AdminCustomerService'
import { AdminChat } from './AdminChat'
import { AdminSettings } from './AdminSettings'
import { AdminReferralCodes } from './AdminReferralCodes'
import { AdminPledges } from './AdminPledges'
import { AdminFeaturesOrders } from './AdminFeaturesOrders'
import { AdminMsbApprovals } from './AdminMsbApprovals'
import { useState, useEffect, useCallback } from 'react'
import { getAllTrades } from '../data/tradesStore'
import { getReferralCodes } from '../data/referralCodesStore'
import { isApiConfigured, apiGetReferralCodes, apiGetTrades } from '../data/apiBridge'
import type { Trade } from '../types/admin'
import { formatDateUTC } from '../utils/dateUtils'

/** Normalize date string for parsing (MySQL "Y-m-d H:i:s" -> ISO) */
function parseDate(dateStr: string): Date {
  const s = String(dateStr ?? '').trim()
  if (!s) return new Date(NaN)
  const normalized = s.includes(' ') && !s.includes('T') ? s.replace(' ', 'T') : s
  return new Date(normalized)
}

/** Format date as local YYYY-MM-DD for consistent grouping */
function toLocalDateKey(dateOrStr: Date | string): string {
  const d = typeof dateOrStr === 'string' ? parseDate(dateOrStr) : dateOrStr
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function groupByDate<T>(items: T[], getDate: (t: T) => string): Record<string, number> {
  const map: Record<string, number> = {}
  for (const item of items) {
    const key = toLocalDateKey(getDate(item))
    if (key) map[key] = (map[key] ?? 0) + 1
  }
  return map
}

function lastNDays(n: number): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(toLocalDateKey(d))
  }
  return out
}

function DashboardPage() {
  const { users, pendingDeposits, pendingWithdrawals, refreshData } = useAdmin()
  const [referralCodes, setReferralCodes] = useState(() =>
    isApiConfigured() ? [] : getReferralCodes()
  )
  const [allTrades, setAllTrades] = useState<Trade[]>(() =>
    isApiConfigured() ? [] : getAllTrades()
  )
  const [refreshing, setRefreshing] = useState(false)
  const loadReferralCodes = useCallback(async () => {
    if (isApiConfigured()) {
      try {
        const list = await apiGetReferralCodes()
        setReferralCodes(list)
      } catch {
        setReferralCodes(getReferralCodes())
      }
    } else {
      setReferralCodes(getReferralCodes())
    }
  }, [])
  const loadTrades = useCallback(async () => {
    if (isApiConfigured()) {
      try {
        const list = await apiGetTrades()
        setAllTrades(list)
      } catch {
        setAllTrades(getAllTrades())
      }
    } else {
      setAllTrades(getAllTrades())
    }
  }, [])
  useEffect(() => {
    loadReferralCodes()
  }, [loadReferralCodes])
  useEffect(() => {
    loadTrades()
  }, [loadTrades])
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      refreshData()
      await loadTrades()
      await loadReferralCodes()
    } finally {
      setRefreshing(false)
    }
  }, [refreshData, loadTrades, loadReferralCodes])
  const approvedUsers = users.filter((u) => u.status === 'approved').length
  const totalUsdt = users.reduce((s, u) => s + (u.balanceUsdt ?? 0), 0)
  const availableCodes = referralCodes.filter((c) => c.status === 'available').length
  const usedCodes = referralCodes.filter((c) => c.status === 'used').length

  const allFeatures = allTrades.filter((t) => t.type === 'features')
  const pendingFeatures = allFeatures.filter((t) => (t.featuresStatus ?? '') === 'pending')
  const registrationsByDay = groupByDate(users, (u) => u.registeredAt)
  const featuresByDay = groupByDate(allFeatures, (t) => t.createdAt)
  const days = lastNDays(7)
  const maxReg = Math.max(1, ...days.map((d) => registrationsByDay[d] ?? 0))
  const maxFeatures = Math.max(1, ...days.map((d) => featuresByDay[d] ?? 0))

  const statCards = [
    { value: users.length, label: 'Registered users', Icon: IoPeopleOutline, color: 'users' },
    { value: pendingDeposits.length, label: 'Pending deposits', Icon: IoArrowDownCircleOutline, color: 'accent' },
    { value: pendingWithdrawals.length, label: 'Pending withdrawals', Icon: IoArrowUpCircleOutline, color: 'warning' },
    { value: approvedUsers, label: 'Approved users', Icon: IoCheckmarkCircleOutline, color: 'success' },
    { value: totalUsdt >= 1000 ? totalUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : totalUsdt.toFixed(2), label: 'Total USDT in platform', Icon: IoWalletOutline, color: 'wallet' },
    { value: pendingFeatures.length, label: 'Pending features orders', Icon: IoStatsChartOutline, color: 'accent' },
    { value: availableCodes, label: 'Referral codes available', Icon: IoGiftOutline, color: 'success' },
    { value: usedCodes, label: 'Referral codes used', Icon: IoGiftOutline, color: 'muted' },
  ]

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <p className="admin-page-subtitle" style={{ margin: 0 }}>Overview of your platform</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="admin-dashboard-refresh-btn"
          title="Refresh data"
        >
          <IoRefreshOutline size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="admin-stats-grid">
        {statCards.map(({ value, label, Icon, color }) => (
          <div key={label} className="admin-stat-card">
            <div className={`admin-stat-icon admin-stat-icon-${color}`}>
              <Icon size={26} />
            </div>
            <div className="admin-stat-body">
              <span className="admin-stat-value">{value}</span>
              <span className="admin-stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-charts-grid">
        <div className="admin-dashboard-chart-card">
          <h3 className="admin-dashboard-chart-title">User registrations (last 7 days)</h3>
          <div className="admin-dashboard-chart">
            {days.map((d) => {
              const count = registrationsByDay[d] ?? 0
              const pct = maxReg > 0 ? (count / maxReg) * 100 : 0
              const barHeight = Math.max(8, pct)
              return (
                <div key={d} className="admin-dashboard-chart-bar-wrap">
                  <div className="admin-dashboard-chart-bar-container">
                    <div
                      className="admin-dashboard-chart-bar"
                      style={{ height: `${barHeight}%` }}
                      title={`${d}: ${count}`}
                    />
                  </div>
                  <span className="admin-dashboard-chart-count">{count}</span>
                  <span className="admin-dashboard-chart-label">
                    {new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="admin-dashboard-chart-card">
          <h3 className="admin-dashboard-chart-title">Features orders (last 7 days)</h3>
          <div className="admin-dashboard-chart">
            {days.map((d) => {
              const count = featuresByDay[d] ?? 0
              const pct = maxFeatures > 0 ? (count / maxFeatures) * 100 : 0
              const barHeight = Math.max(8, pct)
              return (
                <div key={d} className="admin-dashboard-chart-bar-wrap">
                  <div className="admin-dashboard-chart-bar-container">
                    <div
                      className="admin-dashboard-chart-bar admin-dashboard-chart-bar-accent"
                      style={{ height: `${barHeight}%` }}
                      title={`${d}: ${count}`}
                    />
                  </div>
                  <span className="admin-dashboard-chart-count">{count}</span>
                  <span className="admin-dashboard-chart-label">
                    {new Date(d + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="admin-dashboard-bottom-grid">
        <div className="admin-dashboard-recent-card">
          <h3 className="admin-dashboard-chart-title">Recent users</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...users].reverse().slice(0, 5).map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 13 }}>{u.email}</span>
                <span style={{ fontSize: 12, color: '#71717a' }}>{formatDateUTC(u.registeredAt, { dateStyle: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-dashboard-recent-card">
          <h3 className="admin-dashboard-chart-title">Activity summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Spot trades (total)</span>
              <span>{isApiConfigured() ? allTrades.filter((t) => t.type === 'spot').length : getAllTrades().filter((t) => t.type === 'spot').length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Features orders (total)</span>
              <span>{allFeatures.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#71717a' }}>Features orders (settled)</span>
              <span>{allFeatures.filter((t) => (t.featuresStatus ?? '') === 'settled').length}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-page-subtitle { font-size: 14px; color: #71717a; }
        .admin-dashboard-refresh-btn {
          padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06); color: #e4e4e7; font-size: 13px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center;
          transition: background 0.15s;
        }
        .admin-dashboard-refresh-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); }
        .admin-dashboard-refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        .admin-stat-card {
          display: flex; align-items: center; gap: 16px;
          background: #16161a; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 20px;
        }
        .admin-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .admin-stat-icon-users { background: rgba(99,102,241,0.2); color: #818cf8; }
        .admin-stat-icon-accent { background: rgba(34,197,94,0.2); color: #22c55e; }
        .admin-stat-icon-warning { background: rgba(234,179,8,0.2); color: #eab308; }
        .admin-stat-icon-success { background: rgba(34,197,94,0.2); color: #22c55e; }
        .admin-stat-icon-wallet { background: rgba(14,165,233,0.2); color: #0ea5e9; }
        .admin-stat-icon-muted { background: rgba(255,255,255,0.08); color: #a1a1aa; }
        .admin-stat-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .admin-stat-value { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .admin-stat-label { font-size: 12px; color: #71717a; font-weight: 500; }
        .admin-dashboard-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
        @media (max-width: 700px) { .admin-dashboard-charts-grid { grid-template-columns: 1fr; } }
        .admin-dashboard-chart-card {
          background: #16161a; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 24px;
        }
        .admin-dashboard-chart-title { margin: 0 0 20px; font-size: 15px; font-weight: 700; color: #fff; }
        .admin-dashboard-chart {
          display: flex; align-items: stretch; gap: 12px; height: 200px;
        }
        .admin-dashboard-chart-bar-wrap {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0;
        }
        .admin-dashboard-chart-bar-container {
          flex: 1; width: 100%; max-width: 48px; min-height: 0;
          display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
        }
        .admin-dashboard-chart-bar {
          width: 100%; min-height: 6px; max-height: 100%;
          background: linear-gradient(to top, #22c55e, #4ade80); border-radius: 6px 6px 0 0;
          transition: height 0.25s ease;
        }
        .admin-dashboard-chart-bar-accent { background: linear-gradient(to top, #0ea5e9, #38bdf8); }
        .admin-dashboard-chart-count { font-size: 12px; font-weight: 700; color: #fff; }
        .admin-dashboard-chart-label { font-size: 10px; color: #71717a; font-weight: 600; text-transform: uppercase; }
        .admin-dashboard-recent-card {
          background: #16161a; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 24px;
        }
        .admin-dashboard-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; }
        @media (max-width: 700px) { .admin-dashboard-bottom-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

function AdminContent({ pathname }: { pathname: string }) {
  if (pathname === '/admin' || pathname === '/admin/') return <DashboardPage />
  if (pathname === '/admin/users') return <AdminUsers />
  if (pathname === '/admin/referral-codes') return <AdminReferralCodes />
  if (pathname === '/admin/verification') return <AdminVerification />
  if (pathname === '/admin/msb-approvals') return <AdminMsbApprovals />
  if (pathname === '/admin/deposits') return <AdminDeposits />
  if (pathname === '/admin/withdrawals') return <AdminWithdrawals />
  if (pathname === '/admin/balance') return <AdminBalance />
  if (pathname === '/admin/pledges') return <AdminPledges />
  if (pathname === '/admin/features-orders') return <AdminFeaturesOrders />
  if (pathname === '/admin/payment-methods') return <AdminPaymentMethods />
  if (pathname === '/admin/customer-service') return <AdminCustomerService />
  if (pathname === '/admin/chat') return <AdminChat />
  if (pathname === '/admin/settings') return <AdminSettings />
  return <DashboardPage />
}

interface AdminDashboardProps {
  pathname: string
  onNavigate: (path: string) => void
}

export function AdminDashboard({ pathname, onNavigate }: AdminDashboardProps) {
  return (
    <AdminProvider>
      <AdminLayout pathname={pathname} onNavigate={onNavigate}>
        <AdminContent pathname={pathname} />
      </AdminLayout>
    </AdminProvider>
  )
}
