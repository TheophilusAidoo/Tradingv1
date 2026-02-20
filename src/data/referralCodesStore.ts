export type ReferralCodeStatus = 'available' | 'used'

export interface ReferralCode {
  id: string
  code: string
  status: ReferralCodeStatus
  usedBy?: string
  usedAt?: string
  createdAt: string
}

const REFERRAL_CODES_KEY = 'river_admin_referral_codes'

function loadCodes(): ReferralCode[] {
  try {
    const raw = localStorage.getItem(REFERRAL_CODES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ReferralCode[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

function saveCodes(codes: ReferralCode[]) {
  localStorage.setItem(REFERRAL_CODES_KEY, JSON.stringify(codes))
}

/** Generate a random 5-digit numeric code (10000-99999) */
function generate5DigitCode(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

/** Generate unique 5-digit code, retrying if collision */
function generateUniqueCode(existing: ReferralCode[]): string {
  const used = new Set(existing.map((c) => c.code))
  for (let i = 0; i < 100; i++) {
    const code = generate5DigitCode()
    if (!used.has(code)) {
      used.add(code)
      return code
    }
  }
  return generate5DigitCode() + String(Date.now()).slice(-2)
}

export function getReferralCodes(): ReferralCode[] {
  return loadCodes()
}

export function generateReferralCode(): ReferralCode {
  const codes = loadCodes()
  const code = generateUniqueCode(codes)
  const newCode: ReferralCode = {
    id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    code,
    status: 'available',
    createdAt: new Date().toISOString(),
  }
  codes.push(newCode)
  saveCodes(codes)
  return newCode
}

/** Validate that a code exists and is available. Returns the code object if valid. */
export function validateReferralCode(input: string): ReferralCode | null {
  const trimmed = String(input).trim()
  if (trimmed.length !== 5 || !/^\d{5}$/.test(trimmed)) return null
  const codes = loadCodes()
  const found = codes.find((c) => c.code === trimmed && c.status === 'available')
  return found ?? null
}

/** Mark a code as used. Returns true if successful. */
export function markReferralCodeAsUsed(code: string, usedBy: string): boolean {
  const codes = loadCodes()
  const idx = codes.findIndex((c) => c.code === code && c.status === 'available')
  if (idx === -1) return false
  codes[idx] = {
    ...codes[idx],
    status: 'used',
    usedBy,
    usedAt: new Date().toISOString(),
  }
  saveCodes(codes)
  return true
}
