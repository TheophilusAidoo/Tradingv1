/**
 * Stylized cityscape/document icon for empty orders state.
 * Central document with lines, buildings, clouds, trees, base.
 */
export function OrdersEmptyIcon({ size = 120 }: { size?: number }) {
  const w = size
  const h = size * 0.85
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 102"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', margin: '0 auto' }}
      aria-hidden
    >
      {/* Clouds */}
      <ellipse cx="72" cy="18" rx="14" ry="8" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="32" cy="24" rx="10" ry="6" fill="rgba(255,255,255,0.4)" />
      {/* Left building */}
      <rect x="8" y="38" width="22" height="52" rx="2" fill="rgba(255,255,255,0.25)" />
      {/* Right building */}
      <rect x="90" y="30" width="22" height="60" rx="2" fill="rgba(255,255,255,0.3)" />
      {/* Central document building */}
      <rect x="38" y="36" width="44" height="38" rx="3" fill="rgba(255,255,255,0.2)" />
      {/* Document lines */}
      <line x1="46" y1="46" x2="74" y2="46" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="54" x2="74" y2="54" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      <line x1="46" y1="62" x2="74" y2="62" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      {/* Base/drawer under document */}
      <rect x="42" y="74" width="36" height="8" rx="1" fill="rgba(255,255,255,0.35)" />
      {/* Trees */}
      <path d="M26 88 L32 76 L38 88 Z" fill="rgba(255,255,255,0.4)" />
      <path d="M82 88 L88 76 L94 88 Z" fill="rgba(255,255,255,0.4)" />
      {/* Ground curve */}
      <path d="M4 98 Q60 92 116 98" stroke="rgba(255,255,255,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
