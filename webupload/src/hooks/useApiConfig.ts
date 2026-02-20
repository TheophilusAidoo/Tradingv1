import { useState, useEffect, useCallback } from 'react'
import { getFeaturesLevers, getFeaturesPeriods, saveFeaturesLevers, saveFeaturesPeriods } from '../data/featuresConfigStore'
import { isApiConfigured, apiGetFeaturesPeriods, apiGetFeaturesLevers, apiSaveFeaturesPeriods, apiSaveFeaturesLevers } from '../data/apiBridge'

export interface FeaturesPeriod {
  seconds: number
  percent: number
}

export function useFeaturesConfig() {
  const [periods, setPeriods] = useState<FeaturesPeriod[]>(() =>
    isApiConfigured() ? [] : getFeaturesPeriods()
  )
  const [levers, setLevers] = useState<string[]>(() =>
    isApiConfigured() ? [] : getFeaturesLevers()
  )
  const [loading, setLoading] = useState(isApiConfigured())
  const [loaded, setLoaded] = useState(!isApiConfigured())

  useEffect(() => {
    if (!isApiConfigured()) return
    setLoading(true)
    Promise.all([apiGetFeaturesPeriods(), apiGetFeaturesLevers()])
      .then(([p, l]) => {
        setPeriods(p)
        setLevers(l)
        setLoaded(true)
      })
      .catch(() => {
        setPeriods(getFeaturesPeriods())
        setLevers(getFeaturesLevers())
        setLoaded(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const savePeriods = useCallback(async (p: FeaturesPeriod[]) => {
    if (isApiConfigured()) {
      await apiSaveFeaturesPeriods(p)
      setPeriods(p)
    } else {
      saveFeaturesPeriods(p)
      setPeriods(p)
    }
  }, [])

  const saveLevers = useCallback(async (l: string[]) => {
    if (isApiConfigured()) {
      await apiSaveFeaturesLevers(l)
      setLevers(l)
    } else {
      saveFeaturesLevers(l)
      setLevers(l)
    }
  }, [])

  return {
    periods: loaded ? periods : getFeaturesPeriods(),
    levers: loaded ? levers : getFeaturesLevers(),
    loading,
    savePeriods,
    saveLevers,
  }
}
