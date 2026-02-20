import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { CryptoLogo } from './CryptoLogo'
import type { CryptoPair } from '../data/crypto'
import { DepositHistoryView } from './DepositHistoryView'
import { DepositModal } from './DepositModal'
import { DepositScreenView } from './DepositScreenView'
import { WithdrawalModal } from './WithdrawalModal'
import { WithdrawalHistoryView } from './WithdrawalHistoryView'

/** All crypto assets for the wallet list. USDT first, then all base symbols from price list. */
function getWalletAssets(priceList: CryptoPair[]): { symbol: string; name: string }[] {
  const result: { symbol: string; name: string }[] = [{ symbol: 'USDT', name: 'Tether' }]
  for (const p of priceList) {
    const base = p.symbol.replace('/USDT', '')
    if (base !== 'USDT') result.push({ symbol: base, name: p.name })
  }
  return result
}

interface WalletsViewProps {
  openDepositOnMount?: boolean
  onDepositMountConsumed?: () => void
  openWithdrawalOnMount?: boolean
  onWithdrawalMountConsumed?: () => void
  priceList?: CryptoPair[]
  onOpenWithdrawalAddress?: () => void
  onOpenWithdrawalPassword?: () => void
  onBackToHome?: () => void
  onDepositScreenOpenChange?: (open: boolean) => void
}

export function WalletsView({ openDepositOnMount, onDepositMountConsumed, openWithdrawalOnMount, onWithdrawalMountConsumed, priceList = [], onOpenWithdrawalAddress, onOpenWithdrawalPassword, onBackToHome, onDepositScreenOpenChange }: WalletsViewProps) {
  const { t } = useLanguage()
  const { currentUser, refreshUser } = useVerification()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositScreenOpen, setDepositScreenOpen] = useState(false)
  const [depositHistoryOpen, setDepositHistoryOpen] = useState(false)
  const [withdrawalOpen, setWithdrawalOpen] = useState(false)
  const [withdrawalHistoryOpen, setWithdrawalHistoryOpen] = useState(false)
  const [depositCurrency, setDepositCurrency] = useState('USDT')

  const balanceUsdt = currentUser?.balanceUsdt ?? 0
  const frozenUsdt = currentUser?.frozenUsdt ?? 0
  const availableUsdt = balanceUsdt - frozenUsdt
  const holdings = currentUser?.cryptoHoldings ?? {}
  const getPrice = (symbol: string) => priceList.find((p) => p.symbol === `${symbol}/USDT`)?.lastPrice ?? 0
  const walletAssets = getWalletAssets(priceList)
  const totalAssetsUsdt =
    availableUsdt +
    walletAssets.reduce((sum, a) => sum + (a.symbol === 'USDT' ? 0 : (holdings[a.symbol] ?? 0) * getPrice(a.symbol)), 0)
  const totalDisplay = balanceVisible ? totalAssetsUsdt.toFixed(2) : '****'

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (openDepositOnMount && onDepositMountConsumed) {
      if (currentUser && !currentUser.balanceFrozen) setDepositOpen(true)
      onDepositMountConsumed()
    }
  }, [openDepositOnMount, onDepositMountConsumed, currentUser])

  useEffect(() => {
    if (openWithdrawalOnMount && onWithdrawalMountConsumed) {
      setWithdrawalOpen(true)
      onWithdrawalMountConsumed()
    }
  }, [openWithdrawalOnMount, onWithdrawalMountConsumed])

  useEffect(() => {
    onDepositScreenOpenChange?.(depositScreenOpen)
  }, [depositScreenOpen, onDepositScreenOpenChange])

  return (
    <div style={{ paddingTop: 8 }}>
      <h1
        style={{
          margin: '0 0 16px',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: '#fff',
        }}
      >
        {t('wallets.title')}
      </h1>

      {/* Total Account Assets – credit card view */}
      <div
        className="wallet-asset-card"
        style={{
          background: 'linear-gradient(to right, #22c55e 0%, #14b8a6 50%, #0ea5e9 100%)',
          borderRadius: 24,
          padding: '24px 22px 22px',
          marginBottom: 24,
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2), 0 2px 8px rgba(0,0,0,0.15)',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {t('wallets.totalAssets')}
            </span>
            <button type="button" aria-label="Info" style={iconBtnStyle}>
              <InfoIcon />
            </button>
          </div>
          <button
            type="button"
            aria-label={balanceVisible ? 'Hide balance' : 'Show balance'}
            onClick={() => setBalanceVisible((v) => !v)}
            style={iconBtnStyle}
          >
            {balanceVisible ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          {totalDisplay}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            style={{ ...actionBtnStyle, opacity: currentUser?.balanceFrozen ? 0.5 : 1, cursor: currentUser?.balanceFrozen ? 'not-allowed' : 'pointer' }}
            onClick={() => !currentUser?.balanceFrozen && setDepositOpen(true)}
            disabled={!!currentUser?.balanceFrozen}
            title={currentUser?.balanceFrozen ? 'Deposit blocked: balance frozen' : undefined}
          >
            <DownArrowIcon />
            <span>{t('wallets.deposit')}</span>
          </button>
          <button
            style={{ ...actionBtnStyle, opacity: currentUser?.balanceFrozen ? 0.5 : 1, cursor: currentUser?.balanceFrozen ? 'not-allowed' : 'pointer' }}
            onClick={() => !currentUser?.balanceFrozen && setWithdrawalOpen(true)}
            disabled={!!currentUser?.balanceFrozen}
            title={currentUser?.balanceFrozen ? 'Withdrawal blocked: balance frozen' : undefined}
          >
            <UpArrowIcon />
            <span>{t('wallets.withdraw')}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={() => setWithdrawalHistoryOpen(true)}
          style={{
            marginTop: 10,
            padding: 8,
            border: 'none',
            background: 'transparent',
            color: 'rgba(255,255,255,0.8)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Withdrawal history
        </button>
      </div>

      {/* Asset list */}
      <div className="card wallet-asset-list" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.03em' }}>{t('wallets.assetList')}</span>
        </div>
        <ul style={{ margin: 0, padding: 0 }}>
          {walletAssets.map((asset, i) => {
            const available = asset.symbol === 'USDT' ? availableUsdt : (holdings[asset.symbol] ?? 0)
            const frozen = asset.symbol === 'USDT' ? frozenUsdt : 0
            const price = getPrice(asset.symbol)
            const approxUsdt = asset.symbol === 'USDT' ? availableUsdt : available * (price || 1)
            return (
              <li key={asset.symbol}>
                <button
                  type="button"
                  onClick={() => {
                    if (!currentUser?.balanceFrozen) {
                      setDepositCurrency(asset.symbol)
                      setDepositOpen(true)
                    }
                  }}
                  disabled={!!currentUser?.balanceFrozen}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '16px 20px',
                    border: 'none',
                    borderBottom: i < walletAssets.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    textAlign: 'left',
                    cursor: currentUser?.balanceFrozen ? 'not-allowed' : 'pointer',
                    opacity: currentUser?.balanceFrozen ? 0.6 : 1,
                  }}
                >
                  <CryptoLogo symbol={`${asset.symbol}/USDT`} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{asset.symbol}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      AVAILABLE {available.toFixed(asset.symbol === 'USDT' ? 2 : 6)} &nbsp;&nbsp; FROZEN {frozen.toFixed(2)} &nbsp;&nbsp; ≈USDT {approxUsdt.toFixed(2)}
                    </div>
                  </div>
                  <ChevronIcon />
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <DepositModal
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        onSelectCurrency={(currency) => {
          setDepositCurrency(currency)
          setDepositOpen(false)
          setDepositScreenOpen(true)
        }}
      />
      <DepositScreenView
        open={depositScreenOpen}
        onClose={() => setDepositScreenOpen(false)}
        initialCurrency={depositCurrency}
        onOpenDepositHistory={() => {
          setDepositScreenOpen(false)
          setDepositHistoryOpen(true)
        }}
        onBackToHome={onBackToHome ? () => {
          setDepositScreenOpen(false)
          onBackToHome()
        } : undefined}
      />
      <DepositHistoryView
        open={depositHistoryOpen}
        onClose={() => setDepositHistoryOpen(false)}
      />
      <WithdrawalModal
        open={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        onOpenWithdrawalAddress={onOpenWithdrawalAddress}
        onOpenWithdrawalPassword={onOpenWithdrawalPassword}
      />
      <WithdrawalHistoryView
        open={withdrawalHistoryOpen}
        onClose={() => setWithdrawalHistoryOpen(false)}
      />
    </div>
  )
}

const iconBtnStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(255,255,255,0.22)',
  borderRadius: '50%',
  color: '#fff',
  flexShrink: 0,
}

const actionBtnStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '14px 18px',
  borderRadius: 14,
  border: 'none',
  background: 'rgba(255,255,255,0.28)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  letterSpacing: '0.04em',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function DownArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  )
}

function UpArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
