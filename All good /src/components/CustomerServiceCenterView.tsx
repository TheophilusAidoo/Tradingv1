import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { isApiConfigured, apiGetCustomerLinks } from '../data/apiBridge'

const CUSTOMER_LINKS_KEY = 'river_admin_customer_links'

interface CustomerLink {
  id: string
  label: string
  url: string
}

function loadCustomerLinksFromStorage(): CustomerLink[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_LINKS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CustomerLink[]
      if (Array.isArray(parsed)) return parsed.filter((l) => l.url?.trim())
    }
  } catch (_) {}
  return []
}

interface CustomerServiceCenterViewProps {
  open: boolean
  onClose: () => void
  onOpenChat?: () => void
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

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function TelegramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export function CustomerServiceCenterView({ open, onClose, onOpenChat }: CustomerServiceCenterViewProps) {
  const { t } = useLanguage()
  const [links, setLinks] = useState<CustomerLink[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    if (isApiConfigured()) {
      apiGetCustomerLinks()
        .then((data) => setLinks(data.filter((l) => l.url?.trim())))
        .catch(() => setLinks(loadCustomerLinksFromStorage()))
        .finally(() => setLoading(false))
    } else {
      setLinks(loadCustomerLinksFromStorage())
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('customerService.title')}
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
      {/* Header - same as Account Info */}
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
          {t('customerService.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      {/* Content - centered card like Account Info / Language Management */}
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
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              {t('customerService.loading')}
            </div>
          ) : (
            <>
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenChat()
                  }}
                  style={{
                    ...menuItemStyle(true),
                    width: '100%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <ChatIcon />
                  <span style={{ flex: 1 }}>River Customer Service</span>
                  <ChevronIcon />
                </button>
              )}
              {links.length === 0 && !onOpenChat ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
                  {t('customerService.noLinks')}
                </div>
              ) : (
                links.map((link, i) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...menuItemStyle(i < links.length - 1),
                      textDecoration: 'none',
                      display: 'flex',
                    }}
                  >
                    {link.id === 'telegram' ? <TelegramIcon /> : <WhatsAppIcon />}
                    <span style={{ flex: 1 }}>{link.label}</span>
                    <ChevronIcon />
                  </a>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
