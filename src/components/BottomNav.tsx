import { useLanguage } from '../contexts/LanguageContext'
import type { TranslationKey } from '../data/translations'

export type NavTab = 'home' | 'market' | 'trade' | 'features' | 'wallets'

const navKeys: Record<NavTab, TranslationKey> = {
  home: 'nav.home',
  market: 'nav.market',
  trade: 'nav.trade',
  features: 'nav.features',
  wallets: 'nav.wallets',
}

const navItems: { id: NavTab; icon: React.ComponentType<{ active?: boolean }> }[] = [
  { id: 'home', icon: HomeIcon },
  { id: 'market', icon: ChartIcon },
  { id: 'trade', icon: TradeIcon },
  { id: 'features', icon: StarIcon },
  { id: 'wallets', icon: WalletIcon },
]

interface BottomNavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  /** Hide on mobile & tablet when deposit screen is open */
  hidden?: boolean
}

export function BottomNav({ activeTab, onTabChange, hidden }: BottomNavProps) {
  const { t } = useLanguage()
  return (
    <div
      className={`bottom-nav-wrapper${hidden ? ' bottom-nav-hidden-mobile' : ''}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        padding: `12px max(12px, env(safe-area-inset-left)) max(20px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-right))`,
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <nav
        className="bottom-nav"
        style={{
          height: 72,
          flex: '1 1 0',
          minWidth: 0,
          maxWidth: 440,
          background: 'var(--card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
          pointerEvents: 'auto',
        }}
        aria-label="Main navigation"
      >
      {navItems.map(({ id, icon: Icon }) => {
        const label = t(navKeys[id])
        const active = activeTab === id
        return (
          <button
            key={id}
            type="button"
            className="bottom-nav-item"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onTabChange(id)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              flex: '1 1 0',
              minWidth: 0,
              background: 'none',
              border: 'none',
              color: active ? 'var(--accent)' : 'var(--text)',
              padding: '8px 4px',
            }}
          >
            <Icon active={active} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.02em',
                borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                paddingBottom: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
      </nav>
    </div>
  )
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'currentColor'}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  )
}
function ChartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
    </svg>
  )
}
function TradeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 17L17 7M17 7h-8M17 7v8" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}
function WalletIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}
