import { useState, useEffect, useCallback } from 'react'
import { fetchBinanceKlines, fetchBinanceTicker24hForSymbol, type BinanceKline } from '../api/binance'

const TIMEFRAME_TO_INTERVAL: Record<string, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '30m': '30m',
  '1h': '1h',
  '4h': '4h',
  '1D': '1d',
}

const KLINE_POLL_MS = 8000

export interface Candle {
  open: number
  high: number
  low: number
  close: number
  time: number
}

export interface Stats24h {
  lowPrice: number
  highPrice: number
  volume: number
  lastPrice: number
  priceChangePercent: number
}

function parseKlines(klines: BinanceKline[]): Candle[] {
  return klines.map((k) => ({
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    time: k[0],
  }))
}

export function useFeaturesTrading(symbol: string, timeframe: string) {
  const [candles, setCandles] = useState<Candle[]>([])
  const [stats24h, setStats24h] = useState<Stats24h | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const interval = TIMEFRAME_TO_INTERVAL[timeframe] ?? '1m'

  const fetchData = useCallback(async () => {
    try {
      const [klinesRes, statsRes] = await Promise.all([
        fetchBinanceKlines(symbol, interval, 60),
        fetchBinanceTicker24hForSymbol(symbol),
      ])
      setCandles(parseKlines(klinesRes))
      setStats24h({
        lowPrice: statsRes.lowPrice,
        highPrice: statsRes.highPrice,
        volume: statsRes.volume,
        lastPrice: statsRes.lastPrice,
        priceChangePercent: statsRes.priceChangePercent,
      })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [symbol, interval])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const id = setInterval(fetchData, KLINE_POLL_MS)
    return () => clearInterval(id)
  }, [fetchData])

  return { candles, stats24h, loading, error }
}
