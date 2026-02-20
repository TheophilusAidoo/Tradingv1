import { useState, useEffect, useCallback } from 'react'
import { IoAddOutline, IoTrashOutline } from './adminIcons'
import {
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
} from '../data/paymentMethodsStore'
import { isApiConfigured, apiGetPaymentMethods, apiCreatePaymentMethod, apiDeletePaymentMethod } from '../data/apiBridge'
import type { PaymentMethod } from '../types/admin'
import { adminPageStyles } from './adminStyles'

function qrImageSrc(m: PaymentMethod): string {
  if (m.qrCodeUrl && m.qrCodeUrl.trim()) {
    const path = m.qrCodeUrl.trim()
    const url = path.startsWith('http') ? path : `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`
    return url
  }
  return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(m.walletAddress)}`
}

function QrImage({ method }: { method: PaymentMethod }) {
  const [src, setSrc] = useState(() => qrImageSrc(method))
  const fallback = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(method.walletAddress)}`
  return (
    <img
      src={src}
      alt="QR"
      style={{ width: 48, height: 48, borderRadius: 6 }}
      onError={() => setSrc(fallback)}
    />
  )
}

export function AdminPaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [walletName, setWalletName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const refresh = useCallback(async () => {
    if (isApiConfigured()) {
      try {
        const list = await apiGetPaymentMethods()
        setMethods(list)
      } catch {
        setMethods(getPaymentMethods())
      }
    } else {
      setMethods(getPaymentMethods())
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!walletName.trim() || !walletAddress.trim()) {
      setError('Wallet name and wallet address are required')
      return
    }
    // QR image is optional; QR will be auto-generated from wallet address if not provided
    setSubmitting(true)
    try {
      if (isApiConfigured()) {
        const formData = new FormData()
        formData.append('walletName', walletName.trim())
        formData.append('walletAddress', walletAddress.trim())
        if (imageFile) formData.append('qrcode', imageFile)
        await apiCreatePaymentMethod(formData)
      } else {
        addPaymentMethod({
          label: walletName.trim(),
          network: walletName.trim(),
          walletAddress: walletAddress.trim(),
          minAmount: '0',
          unit: 'USDT',
        })
      }
      await refresh()
      setShowForm(false)
      setWalletName('')
      setWalletAddress('')
      setImageFile(null)
    } catch (e) {
      setError((e as Error).message || 'Failed to add payment method')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this payment method?')) return
    try {
      if (isApiConfigured()) {
        await apiDeletePaymentMethod(id)
      } else {
        removePaymentMethod(id)
      }
      await refresh()
    } catch (e) {
      setError((e as Error).message || 'Failed to remove')
    }
  }

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Add payment methods. Enter wallet name, wallet address, and upload your QR code image. What you add here is shown to users in the deposit section.
      </p>

      {error && (
        <div className="admin-badge admin-badge-danger" style={{ marginBottom: 16, display: 'block', padding: 12 }}>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowForm(!showForm)}
        className="admin-btn admin-btn-primary"
        style={{ marginBottom: 20 }}
      >
        <IoAddOutline size={18} style={{ marginRight: 8 }} />
        Add payment method
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="admin-form-card" style={{ marginBottom: 24 }}>
          <div className="admin-form-group">
            <label className="admin-form-label">Wallet name</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="e.g. USDT TRC20, Bitcoin"
              className="admin-form-input"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Wallet address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Your deposit address"
              className="admin-form-input"
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Upload image (optional – QR auto-generated from address if empty)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="admin-form-input"
            />
            {imageFile && (
              <span style={{ fontSize: 12, color: '#71717a', marginTop: 4, display: 'block' }}>
                Selected: {imageFile.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="admin-btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text)' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Wallet name</th>
                  <th>Wallet address</th>
                  <th>Image</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {methods.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.label}</td>
                    <td style={{ fontSize: 12, wordBreak: 'break-all', maxWidth: 200 }}>{m.walletAddress}</td>
                    <td>
                      <QrImage method={m} />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemove(m.id)}
                        style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer', padding: 8 }}
                        aria-label="Remove"
                      >
                        <IoTrashOutline size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {methods.length === 0 && !loading && (
              <div className="admin-empty">No payment methods. Add one above.</div>
            )}
          </>
        )}
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
