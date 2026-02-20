import { useRef } from 'react'
import { useVerification } from '../contexts/VerificationContext'

function DocumentIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function CheckCircleIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={style}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  )
}

export function VerificationPendingView() {
  const { currentUser, uploadDocument, refreshUser } = useVerification()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    uploadDocument(file.name.endsWith('.pdf') ? 'PDF' : 'Document', url)
    e.target.value = ''
  }

  if (!currentUser) return null

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 400,
          background: 'var(--card)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: 32,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'rgba(234,179,8,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <DocumentIcon size={32} style={{ color: '#eab308' }} />
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 700 }}>
          Account under review
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          We are reviewing your documents. You will be able to use the platform once approved.
        </p>
        {currentUser.documents.length > 0 && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
            <CheckCircleIcon size={18} style={{ verticalAlign: 'middle', marginRight: 6, display: 'inline-block' }} />
            {currentUser.documents.length} document(s) uploaded
          </p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={refreshUser}
          style={{
            width: '100%',
            padding: 12,
            marginBottom: 12,
            borderRadius: 12,
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            color: 'var(--text-muted)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Check approval status
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: '1px dashed rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <DocumentIcon size={20} />
          Upload another document
        </button>
      </div>
    </div>
  )
}
