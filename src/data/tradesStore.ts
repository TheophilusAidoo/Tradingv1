import type { Trade, FeaturesOrderResult } from '../types/admin'
import { getUsers, saveUsersToStore } from './verificationStore'
import { parseLeverValue } from './featuresConfigStore'
import { parseAsUTC, nowUTC, isoStringUTC } from '../utils/dateUtils'

const TRADES_KEY = 'river_trades'

function loadTrades(): Trade[] {
  try {
    const raw = localStorage.getItem(TRADES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Trade[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function saveTrades(trades: Trade[]) {
  localStorage.setItem(TRADES_KEY, JSON.stringify(trades))
}

export function getTradesForUser(userId: string): Trade[] {
  return loadTrades()
    .filter((t) => t.userId === userId)
    .sort((a, b) => parseAsUTC(b.createdAt) - parseAsUTC(a.createdAt))
}

export function getAllTrades(): Trade[] {
  return loadTrades()
}

function getBaseSymbol(pair: string): string {
  return pair.split('/')[0] || 'ETH'
}

export function executeSpotTrade(userId: string, pair: string, side: 'buy' | 'sell', price: number, quantity: number): { success: boolean; error?: string } {
  const amount = price * quantity
  const users = getUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'User not found' }

  const baseSymbol = getBaseSymbol(pair)
  const holdings = user.cryptoHoldings ?? {}

  if (side === 'buy') {
    if (user.balanceUsdt < amount) return { success: false, error: 'Insufficient USDT balance' }
    const nextUsers = users.map((u) => {
      if (u.id !== userId) return u
      return {
        ...u,
        balanceUsdt: u.balanceUsdt - amount,
        cryptoHoldings: {
          ...(u.cryptoHoldings ?? {}),
          [baseSymbol]: (u.cryptoHoldings?.[baseSymbol] ?? 0) + quantity,
        },
      }
    })
    saveUsersToStore(nextUsers)
  } else {
    const currentHolding = holdings[baseSymbol] ?? 0
    if (currentHolding < quantity) return { success: false, error: `Insufficient ${baseSymbol} balance` }
    const nextUsers = users.map((u) => {
      if (u.id !== userId) return u
      return {
        ...u,
        balanceUsdt: u.balanceUsdt + amount,
        cryptoHoldings: {
          ...(u.cryptoHoldings ?? {}),
          [baseSymbol]: Math.max(0, (u.cryptoHoldings?.[baseSymbol] ?? 0) - quantity),
        },
      }
    })
    saveUsersToStore(nextUsers)
  }

  const trade: Trade = {
    id: `trade_${nowUTC()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    type: 'spot',
    pair,
    side,
    price,
    quantity,
    amount,
    createdAt: isoStringUTC(),
  }
  const trades = loadTrades()
  trades.push(trade)
  saveTrades(trades)
  return { success: true }
}

export function executeFeaturesOrder(
  userId: string,
  userEmail: string,
  pair: string,
  variant: 'up' | 'fall',
  amount: number,
  periodSeconds: number,
  periodPercent: number,
  lever: string
): { success: boolean; error?: string } {
  const users = getUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'User not found' }
  if (user.balanceUsdt < amount) return { success: false, error: 'Insufficient USDT balance' }

  const nextUsers = users.map((u) =>
    u.id === userId ? { ...u, balanceUsdt: Math.max(0, u.balanceUsdt - amount) } : u
  )
  saveUsersToStore(nextUsers)

  const trade: Trade = {
    id: `trade_${nowUTC()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    userEmail,
    type: 'features',
    pair,
    side: variant,
    price: 0,
    quantity: amount,
    amount,
    createdAt: isoStringUTC(),
    period: periodSeconds,
    periodPercent,
    lever,
    featuresStatus: 'pending',
  }
  const trades = loadTrades()
  trades.push(trade)
  saveTrades(trades)
  return { success: true }
}

export function getPendingFeaturesOrders(): Trade[] {
  return loadTrades().filter(
    (t) => t.type === 'features' && t.featuresStatus === 'pending'
  )
}

export function getAllFeaturesOrders(): Trade[] {
  return loadTrades()
    .filter((t) => t.type === 'features')
    .sort((a, b) => parseAsUTC(b.createdAt) - parseAsUTC(a.createdAt))
}

function calcPayoutOnWin(stake: number, periodPercent: number, lever: string): number {
  const leverNum = parseLeverValue(lever)
  const profit = stake * (periodPercent / 100) * leverNum
  return stake + profit
}

/** Returns endsAt timestamp (ms) for a features order. Uses UTC. */
export function getOrderEndsAt(trade: Trade): number {
  const created = parseAsUTC(String(trade.createdAt ?? ''))
  const periodSec = trade.period ?? 120
  return created + periodSec * 1000
}

/** Credits user and marks order settled. Called when timer has expired. */
function applySettlement(trades: Trade[], idx: number): void {
  const trade = trades[idx]
  if (trade.featuresStatus === 'settled' || !trade.featuresResult) return

  const stake = trade.amount
  let payout = 0
  if (trade.featuresResult === 'win') {
    payout = calcPayoutOnWin(stake, trade.periodPercent ?? 50, trade.lever ?? '1x')
  } else if (trade.featuresResult === 'draw') {
    payout = stake
  }

  if (payout > 0) {
    const users = getUsers()
    const nextUsers = users.map((u) =>
      u.id === trade.userId ? { ...u, balanceUsdt: u.balanceUsdt + payout } : u
    )
    saveUsersToStore(nextUsers)
  }

  trades[idx] = {
    ...trade,
    featuresStatus: 'settled',
    payoutAmount: payout,
    settledAt: isoStringUTC(),
  }
}

/** Admin declares result. Credits immediately only if timer has expired. */
export function settleFeaturesOrder(tradeId: string, result: FeaturesOrderResult): { success: boolean; error?: string } {
  const trades = loadTrades()
  const idx = trades.findIndex((t) => t.id === tradeId)
  if (idx === -1) return { success: false, error: 'Order not found' }

  const trade = trades[idx]
  if (trade.type !== 'features' || trade.featuresStatus !== 'pending') {
    return { success: false, error: 'Order already settled' }
  }

  const now = nowUTC()
  const endsAt = getOrderEndsAt(trade)
  const timeExpired = now >= endsAt

  trades[idx] = { ...trade, featuresResult: result }

  if (timeExpired) {
    applySettlement(trades, idx)
  }

  saveTrades(trades)
  return { success: true }
}

/** Settle all orders where timer has expired. Auto-draw if admin never set result. Call periodically. */
export function processExpiredFeaturesOrders(): number {
  const trades = loadTrades()
  let count = 0
  const now = nowUTC()
  for (let i = 0; i < trades.length; i++) {
    const t = trades[i]
    if (t.type !== 'features' || t.featuresStatus !== 'pending') continue
    if (now < getOrderEndsAt(t)) continue

    const result = t.featuresResult ?? 'draw'
    trades[i] = { ...t, featuresResult: result }
    applySettlement(trades, i)
    count++
  }
  if (count > 0) saveTrades(trades)
  return count
}
