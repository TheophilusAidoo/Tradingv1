import type { AdminUser, UserDocument } from '../types/admin'
import { nowUTC, isoStringUTC } from '../utils/dateUtils'

const USERS_KEY = 'river_users'
const CURRENT_USER_ID_KEY = 'river_current_user_id'

const DEFAULT_USERS: AdminUser[] = [
  { id: '1', email: 'john@example.com', name: 'John Doe', registeredAt: '2025-01-15T10:00:00Z', balanceUsdt: 1250.5, frozenUsdt: 0, status: 'approved', documents: [] },
  { id: '2', email: 'jane@example.com', name: 'Jane Smith', registeredAt: '2025-01-20T14:30:00Z', balanceUsdt: 890, frozenUsdt: 0, status: 'approved', documents: [] },
  { id: '3', email: 'alex@example.com', name: 'Alex Brown', registeredAt: '2025-02-01T09:15:00Z', balanceUsdt: 0, frozenUsdt: 0, status: 'pending', documents: [{ id: 'doc1', type: 'ID', url: '#', uploadedAt: '2025-02-07T10:00:00Z' }] },
]

function loadUsers(): AdminUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AdminUser[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return DEFAULT_USERS.map((u) => ({ ...u }))
}

function saveUsers(users: AdminUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getUsers(): AdminUser[] {
  return loadUsers()
}

export function saveUsersToStore(users: AdminUser[]) {
  saveUsers(users)
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(CURRENT_USER_ID_KEY)
}

export function setCurrentUserId(id: string | null) {
  if (id == null) localStorage.removeItem(CURRENT_USER_ID_KEY)
  else localStorage.setItem(CURRENT_USER_ID_KEY, id)
}

export function addDocumentForUser(userId: string, doc: Omit<UserDocument, 'uploadedAt'>): AdminUser[] {
  const users = loadUsers()
  const docWithDate: UserDocument = { ...doc, uploadedAt: isoStringUTC() }
  const next = users.map((u) =>
    u.id === userId ? { ...u, documents: [...u.documents, docWithDate] } : u
  )
  saveUsers(next)
  return next
}

export function setUserWithdrawalAddress(userId: string, address: string, network?: string): void {
  const users = loadUsers()
  const next = users.map((u) =>
    u.id === userId ? { ...u, mainWithdrawalAddress: address, mainWithdrawalNetwork: network ?? 'USDT (TRC20)' } : u
  )
  saveUsers(next)
}

export function setUserWithdrawalPassword(userId: string): void {
  const users = loadUsers()
  const next = users.map((u) =>
    u.id === userId ? { ...u, hasWithdrawalPassword: true } : u
  )
  saveUsers(next)
}

export function addFrozenToUser(userId: string, amount: number): void {
  const users = loadUsers()
  const next = users.map((u) =>
    u.id === userId ? { ...u, frozenUsdt: (u.frozenUsdt ?? 0) + amount } : u
  )
  saveUsers(next)
}

export function removeFrozenFromUser(userId: string, amount: number): void {
  const users = loadUsers()
  const next = users.map((u) =>
    u.id === userId ? { ...u, frozenUsdt: Math.max(0, (u.frozenUsdt ?? 0) - amount) } : u
  )
  saveUsers(next)
}

export function deductBalanceAndFrozen(userId: string, amount: number): void {
  const users = loadUsers()
  const next = users.map((u) =>
    u.id === userId
      ? {
          ...u,
          balanceUsdt: Math.max(0, u.balanceUsdt - amount),
          frozenUsdt: Math.max(0, (u.frozenUsdt ?? 0) - amount),
        }
      : u
  )
  saveUsers(next)
}

export function approveUserInStore(userId: string): AdminUser[] {
  const users = loadUsers()
  const next = users.map((u) => (u.id === userId ? { ...u, status: 'approved' as const } : u))
  saveUsers(next)
  return next
}

export function lockUserInStore(userId: string, locked: boolean): AdminUser[] {
  const users = loadUsers()
  const next = users.map((u) => (u.id === userId ? { ...u, locked } : u))
  saveUsers(next)
  return next
}

export function freezeUserBalanceInStore(userId: string, frozen: boolean): AdminUser[] {
  const users = loadUsers()
  const next = users.map((u) => (u.id === userId ? { ...u, balanceFrozen: frozen } : u))
  saveUsers(next)
  return next
}

export function deleteUserInStore(userId: string): AdminUser[] | null {
  const users = loadUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) return null
  if (user.isAdmin) return null
  const next = users.filter((u) => u.id !== userId)
  saveUsers(next)
  return next
}

export function addUser(email: string, name?: string, referralCodeUsed?: string): AdminUser {
  const users = loadUsers()
  const id = `user_${nowUTC()}_${Math.random().toString(36).slice(2, 9)}`
  const newUser: AdminUser = {
    id,
    email,
    name: name ?? email.split('@')[0] ?? 'User',
    registeredAt: isoStringUTC(),
    balanceUsdt: 0,
    status: 'approved',
    documents: [],
    referralCodeUsed,
    creditScore: 100,
  }
  users.push(newUser)
  saveUsers(users)
  return newUser
}
