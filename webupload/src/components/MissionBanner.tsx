export function MissionBanner() {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
        padding: '20px 20px 24px',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div>
        <h2
          style={{
            margin: '0 0 8px',
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          Our mission
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.92)',
            maxWidth: '28ch',
          }}
        >
          Increase economic freedom in the world. Everyone must have access.
        </p>
      </div>
      <div
        style={{
          width: 100,
          height: 80,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: 4,
        }}
        aria-hidden
      >
        {/* Abstract blocks + Bitcoin B */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 24, height: 20, background: 'rgba(255,255,255,0.9)', borderRadius: 4 }} />
          <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.95)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#f59e0b' }}>₿</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 20, height: 32, background: 'rgba(255,255,255,0.7)', borderRadius: 4 }} />
          <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.85)', borderRadius: 4 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 18, height: 24, background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
          <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.9)', borderRadius: 6 }} />
        </div>
      </div>
    </div>
  )
}
