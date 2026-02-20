import { useState, useEffect, useCallback } from 'react'
import { fetchBinanceTicker24h, toBinanceSymbol } from '../api/binance'
import type { CryptoPair } from '../data/crypto'
import { CRYPTO_LIST_META } from '../data/crypto'

const INTERVAL_MS = 2000

function mapTickerToPair(
  meta: { symbol: string; name: string },
  ticker: { lastPrice: string; priceChangePercent: string } | undefined
): CryptoPair {
  if (!ticker) {
    return {
      symbol: meta.symbol,
      name: meta.name,
      lastPrice: 0,
      change24h: 0,
    }
  }
  const lastPrice = parseFloat(ticker.lastPrice)
  const change24h = parseFloat(ticker.priceChangePercent)
  return {
    symbol: meta.symbol,
    name: meta.name,
    lastPrice: Number.isFinite(lastPrice) ? lastPrice : 0,
    change24h: Number.isFinite(change24h) ? change24h : 0,
  }
}

export function useLivePrices(): {
  featured: CryptoPair[]
  list: CryptoPair[]
  loading: boolean
  error: string | null
} {
  const [tickerMap, setTickerMap] = useState<Record<string, { lastPrice: string; priceChangePercent: string }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrices = useCallback(async () => {
    try {
      const rows = await fetchBinanceTicker24h()
      const map: Record<string, { lastPrice: string; priceChangePercent: string }> = {}
      for (const row of rows) {
        map[row.symbol] = {
          lastPrice: row.lastPrice,
          priceChangePercent: row.priceChangePercent,
        }
      }
      setTickerMap(map)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch prices')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, INTERVAL_MS)
    return () => clearInterval(id)
  }, [fetchPrices])

  const featuredMeta = CRYPTO_LIST_META.slice(0, 3)
  const featured: CryptoPair[] = featuredMeta.map((meta) =>
    mapTickerToPair(meta, tickerMap[toBinanceSymbol(meta.symbol)])
  )
  const list: CryptoPair[] = CRYPTO_LIST_META.map((meta) =>
    mapTickerToPair(meta, tickerMap[toBinanceSymbol(meta.symbol)])
  )

  return { featured, list, loading, error }
}
