import { useState } from 'react'
import {
  IoStatsChartOutline,
  IoPersonCircleOutline,
  IoArrowDownCircleOutline,
  IoWalletOutline,
  IoChatbubbleEllipsesOutline,
  IoDocumentTextOutline,
  IoCardOutline,
  IoSettingsOutline,
  IoArrowUpCircleOutline,
  IoLogOutOutline,
  IoGiftOutline,
  IoMenuOutline,
  IoCloseOutline,
} from './adminIcons'
import { useAdminAuth } from '../contexts/AdminAuthContext'

interface AdminLayoutProps {
  pathname: string
  onNavigate: (path: string) => void
  children: React.ReactNode
}

const APP_BASE = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'

const navItems = [
  { path: '/admin', label: 'Dashboard', Icon: IoStatsChartOutline },
  { path: '/admin/users', label: 'Users', Icon: IoPersonCircleOutline },
  { path: '/admin/referral-codes', label: 'Referral codes', Icon: IoGiftOutline },
  { path: '/admin/verification', label: 'Verification', Icon: IoDocumentTextOutline },
  { path: '/admin/msb-approvals', label: 'MSB Approvals', Icon: IoDocumentTextOutline },
  { path: '/admin/deposits', label: 'Deposits', Icon: IoArrowDownCircleOutline },
  { path: '/admin/withdrawals', label: 'Withdrawals', Icon: IoArrowUpCircleOutline },
  { path: '/admin/balance', label: 'Balance', Icon: IoWalletOutline },
  { path: '/admin/pledges', label: 'Pledges', Icon: IoCardOutline },
  { path: '/admin/features-orders', label: 'Features orders', Icon: IoStatsChartOutline },
  { path: '/admin/payment-methods', label: 'Payment methods', Icon: IoCardOutline },
  { path: '/admin/customer-service', label: 'Support links', Icon: IoChatbubbleEllipsesOutline },
  { path: '/admin/chat', label: 'River Customer Service', Icon: IoChatbubbleEllipsesOutline },
  { path: '/admin/settings', label: 'Settings', Icon: IoSettingsOutline },
]

export function AdminLayout({ pathname, onNavigate, children }: AdminLayoutProps) {
  const { logout } = useAdminAuth()
  const homeHref = APP_BASE.replace(/\/$/, '') || '/'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)
  const handleNav = (path: string) => {
    onNavigate(path)
    setSidebarOpen(false)
  }

  return (
    <div className="admin-root">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          role="button"
          tabIndex={0}
          onClick={closeSidebar}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          aria-label="Close menu"
        />
      )}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-logo">RIVER</span>
          <span className="admin-sidebar-badge">Admin</span>
        </div>
        <div className="admin-sidebar-close" aria-hidden="true">
          <button type="button" onClick={closeSidebar} aria-label="Close menu" className="admin-sidebar-close-btn">
            <IoCloseOutline size={22} />
          </button>
        </div>
        <nav className="admin-nav">
          {navItems.map(({ path, label, Icon }) => {
            const active = pathname === path || (path !== '/admin' && pathname.startsWith(path))
            return (
              <button
                key={path}
                type="button"
                onClick={() => handleNav(path)}
                className={`admin-nav-item ${active ? 'admin-nav-item-active' : ''}`}
              >
                <span className="admin-nav-icon">
                  <Icon size={20} />
                </span>
                <span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <a href={homeHref} className="admin-logout-link" onClick={(e) => { e.preventDefault(); logout(); handleNav('/admin'); }}>
            <IoLogOutOutline size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Log out
          </a>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <IoMenuOutline size={24} />
          </button>
          <h1 className="admin-header-title">
            {navItems.find((n) => n.path === pathname || (n.path !== '/admin' && pathname.startsWith(n.path)))?.label ?? 'Dashboard'}
          </h1>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </div>

      <style>{`
        .admin-root {
          min-height: 100vh;
          display: flex;
          background: #0f0f11;
          color: #e4e4e7;
        }
        .admin-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: #16161a;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
        }
        .admin-sidebar-brand {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .admin-sidebar-logo {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #fff;
        }
        .admin-sidebar-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #22c55e;
          background: rgba(34,197,94,0.15);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .admin-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-radius: 10px;
          background: transparent;
          color: #a1a1aa;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #e4e4e7;
        }
        .admin-nav-item-active {
          background: rgba(34,197,94,0.12);
          color: #22c55e;
        }
        .admin-nav-item-active:hover {
          background: rgba(34,197,94,0.18);
          color: #22c55e;
        }
        .admin-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .admin-logout-link {
          font-size: 13px;
          color: #71717a;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          padding: 8px 0;
          margin-top: 4px;
          transition: color 0.15s;
        }
        .admin-logout-link:hover {
          color: #ef4444;
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .admin-header {
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(0,0,0,0.2);
        }
        .admin-header-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
        }
        .admin-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }
        .admin-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-right: 12px;
          border: none;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          color: #e4e4e7;
          cursor: pointer;
        }
        .admin-sidebar-close {
          display: none;
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .admin-sidebar-close-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
          color: #e4e4e7;
          cursor: pointer;
        }
        .admin-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(0,0,0,0.6);
        }
        @media (max-width: 768px) {
          .admin-menu-btn { display: flex; }
          .admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 50;
            width: 280px;
            max-width: 85vw;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }
          .admin-sidebar-open { transform: translateX(0); }
          .admin-sidebar-close { display: block; }
          .admin-sidebar-overlay { display: block; }
          .admin-header {
            padding: 16px 20px;
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(20px, env(safe-area-inset-right));
          }
          .admin-header-title { font-size: 18px; }
          .admin-content {
            padding: 20px 16px;
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
            padding-bottom: max(20px, env(safe-area-inset-bottom));
          }
        }
        @media (max-width: 480px) {
          .admin-content { padding: 16px 12px; }
          .admin-header-title { font-size: 16px; }
        }
      `}</style>
    </div>
  )
}
