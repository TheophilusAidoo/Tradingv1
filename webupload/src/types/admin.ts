export type UserVerificationStatus = 'pending' | 'approved'

export interface UserDocument {
  id: string
  type: string
  url: string
  uploadedAt: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  registeredAt: string
  balanceUsdt: number
  /** Amount locked in pending withdrawals */
  frozenUsdt?: number
  status: UserVerificationStatus
  documents: UserDocument[]
  /** Referral code the user used to register (from admin) */
  referralCodeUsed?: string
  /** Credit score (0–100+), managed by admin */
  creditScore?: number
  /** Spot holdings: base symbol -> quantity, e.g. { "ETH": 0.5 } */
  cryptoHoldings?: Record<string, number>
  /** Main withdrawal wallet address set in profile */
  mainWithdrawalAddress?: string | null
  /** Main withdrawal network (e.g. USDT TRC20) */
  mainWithdrawalNetwork?: string | null
  /** Whether user has set a withdrawal password */
  hasWithdrawalPassword?: boolean
  /** Admin has locked the account; user cannot perform any actions */
  locked?: boolean
  /** Admin has frozen balance; user cannot withdraw, trade, or features trade */
  balanceFrozen?: boolean
  /** User has admin access; cannot be deleted */
  isAdmin?: boolean
}

export type TradeType = 'spot' | 'features'

export type FeaturesOrderStatus = 'pending' | 'settled'
export type FeaturesOrderResult = 'win' | 'lose' | 'draw'

export interface Trade {
  id: string
  userId: string
  userEmail?: string
  type: TradeType
  pair: string
  side: 'buy' | 'sell' | 'up' | 'fall'
  price: number
  quantity: number
  amount: number
  createdAt: string
  /** For features: period in seconds, lever */
  period?: number
  lever?: string
  /** For features: period percentage (20, 30, 50, 100, 200) */
  periodPercent?: number
  /** For features: pending until admin settles */
  featuresStatus?: FeaturesOrderStatus
  featuresResult?: FeaturesOrderResult
  /** Amount credited to user (win: stake+profit, draw: stake, lose: 0) */
  payoutAmount?: number
  settledAt?: string
}

/** Period (seconds) -> percentage return on win */
export const PERIOD_PERCENT_MAP: Record<number, number> = {
  60: 20,
  90: 30,
  120: 50,
  180: 100,
  240: 200,
}

export type DepositStatus = 'pending' | 'accepted' | 'declined'

export interface AdminDeposit {
  id: string
  userId: string
  userEmail: string
  amount: number
  currency: string
  network: string
  txHash?: string
  paymentProofUrl?: string
  status: DepositStatus
  createdAt: string
}

export interface CustomerServiceLink {
  id: 'telegram' | 'whatsapp'
  label: string
  url: string
}

export interface PaymentMethod {
  id: string
  label: string
  network: string
  walletAddress: string
  minAmount: string
  unit: string
  /** URL to uploaded QR code image, or null if using generated QR */
  qrCodeUrl?: string | null
}

export type WithdrawalStatus = 'pending' | 'accepted' | 'declined'

export interface WithdrawalRequest {
  id: string
  userId: string
  userEmail: string
  amount: number
  currency: string
  status: WithdrawalStatus
  createdAt: string
  /** Wallet address for payout (from user's main withdrawal address) */
  walletAddress?: string | null
  /** Network (e.g. USDT TRC20) */
  walletNetwork?: string | null
}
