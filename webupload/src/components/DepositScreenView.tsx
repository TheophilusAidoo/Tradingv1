import { useState, useEffect } from 'react'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiCreateDeposit } from '../data/apiBridge'

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''

function buildImageUrl(pathOrUrl: string | null | undefined, subdir: string): string {
  if (!pathOrUrl?.trim()) return ''
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  const filename = pathOrUrl.replace(/^.*\//, '')
  if (filename && API_BASE) {
    const base = API_BASE.replace(/\/$/, '')
    const path = base.startsWith('/') ? base : `/${base}`
    return `${window.location.origin}${path}/${subdir}/${encodeURIComponent(filename)}`
  }
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${window.location.origin}${p}`
}

function buildQrImageUrl(qrCodeUrl: string | null | undefined, depositLink: string): string {
  if (qrCodeUrl && qrCodeUrl.trim()) {
    if (qrCodeUrl.startsWith('http')) return qrCodeUrl
    const filename = qrCodeUrl.replace(/^.*\//, '')
    if (filename && API_BASE) {
      const base = API_BASE.replace(/\/$/, '')
      const path = base.startsWith('/') ? base : `/${base}`
      return `${window.location.origin}${path}/qrcode/${encodeURIComponent(filename)}`
    }
    const path = qrCodeUrl.startsWith('/') ? qrCodeUrl : `/${qrCodeUrl}`
    return `${window.location.origin}${path}`
  }
  return depositLink ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(depositLink)}` : ''
}

interface DepositScreenViewProps {
  open: boolean
  onClose: () => void
  initialCurrency?: string
  onOpenDepositHistory?: () => void
}

export function DepositScreenView({ open, onClose, initialCurrency = 'USDT', onOpenDepositHistory }: DepositScreenViewProps) {
  const { currentUser } = useVerification()
  const paymentMethods = usePaymentMethods()
  const hasPaymentMethods = paymentMethods.length > 0

  const resolveInitialId = (): string => {
    if (!hasPaymentMethods) return initialCurrency
    const byId = paymentMethods.find((m) => m.id === initialCurrency)
    if (byId) return initialCurrency
    const byLabel = paymentMethods.find((m) => m.label?.toUpperCase() === initialCurrency?.toUpperCase())
    if (byLabel) return byLabel.id
    return paymentMethods[0]?.id ?? initialCurrency
  }
  const [selectedId, setSelectedId] = useState(() => initialCurrency)
  const [qrFallback, setQrFallback] = useState(false)
  const [qrLoading, setQrLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedId(resolveInitialId())
      setQrFallback(false)
    }
  }, [open, initialCurrency, hasPaymentMethods, paymentMethods])

  useEffect(() => {
    setQrFallback(false)
    setQrLoading(true)
  }, [selectedId])

  const balanceFrozen = !!currentUser?.balanceFrozen
  const canSubmit = isApiConfigured() && currentUser && !balanceFrozen && amount && parseFloat(amount) > 0 && proofFile

  const currency = hasPaymentMethods ? paymentMethods.find((m) => m.id === selectedId) ?? paymentMethods[0] : null
  const depositAddress: string = currency?.walletAddress ?? ''
  const displayLabel = currency?.label ?? ''
  const minAmount = currency?.minAmount ?? ''
  const unit = currency?.unit ?? ''
  const depositLink = displayLabel && depositAddress ? `${displayLabel}:${depositAddress}` : ''
  const fallbackQr = depositLink ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(depositLink)}` : ''
  const adminQr = currency?.qrCodeUrl ? buildQrImageUrl(currency.qrCodeUrl, depositLink) : ''
  const qrSrc = qrFallback || !adminQr ? fallbackQr : adminQr
  const pm = currency ?? null

  const copyAddress = () => {
    void navigator.clipboard.writeText(depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser || !proofFile) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('userId', currentUser.id)
      formData.append('userEmail', currentUser.email ?? '')
      formData.append('amount', amount)
      formData.append('currency', unit)
      formData.append('network', currency?.network ?? displayLabel)
      formData.append('paymentProof', proofFile)
      const res = await apiCreateDeposit(formData)
      if (res.success) {
        setAmount('')
        setProofFile(null)
        onOpenDepositHistory?.()
        onClose()
      } else {
        setSubmitError(res.error ?? 'Failed to submit')
      }
    } catch (e) {
      setSubmitError((e as Error).message ?? 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setProofFile(null)
      setSubmitError(null)
    }
  }, [open])

  if (!open) return null

  if (balanceFrozen) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Deposit"
        className="deposit-screen-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 65,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 400,
            padding: 32,
            textAlign: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ color: 'var(--negative)', fontSize: 14, margin: 0 }}>Your balance has been frozen. You cannot deposit. Please contact support.</p>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 20,
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  if (!hasPaymentMethods) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Deposit"
        className="deposit-screen-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 65,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 520,
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 14,
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ margin: 0 }}>No payment methods configured. Please contact support.</p>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 20,
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'rgba(255,255,255,0.08)',
              color: 'var(--text)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Deposit"
      className="deposit-screen-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="deposit-screen-scroll">
      <div
        className="deposit-screen-card"
        style={{
          background: 'var(--card)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Back"
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              color: 'var(--text)',
            }}
          >
            <BackIcon />
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--text)',
              flex: 1,
              textAlign: 'center',
            }}
          >
            DEPOSIT
          </h1>
          {onOpenDepositHistory ? (
            <button
              type="button"
              onClick={onOpenDepositHistory}
              aria-label="Deposit History"
              style={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10,
                color: 'var(--text)',
              }}
            >
              <HistoryIcon />
            </button>
          ) : (
            <span style={{ width: 40 }} />
          )}
        </div>

      <div
        className="deposit-screen-body"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '14px 16px 18px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Currency type */}
        <div className="deposit-form-section" style={{ marginBottom: 12 }}>
          <label style={labelStyle}>CURRENCY TYPE</label>
          <button
            type="button"
            onClick={() => setShowCurrencyPicker(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: 15,
            }}
          >
            <span>{displayLabel}</span>
            <ChevronIcon />
          </button>
        </div>

        {/* Network */}
        <div className="deposit-form-section" style={{ marginBottom: 12 }}>
          <label style={labelStyle}>NETWORK</label>
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(34,197,94,0.15)',
              color: 'var(--accent)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {currency?.network ?? ''}
          </div>
        </div>

        {/* Deposit address + QR */}
        <div
          className="deposit-address-block"
          style={{
            background: 'var(--card)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '14px 16px',
            marginBottom: 14,
            textAlign: 'center',
          }}
        >
          <div style={labelStyle}>DEPOSIT ADDRESS</div>
          <div className="deposit-qr-wrap" style={{ position: 'relative', width: 120, height: 120, margin: '10px auto', borderRadius: 8, background: 'rgba(0,0,0,0.2)' }}>
            {qrLoading && adminQr && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                Loading…
              </div>
            )}
            <img
              src={qrSrc}
              alt="Deposit QR"
              className="deposit-qr-img"
              style={{ width: 120, height: 120, borderRadius: 8, display: 'block' }}
              onLoad={() => setQrLoading(false)}
              onError={() => {
                setQrFallback(true)
                setQrLoading(false)
              }}
            />
          </div>
          <div className="deposit-address-row">
            <div className="deposit-address-text-wrap">
              <span className="deposit-address-text">{depositAddress}</span>
            </div>
            <button
              type="button"
              onClick={copyAddress}
              aria-label="Copy address"
              className="deposit-copy-btn"
              title="Copy address"
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="deposit-form-section" style={{ marginBottom: 10 }}>
          <label style={labelStyle}>AMOUNT</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`0.00 ${unit}`}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'var(--card)',
              color: 'var(--text)',
              fontSize: 15,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <p style={{ fontSize: 11, color: 'var(--negative)', marginBottom: 12, lineHeight: 1.4 }}>
          Minimum recharge amount: {minAmount} {unit}, recharges less than the minimum amount will not
          be credited and cannot be refunded.
        </p>

        {isApiConfigured() && (
          <div className="deposit-form-section" style={{ marginBottom: 14 }}>
            <label style={labelStyle}>PAYMENT PROOF (required)</label>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              Upload a screenshot of your transaction after you send the funds. Admin will verify and credit your account.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              className="admin-form-input"
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'var(--card)',
                color: 'var(--text)',
                fontSize: 14,
                boxSizing: 'border-box',
              }}
            />
            {proofFile && (
              <span style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, display: 'block' }}>
                Selected: {proofFile.name}
              </span>
            )}
          </div>
        )}

        {submitError && (
          <div style={{ padding: 10, marginBottom: 12, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 12 }}>
            {submitError}
          </div>
        )}

        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            marginBottom: 0,
            lineHeight: 1.45,
          }}
        >
          Choose the correct network—wrong network may cause loss. Recharge address rarely changes. Keep your device secure.
        </p>
      </div>

        {/* Fixed footer - submit button always visible on mobile */}
        <div
          className="deposit-screen-footer"
          style={{
            flexShrink: 0,
            padding: '12px 16px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'var(--card)',
          }}
        >
          <button
            type="button"
            onClick={canSubmit ? handleSubmit : undefined}
            disabled={!canSubmit || submitting}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: 'none',
              background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
              color: canSubmit ? '#fff' : 'var(--text)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Submitting…' : isApiConfigured() ? 'SUBMIT DEPOSIT REQUEST' : 'DEPOSIT'}
          </button>
        </div>
      </div>
      </div>

      {/* Currency picker overlay */}
      {showCurrencyPicker && (
        <div
          className="deposit-currency-picker-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 70,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowCurrencyPicker(false)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: 16,
              padding: 16,
              width: '100%',
              maxWidth: 320,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Select payment method</div>
            {paymentMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedId(m.id)
                  setShowCurrencyPicker(false)
                }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  marginBottom: 8,
                  borderRadius: 10,
                  border: 'none',
                  background: selectedId === m.id ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  color: 'var(--text)',
                  fontSize: 15,
                  textAlign: 'left',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
  letterSpacing: '0.02em',
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
