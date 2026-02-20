import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { AdminUser, AdminDeposit, CustomerServiceLink, WithdrawalRequest } from '../types/admin'
import { getUsers, saveUsersToStore, approveUserInStore, lockUserInStore, freezeUserBalanceInStore, deleteUserInStore } from '../data/verificationStore'
import { getWithdrawals, acceptWithdrawalInStore, declineWithdrawalInStore } from '../data/withdrawalsStore'
import {
  isApiConfigured,
  apiGetUsers,
  apiApproveUser,
  apiLockUser,
  apiFreezeUserBalance,
  apiDeleteUser,
  apiSetCreditScore,
  apiAdjustBalance,
  apiGetDeposits,
  apiAcceptDeposit,
  apiDeclineDeposit,
  apiGetWithdrawals,
  apiAcceptWithdrawal,
  apiDeclineWithdrawal,
  apiGetCustomerLinks,
  apiUpdateCustomerLink,
} from '../data/apiBridge'

export function loadUsersFromStore(): AdminUser[] {
  return getUsers()
}

const CUSTOMER_LINKS_KEY = 'river_admin_customer_links'

function loadCustomerLinks(): CustomerServiceLink[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_LINKS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CustomerServiceLink[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return [
    { id: 'telegram', label: 'Telegram', url: '' },
    { id: 'whatsapp', label: 'WhatsApp', url: '' },
  ]
}

function saveCustomerLinks(links: CustomerServiceLink[]) {
  localStorage.setItem(CUSTOMER_LINKS_KEY, JSON.stringify(links))
}

interface AdminContextValue {
  users: AdminUser[]
  deposits: AdminDeposit[]
  pendingDeposits: AdminDeposit[]
  customerLinks: CustomerServiceLink[]
  acceptDeposit: (depositId: string) => void
  declineDeposit: (depositId: string) => void
  adjustBalance: (userId: string, amount: number) => void
  setCustomerLink: (id: 'telegram' | 'whatsapp', url: string) => void
  approveUser: (userId: string) => void
  lockUser: (userId: string, locked: boolean) => void
  freezeUserBalance: (userId: string, frozen: boolean) => void
  deleteUser: (userId: string) => void
  setUserCreditScore: (userId: string, creditScore: number) => void
  setUsers: (users: AdminUser[] | ((prev: AdminUser[]) => AdminUser[])) => void
  refreshUsersFromStore: () => void
  refreshData: () => void
  withdrawals: WithdrawalRequest[]
  pendingWithdrawals: WithdrawalRequest[]
  acceptWithdrawal: (withdrawalId: string) => void
  declineWithdrawal: (withdrawalId: string) => void
  refreshWithdrawalsFromStore: () => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [users, setUsersState] = useState<AdminUser[]>(() => getUsers())
  const [deposits, setDeposits] = useState<AdminDeposit[]>([])
  const [customerLinks, setCustomerLinksState] = useState<CustomerServiceLink[]>(loadCustomerLinks)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => getWithdrawals())

  const pendingDeposits = deposits.filter((d) => d.status === 'pending')
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending')

  const loadFromApi = useCallback(() => {
    if (!isApiConfigured()) return
    apiGetUsers().then(setUsersState).catch(() => {})
    apiGetDeposits().then(setDeposits).catch(() => {})
    apiGetWithdrawals().then(setWithdrawals).catch(() => {})
    apiGetCustomerLinks()
      .then((links) =>
        setCustomerLinksState(links.map((l) => ({ id: l.id as 'telegram' | 'whatsapp', label: l.label, url: l.url })))
      )
      .catch(() => {})
  }, [])

  const refreshData = useCallback(() => {
    if (isApiConfigured()) {
      loadFromApi()
    } else {
      setUsersState(getUsers())
      setWithdrawals(getWithdrawals())
    }
  }, [loadFromApi])

  useEffect(() => {
    loadFromApi()
  }, [loadFromApi])

  useEffect(() => {
    if (!isApiConfigured()) saveCustomerLinks(customerLinks)
  }, [customerLinks])

  useEffect(() => {
    if (!isApiConfigured()) saveUsersToStore(users)
  }, [users])

  const setUsers = useCallback((arg: AdminUser[] | ((prev: AdminUser[]) => AdminUser[])) => {
    setUsersState(arg)
  }, [])

  const acceptDeposit = useCallback(async (depositId: string) => {
    if (isApiConfigured()) {
      await apiAcceptDeposit(depositId)
      loadFromApi()
    } else {
      const dep = deposits.find((d) => d.id === depositId)
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? { ...d, status: 'accepted' as const } : d))
      )
      if (dep) {
        setUsersState((prev) =>
          prev.map((u) => (u.id === dep.userId ? { ...u, balanceUsdt: u.balanceUsdt + dep.amount } : u))
        )
      }
    }
  }, [deposits, loadFromApi])

  const declineDeposit = useCallback(async (depositId: string) => {
    if (isApiConfigured()) {
      await apiDeclineDeposit(depositId)
      loadFromApi()
    } else {
      setDeposits((prev) =>
        prev.map((d) => (d.id === depositId ? { ...d, status: 'declined' as const } : d))
      )
    }
  }, [loadFromApi])

  const adjustBalance = useCallback(
    async (userId: string, amount: number) => {
      if (isApiConfigured()) {
        await apiAdjustBalance(userId, amount)
        loadFromApi()
      } else {
        setUsersState((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, balanceUsdt: Math.max(0, u.balanceUsdt + amount) } : u
          )
        )
      }
    },
    [loadFromApi]
  )

  const setCustomerLink = useCallback(
    (id: 'telegram' | 'whatsapp', url: string) => {
      setCustomerLinksState((prev) =>
        prev.map((l) => (l.id === id ? { ...l, url } : l))
      )
      if (isApiConfigured()) apiUpdateCustomerLink(id, url)
    },
    []
  )

  const approveUser = useCallback(
    async (userId: string) => {
      if (isApiConfigured()) {
        await apiApproveUser(userId)
        loadFromApi()
      } else {
        const next = approveUserInStore(userId)
        setUsersState(next)
      }
    },
    [loadFromApi]
  )

  const lockUser = useCallback(
    async (userId: string, locked: boolean) => {
      if (isApiConfigured()) {
        await apiLockUser(userId, locked)
        loadFromApi()
      } else {
        const next = lockUserInStore(userId, locked)
        setUsersState(next)
      }
    },
    [loadFromApi]
  )

  const freezeUserBalance = useCallback(
    async (userId: string, frozen: boolean) => {
      if (isApiConfigured()) {
        await apiFreezeUserBalance(userId, frozen)
        loadFromApi()
      } else {
        const next = freezeUserBalanceInStore(userId, frozen)
        setUsersState(next)
      }
    },
    [loadFromApi]
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      if (isApiConfigured()) {
        await apiDeleteUser(userId)
        loadFromApi()
      } else {
        const next = deleteUserInStore(userId)
        if (next) setUsersState(next)
      }
    },
    [loadFromApi]
  )

  const setUserCreditScore = useCallback(
    async (userId: string, creditScore: number) => {
      const value = Math.max(0, Math.min(999, Math.round(creditScore)))
      if (isApiConfigured()) {
        await apiSetCreditScore(userId, value)
        loadFromApi()
      } else {
        setUsersState((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, creditScore: value } : u))
        )
      }
    },
    [loadFromApi]
  )

  const refreshUsersFromStore = useCallback(() => {
    if (isApiConfigured()) apiGetUsers().then(setUsersState)
    else setUsersState(getUsers())
  }, [])

  const acceptWithdrawal = useCallback(
    (withdrawalId: string) => {
      if (isApiConfigured()) {
        apiAcceptWithdrawal(withdrawalId).then(() => {
          apiGetUsers().then(setUsersState)
          apiGetWithdrawals().then(setWithdrawals)
        })
      } else {
        acceptWithdrawalInStore(withdrawalId)
        setWithdrawals(getWithdrawals())
        setUsersState(getUsers())
      }
    },
    []
  )

  const declineWithdrawal = useCallback(
    (withdrawalId: string) => {
      if (isApiConfigured()) {
        apiDeclineWithdrawal(withdrawalId).then(() => apiGetWithdrawals().then(setWithdrawals))
      } else {
        declineWithdrawalInStore(withdrawalId)
        setWithdrawals(getWithdrawals())
      }
    },
    []
  )

  const refreshWithdrawalsFromStore = useCallback(() => {
    if (isApiConfigured()) apiGetWithdrawals().then(setWithdrawals)
    else setWithdrawals(getWithdrawals())
  }, [])

  const value: AdminContextValue = {
    users,
    deposits,
    pendingDeposits,
    customerLinks,
    acceptDeposit,
    declineDeposit,
    adjustBalance,
    setCustomerLink,
    approveUser,
    lockUser,
    freezeUserBalance,
    deleteUser,
    setUserCreditScore,
    setUsers,
    refreshUsersFromStore,
    refreshData,
    withdrawals,
    pendingWithdrawals,
    acceptWithdrawal,
    declineWithdrawal,
    refreshWithdrawalsFromStore,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
