import { useEffect } from 'react'
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from './adminIcons'
import { useAdmin } from '../contexts/AdminContext'
import { adminPageStyles } from './adminStyles'

export function AdminWithdrawals() {
  const { withdrawals, pendingWithdrawals, acceptWithdrawal, declineWithdrawal, refreshWithdrawalsFromStore } = useAdmin()

  useEffect(() => {
    refreshWithdrawalsFromStore()
  }, [refreshWithdrawalsFromStore])

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Accept or decline withdrawal requests. Accept deducts from the user&apos;s balance; decline leaves their balance unchanged.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#a1a1aa' }}>
          Pending — {pendingWithdrawals.length}
        </h2>
        <div className="admin-card">
          {pendingWithdrawals.length === 0 ? (
            <div className="admin-empty">No pending withdrawals</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Wallet address</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{w.userEmail}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{w.amount}</td>
                    <td>{w.currency}</td>
                    <td>
                      <div style={{ maxWidth: 200, wordBreak: 'break-all', fontSize: 12 }}>
                        {w.walletAddress ? (
                          <>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>{w.walletNetwork ?? '—'}</span>
                            {w.walletAddress}
                          </>
                        ) : (
                          '—'
                        )}
                      </div>
                    </td>
                    <td>{new Date(w.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <button type="button" className="admin-btn admin-btn-primary" onClick={() => acceptWithdrawal(w.id)}>
                          <IoCheckmarkCircleOutline size={18} style={{ marginRight: 6 }} />
                          Accept
                        </button>
                        <button type="button" className="admin-btn admin-btn-danger" onClick={() => declineWithdrawal(w.id)}>
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
          All withdrawals
        </h2>
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Wallet address</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id}>
                  <td>{w.userEmail}</td>
                  <td style={{ fontWeight: 600 }}>{w.amount}</td>
                  <td>{w.currency}</td>
                  <td>
                    <div style={{ maxWidth: 200, wordBreak: 'break-all', fontSize: 12 }}>
                      {w.walletAddress ? (
                        <>
                          <span style={{ color: 'var(--text-muted)', display: 'block' }}>{w.walletNetwork ?? '—'}</span>
                          {w.walletAddress}
                        </>
                      ) : (
                        '—'
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      w.status === 'accepted' ? 'admin-badge-success' :
                      w.status === 'declined' ? 'admin-badge-danger' : 'admin-badge-pending'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td>{new Date(w.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {withdrawals.length === 0 && <div className="admin-empty">No withdrawals yet</div>}
        </div>
      </section>
      <style>{adminPageStyles}</style>
    </div>
  )
}
