import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from './adminIcons'
import { useAdmin } from '../contexts/AdminContext'
import { adminPageStyles } from './adminStyles'

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''

function proofImageUrl(url: string | undefined): string {
  if (!url?.trim()) return ''
  if (url.startsWith('http')) return url
  const filename = url.replace(/^.*\//, '')
  if (!filename || !API_BASE) return `${window.location.origin}${url.startsWith('/') ? url : '/' + url}`
  const base = API_BASE.replace(/\/$/, '')
  return `${window.location.origin}${base.startsWith('/') ? base : '/' + base}/proof/${filename}`
}

export function AdminDeposits() {
  const { deposits, pendingDeposits, acceptDeposit, declineDeposit } = useAdmin()

  return (
    <div className="admin-page">
      <p className="admin-page-desc">Review and approve or decline user deposits.</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#a1a1aa' }}>
          Pending — {pendingDeposits.length}
        </h2>
        <div className="admin-card">
          {pendingDeposits.length === 0 ? (
            <div className="admin-empty">No pending deposits</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Network</th>
                  <th>Proof</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDeposits.map((d) => (
                  <tr key={d.id}>
                    <td>{d.userEmail}</td>
                    <td style={{ fontWeight: 600 }}>{d.amount} {d.currency}</td>
                    <td>{d.network}</td>
                    <td>
                      {d.paymentProofUrl ? (
                        <a href={proofImageUrl(d.paymentProofUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>
                          View proof
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>{new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => acceptDeposit(d.id)}>
                          <IoCheckmarkCircleOutline size={18} style={{ marginRight: 6 }} />
                          Accept
                        </button>
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => declineDeposit(d.id)}>
                          <IoCloseCircleOutline size={18} style={{ marginRight: 6 }} />
                          Decline
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#a1a1aa' }}>
          All deposits
        </h2>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Network</th>
                <th>Proof</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td>{d.userEmail}</td>
                  <td style={{ fontWeight: 600 }}>{d.amount} {d.currency}</td>
                  <td>{d.network}</td>
                  <td>
                    {d.paymentProofUrl ? (
                      <a href={proofImageUrl(d.paymentProofUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: 13 }}>
                        View
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      d.status === 'accepted' ? 'admin-badge-success' :
                      d.status === 'declined' ? 'admin-badge-danger' : 'admin-badge-pending'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{new Date(d.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <style>{adminPageStyles}</style>
    </div>
  )
}
