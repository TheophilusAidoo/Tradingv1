import type { Pledge, PledgeStats } from './apiBridge'
import { getUsers, saveUsersToStore } from './verificationStore'

const PLEDGES_KEY = 'river_pledges'

const PLEDGE_PLANS: Record<string, { min: number; max: number; dailyYield: number; cycleDays: number }> = {
  newuser: { min: 10, max: 100, dailyYield: 20, cycleDays: 4 },
  olduser: { min: 10, max: 1000, dailyYield: 10, cycleDays: 3 },
  small: { min: 10, max: 100, dailyYield: 1, cycleDays: 7 },
}

function loadPledges(): Pledge[] {
  try {
    const raw = localStorage.getItem(PLEDGES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Pledge[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function savePledges(pledges: Pledge[]) {
  localStorage.setItem(PLEDGES_KEY, JSON.stringify(pledges))
}

/** Settle matured pledges: credit user balance and mark completed. Uses PLEDGE CYCLE and DAILY YIELD. */
function settleMaturedPledges(userId: string): void {
  const pledges = loadPledges()
  const now = Date.now()
  let updated = false
  const nextPledges = pledges.map((p) => {
    if (p.userId !== userId || p.status !== 'active') return p
    const ends = new Date(p.endsAt).getTime()
    if (now < ends) return p
    const amount = Number(p.amount) || 0
    const dailyYield = Number(p.dailyYieldPercent) || 0
    const cycleDays = Number(p.cycleDays) || 1
    const totalEarned = amount * (dailyYield / 100) * cycleDays
    updated = true
    return { ...p, status: 'completed' as const, totalEarned }
  })
  if (!updated) return
  savePledges(nextPledges)
  const users = getUsers()
  const matured = pledges.filter(
    (p) => p.userId === userId && p.status === 'active' && new Date(p.endsAt).getTime() <= now
  )
  let credit = 0
  for (const p of matured) {
    const amount = Number(p.amount) || 0
    const dailyYield = Number(p.dailyYieldPercent) || 0
    const cycleDays = Number(p.cycleDays) || 1
    credit += amount + amount * (dailyYield / 100) * cycleDays
  }
  if (credit > 0) {
    const next = users.map((u) =>
      u.id === userId ? { ...u, balanceUsdt: (u.balanceUsdt ?? 0) + credit } : u
    )
    saveUsersToStore(next)
  }
}

export function getPledgesForUser(userId: string): { pledges: Pledge[]; stats: PledgeStats } {
  settleMaturedPledges(userId)
  const all = loadPledges()
  const userPledges = all.filter((p) => String(p.userId) === String(userId))
  const now = Date.now()
  let amountMined = 0
  let todayEarnings = 0
  let cumulativeIncome = 0
  for (const p of userPledges) {
    const amount = Number(p.amount) || 0
    const dailyYield = Number(p.dailyYieldPercent) || 0
    const cycleDays = Number(p.cycleDays) || 1
    const created = new Date(p.createdAt).getTime()
    const ends = new Date(p.endsAt).getTime()
    const elapsedDays = Math.min(cycleDays, (now - created) / 86400000)
    const dailyEarn = amount * (dailyYield / 100)
    if (p.status === 'active' && now < ends) {
      amountMined += amount
      todayEarnings += dailyEarn
      cumulativeIncome += dailyEarn * elapsedDays
    } else if (p.status === 'completed') {
      cumulativeIncome += Number(p.totalEarned) || 0
    } else if (p.status === 'active' && now >= ends) {
      cumulativeIncome += amount * (dailyYield / 100) * cycleDays
    }
  }
  return {
    pledges: userPledges.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    stats: {
      amountMined: Math.round(amountMined * 100) / 100,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
      cumulativeIncome: Math.round(cumulativeIncome * 100) / 100,
      incomeOrder: userPledges.length,
    },
  }
}

export function createPledgeInStore(
  userId: string,
  userEmail: string,
  planId: string,
  amount: number
): { success: boolean; pledge?: Pledge; error?: string } {
  const plan = PLEDGE_PLANS[planId]
  if (!plan || amount < plan.min || amount > plan.max) {
    return { success: false, error: `Amount must be between ${plan?.min ?? 0} and ${plan?.max ?? 0} USDT` }
  }
  const users = getUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return { success: false, error: 'User not found' }
  if ((user.balanceUsdt ?? 0) < amount) return { success: false, error: 'Insufficient balance' }
  if (user.locked) return { success: false, error: 'Account locked' }
  if (user.balanceFrozen) return { success: false, error: 'Balance frozen' }
  const endsAt = new Date(Date.now() + plan.cycleDays * 86400000).toISOString().slice(0, 19).replace('T', ' ')
  const pledge: Pledge = {
    id: `pledge_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    userId,
    userEmail,
    planId,
    amount,
    dailyYieldPercent: plan.dailyYield,
    cycleDays: plan.cycleDays,
    status: 'active',
    totalEarned: 0,
    createdAt: new Date().toISOString(),
    endsAt,
  }
  const pledges = loadPledges()
  pledges.push(pledge)
  savePledges(pledges)
  const next = users.map((u) =>
    u.id === userId ? { ...u, balanceUsdt: Math.max(0, (u.balanceUsdt ?? 0) - amount) } : u
  )
  saveUsersToStore(next)
  return { success: true, pledge }
}

export function getAllPledges(): Pledge[] {
  return loadPledges().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
