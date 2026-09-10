import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { Compass, BookOpen, CheckSquare, Users, Briefcase, Award, ArrowUpRight, TrendingUp, UserCheck, FileText, Upload } from 'lucide-react'

export const StudentDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/students/dashboard/')
      .then(res => {
        if (res.success) setStats(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Loading your dashboard...</div>
  }

  const profile = stats?.profile
  const statCards = [
    { title: 'Enrolled Courses', value: stats?.enrolled_courses_count || 0, icon: BookOpen, color: 'var(--accent-blue)', bg: 'rgba(59, 130, 246, 0.15)' },
    { title: 'Completed Courses', value: stats?.completed_courses_count || 0, icon: Award, color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.15)' },
    { title: 'Skill Assessments', value: stats?.assessments_taken || 0, icon: CheckSquare, color: 'var(--accent-violet)', bg: 'rgba(139, 92, 246, 0.15)' },
    { title: 'Mentor Sessions', value: stats?.upcoming_sessions || 0, icon: Users, color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.15)' },
    { title: 'Active Applications', value: stats?.active_applications || 0, icon: Briefcase, color: 'var(--accent-pink)', bg: 'rgba(236, 72, 153, 0.15)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* LinkedIn / Naukri Student Profile Summary Header Widget */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--primary-gradient)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', fontWeight: 'bold', color: '#fff'
          }}>
            {profile?.user?.first_name ? profile.user.first_name[0] : 'S'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700' }}>
              Welcome back, {profile?.user?.first_name || 'Student'}!
            </h2>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginTop: '2px' }}>
              {profile?.headline || 'Full Stack Software Engineer | Ready for Career Growth'}
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Status: <strong style={{ color: '#10b981' }}>{profile?.job_hunt_status === 'actively_looking' ? 'Actively Looking' : 'Open to Offers'}</strong></span>
              <span>•</span>
              <span>Notice Period: <strong>{profile?.notice_period || 'Immediate'}</strong></span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/profile" className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            <UserCheck size={16} /> Edit LinkedIn Profile Details
          </Link>
          <Link to="/resume" className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            <FileText size={16} /> Resume Manager
          </Link>
        </div>
      </div>

      {/* Stat Metric Cards */}
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

      {/* Quick Action Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span className="badge badge-purple" style={{ marginBottom: '8px' }}><TrendingUp size={12} /> AI Career Engine</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Explore Tailored Career Roadmaps</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', maxWidth: '500px' }}>
            Discover step-by-step roadmaps, required skills, and course recommendations for your dream role.
          </p>
        </div>
        <Link to="/careers" className="btn-primary">
          Explore Roadmaps <ArrowUpRight size={18} />
        </Link>
      </div>

      {/* Learning Activity Feed */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Learning History</h3>
        {stats?.recent_history?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recent_history.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-glass)',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</div>
                </div>
                <span className="badge badge-indigo">{item.event_type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
            No recent activity logged yet. Start a course or career roadmap to populate your timeline!
          </div>
        )}
      </div>
    </div>
  )
}
