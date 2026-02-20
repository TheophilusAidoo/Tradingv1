import { useEffect, useRef } from 'react'

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    const dots: { x: number; y: number; vx: number; vy: number }[] = []
    const count = 80
    const connectionDist = 140
    const dotRadius = 2.2
    const speed = 0.7

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initDots()
    }

    function initDots() {
      if (!canvas) return
      dots.length = 0
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
        })
      }
    }

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      dots.forEach((d, i) => {
        d.x += d.vx
        d.y += d.vy
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1

        ctx.beginPath()
        ctx.arc(d.x, d.y, dotRadius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
        ctx.fill()

        for (let j = i + 1; j < dots.length; j++) {
          const other = dots[j]
          const dx = d.x - other.x
          const dy = d.y - other.y
          const dist = Math.hypot(dx, dy)
          if (dist < connectionDist) {
            ctx.beginPath()
            ctx.moveTo(d.x, d.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.18 * (1 - dist / connectionDist)})`
            ctx.lineWidth = 1.2
            ctx.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  )
}
