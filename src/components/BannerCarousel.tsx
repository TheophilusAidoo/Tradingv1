import { useState, useEffect, useCallback } from 'react'
import { RiverLogo } from './RiverLogo'

const SLIDE_DURATION_MS = 4500
const SLIDES = [
  {
    id: 'mission',
    title: 'Our mission',
    subtitle: 'Increase economic freedom in the world. Everyone must have access.',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
    rightContent: (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 22, height: 18, background: 'rgba(255,255,255,0.9)', borderRadius: 4 }} />
          <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,0.95)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#f59e0b' }}>₿</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ width: 18, height: 28, background: 'rgba(255,255,255,0.7)', borderRadius: 4 }} />
          <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.85)', borderRadius: 4 }} />
        </div>
      </div>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    subtitle: 'All-round financial wind control system and anti-theft system.',
    gradient: 'linear-gradient(135deg, #0c8bd4 0%, #4f46e5 50%, #7c3aed 100%)',
    rightContent: (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
        <div style={{ width: 28, height: 22, background: 'rgba(34,197,94,0.9)', borderRadius: 4 }} />
        <div style={{ width: 32, height: 32, background: 'rgba(139,92,246,0.95)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>✓</span>
        </div>
        <div style={{ width: 24, height: 24, background: 'rgba(56,189,248,0.9)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>₿</div>
        <div style={{ width: 22, height: 22, background: 'rgba(56,189,248,0.85)', borderRadius: 6 }} />
      </div>
    ),
  },
  {
    id: 'global',
    title: 'Global Exchange',
    subtitle: 'Global Business Service Network Coverage, Invest in Global Encrypted.',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #4338ca 50%, #6d28d9 100%)',
    rightContent: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'rgba(56,189,248,0.4)',
            border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fbbf24',
          }}
        >
          ◐
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ width: 20, height: 18, background: 'rgba(255,255,255,0.8)', borderRadius: 4 }} />
          <div style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.9)', borderRadius: 6 }} />
        </div>
      </div>
    ),
  },
] as const

export function BannerCarousel() {
  const [index, setIndex] = useState(0)

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % SLIDES.length)
  }, [])

  useEffect(() => {
    const id = setInterval(goNext, SLIDE_DURATION_MS)
    return () => clearInterval(id)
  }, [goNext])

  const slide = SLIDES[index]

  return (
    <div
      style={{
        position: 'relative',
        background: slide.gradient,
        padding: '16px 20px 40px',
        overflow: 'hidden',
      }}
    >
      {/* In-banner animation: bigger, faster */}
      <div
        className="banner-bg-animation"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.5,
        }}
        aria-hidden
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
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
            {slide.title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.45,
              color: 'rgba(255,255,255,0.92)',
              maxWidth: '26ch',
            }}
          >
            {slide.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {slide.rightContent}
          <RiverLogo size={40} />
        </div>
      </div>

      {/* Carousel dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          zIndex: 2,
        }}
      >
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? 10 : 6,
              height: 6,
              borderRadius: 3,
              border: 'none',
              background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
              padding: 0,
              cursor: 'pointer',
              transition: 'width 0.2s ease, background 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
