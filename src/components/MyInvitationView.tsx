import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

interface MyInvitationViewProps {
  open: boolean
  onClose: () => void
  email?: string
  /** Referral code the user used to register (from admin) */
  referralCode?: string
}

const APP_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://river.app'

export function MyInvitationView({ open, onClose, email = 'theophilusaidoo821@gmail.com', referralCode }: MyInvitationViewProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const invitationLink = referralCode ? `${APP_BASE}/?ref=${referralCode}` : APP_BASE

  const copyLink = () => {
    void navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Invite"
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
            flex: 1,
            textAlign: 'center',
          }}
        >
          {t('invite.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 28px' }}>
        {/* User invitation details card */}
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '24px 20px',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #1a0a2e 100%)',
                marginBottom: 12,
              }}
            />
            <div
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: 20,
                wordBreak: 'break-all',
                textAlign: 'center',
              }}
            >
              {email}
            </div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(invitationLink)}`}
              alt="Invitation QR code"
              style={{ width: 140, height: 140, marginBottom: 16, borderRadius: 8 }}
            />
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginBottom: 16,
              }}
            >
              {t('invite.myInvitationCode')}: {referralCode ?? '—'}
            </div>
            <button
              type="button"
              onClick={copyLink}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied' : t('invite.copyInvitationLink')}
            </button>
          </div>
        </div>

        {/* First generation members */}
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '18px 20px',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '0.02em',
              marginBottom: 14,
            }}
          >
            {t('invite.firstGenerationMembers')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('invite.approved')} 0 {t('invite.numbers')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('invite.unapproved')} 0 {t('invite.numbers')}
            </span>
          </div>
        </div>

        {/* Second generation members */}
        <div
          style={{
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '18px 20px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text)',
              letterSpacing: '0.02em',
              marginBottom: 14,
            }}
          >
            {t('invite.secondGenerationMembers')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('invite.approved')} 0 {t('invite.numbers')}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {t('invite.unapproved')} 0 {t('invite.numbers')}
            </span>
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
