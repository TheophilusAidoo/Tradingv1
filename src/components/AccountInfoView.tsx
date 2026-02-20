import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const MENU_GROUP_1 = [
  { id: 'language', label: 'LANGUAGE', icon: GlobeIcon },
  { id: 'withdrawal', label: 'WITHDRAWAL ADDRESS', icon: LinkIcon },
  { id: 'password', label: 'PASSWORD', icon: KeyIcon },
] as const

const MENU_GROUP_2 = [
  { id: 'notifications', label: 'NOTIFICATIONS', icon: BellIcon },
  { id: 'invitation', label: 'MY INVITATION', icon: PersonDocIcon },
  { id: 'about', label: 'ABOUT US', icon: InfoIcon },
  { id: 'msb', label: 'MSB APPROVAL', icon: ShieldIcon },
  { id: 'logout', label: 'LOG OUT', icon: LogOutIcon },
] as const

const MENU_GROUP_1_KEYS = ['accountInfo.menu.language', 'accountInfo.menu.withdrawalAddress', 'accountInfo.menu.password'] as const
const MENU_GROUP_2_KEYS = ['accountInfo.menu.notifications', 'accountInfo.menu.myInvitation', 'accountInfo.menu.aboutUs', 'accountInfo.menu.msbApproval', 'accountInfo.menu.logOut'] as const

interface AccountInfoViewProps {
  open: boolean
  onClose: () => void
  onAboutUsClick?: () => void
  onWithdrawalAddressClick?: () => void
  onLanguageClick?: () => void
  onPasswordClick?: () => void
  onMyInvitationClick?: () => void
  onMsbApprovalClick?: () => void
  onNotificationsClick?: () => void
  onLogoutClick?: () => void
  onCustomerServiceClick?: () => void
  email?: string
  /** Referral code the user used to register (from admin) */
  referralCode?: string
  /** Credit score set by admin */
  creditScore?: number
  /** Called when the view opens (e.g. to refresh user data) */
  onOpen?: () => void
}

export function AccountInfoView({ open, onClose, onAboutUsClick, onWithdrawalAddressClick, onLanguageClick, onPasswordClick, onMyInvitationClick, onMsbApprovalClick, onNotificationsClick, onLogoutClick, onCustomerServiceClick, email = 'theophilusaidoo821@gmail.com', referralCode, creditScore = 100, onOpen }: AccountInfoViewProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) onOpen?.()
  }, [open, onOpen])

  const copyCode = () => {
    if (!referralCode) return
    void navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Account info"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
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
          }}
        >
          {t('accountInfo.title')}
        </h1>
        <button
          type="button"
          onClick={onCustomerServiceClick}
          aria-label="Customer service"
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
            cursor: 'pointer',
          }}
        >
          <HeadphoneIcon />
        </button>
      </div>

      <div style={{ overflowY: 'auto', padding: '20px 16px 60px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Single main card: profile + menu groups */}
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
          {/* User info section */}
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
                imageRendering: 'pixelated' as const,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: 6,
                  wordBreak: 'break-all',
                }}
              >
                {email}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 4,
                }}
              >
                CREDIT SCORE: {creditScore}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                <span>REFERRAL CODE: {referralCode ?? '—'}</span>
                {referralCode && (
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Copy referral code"
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    color: 'var(--text)',
                  }}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </button>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />

          {/* First group: LANGUAGE, WITHDRAWAL ADDRESS, PASSWORD */}
          {MENU_GROUP_1.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'language') onLanguageClick?.()
                if (item.id === 'withdrawal') onWithdrawalAddressClick?.()
                if (item.id === 'password') onPasswordClick?.()
              }}
              style={menuItemStyle(i < MENU_GROUP_1.length - 1)}
            >
              <item.icon />
              <span style={{ flex: 1 }}>{t(MENU_GROUP_1_KEYS[i])}</span>
              <ChevronIcon />
            </button>
          ))}

          {/* Subtle separator between groups */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 18px' }} />

          {/* Second group: NOTIFICATIONS, MY INVITATION, ABOUT US, MSB APPROVAL, LOG OUT */}
          {MENU_GROUP_2.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'notifications') onNotificationsClick?.()
                if (item.id === 'about') onAboutUsClick?.()
                if (item.id === 'invitation') onMyInvitationClick?.()
                if (item.id === 'msb') onMsbApprovalClick?.()
                if (item.id === 'logout') onLogoutClick?.()
              }}
              style={menuItemStyle(i < MENU_GROUP_2.length - 1)}
            >
              <item.icon />
              <span style={{ flex: 1 }}>{t(MENU_GROUP_2_KEYS[i])}</span>
              <ChevronIcon />
            </button>
          ))}
        </div>
      </div>

      {/* Version footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '14px 16px',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)',
        }}
      >
        0.3.7
      </div>
    </div>
  )
}

const menuItemStyle = (showBorder: boolean): React.CSSProperties => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 18px',
  border: 'none',
  borderBottom: showBorder ? '1px solid rgba(255,255,255,0.06)' : 'none',
  background: 'transparent',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  letterSpacing: '0.02em',
  textAlign: 'left',
  cursor: 'pointer',
})

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function HeadphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function PersonDocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      <path d="M16 17h6M19 14v6" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function LogOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
