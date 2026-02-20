import { useState } from 'react'

/**
 * Crypto logos – CoinGecko CDN (primary) + fallback CDNs for reliability.
 * No crossOrigin to avoid CORS preflight blocking image load.
 */
const COINGECKO_IMAGES: Record<string, string> = {
  BTC: '1/small/bitcoin.png',
  ETH: '279/small/ethereum.png',
  BNB: '825/small/bnb-icon2_2x.png',
  SOL: '4128/small/solana.png',
  ADA: '975/small/cardano.png',
  DOGE: '5/small/dogecoin.png',
  TRX: '1958/small/trx.png',
  TON: '17980/small/ton_symbol.png',
  LTC: '2/small/litecoin.png',
  BCH: '780/small/bitcoin-cash.png',
  UNI: '12504/small/uni.png',
  FIL: '2280/small/filecoin.png',
  AVAX: '12559/small/avax.png',
  LINK: '877/small/chainlink-new-logo.png',
  XRP: '52/small/ripple.png',
  USDT: '325/small/Tether.png',
}

const COINGECKO_BASE = 'https://assets.coingecko.com/coins/images'
// jsDelivr mirror – often more reliable for localhost/restricted networks
const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos@main/images'
const COIN_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  TRX: 'tron',
  TON: 'the-open-network',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
  UNI: 'uniswap',
  FIL: 'filecoin',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  XRP: 'ripple',
  USDT: 'tether',
}

function getLogoUrls(symbol: string): string[] {
  const base = symbol.split('/')[0] ?? symbol
  const cgPath = COINGECKO_IMAGES[base]
  const coinId = COIN_IDS[base]
  const urls: string[] = []
  if (cgPath) urls.push(`${COINGECKO_BASE}/${cgPath}`)
  if (coinId) urls.push(`${JSDELIVR_BASE}/${coinId}/50.png`)
  return urls
}

interface CryptoLogoProps {
  symbol: string
  size?: number
  style?: React.CSSProperties
}

export function CryptoLogo({ symbol, size = 28, style }: CryptoLogoProps) {
  const [urlIndex, setUrlIndex] = useState(0)
  const urls = getLogoUrls(symbol)
  const src = urls[urlIndex] ?? null
  const base = symbol.split('/')[0] ?? symbol
  const letter = base.slice(0, 1)

  const fallback = (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        flexShrink: 0,
        ...style,
      }}
    >
      {letter}
    </span>
  )

  const handleError = () => {
    if (urls.length === 0 || urlIndex >= urls.length - 1) {
      setUrlIndex(-1)
    } else {
      setUrlIndex((i) => i + 1)
    }
  }

  if (!src || urlIndex < 0) {
    return fallback
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={handleError}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}
