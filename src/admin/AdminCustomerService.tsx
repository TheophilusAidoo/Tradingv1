import { useAdmin } from '../contexts/AdminContext'
import { adminPageStyles } from './adminStyles'

export function AdminCustomerService() {
  const { customerLinks, setCustomerLink } = useAdmin()

  return (
    <div className="admin-page">
      <p className="admin-page-desc">
        Set Telegram and WhatsApp links for user support. Saved automatically.
      </p>
      <div className="admin-form-card">
        {customerLinks.map((link) => (
          <div key={link.id} className="admin-form-group" style={{ marginBottom: 24 }}>
            <label className="admin-form-label">{link.label}</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => setCustomerLink(link.id, e.target.value)}
              placeholder={
                link.id === 'telegram' ? 'https://t.me/your_support' : 'https://wa.me/1234567890'
              }
              className="admin-form-input"
            />
          </div>
        ))}
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#71717a' }}>
          Leave empty to hide a link in the app.
        </p>
      </div>
      <style>{adminPageStyles}</style>
    </div>
  )
}
