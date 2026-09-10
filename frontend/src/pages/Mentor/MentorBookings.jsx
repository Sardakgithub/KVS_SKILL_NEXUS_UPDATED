import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Calendar, Clock, Check, X, MessageSquare, User } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', label: 'Pending Review' },
  confirmed: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399', label: 'Confirmed' },
  completed: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#818cf8', label: 'Completed' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Cancelled' },
  rejected: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Rejected' },
}

export const MentorBookings = () => {
  const [bookings, setBookings] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await api.get('/mentors/bookings/my/')
      if (res.success) {
        setBookings(res.data?.results || res.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (bookingId, action) => {
    setActionLoading(bookingId)
    try {
      const res = await api.post(`/mentors/bookings/${bookingId}/${action}/`)
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: action === 'confirm' ? 'confirmed' : 'cancelled' }
              : b
          )
        )
      }
    } catch (err) {
      console.error('Action failed', err)
    } finally {
      setActionLoading(null)
    }
  }

  const filters = ['all', 'pending', 'confirmed', 'completed', 'cancelled']
  const filtered = activeFilter === 'all' ? bookings : bookings.filter((b) => b.status === activeFilter)

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading session bookings...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--accent-cyan)" size={24} /> Session Bookings
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Review and manage your mentorship session requests from students
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-md)',
              border: activeFilter === f ? '1px solid rgba(99,102,241,0.5)' : '1px solid var(--border-glass)',
              background: activeFilter === f ? 'rgba(99,102,241,0.2)' : 'transparent',
              color: activeFilter === f ? '#fff' : 'var(--text-muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease',
            }}
          >
            {f}
            {f !== 'all' && (
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                ({bookings.filter((b) => b.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-xl)', color: 'var(--text-muted)' }}>
          <Calendar size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <h3 style={{ fontWeight: 700 }}>No {activeFilter !== 'all' ? activeFilter : ''} bookings</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Check back later or try a different filter.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((b) => {
            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
            return (
              <div
                key={b.id}
                className="glass-panel"
                style={{
                  padding: '22px 24px',
                  borderRadius: 'var(--radius-xl)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  background: sc.bg,
                  border: `1px solid ${sc.border}`,
                }}
              >
                {/* Left: Student info + time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(99,102,241,0.2)',
                    border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: 'var(--accent-violet)',
                    flexShrink: 0,
                  }}>
                    {b.student?.full_name?.[0] || <User size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{b.student?.full_name || 'Student'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {b.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {b.start_time} – {b.end_time}
                      </span>
                    </div>
                    {b.notes && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MessageSquare size={11} /> {b.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '4px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.05)',
                    color: sc.color,
                    border: `1px solid ${sc.border}`,
                  }}>
                    {sc.label}
                  </span>

                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleAction(b.id, 'confirm')}
                        disabled={actionLoading === b.id}
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
                      >
                        <Check size={14} /> Confirm
                      </button>
                      <button
                        onClick={() => handleAction(b.id, 'cancel')}
                        disabled={actionLoading === b.id}
                        className="btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
