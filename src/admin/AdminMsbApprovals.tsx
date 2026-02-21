import { useState, useEffect, useCallback } from 'react'
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from './adminIcons'
import { isApiConfigured } from '../data/apiBridge'
import { formatDateUTC } from '../utils/dateUtils'
import { api } from '../api/client'

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''

function buildMsbImageUrl(filename: string): string {
  if (!filename?.trim()) return ''
  if (filename.startsWith('http')) return filename
  const base = API_BASE.replace(/\/$/, '')
  const path = base.startsWith('/') ? base : `/${base}`
  return `${window.location.origin}${path}/msb/${encodeURIComponent(filename)}`
}

interface MsbApproval {
  id: string
  userId: string
  userEmail: string
  frontUrl: string
  backUrl: string
  status: string
  submittedAt: string
  reviewedAt?: string
}

export function AdminMsbApprovals() {
  const [list, setList] = useState<MsbApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isApiConfigured()) {
      setList([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await api.msbApprovals.list()
      setList(Array.isArray(data) ? data : [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleApprove = async (id: string) => {
    setActing(id)
    try {
      await api.msbApprovals.approve(id)
      await load()
    } finally {
      setActing(null)
    }
  }

  const handleDecline = async (id: string) => {
    setActing(id)
    try {
      await api.msbApprovals.decline(id)
      await load()
    } finally {
      setActing(null)
    }
  }

  const pending = list.filter((m) => m.status === 'pending')

  return (
    <div className="admin-page">
      <p className="admin-page-desc">Review and approve or decline MSB (ID document) submissions from users.</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#a1a1aa' }}>
          Pending — {pending.length}
        </h2>
        <div className="admin-card">
          {loading ? (
            <div className="admin-empty">Loading…</div>
          ) : pending.length === 0 ? (
            <div className="admin-empty">No pending MSB submissions</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pending.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: 16,
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{m.userEmail}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Submitted {formatDateUTC(m.submittedAt, { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={() => handleApprove(m.id)}
                        disabled={acting === m.id}
                      >
                        <IoCheckmarkCircleOutline size={18} style={{ marginRight: 6 }} />
                        {acting === m.id ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={() => handleDecline(m.id)}
                        disabled={acting === m.id}
                      >
                        <IoCloseCircleOutline size={18} style={{ marginRight: 6 }} />
                        {acting === m.id ? '…' : 'Decline'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Front</div>
                      <a
                        href={buildMsbImageUrl(m.frontUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}
                      >
                        <img
                          src={buildMsbImageUrl(m.frontUrl)}
                          alt="Front"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </a>
                      <a href={buildMsbImageUrl(m.frontUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block' }}>
                        View full
                      </a>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Back</div>
                      <a
                        href={buildMsbImageUrl(m.backUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', width: 120, height: 90, borderRadius: 8, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}
                      >
                        <img
                          src={buildMsbImageUrl(m.backUrl)}
                          alt="Back"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </a>
                      <a href={buildMsbImageUrl(m.backUrl)} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block' }}>
                        View full
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#a1a1aa' }}>
          All MSB submissions
        </h2>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Front</th>
                <th>Back</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.id}>
                  <td>{m.userEmail}</td>
                  <td>
                    <a href={buildMsbImageUrl(m.frontUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>
                      View
                    </a>
                  </td>
                  <td>
                    <a href={buildMsbImageUrl(m.backUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>
                      View
                    </a>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        m.status === 'approved' ? 'admin-badge-success' : m.status === 'declined' ? 'admin-badge-danger' : 'admin-badge-pending'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>{formatDateUTC(m.submittedAt, { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
              {list.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                    No MSB submissions yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
