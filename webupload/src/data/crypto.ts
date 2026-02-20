export interface CryptoPair {
  symbol: string
  name: string
  lastPrice: number
  change24h: number
  icon?: string
}

/** Static metadata for symbols we display; prices come from live API. */
export const CRYPTO_LIST_META: { symbol: string; name: string }[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin' },
  { symbol: 'ETH/USDT', name: 'Ethereum' },
  { symbol: 'BNB/USDT', name: 'BNB' },
  { symbol: 'SOL/USDT', name: 'Solana' },
  { symbol: 'ADA/USDT', name: 'Cardano' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin' },
  { symbol: 'TRX/USDT', name: 'TRON' },
  { symbol: 'TON/USDT', name: 'Toncoin' },
  { symbol: 'LTC/USDT', name: 'Litecoin' },
  { symbol: 'BCH/USDT', name: 'Bitcoin Cash' },
  { symbol: 'UNI/USDT', name: 'Uniswap' },
  { symbol: 'FIL/USDT', name: 'Filecoin' },
  { symbol: 'AVAX/USDT', name: 'Avalanche' },
  { symbol: 'LINK/USDT', name: 'Chainlink' },
  { symbol: 'XRP/USDT', name: 'XRP' },
]

function formatPrice(value: number): string {
  if (value === 0) return '—'
  if (value >= 1000) return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (value >= 1) return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })
}

export function formatCryptoPrice(value: number): string {
  return formatPrice(value)
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
