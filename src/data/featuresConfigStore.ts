const FEATURES_LEVERS_KEY = 'river_admin_features_levers'
const FEATURES_PERIODS_KEY = 'river_admin_features_periods'

const DEFAULT_LEVERS = ['2x', '5x', '10x', '20x', '30x']

export interface FeaturesPeriod {
  seconds: number
  percent: number
}

const DEFAULT_PERIODS: FeaturesPeriod[] = [
  { seconds: 60, percent: 20 },
  { seconds: 90, percent: 30 },
  { seconds: 120, percent: 50 },
  { seconds: 180, percent: 100 },
  { seconds: 240, percent: 200 },
]

export function getFeaturesLevers(): string[] {
  try {
    const raw = localStorage.getItem(FEATURES_LEVERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as string[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return [...DEFAULT_LEVERS]
}

export function saveFeaturesLevers(levers: string[]) {
  localStorage.setItem(FEATURES_LEVERS_KEY, JSON.stringify(levers.filter((l) => l.trim().length > 0)))
}

export function parseLeverValue(lever: string): number {
  const m = lever.match(/^(\d+(?:\.\d+)?)x$/i)
  return m ? parseFloat(m[1]) : 1
}

export function getFeaturesPeriods(): FeaturesPeriod[] {
  try {
    const raw = localStorage.getItem(FEATURES_PERIODS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as FeaturesPeriod[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return DEFAULT_PERIODS.map((p) => ({ ...p }))
}

export function saveFeaturesPeriods(periods: FeaturesPeriod[]) {
  localStorage.setItem(
    FEATURES_PERIODS_KEY,
    JSON.stringify(periods.filter((p) => p.seconds > 0 && p.percent >= 0))
  )
}
