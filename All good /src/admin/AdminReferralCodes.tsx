import { useState, useCallback, useEffect } from 'react'
import { IoAddCircleOutline } from './adminIcons'
import { adminPageStyles } from './adminStyles'
import {
  getReferralCodes,
  generateReferralCode,
  type ReferralCode,
} from '../data/referralCodesStore'
import { isApiConfigured, apiGetReferralCodes, apiGenerateReferralCode } from '../data/apiBridge'

export function AdminReferralCodes() {
  const [codes, setCodes] = useState<ReferralCode[]>(() =>
    isApiConfigured() ? [] : getReferralCodes()
  )
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (isApiConfigured()) {
      const list = await apiGetReferralCodes()
      setCodes(list)
    } else {
      setCodes(getReferralCodes())
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      if (isApiConfigured()) {
        await apiGenerateReferralCode()
      } else {
        generateReferralCode()
      }
      await refresh()
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = (code: string, id: string) => {
    void navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const availableCount = codes.filter((c) => c.status === 'available').length
  const usedCount = codes.filter((c) => c.status === 'used').length

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Generate 5-digit referral codes. Users must enter a valid code to register. Each code can only be used once.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            background: '#16161a',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '16px 20px',
            minWidth: 140,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>{availableCount}</span>
          <span style={{ fontSize: 13, color: '#71717a', marginLeft: 8 }}>Available</span>
        </div>
        <div
          style={{
            background: '#16161a',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '16px 20px',
            minWidth: 140,
          }}
        >
          <span style={{ fontSize: 24, fontWeight: 800, color: '#71717a' }}>{usedCount}</span>
          <span style={{ fontSize: 13, color: '#71717a', marginLeft: 8 }}>Used</span>
        </div>
      </div>

      <div className="admin-form-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Generate new code</h3>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="admin-btn admin-btn-primary"
        >
          <IoAddCircleOutline size={18} style={{ marginRight: 8 }} />
          Generate 5-digit code
        </button>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Used by</th>
              <th>Used at</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty">
                  No referral codes yet. Generate one above.
                </td>
              </tr>
            ) : (
              [...codes].reverse().map((c) => (
                <tr key={c.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 16,
                        fontWeight: 700,
                        letterSpacing: 2,
                        color: '#fff',
                      }}
                    >
                      {c.code}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${c.status === 'available' ? 'admin-badge-success' : 'admin-badge-pending'}`}
                    >
                      {c.status === 'used' ? 'Used' : 'Available'}
                    </span>
                  </td>
                  <td style={{ color: '#a1a1aa', fontSize: 13 }}>
                    {c.usedBy ?? '—'}
                  </td>
                  <td style={{ color: '#71717a', fontSize: 13 }}>
                    {c.usedAt ? new Date(c.usedAt).toLocaleString() : '—'}
                  </td>
                  <td style={{ color: '#71717a', fontSize: 13 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {c.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => copyCode(c.code, c.id)}
                        className="admin-btn"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#e4e4e7',
                          padding: '6px 12px',
                          fontSize: 12,
                        }}
                      >
                        {copiedId === c.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
