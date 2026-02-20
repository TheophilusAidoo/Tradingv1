import type { PaymentMethod } from '../types/admin'

const PAYMENT_METHODS_KEY = 'river_payment_methods'

function load(): PaymentMethod[] {
  try {
    const raw = localStorage.getItem(PAYMENT_METHODS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PaymentMethod[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function save(methods: PaymentMethod[]) {
  localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(methods))
}

export function getPaymentMethods(): PaymentMethod[] {
  return load()
}

export function addPaymentMethod(method: Omit<PaymentMethod, 'id'>): PaymentMethod[] {
  const methods = load()
  const id = `pm-${Date.now()}`
  const next = [...methods, { ...method, id }]
  save(next)
  return next
}

export function updatePaymentMethod(id: string, updates: Partial<Omit<PaymentMethod, 'id'>>): PaymentMethod[] {
  const methods = load()
  const next = methods.map((m) => (m.id === id ? { ...m, ...updates } : m))
  save(next)
  return next
}

export function removePaymentMethod(id: string): PaymentMethod[] {
  const methods = load().filter((m) => m.id !== id)
  save(methods)
  return methods
}

export function savePaymentMethods(methods: PaymentMethod[]) {
  save(methods)
}
