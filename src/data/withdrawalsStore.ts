import type { WithdrawalRequest } from '../types/admin'
import { nowUTC, isoStringUTC } from '../utils/dateUtils'
import { addFrozenToUser, removeFrozenFromUser, deductBalanceAndFrozen } from './verificationStore'

const WITHDRAWALS_KEY = 'river_withdrawals'

function load(): WithdrawalRequest[] {
  try {
    const raw = localStorage.getItem(WITHDRAWALS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as WithdrawalRequest[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function save(requests: WithdrawalRequest[]) {
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(requests))
}

export function getWithdrawals(): WithdrawalRequest[] {
  return load()
}

export function createWithdrawal(userId: string, userEmail: string, amount: number, currency: string, walletAddress?: string, walletNetwork?: string): WithdrawalRequest[] {
  const requests = load()
  const req: WithdrawalRequest = {
    id: `wd-${nowUTC()}`,
    userId,
    userEmail,
    amount,
    currency,
    status: 'pending',
    createdAt: isoStringUTC(),
    walletAddress: walletAddress ?? null,
    walletNetwork: walletNetwork ?? null,
  }
  const next = [...requests, req]
  save(next)
  addFrozenToUser(userId, amount)
  return next
}

export function acceptWithdrawalInStore(withdrawalId: string): WithdrawalRequest[] {
  const requests = load()
  const req = requests.find((r) => r.id === withdrawalId)
  if (!req || req.status !== 'pending') return requests
  deductBalanceAndFrozen(req.userId, req.amount)
  const nextRequests = requests.map((r) =>
    r.id === withdrawalId ? { ...r, status: 'accepted' as const } : r
  )
  save(nextRequests)
  return nextRequests
}

export function declineWithdrawalInStore(withdrawalId: string): WithdrawalRequest[] {
  const requests = load()
  const req = requests.find((r) => r.id === withdrawalId)
  if (req && req.status === 'pending') {
    removeFrozenFromUser(req.userId, req.amount)
  }
  const next = requests.map((r) =>
    r.id === withdrawalId ? { ...r, status: 'declined' as const } : r
  )
  save(next)
  return next
}
