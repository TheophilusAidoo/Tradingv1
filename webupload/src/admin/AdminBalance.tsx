import { useState } from 'react'
import { IoAddCircleOutline, IoRemoveCircleOutline } from './adminIcons'
import { useAdmin } from '../contexts/AdminContext'
import type { AdminUser } from '../types/admin'
import { adminPageStyles } from './adminStyles'

function AdjustBalanceModal({
  user,
  onClose,
}: {
  user: AdminUser
  onClose: () => void
}) {
  const { users, adjustBalance } = useAdmin()
  const [amount, setAmount] = useState('')
  const currentUser = users.find((u) => u.id === user.id) ?? user
  const numAmount = parseFloat(amount) || 0

  const handleAdd = () => {
    if (numAmount <= 0) return
    adjustBalance(currentUser.id, numAmount)
    setAmount('')
  }

  const handleSubtract = () => {
    if (numAmount <= 0) return
    adjustBalance(currentUser.id, -numAmount)
    setAmount('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Adjust balance"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="admin-form-card"
        style={{ maxWidth: 400, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Adjust balance</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 10,
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <p style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--text)' }}>{currentUser.name}</p>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)' }}>{currentUser.email}</p>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
          Current balance: <strong style={{ color: '#22c55e' }}>{currentUser.balanceUsdt.toFixed(2)} USDT</strong>
        </p>
        <div className="admin-form-group">
          <label className="admin-form-label">Amount (USDT)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="admin-form-input"
          />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            onClick={handleAdd}
            disabled={numAmount <= 0}
            className="admin-btn admin-btn-primary"
            style={{ flex: 1, padding: 14 }}
          >
            <IoAddCircleOutline size={20} style={{ marginRight: 8 }} />
            Add
          </button>
          <button
            type="button"
            onClick={handleSubtract}
            disabled={numAmount <= 0}
            className="admin-btn admin-btn-danger"
            style={{ flex: 1, padding: 14 }}
          >
            <IoRemoveCircleOutline size={20} style={{ marginRight: 8 }} />
            Subtract
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminBalance() {
  const { users } = useAdmin()
  const [modalUser, setModalUser] = useState<AdminUser | null>(null)

  if (users.length === 0) {
    return (
      <div className="admin-page">
        <p className="admin-page-desc">No users yet.</p>
        <style>{adminPageStyles}</style>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <p className="admin-page-desc">Click a user to add or subtract USDT from their balance.</p>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Balance (USDT)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setModalUser(u)}
              >
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td style={{ fontWeight: 600 }}>{Number(u.balanceUsdt).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setModalUser(u)}
                    className="admin-btn admin-btn-primary"
                    style={{ padding: '8px 14px', fontSize: 12 }}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalUser && (
        <AdjustBalanceModal
          user={modalUser}
          onClose={() => setModalUser(null)}
        />
      )}
      <style>{adminPageStyles}</style>
    </div>
  )
}
