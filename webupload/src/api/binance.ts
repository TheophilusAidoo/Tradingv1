const BINANCE_BASE = 'https://api.binance.com/api/v3'

export interface BinanceTickerRow {
  symbol: string
  lastPrice: string
  priceChangePercent: string
  lowPrice?: string
  highPrice?: string
  volume?: string
}

export async function fetchBinanceTicker24h(): Promise<BinanceTickerRow[]> {
  const res = await fetch(`${BINANCE_BASE}/ticker/24hr`)
  if (!res.ok) throw new Error('Failed to fetch prices')
  const data = await res.json()
  return data
}

/** Single-symbol 24h ticker for low, high, volume */
export async function fetchBinanceTicker24hForSymbol(symbol: string): Promise<{
  lastPrice: number
  priceChangePercent: number
  lowPrice: number
  highPrice: number
  volume: number
}> {
  const binanceSymbol = toBinanceSymbol(symbol)
  const res = await fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${binanceSymbol}`)
  if (!res.ok) throw new Error('Failed to fetch 24h stats')
  const d = await res.json()
  return {
    lastPrice: parseFloat(d.lastPrice),
    priceChangePercent: parseFloat(d.priceChangePercent),
    lowPrice: parseFloat(d.lowPrice ?? 0),
    highPrice: parseFloat(d.highPrice ?? 0),
    volume: parseFloat(d.volume ?? 0),
  }
}

/** Kline: [openTime, open, high, low, close, volume, ...] */
export type BinanceKline = [number, string, string, string, string, string, ...unknown[]]

export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit = 60
): Promise<BinanceKline[]> {
  const binanceSymbol = toBinanceSymbol(symbol)
  const url = `${BINANCE_BASE}/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch klines')
  const data = await res.json()
  return data
}

export function toBinanceSymbol(pair: string): string {
  return pair.replace('/', '')
}
