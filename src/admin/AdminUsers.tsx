import { useState } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { adminPageStyles } from './adminStyles'
import { IoTrashOutline } from './adminIcons'
import type { AdminUser } from '../types/admin'

export function AdminUsers() {
  const { users, setUserCreditScore, lockUser, freezeUserBalance, deleteUser } = useAdmin()
  const [editingCreditUserId, setEditingCreditUserId] = useState<string | null>(null)
  const [creditInput, setCreditInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const startEditCredit = (u: { id: string; creditScore?: number }) => {
    setEditingCreditUserId(u.id)
    setCreditInput(String(u.creditScore ?? 100))
  }

  const saveCreditScore = (userId: string) => {
    const n = parseInt(creditInput, 10)
    if (!Number.isNaN(n)) setUserCreditScore(userId, n)
    setEditingCreditUserId(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    const userId = deleteConfirm.id
    setDeleteError(null)
    try {
      await deleteUser(userId)
      setDeleteConfirm(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Failed to delete user')
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-page-desc">All registered users on the platform. Click credit score to edit.</p>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Lock</th>
              <th>Freeze Balance</th>
              <th>Credit Score</th>
              <th>Registered</th>
              <th>Balance (USDT)</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>
                  <span className={`admin-badge ${u.status === 'approved' ? 'admin-badge-success' : 'admin-badge-pending'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => lockUser(u.id, !u.locked)}
                    className={`admin-btn ${u.locked ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                    title={u.locked ? 'Unlock account' : 'Lock account'}
                  >
                    {u.locked ? 'Unlock' : 'Lock'}
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => freezeUserBalance(u.id, !u.balanceFrozen)}
                    className={`admin-btn ${u.balanceFrozen ? 'admin-btn-primary' : 'admin-btn-danger'}`}
                    style={{ fontSize: 12, padding: '8px 14px' }}
                    title={u.balanceFrozen ? 'Unfreeze balance' : 'Freeze balance (blocks withdraw, trade, features)'}
                  >
                    {u.balanceFrozen ? 'Unfreeze' : 'Freeze'}
                  </button>
                </td>
                <td>
                  {editingCreditUserId === u.id ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        min={0}
                        max={999}
                        value={creditInput}
                        onChange={(e) => setCreditInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveCreditScore(u.id)}
                        className="admin-form-input"
                        style={{ width: 70, padding: '6px 10px' }}
                        autoFocus
                      />
                      <button type="button" onClick={() => saveCreditScore(u.id)} className="admin-btn admin-btn-primary" style={{ padding: '6px 12px' }}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingCreditUserId(null)} className="admin-btn" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)' }}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditCredit(u)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                        padding: 4,
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                      }}
                      title="Click to edit"
                    >
                      {u.creditScore ?? 100}
                    </button>
                  )}
                </td>
                <td>{new Date(u.registeredAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                <td style={{ fontWeight: 600 }}>{Number(u.balanceUsdt).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td>
                  {u.isAdmin ? (
                    <span style={{ fontSize: 12, color: '#71717a' }} title="Admin users cannot be deleted">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(u)}
                      className="admin-btn admin-btn-danger"
                      style={{ padding: '8px 12px', fontSize: 12 }}
                      title="Delete user"
                    >
                      <IoTrashOutline size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="admin-users-modal-overlay" onClick={() => { setDeleteConfirm(null); setDeleteError(null); }}>
          <div className="admin-users-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-users-modal-title">Delete user?</h3>
            {deleteError && <p className="admin-users-modal-error">{deleteError}</p>}
            <p className="admin-users-modal-desc">
              Permanently delete <strong>{deleteConfirm.email}</strong> ({deleteConfirm.name})? This cannot be undone.
            </p>
            <div className="admin-users-modal-actions">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="admin-btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="admin-btn admin-btn-danger"
              >
                Delete user
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        ${adminPageStyles}
        .admin-users-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 24px;
        }
        .admin-users-modal {
          background: #16161a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 28px;
          max-width: 420px; width: 100%;
        }
        .admin-users-modal-title { margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #fff; }
        .admin-users-modal-error { margin: 0 0 12px; font-size: 13px; color: #ef4444; }
        .admin-users-modal-desc { margin: 0 0 24px; font-size: 14px; color: #a1a1aa; line-height: 1.5; }
        .admin-users-modal-desc strong { color: #e4e4e7; }
        .admin-users-modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
      `}</style>
    </div>
  )
}
