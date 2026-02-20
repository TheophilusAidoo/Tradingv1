import { useState, useEffect, useCallback } from 'react'
import { getPaymentMethods, savePaymentMethods } from '../data/paymentMethodsStore'
import { isApiConfigured, apiGetPaymentMethods } from '../data/apiBridge'
import type { PaymentMethod } from '../types/admin'

export function usePaymentMethods(): PaymentMethod[] {
  const [methods, setMethods] = useState<PaymentMethod[]>(() =>
    isApiConfigured() ? [] : getPaymentMethods()
  )

  const load = useCallback(async () => {
    if (isApiConfigured()) {
      try {
        const list = await apiGetPaymentMethods()
        setMethods(list)
        savePaymentMethods(list)
      } catch {
        setMethods(getPaymentMethods())
      }
    } else {
      setMethods(getPaymentMethods())
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return methods
}
