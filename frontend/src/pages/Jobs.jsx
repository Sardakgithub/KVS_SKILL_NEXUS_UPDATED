import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Briefcase, MapPin, Building, Send, CheckCircle2 } from 'lucide-react'

export const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [internships, setInternships] = useState([])
  const [activeTab, setActiveTab] = useState('jobs')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const [jobsRes, internRes] = await Promise.all([
        api.get('/jobs/postings/'),
        api.get('/jobs/internships/'),
      ])
      if (jobsRes.success) setJobs(jobsRes.data)
      if (internRes.success) setInternships(internRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (type, id) => {
    try {
      const res = await api.post('/jobs/apply/', {
        opportunity_type: type,
        opportunity_id: id,
        cover_letter: 'Applying with my KVS Skill Nexus resume.',
      })
      if (res.success) alert('Application submitted successfully!')
    } catch (err) {
      alert(err.message || 'Already applied or application error')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Opportunities...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Jobs & Internships</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Discover active career opportunities matched to your skill profile</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setActiveTab('jobs')}
            className={activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Full-Time Jobs
          </button>
          <button
            onClick={() => setActiveTab('internships')}
            className={activeTab === 'internships' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Internships
          </button>
        </div>
      </div>

      {/* Opportunity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {(activeTab === 'jobs' ? jobs : internships).map((opp) => (
          <div key={opp.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-emerald"><Building size={12} /> {opp.company?.name || 'Partner Company'}</span>
                <span className="badge badge-indigo">{opp.job_type || (opp.is_remote ? 'Remote' : 'On-Site')}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>{opp.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '14px' }}>
                <MapPin size={14} /> {opp.location}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '16px' }}>
                {opp.description?.substring(0, 110)}...
              </p>
            </div>

            <button onClick={() => handleApply(activeTab === 'jobs' ? 'job' : 'internship', opp.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Send size={16} /> Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
