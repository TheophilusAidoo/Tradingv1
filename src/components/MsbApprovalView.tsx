import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useVerification } from '../contexts/VerificationContext'
import { isApiConfigured, apiGetMsbApprovalStatus, apiSubmitMsbApproval } from '../data/apiBridge'
import { isoStringUTC } from '../utils/dateUtils'

interface MsbApprovalViewProps {
  open: boolean
  onClose: () => void
}

type Slot = 'front' | 'back'

export function MsbApprovalView({ open, onClose }: MsbApprovalViewProps) {
  const { t } = useLanguage()
  const { currentUser } = useVerification()
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState<Slot | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [status, setStatus] = useState<{ submitted: boolean; status?: string; submittedAt?: string; frontUrl?: string; backUrl?: string } | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open || !isApiConfigured() || !currentUser?.id) return
    setStatusLoading(true)
    apiGetMsbApprovalStatus(currentUser.id)
      .then((res) => setStatus(res))
      .catch(() => setStatus({ submitted: false }))
      .finally(() => setStatusLoading(false))
  }, [open, currentUser?.id])

  const handleFileChange = (slot: Slot) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (slot === 'front') setFrontFile(file)
      else setBackFile(file)
    }
    e.target.value = ''
  }

  const handleDrop = (slot: Slot) => (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (slot === 'front') setFrontFile(file)
      else setBackFile(file)
    }
  }

  const handleDragOver = (slot: Slot) => (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(slot)
  }

  const removeFile = (slot: Slot) => {
    if (slot === 'front') setFrontFile(null)
    else setBackFile(null)
  }

  const handleSubmit = async () => {
    if (!currentUser || !frontFile || !backFile) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('userId', currentUser.id)
      formData.append('userEmail', currentUser.email ?? '')
      formData.append('frontFile', frontFile)
      formData.append('backFile', backFile)
      const res = await apiSubmitMsbApproval(formData)
      if (res.success) {
        setStatus({ submitted: true, status: 'pending', submittedAt: isoStringUTC() })
        setFrontFile(null)
        setBackFile(null)
      } else {
        setSubmitError(res.error ?? 'Failed to submit')
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const alreadySubmitted = status?.submitted === true
  const canSubmit = isApiConfigured() && currentUser && frontFile && backFile && !submitting

  const dropZoneStyle = (slot: Slot): React.CSSProperties => ({
    border: `2px dashed ${dragOver === slot ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
    borderRadius: 12,
    padding: 20,
    textAlign: 'center' as const,
    background: dragOver === slot ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: 12,
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="MSB Approval"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 65,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(10,10,11,0.9)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 10,
            color: 'var(--text)',
          }}
        >
          <BackIcon />
        </button>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text)' }}>
          {t('msbApproval.title')}
        </h1>
        <span style={{ width: 40 }} />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px 60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'var(--card)',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
            overflow: 'hidden',
            padding: 24,
          }}
        >
          {statusLoading ? (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Loading…</p>
          ) : alreadySubmitted ? (
            <>
              <div
                style={{
                  padding: 16,
                  background: 'rgba(34,197,94,0.12)',
                  borderRadius: 12,
                  border: '1px solid rgba(34,197,94,0.3)',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600, margin: '0 0 8px' }}>
                  {t('msbApproval.alreadySubmitted')}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {t('msbApproval.noNeedToSubmit')}
                </p>
              </div>
              {status?.status && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Status: <span style={{ textTransform: 'capitalize', color: 'var(--text)' }}>{status.status}</span>
                </p>
              )}
            </>
          ) : !isApiConfigured() ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t('msbApproval.uploadIdCardHint')}</p>
          ) : !currentUser ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Please sign in to submit documents.</p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                {t('msbApproval.uploadIdCardHint')}
              </p>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                  {t('msbApproval.front')}
                </div>
                {frontFile ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {frontFile.name}
                    </span>
                    <button type="button" onClick={() => removeFile('front')} aria-label="Remove" style={removeBtnStyle}>
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <div
                    style={dropZoneStyle('front')}
                    onClick={() => frontInputRef.current?.click()}
                    onDrop={handleDrop('front')}
                    onDragOver={handleDragOver('front')}
                    onDragLeave={() => setDragOver(null)}
                  >
                    <input ref={frontInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange('front')} style={{ display: 'none' }} />
                    <UploadIcon />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{t('msbApproval.dropOrClick')}</div>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                  {t('msbApproval.back')}
                </div>
                {backFile ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {backFile.name}
                    </span>
                    <button type="button" onClick={() => removeFile('back')} aria-label="Remove" style={removeBtnStyle}>
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <div
                    style={dropZoneStyle('back')}
                    onClick={() => backInputRef.current?.click()}
                    onDrop={handleDrop('back')}
                    onDragOver={handleDragOver('back')}
                    onDragLeave={() => setDragOver(null)}
                  >
                    <input ref={backInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange('back')} style={{ display: 'none' }} />
                    <UploadIcon />
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{t('msbApproval.dropOrClick')}</div>
                  </div>
                )}
              </div>

              {submitError && (
                <div style={{ padding: 10, marginBottom: 12, background: 'rgba(239,68,68,0.15)', borderRadius: 10, color: 'var(--negative)', fontSize: 12 }}>
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: '100%',
                  padding: 14,
                  borderRadius: 12,
                  border: 'none',
                  background: canSubmit ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                  color: canSubmit ? '#fff' : 'var(--text-muted)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {submitting ? 'Submitting…' : t('msbApproval.submit')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const removeBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  background: 'rgba(239,68,68,0.15)',
  borderRadius: 6,
  color: 'var(--negative)',
  marginLeft: 8,
}

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto' }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}
