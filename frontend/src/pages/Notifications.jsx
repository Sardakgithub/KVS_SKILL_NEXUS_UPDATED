import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Bell, CheckCheck, AlertCircle, BookOpen, Award, Briefcase, Users, Info } from 'lucide-react'

const ICON_MAP = {
  course: BookOpen,
  assessment: Award,
  job: Briefcase,
  mentor: Users,
  certificate: Award,
  system: Info,
}

const TYPE_COLORS = {
  course: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: 'var(--accent-blue)' },
  assessment: { bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', icon: 'var(--accent-violet)' },
  job: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', icon: 'var(--accent-emerald)' },
  mentor: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: 'var(--accent-amber)' },
  certificate: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: 'var(--accent-amber)' },
  system: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', icon: 'var(--accent-violet)' },
}

export const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      if (res.success) {
        setNotifications(res.data?.results || res.data || [])
      }
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read/`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    setMarkingAll(true)
    try {
      await api.post('/notifications/mark-all-read/')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        <Bell size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
        <p>Loading notifications...</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell color="var(--accent-violet)" size={24} />
            Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--accent-pink)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                boxShadow: '0 0 10px rgba(236,72,153,0.5)',
              }}>
                {unreadCount} new
              </span>
            )}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Stay up to date with your learning activity, sessions, and platform updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <CheckCheck size={16} />
            {markingAll ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
      </div>

      {/* Notification List */}
      {notifications.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '60px',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'rgba(99,102,241,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bell size={32} color="var(--accent-violet)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>All Caught Up!</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '300px' }}>
            No notifications right now. Complete a course or book a mentor session to get started.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notif) => {
            const typeKey = notif.notification_type?.split('_')[0] || 'system'
            const colors = TYPE_COLORS[typeKey] || TYPE_COLORS.system
            const Icon = ICON_MAP[typeKey] || Info
            return (
              <div
                key={notif.id}
                className="glass-panel"
                style={{
                  padding: '20px 24px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  background: notif.is_read
                    ? 'var(--bg-card)'
                    : `linear-gradient(135deg, ${colors.bg} 0%, var(--bg-card) 100%)`,
                  border: notif.is_read
                    ? '1px solid var(--border-glass)'
                    : `1px solid ${colors.border}`,
                  cursor: notif.is_read ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
              >
                {/* Unread dot */}
                {!notif.is_read && (
                  <div style={{
                    position: 'absolute',
                    top: '18px',
                    right: '20px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.icon,
                    boxShadow: `0 0 8px ${colors.icon}`,
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={20} color={colors.icon} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: notif.is_read ? 500 : 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                    {notif.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(notif.created_at).toLocaleString()}
                    {!notif.is_read && (
                      <span style={{ color: colors.icon, marginLeft: '12px', fontWeight: 600 }}>
                        Click to mark as read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
