import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts'
import type { UTCTimestamp } from 'lightweight-charts'
import type { Candle } from '../hooks/useFeaturesTrading'

interface TradingChartProps {
  candles: Candle[]
  height?: number
}

function toChartData(candles: Candle[]) {
  return candles.map((c) => ({
    time: Math.floor(c.time / 1000) as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }))
}

export function TradingChart({ candles, height = 380 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null)
  const seriesRef = useRef<ReturnType<ReturnType<typeof createChart>['addSeries']> | null>(null)

  useEffect(() => {
    if (!containerRef.current || candles.length === 0) return

    const data = toChartData(candles)

    if (!chartRef.current) {
      const chart = createChart(containerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'rgba(0,0,0,0.2)' },
          textColor: '#a1a1aa',
          fontFamily: 'DM Sans, system-ui, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.06)' },
          horzLines: { color: 'rgba(255,255,255,0.06)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255,255,255,0.1)',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: 'rgba(255,255,255,0.1)',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          vertLine: { labelBackgroundColor: '#22c55e' },
          horzLine: { labelBackgroundColor: '#22c55e' },
        },
        handleScroll: {
          vertTouchDrag: true,
          horzTouchDrag: true,
        },
      })

      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderUpColor: '#22c55e',
        borderDownColor: '#ef4444',
      })

      candlestickSeries.setData(data)
      chart.timeScale().fitContent()
      chartRef.current = chart
      seriesRef.current = candlestickSeries
    } else {
      const series = seriesRef.current
      if (series) series.setData(toChartData(candles))
    }
  }, [candles])

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
    }
  }, [])

  if (candles.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 10,
          color: 'var(--text-muted)',
          fontSize: 14,
        }}
      >
        Loading chart…
      </div>
    )
  }

  return <div ref={containerRef} style={{ height, width: '100%', borderRadius: 10 }} />
}
