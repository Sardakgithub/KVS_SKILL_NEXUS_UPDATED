import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import {
  LayoutDashboard, Compass, BookOpen, Award, FileText,
  Briefcase, Users, Bell, LogOut, Settings,
  Shield, BarChart2, CheckSquare, UserCheck, ArrowLeft, Menu, X
} from 'lucide-react'

export const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(3)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user?.role || 'student'

  const studentNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Student Profile', icon: UserCheck, path: '/profile' },
    { label: 'Career Paths', icon: Compass, path: '/careers' },
    { label: 'Courses', icon: BookOpen, path: '/courses' },
    { label: 'Assessments', icon: CheckSquare, path: '/assessments' },
    { label: 'Resume Builder', icon: FileText, path: '/resume' },
    { label: 'Jobs & Internships', icon: Briefcase, path: '/jobs' },
    { label: 'Mentors', icon: Users, path: '/mentors' },
    { label: 'Certificates', icon: Award, path: '/certificates' },
  ]

  const mentorNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Manage Assessments', icon: CheckSquare, path: '/mentor-assessments' },
    { label: 'Session Bookings', icon: Users, path: '/mentor-bookings' },
    { label: 'Availability', icon: Settings, path: '/mentor-availability' },
    { label: 'Reviews', icon: Award, path: '/mentor-reviews' },
  ]


  const adminNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Mentor Approvals', icon: UserCheck, path: '/admin/approvals' },
    { label: 'Platform Analytics', icon: BarChart2, path: '/admin/analytics' },
  ]

  const navItems = role === 'admin' ? adminNav : (role === 'mentor' ? mentorNav : studentNav)

  return (
    <div className="app-container">
      {/* Backdrop for Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <aside
        className={`glass-panel app-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}
      >
        <div>
          {/* Logo & Mobile Close */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Link to="/" onClick={() => setIsMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '4px' }}>
              <Logo size="medium" />
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="btn-secondary"
              style={{ padding: '6px', borderRadius: '50%', display: isMobileOpen ? 'flex' : 'none' }}
              aria-label="Close Navigation Menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#4338ca' : 'var(--text-muted)',
                    background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} color={isActive ? '#4338ca' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', marginBottom: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(79, 70, 229, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'var(--accent-violet)',
              border: '1px solid var(--border-glass)',
            }}>
              {user?.first_name?.[0] || 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Header */}
        <header
          className="glass-panel app-header"
          style={{
            padding: '16px 24px',
            marginBottom: '24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="mobile-menu-btn"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} /> Navigation
            </button>

            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                Welcome back, <span className="gradient-text">{user?.first_name || 'Explorer'}</span> 👋
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Empower your career with AI-driven learning paths and expert mentorship.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/notifications"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent-pink)',
                    boxShadow: '0 0 10px var(--accent-pink)',
                  }}
                />
              )}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
