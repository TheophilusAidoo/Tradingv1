import { useState, useEffect } from 'react'
import { useAdmin } from '../contexts/AdminContext'
import { adminPageStyles } from './adminStyles'
import { useFeaturesConfig } from '../hooks/useApiConfig'
import type { FeaturesPeriod } from '../data/featuresConfigStore'

export function AdminSettings() {
  const { customerLinks, setCustomerLink } = useAdmin()
  const { periods: initialPeriods, levers: initialLevers, loading, savePeriods, saveLevers } = useFeaturesConfig()
  const [leversStr, setLeversStr] = useState('')
  const [periods, setPeriods] = useState<FeaturesPeriod[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLeversStr(initialLevers.join(', '))
    setPeriods([...initialPeriods])
  }, [initialLevers, initialPeriods])

  const handleSaveLevers = async () => {
    const levers = leversStr
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (levers.length === 0) {
      setError('At least one lever is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await saveLevers(levers)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save levers')
    } finally {
      setSaving(false)
    }
  }

  const handleSavePeriods = async () => {
    const valid = periods.filter((p) => p.seconds > 0 && p.percent >= 0)
    if (valid.length === 0) {
      setError('At least one period is required')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await savePeriods(valid)
      setPeriods(valid)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save periods')
    } finally {
      setSaving(false)
    }
  }

  const addPeriod = () => {
    setPeriods((p) => [...p, { seconds: 60, percent: 20 }])
  }

  const removePeriod = (i: number) => {
    setPeriods((p) => p.filter((_, idx) => idx !== i))
  }

  const updatePeriod = (i: number, field: 'seconds' | 'percent', value: number) => {
    setPeriods((p) => p.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)))
  }

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        General admin settings. Customer support links and Features levers below.
      </p>

      {loading && (
        <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading settings...</p>
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: 12, background: 'rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: 14 }}>
          {error}
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: 16, padding: 12, background: 'rgba(34,197,94,0.2)', borderRadius: 8, color: '#22c55e', fontSize: 14 }}>
          Saved successfully
        </div>
      )}

      <div className="admin-form-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Features selection periods (timers)</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#71717a' }}>
          Each period is a timer (seconds). When it expires, the admin-set result appears. Percent is the return on win.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {periods.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="number"
                min={10}
                value={p.seconds}
                onChange={(e) => updatePeriod(i, 'seconds', parseInt(e.target.value, 10) || 60)}
                className="admin-form-input"
                style={{ width: 100 }}
              />
              <span style={{ color: '#71717a' }}>seconds</span>
              <input
                type="number"
                min={0}
                value={p.percent}
                onChange={(e) => updatePeriod(i, 'percent', parseInt(e.target.value, 10) || 0)}
                className="admin-form-input"
                style={{ width: 80 }}
              />
              <span style={{ color: '#71717a' }}>%</span>
              <button type="button" onClick={() => removePeriod(i)} className="admin-btn admin-btn-danger" style={{ padding: '8px 12px' }}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={addPeriod} className="admin-btn" style={{ background: 'rgba(255,255,255,0.1)' }} disabled={saving}>
            Add period
          </button>
          <button type="button" onClick={handleSavePeriods} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save periods'}
          </button>
        </div>
      </div>

      <div className="admin-form-card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Features selection lever</h3>
        <p style={{ margin: '0 0 12px', fontSize: 13, color: '#71717a' }}>
          Comma-separated list, e.g. 2x, 5x, 10x, 20x, 30x
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={leversStr}
            onChange={(e) => setLeversStr(e.target.value)}
            placeholder="2x, 5x, 10x, 20x, 30x"
            className="admin-form-input"
            style={{ flex: 1 }}
          />
          <button type="button" onClick={handleSaveLevers} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="admin-form-card">
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Customer support links</h3>
        {customerLinks.map((link) => (
          <div key={link.id} className="admin-form-group" style={{ marginBottom: 20 }}>
            <label className="admin-form-label">{link.label}</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => setCustomerLink(link.id, e.target.value)}
              placeholder={link.id === 'telegram' ? 'https://t.me/...' : 'https://wa.me/...'}
              className="admin-form-input"
            />
          </div>
        ))}
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
