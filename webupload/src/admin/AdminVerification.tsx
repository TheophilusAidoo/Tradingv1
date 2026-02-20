import { useEffect, useState } from 'react'
import { IoCheckmarkCircleOutline, IoDocumentTextOutline } from './adminIcons'
import { useAdmin } from '../contexts/AdminContext'
import type { UserDocument } from '../types/admin'
import { adminPageStyles } from './adminStyles'

function DocPreviewModal({ doc, onClose }: { doc: UserDocument; onClose: () => void }) {
  const isImage = /\.(jpe?g|png|gif|webp)$/i.test(doc.url) || doc.type.toLowerCase().match(/image|jpg|png|gif/)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Document preview"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 70,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#16161a',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: 640,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>{doc.type}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: '#22c55e', textDecoration: 'none' }}
            >
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 36,
                height: 36,
                border: 'none',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 10,
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            background: 'rgba(0,0,0,0.3)',
          }}
        >
          {doc.url && doc.url !== '#' ? (
            isImage ? (
              <img
                src={doc.url}
                alt={doc.type}
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
            ) : (
              <iframe
                src={doc.url}
                title={doc.type}
                style={{
                  width: '100%',
                  height: '70vh',
                  minHeight: 400,
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            )
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No preview available for this document.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminVerification() {
  const { users, approveUser, refreshUsersFromStore } = useAdmin()
  // Show pending users (for approval) + approved users with documents (documents stay visible after approval)
  const verificationUsers = users.filter(
    (u) => u.status === 'pending' || (u.status === 'approved' && u.documents.length > 0)
  )
  const [previewDoc, setPreviewDoc] = useState<UserDocument | null>(null)

  useEffect(() => {
    refreshUsersFromStore()
  }, [refreshUsersFromStore])

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Review uploaded documents and approve users so they can use the platform.
      </p>

      {verificationUsers.length === 0 ? (
        <div className="admin-card" style={{ padding: 48 }}>
          <div className="admin-empty">No users awaiting verification</div>
        </div>
      ) : (
        <div className="admin-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Documents</th>
                <th>Uploaded</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {verificationUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>{u.name}</span>
                        <span className={`admin-badge ${u.status === 'approved' ? 'admin-badge-success' : 'admin-badge-pending'}`}>
                          {u.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: '#71717a' }}>{u.email}</div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {u.documents.length === 0 ? (
                        <span style={{ fontSize: 13, color: '#71717a' }}>No documents yet</span>
                      ) : (
                        u.documents.map((doc) => (
                          <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 13,
                                color: '#22c55e',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                              }}
                            >
                              <IoDocumentTextOutline size={18} />
                              {doc.type} — Preview
                            </button>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 12, color: '#71717a', textDecoration: 'none' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open
                            </a>
                          </div>
                        ))
                      )}
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: '#71717a' }}>
                    {u.documents.length > 0
                      ? new Date(u.documents[u.documents.length - 1].uploadedAt).toLocaleDateString(undefined, { dateStyle: 'short' })
                      : '—'}
                  </td>
                  <td>
                    {u.status === 'pending' ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-primary"
                        onClick={() => approveUser(u.id)}
                      >
                        <IoCheckmarkCircleOutline size={18} style={{ marginRight: 6 }} />
                        Approve user
                      </button>
                    ) : (
                      <span className="admin-badge admin-badge-success">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewDoc && (
        <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}

      <style>{adminPageStyles}</style>
    </div>
  )
}
