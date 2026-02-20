import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiSetWithdrawalAddress } from '../data/apiBridge'
import { setUserWithdrawalAddress } from '../data/verificationStore'

interface WithdrawalAddressViewProps {
  open: boolean
  onClose: () => void
}

const NETWORK_OPTIONS = ['USDT (TRC20)', 'USDT (ERC20)', 'ETH', 'BTC']

export function WithdrawalAddressView({ open, onClose }: WithdrawalAddressViewProps) {
  const { t } = useLanguage()
  const { currentUser, refreshUser } = useVerification()
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORK_OPTIONS[0])
  const [walletAddress, setWalletAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      refreshUser()
      setError(null)
    }
  }, [open, refreshUser])

  useEffect(() => {
    if (open && currentUser) {
      setSelectedNetwork((currentUser.mainWithdrawalNetwork as string) || NETWORK_OPTIONS[0])
      setWalletAddress(currentUser.mainWithdrawalAddress ?? '')
    }
  }, [open, currentUser?.mainWithdrawalAddress, currentUser?.mainWithdrawalNetwork])

  const handleSave = async () => {
    const trimmed = walletAddress.trim()
    if (!trimmed) return
    if (!currentUser?.id) {
      setError('Please log in to save your address')
      return
    }
    setError(null)
    setSaving(true)
    try {
      if (isApiConfigured()) {
        await apiSetWithdrawalAddress(currentUser.id, trimmed, selectedNetwork)
      } else {
        setUserWithdrawalAddress(currentUser.id, trimmed, selectedNetwork)
      }
      refreshUser()
      onClose()
    } catch (e) {
      setError((e as Error).message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crypto address management"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,11,0.9)',
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
            textAlign: 'center',
            flex: 1,
          }}
        >
          {t('withdrawalAddress.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div style={{ overflowY: 'auto', padding: '20px 16px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '20px 18px',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #1a0a2e 100%)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <WalletIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 6,
                }}
              >
                {t('withdrawalAddress.title')}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}
              >
                Set your main withdrawal address for crypto payouts.
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />

          <div style={{ padding: '20px 18px' }}>
            {error && (
              <div style={{ padding: 12, marginBottom: 16, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 13 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
                {t('withdrawalAddress.currencyType')}
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                }}
              >
                {NETWORK_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.02em' }}>
                WALLET ADDRESS
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Paste your wallet address"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!walletAddress.trim() || saving}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: walletAddress.trim() && !saving ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: walletAddress.trim() && !saving ? 'pointer' : 'not-allowed',
              }}
            >
              {saving ? 'Saving…' : t('withdrawalAddress.addAddress')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function WalletIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <path d="M19 14h.01" />
    </svg>
  )
}
