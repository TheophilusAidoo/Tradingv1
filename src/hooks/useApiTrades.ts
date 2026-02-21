import { useState, useEffect, useCallback } from 'react'
import type { Trade } from '../types/admin'
import { parseAsUTC } from '../utils/dateUtils'
import {
  getTradesForUser,
  executeSpotTrade,
  executeFeaturesOrder,
  settleFeaturesOrder,
  processExpiredFeaturesOrders,
  getOrderEndsAt,
  getAllFeaturesOrders,
} from '../data/tradesStore'
import {
  isApiConfigured,
  apiGetTradesForUser,
  apiGetTrades,
  apiExecuteSpotTrade,
  apiExecuteFeaturesOrder,
  apiSettleFeaturesOrder,
  apiProcessExpiredFeaturesOrders,
} from '../data/apiBridge'

export function useUserTrades(userId: string | null) {
  const [trades, setTrades] = useState<Trade[]>([])

  const load = useCallback(() => {
    if (!userId) {
      setTrades([])
      return
    }
    if (isApiConfigured()) {
      apiGetTradesForUser(userId)
        .then((list) => {
          // Ensure we only show trades belonging to this user (defense in depth)
          const filtered = (list as Trade[]).filter((t) => t.userId === userId)
          setTrades(filtered)
        })
        .catch(() => setTrades([]))
    } else {
      setTrades(getTradesForUser(userId))
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { trades, refreshTrades: load }
}

export function useSpotTrade() {
  return useCallback(
    async (payload: {
      userId: string
      pair: string
      side: 'buy' | 'sell'
      price: number
      quantity: number
    }) => {
      if (isApiConfigured()) {
        return apiExecuteSpotTrade(payload)
      }
      return executeSpotTrade(
        payload.userId,
        payload.pair,
        payload.side,
        payload.price,
        payload.quantity
      )
    },
    []
  )
}

export function useFeaturesOrder() {
  return useCallback(
    async (payload: {
      userId: string
      userEmail?: string
      pair: string
      variant: 'up' | 'fall'
      amount: number
      periodSeconds: number
      periodPercent: number
      lever: string
    }) => {
      if (isApiConfigured()) {
        return apiExecuteFeaturesOrder(payload)
      }
      return executeFeaturesOrder(
        payload.userId,
        payload.userEmail ?? '',
        payload.pair,
        payload.variant,
        payload.amount,
        payload.periodSeconds,
        payload.periodPercent,
        payload.lever
      )
    },
    []
  )
}

export function useSettleFeaturesOrder() {
  return useCallback(async (tradeId: string, result: 'win' | 'lose' | 'draw') => {
    if (isApiConfigured()) {
      return apiSettleFeaturesOrder(tradeId, result)
    }
    return settleFeaturesOrder(tradeId, result)
  }, [])
}

export function useProcessExpiredOrders() {
  return useCallback(async () => {
    if (isApiConfigured()) {
      return apiProcessExpiredFeaturesOrders()
    }
    return processExpiredFeaturesOrders()
  }, [])
}

export { getOrderEndsAt }

export function useAdminFeaturesOrders() {
  const [trades, setTrades] = useState<Trade[]>([])

  const load = useCallback(async () => {
    if (isApiConfigured()) {
      const list = await apiGetTrades()
      const features = list.filter((t) => t.type === 'features')
      setTrades(features.sort((a, b) => parseAsUTC(b.createdAt) - parseAsUTC(a.createdAt)))
    } else {
      setTrades(getAllFeaturesOrders())
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { trades, load }
}
