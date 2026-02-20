const actions = [
  { id: 'deposit', label: 'DEPOSIT', icon: '↓' },
  { id: 'withdraw', label: 'WITHDRAW', icon: '↑' },
  { id: 'staking', label: 'STAKING', icon: '◆' },
  { id: 'services', label: 'SERVICES', icon: '☰' },
] as const

interface ActionButtonsProps {
  onStakingClick?: () => void
  onDepositClick?: () => void
  onWithdrawClick?: () => void
  onServicesClick?: () => void
}

export function ActionButtons({ onStakingClick, onDepositClick, onWithdrawClick, onServicesClick }: ActionButtonsProps) {
  return (
    <div
      className="action-buttons"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: '20px 20px 16px',
      }}
    >
      {actions.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (id === 'staking') onStakingClick?.()
            else if (id === 'deposit') onDepositClick?.()
            else if (id === 'withdraw') onWithdrawClick?.()
            else if (id === 'services') onServicesClick?.()
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
          }}
        >
          <span
            className="action-btn-icon"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            {icon === '↓' && <ArrowDown />}
            {icon === '↑' && <ArrowUp />}
            {icon === '◆' && <StakingIcon />}
            {icon === '☰' && <GridIcon />}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.04em' }}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}

function ArrowDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}
function ArrowUp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}
function StakingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
