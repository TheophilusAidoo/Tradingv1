import { useLanguage } from '../contexts/LanguageContext'

interface ChangePasswordViewProps {
  open: boolean
  onClose: () => void
  onLoginPasswordClick?: () => void
  onWithdrawalPasswordClick?: () => void
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

const MENU_ITEMS = [
  { id: 'login' as const, labelKey: 'changePassword.loginPassword' as const, icon: KeyIcon },
  { id: 'withdrawal' as const, labelKey: 'changePassword.withdrawalPassword' as const, icon: LockIcon },
] as const

export function ChangePasswordView({ open, onClose, onLoginPasswordClick, onWithdrawalPasswordClick }: ChangePasswordViewProps) {
  const { t } = useLanguage()

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Change password"
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
      {/* Header - same as Language section */}
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
          {t('changePassword.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      {/* Content - centered card like Language section */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
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
          {MENU_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'login') onLoginPasswordClick?.()
                else if (item.id === 'withdrawal') onWithdrawalPasswordClick?.()
              }}
              style={menuItemStyle(i < MENU_ITEMS.length - 1)}
            >
              <item.icon />
              <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
              <ChevronIcon />
            </button>
          ))}
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

function KeyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
