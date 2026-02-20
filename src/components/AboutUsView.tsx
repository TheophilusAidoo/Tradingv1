import { useLanguage } from '../contexts/LanguageContext'

interface AboutUsViewProps {
  open: boolean
  onClose: () => void
}

const PARAGRAPH_1 =
  'On our journey to build the cryptoeconomy, we are committed to creating a financial system that is more fair, accessible, efficient, and transparent, all enabled by the advancement of cryptocurrency.'

const PARAGRAPH_2 =
  'Looking back to 2000, we embarked with a revolutionary idea: that anyone, anywhere in the world, should be able to transact Bitcoin simply and securely. Today, we proudly offer a reliable and user-friendly platform, enabling people to explore and engage with the vast realm of the cryptoeconomy more deeply.'

export function AboutUsView({ open, onClose }: AboutUsViewProps) {
  const { t } = useLanguage()
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About us"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
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
          {t('aboutUs.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '24px 22px 32px',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--text)',
              textAlign: 'center',
            }}
          >
            {t('aboutUs.title')}
          </h2>
          <p
            style={{
              margin: '0 0 18px',
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--text)',
            }}
          >
            {PARAGRAPH_1}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.6,
              color: 'var(--text)',
            }}
          >
            {PARAGRAPH_2}
          </p>
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
