/**
 * Bridge between React app and PHP API.
 * When VITE_API_URL is set, stores use API; otherwise localStorage.
 */

import { api, isApiConfigured } from '../api/client'
import { isoStringUTC } from '../utils/dateUtils'
import type { AdminUser, AdminDeposit, DepositStatus, Trade, WithdrawalRequest } from '../types/admin'
import type { ReferralCode } from './referralCodesStore'

export { isApiConfigured }

export async function apiGetUsers(): Promise<AdminUser[]> {
  const list = await api.users.list()
  return (list as AdminUser[]).map((u) => ({
    ...u,
    documents: u.documents ?? [],
    cryptoHoldings: u.cryptoHoldings ?? {},
  }))
}

export async function apiGetUser(id: string): Promise<AdminUser | null> {
  try {
    const u = (await api.users.get(id)) as AdminUser
    return { ...u, documents: u.documents ?? [], cryptoHoldings: u.cryptoHoldings ?? {} }
  } catch {
    return null
  }
}

export async function apiValidateReferralCode(code: string): Promise<boolean> {
  const res = await api.referralCodes.validate(code)
  return res.valid === true
}

export async function apiAuthLogin(email: string, password: string): Promise<AdminUser | null> {
  const res = await api.auth.login(email, password)
  if (!res.success || !res.user) return null
  return res.user as unknown as AdminUser
}

export async function apiAuthAdminLogin(email: string, password: string): Promise<AdminUser | null> {
  const res = await api.auth.adminLogin(email, password)
  if (!res.success || !res.user) return null
  return res.user as unknown as AdminUser
}

export async function apiAuthSignup(
  email: string,
  password: string,
  name?: string,
  referralCode?: string
): Promise<AdminUser | null> {
  const res = await api.auth.signup(email, password, name, referralCode)
  if (!res.success || !res.user) return null
  return res.user as unknown as AdminUser
}

export async function apiApproveUser(id: string): Promise<void> {
  await api.users.approve(id)
}

export async function apiDeleteUser(id: string): Promise<void> {
  await api.users.delete(id)
}

export async function apiLockUser(id: string, locked: boolean): Promise<void> {
  await api.users.lock(id, locked)
}

export async function apiFreezeUserBalance(id: string, frozen: boolean): Promise<void> {
  await api.users.freezeBalance(id, frozen)
}

export type UserNotification = { id: string; userId: string; type: string; message: string; createdAt: string }

export async function apiGetUserNotifications(userId: string): Promise<UserNotification[]> {
  const res = await api.users.getNotifications(userId)
  return res.notifications ?? []
}

export async function apiSetCreditScore(id: string, score: number): Promise<void> {
  await api.users.setCreditScore(id, score)
}

export async function apiAdjustBalance(id: string, amount: number): Promise<void> {
  await api.users.adjustBalance(id, amount)
}

export async function apiSetWithdrawalAddress(
  userId: string,
  address: string,
  network?: string
): Promise<void> {
  await api.users.setWithdrawalAddress(userId, address, network)
}

export async function apiSetWithdrawalPassword(
  userId: string,
  password: string
): Promise<void> {
  await api.users.setWithdrawalPassword(userId, password)
}

export async function apiChangeLoginPassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  await api.users.changeLoginPassword(userId, oldPassword, newPassword)
}

export async function apiGetMsbApprovalStatus(userId: string): Promise<{ submitted: boolean; status?: string; submittedAt?: string; frontUrl?: string; backUrl?: string; reviewedAt?: string }> {
  return api.msbApproval.getStatus(userId)
}

export async function apiSubmitMsbApproval(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  return api.msbApproval.submit(formData)
}

export async function apiAddDocument(
  userId: string,
  type: string,
  url: string
): Promise<void> {
  await api.users.addDocument(userId, type, url)
}

export async function apiGetReferralCodes(): Promise<ReferralCode[]> {
  const list = await api.referralCodes.list()
  return (list as ReferralCode[]).map((r) => ({
    ...r,
    usedBy: (r as { usedBy?: string }).usedBy,
    usedAt: (r as { usedAt?: string }).usedAt,
    createdAt: (r as { createdAt?: string }).createdAt ?? '',
  }))
}

export async function apiGenerateReferralCode(): Promise<ReferralCode> {
  const res = await api.referralCodes.generate()
  return {
    id: res.id,
    code: res.code,
    status: 'available',
    createdAt: (res as { createdAt?: string }).createdAt ?? isoStringUTC(),
  }
}

export async function apiGetTrades(): Promise<Trade[]> {
  return (await api.trades.list()) as Trade[]
}

export async function apiGetTradesForUser(userId: string): Promise<Trade[]> {
  return (await api.trades.forUser(userId)) as Trade[]
}

export interface Pledge {
  id: string
  userId: string
  userEmail: string
  planId: string
  amount: number
  dailyYieldPercent: number
  cycleDays: number
  status: 'active' | 'completed'
  totalEarned: number
  createdAt: string
  endsAt: string
  completedAt?: string | null
}

export interface PledgeStats {
  amountMined: number
  todayEarnings: number
  cumulativeIncome: number
  incomeOrder: number
}

export async function apiGetPledgesForUser(userId: string): Promise<{ pledges: Pledge[]; stats: PledgeStats }> {
  const res = await api.pledges.forUser(userId)
  const s = (res.stats ?? {}) as Record<string, unknown>
  return {
    pledges: (res.pledges ?? []) as Pledge[],
    stats: {
      amountMined: Number(s.amountMined ?? s.amount_mined) || 0,
      todayEarnings: Number(s.todayEarnings ?? s.today_earnings) || 0,
      cumulativeIncome: Number(s.cumulativeIncome ?? s.cumulative_income) || 0,
      incomeOrder: Number(s.incomeOrder ?? s.income_order) || 0,
    },
  }
}

export async function apiCreatePledge(payload: {
  userId: string
  userEmail: string
  planId: string
  amount: number
}): Promise<{ success: boolean; pledge?: Pledge; error?: string }> {
  try {
    const res = await api.pledges.create(payload)
    if (res.success && res.pledge) return { success: true, pledge: res.pledge as Pledge }
    return { success: false, error: (res as { error?: string }).error ?? 'Pledge failed' }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function apiGetPledges(): Promise<Pledge[]> {
  return (await api.pledges.list()) as Pledge[]
}

export async function apiExecuteSpotTrade(payload: {
  userId: string
  pair: string
  side: 'buy' | 'sell'
  price: number
  quantity: number
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api.trades.spot(payload)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function apiExecuteFeaturesOrder(payload: {
  userId: string
  userEmail?: string
  pair: string
  variant: 'up' | 'fall'
  amount: number
  periodSeconds: number
  periodPercent: number
  lever: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api.trades.features(payload)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function apiSettleFeaturesOrder(
  tradeId: string,
  result: 'win' | 'lose' | 'draw'
): Promise<{ success: boolean; error?: string }> {
  try {
    await api.trades.settle(tradeId, result)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function apiProcessExpiredFeaturesOrders(): Promise<number> {
  const res = await api.trades.processExpired()
  return res.settled
}

export async function apiGetPaymentMethods() {
  const list = await api.paymentMethods.list()
  return list.map((m) => ({
    id: m.id,
    label: m.label,
    network: m.network,
    walletAddress: m.walletAddress,
    minAmount: m.minAmount,
    unit: m.unit,
    qrCodeUrl: m.qrCodeUrl ?? null,
  }))
}

export async function apiCreatePaymentMethod(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const res = await api.paymentMethods.create(formData)
  return res as { success: boolean; id?: string; error?: string }
}

export async function apiDeletePaymentMethod(id: string): Promise<{ success: boolean; error?: string }> {
  return api.paymentMethods.delete(id) as Promise<{ success: boolean; error?: string }>
}

export async function apiGetDeposits(): Promise<AdminDeposit[]> {
  const list = await api.deposits.list()
  return list.map((d) => ({
    ...d,
    txHash: d.txHash ?? undefined,
    paymentProofUrl: d.paymentProofUrl ?? undefined,
    status: (d.status ?? 'pending') as DepositStatus,
  }))
}

export async function apiGetDepositsForUser(userId: string): Promise<AdminDeposit[]> {
  const list = await api.deposits.listForUser(userId)
  return list.map((d) => ({
    ...d,
    txHash: d.txHash ?? undefined,
    paymentProofUrl: d.paymentProofUrl ?? undefined,
    status: (d.status ?? 'pending') as DepositStatus,
  }))
}

export async function apiCreateDeposit(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const res = await api.deposits.create(formData)
  return res as { success: boolean; id?: string; error?: string }
}

export async function apiAcceptDeposit(id: string): Promise<{ success: boolean }> {
  return api.deposits.accept(id)
}

export async function apiDeclineDeposit(id: string): Promise<{ success: boolean }> {
  return api.deposits.decline(id)
}

export async function apiGetWithdrawals(): Promise<WithdrawalRequest[]> {
  return (await api.withdrawals.list()) as WithdrawalRequest[]
}

export async function apiGetWithdrawalsForUser(userId: string): Promise<WithdrawalRequest[]> {
  return (await api.withdrawals.listForUser(userId)) as WithdrawalRequest[]
}

export async function apiCreateWithdrawal(payload: {
  userId: string
  userEmail: string
  amount: number
  currency?: string
  withdrawalPassword?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    await api.withdrawals.create(payload)
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function apiAcceptWithdrawal(id: string): Promise<void> {
  await api.withdrawals.accept(id)
}

export async function apiDeclineWithdrawal(id: string): Promise<void> {
  await api.withdrawals.decline(id)
}

export async function apiGetFeaturesPeriods(): Promise<{ seconds: number; percent: number }[]> {
  return await api.featuresConfig.getPeriods()
}

export async function apiSaveFeaturesPeriods(
  periods: { seconds: number; percent: number }[]
): Promise<void> {
  await api.featuresConfig.savePeriods(periods)
}

export async function apiGetFeaturesLevers(): Promise<string[]> {
  return await api.featuresConfig.getLevers()
}

export async function apiSaveFeaturesLevers(levers: string[]): Promise<void> {
  await api.featuresConfig.saveLevers(levers)
}

export async function apiGetCustomerLinks(): Promise<{ id: string; label: string; url: string }[]> {
  return await api.customerLinks.list()
}

export async function apiUpdateCustomerLink(id: string, url: string): Promise<void> {
  await api.customerLinks.update(id, url)
}

export interface ChatMessage {
  id: string
  userId: string
  senderType: 'user' | 'admin'
  content: string
  createdAt: string
}

export async function apiGetChatMessages(userId: string, since?: string, wait?: number): Promise<ChatMessage[]> {
  return (await api.chat.getMessages(userId, since, wait)) as ChatMessage[]
}

export async function apiChatUserUnread(userId: string, since: string, wait?: number): Promise<boolean> {
  const res = await api.chat.userUnread(userId, since, wait)
  return res.hasUnread
}

export async function apiChatAdminUnread(since: string, wait?: number): Promise<boolean> {
  const res = await api.chat.adminUnread(since, wait)
  return res.hasUnread
}

export async function apiSendChatMessage(
  userId: string,
  content: string,
  senderType: 'user' | 'admin' = 'user'
): Promise<ChatMessage | null> {
  const res = await api.chat.send(userId, content, senderType)
  return (res.message ?? null) as ChatMessage | null
}

export async function apiGetChatConversations(): Promise<{ userId: string; email: string; name: string; lastAt: string }[]> {
  return (await api.chat.getConversations()) as { userId: string; email: string; name: string; lastAt: string }[]
}
