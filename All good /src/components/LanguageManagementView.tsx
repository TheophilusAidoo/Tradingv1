import { useLanguage } from '../contexts/LanguageContext'
import type { Locale } from '../data/translations'
import { LOCALE_LABELS } from '../data/translations'

const LOCALES: Locale[] = ['zh', 'en', 'pt', 'de', 'ru', 'fr', 'es', 'it', 'id']

interface LanguageManagementViewProps {
  open: boolean
  onClose: () => void
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

export function LanguageManagementView({ open, onClose }: LanguageManagementViewProps) {
  const { locale, setLocale, t } = useLanguage()

  if (!open) return null

  const handleSelect = (next: Locale) => {
    setLocale(next)
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Language management"
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
      {/* Header - same as Customer Service */}
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
          {t('languageManagement.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      {/* Content - centered card like Customer Service */}
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
          {LOCALES.map((loc, i) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              style={menuItemStyle(i < LOCALES.length - 1)}
            >
              <GlobeIcon />
              <span style={{ flex: 1 }}>{LOCALE_LABELS[loc]}</span>
              {locale === loc ? (
                <span style={{ color: 'var(--accent)' }}>
                  <CheckIcon />
                </span>
              ) : (
                <ChevronIcon />
              )}
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

function GlobeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
