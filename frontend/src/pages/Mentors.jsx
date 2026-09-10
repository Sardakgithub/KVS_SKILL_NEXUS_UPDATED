import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Users, Star, Calendar, Clock, CheckCircle, Video, MessageSquare, AlertCircle, ArrowLeft } from 'lucide-react'

export const Mentors = () => {
  const [activeTab, setActiveTab] = useState('explore') // 'explore' | 'my-bookings'
  const [mentors, setMentors] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [selectedMentor, setSelectedMentor] = useState(null)
  
  const todayStr = new Date().toISOString().split('T')[0]
  const [bookingDate, setBookingDate] = useState(todayStr)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchMentors()
    fetchMyBookings()
  }, [])

  const fetchMentors = async () => {
    try {
      const res = await api.get('/mentors/')
      if (res.success) setMentors(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBookings = async () => {
    try {
      const res = await api.get('/mentors/bookings/my/')
      if (res.success) {
        setMyBookings(res.data?.results || res.data || [])
      }
    } catch (err) {
      console.error('Failed to load my bookings', err)
    }
  }

  const handleBookSession = async (e) => {
    e.preventDefault()
    if (!selectedMentor) return

    setSubmitting(true)
    setMessage(null)
    try {
      const res = await api.post('/mentors/bookings/create/', {
        mentor_id: selectedMentor.id,
        date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes || '1-on-1 career guidance session request.',
      })
      if (res.success) {
        setMessage({ type: 'success', text: `Session request successfully sent to ${selectedMentor.user?.full_name}!` })
        setSelectedMentor(null)
        setNotes('')
        fetchMyBookings()
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to book session.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Industry Mentors...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="var(--accent-violet)" size={24} /> 1-on-1 Industry Mentorship
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Connect 1-on-1 with verified experts from Google, Microsoft, Meta & top tech firms for career guidance, resume reviews, and mock interviews
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('explore')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-lg)',
            border: activeTab === 'explore' ? '1px solid var(--accent-violet)' : '1px solid transparent',
            background: activeTab === 'explore' ? 'rgba(99,102,241,0.18)' : 'transparent',
            color: activeTab === 'explore' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <Users size={16} /> Explore Industry Mentors ({mentors.length})
        </button>

        <button
          onClick={() => setActiveTab('my-bookings')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-lg)',
            border: activeTab === 'my-bookings' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
            background: activeTab === 'my-bookings' ? 'rgba(6,182,212,0.18)' : 'transparent',
            color: activeTab === 'my-bookings' ? '#fff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
          }}
        >
          <Calendar size={16} /> My Booked 1-on-1 Sessions ({myBookings.length})
        </button>
      </div>

      {/* Alert Banner */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: message.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#f87171',
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* ── TAB 1: Explore Mentors ── */}
      {activeTab === 'explore' && (
        <>
          {/* Booking Modal / Drawer View */}
          {selectedMentor && (
            <div className="glass-panel" style={{
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.1) 100%)',
              border: '1px solid rgba(99,102,241,0.4)',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar color="var(--accent-violet)" size={20} /> Request 1-on-1 Session with {selectedMentor.user?.full_name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                {selectedMentor.job_title} @ {selectedMentor.company} • ${selectedMentor.hourly_rate || '50'}/hr
              </p>

              <form onSubmit={handleBookSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Session Date</label>
                    <input
                      type="date"
                      className="input-glass"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Start Time</label>
                    <input
                      type="time"
                      className="input-glass"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>End Time</label>
                    <input
                      type="time"
                      className="input-glass"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Topic / Session Notes for Mentor</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="e.g. System Design interview practice, Resume review, Backend career advice"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setSelectedMentor(null)} className="btn-secondary" style={{ padding: '10px 18px' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: '10px 22px' }}>
                    {submitting ? 'Sending Request...' : 'Send Booking Request'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mentor Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
            {mentors.map((m) => (
              <div key={m.id} className="glass-panel" style={{
                padding: '24px',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                height: '100%',
                border: '1px solid var(--border-glass)',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      color: '#fff',
                      flexShrink: 0,
                    }}>
                      {m.user?.full_name?.[0] || 'M'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{m.user?.full_name}</h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.job_title} @ {m.company}</div>
                    </div>
                  </div>

                  {m.bio && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: '1.45' }}>
                      {m.bio}
                    </p>
                  )}

                  {m.education && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                      🎓 {m.education}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    <span className="badge badge-amber"><Star size={12} /> {m.average_rating || '5.0'} ({m.total_reviews || 0} reviews)</span>
                    <span className="badge badge-indigo">{m.years_experience || 5}+ Yrs Exp</span>
                    {m.session_duration && <span className="badge badge-purple"><Clock size={12} /> {m.session_duration} mins</span>}
                    {m.hourly_rate && <span className="badge badge-emerald">${m.hourly_rate}/hr</span>}
                  </div>

                  {m.languages_spoken && m.languages_spoken.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '10px' }}>
                      🗣️ Languages: {m.languages_spoken.join(', ')}
                    </div>
                  )}

                  {m.expertise && m.expertise.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {m.expertise.map((exp, i) => (
                        <span key={i} style={{
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          background: 'rgba(79, 70, 229, 0.08)',
                          border: '1px solid rgba(79, 70, 229, 0.2)',
                          fontSize: '0.75rem',
                          color: '#4338ca',
                          fontWeight: 500,
                          whiteSpace: 'nowrap'
                        }}>
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMentor(m)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '12px 20px' }}
                >
                  <Calendar size={16} /> Book 1-on-1 Session
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── TAB 2: My Booked 1-on-1 Sessions ── */}
      {activeTab === 'my-bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myBookings.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-xl)', color: 'var(--text-muted)' }}>
              <Calendar size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Booked 1-on-1 Sessions Yet</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                Browse verified industry experts in the "Explore Industry Mentors" tab to schedule your first 1-on-1 session!
              </p>
            </div>
          ) : (
            myBookings.map((b) => {
              const statusColors = {
                pending: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', label: 'Pending Mentor Approval' },
                accepted: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#34d399', label: 'Confirmed / Scheduled' },
                completed: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', color: '#818cf8', label: 'Completed' },
                rejected: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Declined' },
                cancelled: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#f87171', label: 'Cancelled' },
              }
              const sc = statusColors[b.status] || statusColors.pending
              const mentorName = b.mentor_name || b.mentor?.full_name || 'Industry Mentor'

              return (
                <div
                  key={b.id}
                  className="glass-panel"
                  style={{
                    padding: '22px 26px',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
                      }}>
                        {mentorName[0]}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{mentorName}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {b.date}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} /> {b.start_time} – {b.end_time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '5px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.05)',
                      color: sc.color,
                      border: `1px solid ${sc.border}`,
                    }}>
                      {sc.label}
                    </span>
                  </div>

                  {b.notes && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Notes: </strong> {b.notes}
                    </div>
                  )}

                  {b.meeting_link && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <Video size={14} /> Join Video Session
                      </a>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
