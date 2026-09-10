import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import { Users, Star, Calendar, Clock, CheckCircle, AlertCircle, TrendingUp, Award } from 'lucide-react'

export const MentorDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [upcomingBookings, setUpcomingBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMentorData()
  }, [])

  const fetchMentorData = async () => {
    try {
      const [bookingsRes] = await Promise.all([
        api.get('/mentors/bookings/my/'),
      ])
      if (bookingsRes.success) {
        const bookings = bookingsRes.data?.results || bookingsRes.data || []
        setUpcomingBookings(bookings.slice(0, 5))
        setStats({
          total_bookings: bookings.length,
          pending_bookings: bookings.filter((b) => b.status === 'pending').length,
          confirmed_bookings: bookings.filter((b) => b.status === 'confirmed').length,
          completed_sessions: bookings.filter((b) => b.status === 'completed').length,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading mentor dashboard...</div>
  }

  const statCards = [
    { title: 'Total Bookings', value: stats?.total_bookings || 0, icon: Calendar, color: 'var(--accent-blue)', bg: 'rgba(59,130,246,0.15)' },
    { title: 'Pending Requests', value: stats?.pending_bookings || 0, icon: AlertCircle, color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.15)' },
    { title: 'Confirmed Sessions', value: stats?.confirmed_bookings || 0, icon: CheckCircle, color: 'var(--accent-emerald)', bg: 'rgba(16,185,129,0.15)' },
    { title: 'Completed Sessions', value: stats?.completed_sessions || 0, icon: Award, color: 'var(--accent-violet)', bg: 'rgba(139,92,246,0.15)' },
  ]

  const getStatusColor = (status) => {
    const map = {
      pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', label: 'Pending' },
      confirmed: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Confirmed' },
      completed: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', label: 'Completed' },
      cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', label: 'Cancelled' },
    }
    return map[status] || map.pending
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 100%)',
          border: '1px solid rgba(168,85,247,0.3)',
        }}
      >
        <span className="badge badge-purple" style={{ marginBottom: '8px' }}>
          <TrendingUp size={12} /> Mentor Portal
        </span>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          Welcome, {user?.first_name}! 🎓
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          You're shaping the careers of the next generation. Here's your session overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {statCards.map((c, i) => {
          const Icon = c.icon
          return (
            <div key={i} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{c.title}</span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} color={c.color} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{c.value}</div>
            </div>
          )
        })}
      </div>

      {/* Upcoming Bookings */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar color="var(--accent-cyan)" size={18} /> Recent Session Requests
        </h3>
        {upcomingBookings.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
            No session bookings yet. Share your profile to attract mentees!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingBookings.map((b) => {
              const sc = getStatusColor(b.status)
              return (
                <div key={b.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-glass)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{b.student?.full_name || 'Student'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      <Calendar size={12} /> {b.date} &nbsp; <Clock size={12} /> {b.start_time} – {b.end_time}
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.color,
                  }}>
                    {sc.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
