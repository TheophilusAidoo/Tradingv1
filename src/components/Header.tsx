interface HeaderProps {
  onProfileClick?: () => void
  onLogoClick?: () => void
}

export function Header({ onProfileClick, onLogoClick }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 max(20px, env(safe-area-inset-right)) 0 max(20px, env(safe-area-inset-left))',
        background: 'rgba(10, 10, 11, 0.85)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <button
        type="button"
        onClick={onLogoClick}
        aria-label="Home"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#22c55e',
          }}
        >
          R
        </div>
        <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '0.02em' }}>
          RIVER
        </span>
      </button>
      <button
        type="button"
        aria-label="Profile"
        onClick={onProfileClick}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0a0a0b',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </button>
    </header>
  )
}
