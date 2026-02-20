export function RiverLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}
      aria-hidden
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: size * 0.5,
          color: '#22c55e',
        }}
      >
        R
      </span>
    </div>
  )
}
