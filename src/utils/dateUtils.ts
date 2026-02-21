/**
 * UTC-based date/time utilities for timer calculations and display.
 * All timers and countdowns use UTC to ensure consistency across timezones.
 */

/** Current time in UTC (milliseconds since epoch) */
export function nowUTC(): number {
  return Date.now()
}

/** Current time as ISO string in UTC (e.g. for createdAt, endsAt) */
export function isoStringUTC(): string {
  return new Date(nowUTC()).toISOString()
}

/** Parse a date string as UTC. Handles "YYYY-MM-DD HH:mm:ss" and ISO format. */
export function parseAsUTC(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return NaN
  let normalized = dateStr.trim()
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T') + 'Z'
  } else if (!normalized.endsWith('Z') && !normalized.includes('+') && !/-\d{2}:\d{2}$/.test(normalized)) {
    normalized = normalized + 'Z'
  }
  return new Date(normalized).getTime()
}

/** Format countdown from now to endsAt (both UTC epoch ms). Returns "H:MM:SS" or "0:00:00" when done. */
export function formatCountdownUTC(endsAt: string): string {
  const end = parseAsUTC(endsAt)
  const now = nowUTC()
  if (Number.isNaN(end) || now >= end) return '0:00:00'
  const diff = Math.max(0, Math.floor((end - now) / 1000))
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Format countdown for Features (M:SS) */
export function formatCountdownShortUTC(endsAtMs: number): string {
  const now = nowUTC()
  if (now >= endsAtMs) return '0:00'
  const secLeft = Math.max(0, Math.floor((endsAtMs - now) / 1000))
  return `${Math.floor(secLeft / 60)}:${String(secLeft % 60).padStart(2, '0')}`
}

/** Seconds left until endsAt (UTC). endsAt can be epoch ms or ISO/MySQL string. */
export function secondsLeftUTC(endsAt: number | string): number {
  const endMs = typeof endsAt === 'number' ? endsAt : parseAsUTC(String(endsAt))
  const now = nowUTC()
  if (Number.isNaN(endMs)) return 0
  return Math.max(0, Math.floor((endMs - now) / 1000))
}

/** Current date string in UTC (YYYY-MM-DD) */
export function dateStrUTC(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

/** Current time string in UTC (HH:mm) */
export function timeStrUTC(): string {
  const d = new Date()
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

/** Format date for display in UTC */
export function formatDateUTC(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr || typeof dateStr !== 'string') return ''
  const ms = parseAsUTC(dateStr)
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, { ...options, timeZone: 'UTC' })
}
