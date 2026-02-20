/**
 * River Trading API client
 * Uses VITE_API_URL when set; falls back to empty (localStorage mode)
 */

const BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? ''

function buildUrl(path: string): string {
  if (!BASE) return ''
  const base = BASE.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  const fullPath = `${base}/${p}`
  return fullPath.startsWith('http') ? fullPath : `${window.location.origin}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`
}

async function req<T>(
  path: string,
  opts: RequestInit & { json?: object } = {}
): Promise<T> {
  const { json, ...rest } = opts
  const url = buildUrl(path)
  if (!url) throw new Error('API not configured (VITE_API_URL)')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  }
  const body = json !== undefined ? JSON.stringify(json) : rest.body
  const res = await fetch(url, { ...rest, headers, body })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as T
}

async function reqForm<T>(path: string, formData: FormData): Promise<T> {
  const url = buildUrl(path)
  if (!url) throw new Error('API not configured (VITE_API_URL)')
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText)
  return data as T
}

export const api = {
  health: () => req<{ ok: boolean }>('health'),

  auth: {
    login: (email: string, password: string) =>
      req<{ success: boolean; user?: object; error?: string }>('auth/login', {
        method: 'POST',
        json: { email, password },
      }),
    adminLogin: (email: string, password: string) =>
      req<{ success: boolean; user?: object; error?: string }>('auth/admin-login', {
        method: 'POST',
        json: { email, password },
      }),
    signup: (email: string, password: string, name?: string, referralCode?: string) =>
      req<{ success: boolean; user?: object; error?: string }>('auth/signup', {
        method: 'POST',
        json: { email, password, name, referralCode },
      }),
  },

  users: {
    list: () => req<unknown[]>('users'),
    get: (id: string) => req<object>(`users/${id}`),
    delete: (id: string) => req<{ success: boolean }>(`users/${id}`, { method: 'DELETE' }),
    approve: (id: string) => req<{ success: boolean }>(`users/${id}/approve`, { method: 'POST' }),
    setCreditScore: (id: string, creditScore: number) =>
      req<{ success: boolean }>(`users/${id}/credit-score`, {
        method: 'PATCH',
        json: { creditScore },
      }),
    adjustBalance: (id: string, amount: number) =>
      req<{ success: boolean }>(`users/${id}/balance`, {
        method: 'PATCH',
        json: { amount },
      }),
    setWithdrawalAddress: (userId: string, address: string, network?: string) =>
      req<{ success: boolean }>(`users/${userId}/withdrawal-address`, {
        method: 'PATCH',
        json: { address, network: network ?? 'USDT (TRC20)' },
      }),
    setWithdrawalPassword: (userId: string, password: string) =>
      req<{ success: boolean }>(`users/${userId}/withdrawal-password`, {
        method: 'PATCH',
        json: { password },
      }),
    changeLoginPassword: (userId: string, oldPassword: string, newPassword: string) =>
      req<{ success: boolean }>(`users/${userId}/login-password`, {
        method: 'PATCH',
        json: { oldPassword, newPassword },
      }),
    addDocument: (userId: string, type: string, url: string) =>
      req<{ success: boolean }>(`users/${userId}/documents`, {
        method: 'POST',
        json: { type, url },
      }),
    lock: (userId: string, locked: boolean) =>
      req<{ success: boolean; locked: boolean }>(`users/${userId}/lock`, {
        method: 'PATCH',
        json: { locked },
      }),
    freezeBalance: (userId: string, frozen: boolean) =>
      req<{ success: boolean; frozen: boolean }>(`users/${userId}/freeze-balance`, {
        method: 'PATCH',
        json: { frozen },
      }),
    getNotifications: (userId: string) =>
      req<{ notifications: { id: string; userId: string; type: string; message: string; createdAt: string }[] }>(`users/${userId}/notifications`),
  },

  pledges: {
    list: () => req<unknown[]>('pledges'),
    forUser: (userId: string) =>
      req<{ pledges: unknown[]; stats: { amountMined: number; todayEarnings: number; cumulativeIncome: number; incomeOrder: number } }>(
        `users/${userId}/pledges`
      ),
    create: (payload: { userId: string; userEmail: string; planId: string; amount: number }) =>
      req<{ success: boolean; pledge?: object; error?: string }>('pledges', {
        method: 'POST',
        json: payload,
      }),
  },

  referralCodes: {
    list: () => req<unknown[]>('referral-codes'),
    generate: () => req<{ id: string; code: string; status: string }>('referral-codes/generate', {
      method: 'POST',
    }),
    validate: (code: string) =>
      req<{ valid: boolean; code?: string }>('referral-codes/validate', {
        method: 'POST',
        json: { code },
      }),
  },

  trades: {
    list: () => req<unknown[]>('trades'),
    forUser: (userId: string) => req<unknown[]>(`users/${userId}/trades`),
    spot: (payload: {
      userId: string
      pair: string
      side: 'buy' | 'sell'
      price: number
      quantity: number
    }) => req<{ success: boolean; tradeId?: string; error?: string }>('trades/spot', {
      method: 'POST',
      json: payload,
    }),
    features: (payload: {
      userId: string
      userEmail?: string
      pair: string
      variant: 'up' | 'fall'
      amount: number
      periodSeconds: number
      periodPercent: number
      lever: string
    }) => req<{ success: boolean; tradeId?: string; error?: string }>('trades/features', {
      method: 'POST',
      json: payload,
    }),
    settle: (tradeId: string, result: 'win' | 'lose' | 'draw') =>
      req<{ success: boolean }>(`trades/${tradeId}/settle`, {
        method: 'POST',
        json: { result },
      }),
    processExpired: () =>
      req<{ settled: number }>('trades/process-expired', { method: 'POST' }),
  },

  paymentMethods: {
    list: () =>
      req<{ id: string; label: string; network: string; walletAddress: string; minAmount: string; unit: string; qrCodeUrl?: string | null }[]>(
        'payment-methods'
      ),
    create: (formData: FormData) =>
      reqForm<{ success: boolean; id?: string; error?: string }>('payment-methods', formData),
    delete: (id: string) =>
      req<{ success: boolean; error?: string }>(`payment-methods/${id}`, { method: 'DELETE' }),
  },

  deposits: {
    list: () =>
      req<{ id: string; userId: string; userEmail: string; amount: number; currency: string; network: string; txHash?: string; paymentProofUrl?: string; status: string; createdAt: string }[]>('deposits'),
    listForUser: (userId: string) =>
      req<{ id: string; userId: string; userEmail: string; amount: number; currency: string; network: string; txHash?: string; paymentProofUrl?: string; status: string; createdAt: string }[]>(`users/${userId}/deposits`),
    create: (formData: FormData) =>
      reqForm<{ success: boolean; id?: string; error?: string }>('deposits', formData),
    accept: (id: string) => req<{ success: boolean }>(`deposits/${id}/accept`, { method: 'POST' }),
    decline: (id: string) => req<{ success: boolean }>(`deposits/${id}/decline`, { method: 'POST' }),
  },

  withdrawals: {
    list: () => req<unknown[]>('withdrawals'),
    listForUser: (userId: string) => req<unknown[]>(`users/${userId}/withdrawals`),
    create: (payload: { userId: string; userEmail: string; amount: number; currency?: string; withdrawalPassword?: string }) =>
      req<{ success: boolean; id?: string; error?: string }>('withdrawals', {
        method: 'POST',
        json: payload,
      }),
    accept: (id: string) =>
      req<{ success: boolean }>(`withdrawals/${id}/accept`, { method: 'POST' }),
    decline: (id: string) =>
      req<{ success: boolean }>(`withdrawals/${id}/decline`, { method: 'POST' }),
  },

  featuresConfig: {
    getPeriods: () =>
      req<{ seconds: number; percent: number }[]>('features/periods'),
    savePeriods: (periods: { seconds: number; percent: number }[]) =>
      req<{ success: boolean }>('features/periods', {
        method: 'PUT',
        json: { periods },
      }),
    getLevers: () => req<string[]>('features/levers'),
    saveLevers: (levers: string[]) =>
      req<{ success: boolean }>('features/levers', {
        method: 'PUT',
        json: { levers },
      }),
  },

  customerLinks: {
    list: () =>
      req<{ id: string; label: string; url: string }[]>('customer-links'),
    update: (id: string, url: string) =>
      req<{ success: boolean }>('customer-links', {
        method: 'PATCH',
        json: { id, url },
      }),
  },

  msbApproval: {
    getStatus: (userId: string) =>
      req<{ submitted: boolean; status?: string; submittedAt?: string; frontUrl?: string; backUrl?: string; reviewedAt?: string }>(
        `msb-approval/status?userId=${encodeURIComponent(userId)}`
      ),
    submit: (formData: FormData) =>
      reqForm<{ success: boolean; id?: string; error?: string }>('msb-approval', formData),
  },
  msbApprovals: {
    list: () =>
      req<{ id: string; userId: string; userEmail: string; frontUrl: string; backUrl: string; status: string; submittedAt: string; reviewedAt?: string }[]>('msb-approvals'),
    approve: (id: string) =>
      req<{ success: boolean }>(`msb-approvals/${id}/approve`, { method: 'POST' }),
    decline: (id: string) =>
      req<{ success: boolean }>(`msb-approvals/${id}/decline`, { method: 'POST' }),
  },

  chat: {
    userUnread: (userId: string, since: string, wait?: number) => {
      const p = new URLSearchParams({ userId, since })
      if (wait != null && wait > 0) p.set('wait', String(wait))
      return req<{ hasUnread: boolean }>(`chat/user-unread?${p.toString()}`)
    },
    adminUnread: (since: string, wait?: number) => {
      const p = new URLSearchParams({ since })
      if (wait != null && wait > 0) p.set('wait', String(wait))
      return req<{ hasUnread: boolean }>(`chat/admin-unread?${p.toString()}`)
    },
    getMessages: (userId: string, since?: string, wait?: number) => {
      const params = new URLSearchParams()
      if (since) params.set('since', since)
      if (wait != null && wait > 0) params.set('wait', String(wait))
      const q = params.toString()
      return req<{ id: string; userId: string; senderType: string; content: string; createdAt: string }[]>(
        `users/${userId}/chat-messages${q ? `?${q}` : ''}`
      )
    },
    send: (userId: string, content: string, senderType: 'user' | 'admin') =>
      req<{ success: boolean; message?: { id: string; userId: string; senderType: string; content: string; createdAt: string } }>('chat/messages', {
        method: 'POST',
        json: { userId, content, senderType },
      }),
    getConversations: () =>
      req<{ userId: string; email: string; name: string; lastAt: string }[]>('chat/conversations'),
  },
}

export function isApiConfigured(): boolean {
  return !!BASE
}
