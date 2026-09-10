import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/client'
import {
  UserCheck,
  Check,
  X,
  Plus,
  Trash2,
  Users,
  Key,
  Mail,
  Lock,
  Briefcase,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Copy
} from 'lucide-react'

export const MentorApprovals = () => {
  const [activeTab, setActiveTab] = useState('onboard') // 'onboard' | 'all' | 'pending'
  const [allMentors, setAllMentors] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [createdCredentials, setCreatedCredentials] = useState(null)

  // Onboarding Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company: '',
    position: '',
    bio: '',
    hourly_rate: '50.00',
    expertise_input: 'Python, Django, React'
  })

  useEffect(() => {
    fetchMentors()
  }, [])

  const fetchMentors = async () => {
    try {
      setLoading(true)
      const [resPending, resAll] = await Promise.allSettled([
        adminApi.getPendingMentors(),
        adminApi.getAllMentors()
      ])

      if (resPending.status === 'fulfilled' && resPending.value.success) {
        setPending(resPending.value.data.results || resPending.value.data)
      }

      if (resAll.status === 'fulfilled' && resAll.value.success) {
        setAllMentors(resAll.value.data.results || resAll.value.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const extractErrorMessage = (err, fallbackText = 'Operation failed.') => {
    if (!err) return fallbackText
    if (typeof err === 'string') return err
    if (err.errors) {
      if (typeof err.errors === 'string') return err.errors
      if (typeof err.errors === 'object') {
        const details = Object.entries(err.errors)
          .map(([field, msgs]) => {
            const fieldName = field.replace(/_/g, ' ')
            const msgText = Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
            return `${fieldName}: ${msgText}`
          })
          .join(' | ')
        if (details) return `${err.message || 'Validation error'}: ${details}`
      }
    }
    return err.message || err.detail || fallbackText
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateMentor = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    setCreatedCredentials(null)

    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        company: formData.company,
        position: formData.position,
        bio: formData.bio,
        hourly_rate: parseFloat(formData.hourly_rate) || 50.0,
        expertise: formData.expertise_input
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      }

      const res = await adminApi.createMentor(payload)
      if (res.success) {
        setCreatedCredentials({
          email: formData.email,
          password: formData.password,
          name: `${formData.first_name} ${formData.last_name}`,
          company: formData.company
        })
        setMessage({ type: 'success', text: 'Mentor account successfully created!' })

        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          company: '',
          position: '',
          bio: '',
          hourly_rate: '50.00',
          expertise_input: 'Python, Django, React'
        })
        fetchMentors()
      }
    } catch (err) {
      console.error('Create mentor error:', err)
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to create mentor account.') })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMentor = async (mentorId, mentorName) => {
    if (!window.confirm(`Are you sure you want to delete the mentor account for "${mentorName}"?`)) {
      return
    }

    try {
      const res = await adminApi.deleteMentor(mentorId)
      if (res.success) {
        setMessage({ type: 'success', text: `Mentor "${mentorName}" successfully deleted.` })
        fetchMentors()
      }
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to delete mentor.') })
    }
  }

  const handleApprovalAction = async (mentorId, approve) => {
    try {
      const res = await adminApi.approveMentor(mentorId, approve)
      if (res.success) {
        setMessage({ type: 'success', text: `Mentor application ${approve ? 'approved' : 'rejected'}.` })
        fetchMentors()
      }
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Action failed.') })
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading Mentor Management Hub...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="animate-fade-in">
      {/* Title Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Admin Mentor Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Onboard new mentors, issue credentials, and manage active mentor profiles
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`btn-secondary ${activeTab === 'onboard' ? 'active-tab' : ''}`}
            onClick={() => { setActiveTab('onboard'); setMessage({ type: '', text: '' }); }}
            style={{
              borderColor: activeTab === 'onboard' ? 'var(--accent-cyan)' : 'var(--border-glass)',
              background: activeTab === 'onboard' ? 'rgba(6, 182, 212, 0.15)' : 'transparent'
            }}
          >
            <Plus size={16} /> Onboard New Mentor
          </button>

          <button
            className={`btn-secondary ${activeTab === 'all' ? 'active-tab' : ''}`}
            onClick={() => { setActiveTab('all'); setMessage({ type: '', text: '' }); }}
            style={{
              borderColor: activeTab === 'all' ? 'var(--accent-violet)' : 'var(--border-glass)',
              background: activeTab === 'all' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
            }}
          >
            <Users size={16} /> All Mentors ({allMentors.length})
          </button>

          <button
            className={`btn-secondary ${activeTab === 'pending' ? 'active-tab' : ''}`}
            onClick={() => { setActiveTab('pending'); setMessage({ type: '', text: '' }); }}
            style={{
              borderColor: activeTab === 'pending' ? 'var(--accent-pink)' : 'var(--border-glass)',
              background: activeTab === 'pending' ? 'rgba(236, 72, 153, 0.15)' : 'transparent'
            }}
          >
            <UserCheck size={16} /> Pending Approvals ({pending.length})
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div className="glass-panel" style={{
          padding: '12px 20px', marginBottom: '20px',
          borderColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem'
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: Onboard New Mentor Form */}
      {activeTab === 'onboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          <form onSubmit={handleCreateMentor} className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--accent-cyan)' }}>
              Register & Onboard New Mentor
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Admin-created mentor accounts are auto-verified and ready for instant login.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>First Name *</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="input-glass"
                    placeholder="Alex"
                    value={formData.first_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Last Name *</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="input-glass"
                    placeholder="Rivera"
                    value={formData.last_name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Mentor Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-glass"
                    placeholder="alex.rivera@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Temporary Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="input-glass"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Current Company / Employer</label>
                  <input
                    type="text"
                    name="company"
                    className="input-glass"
                    placeholder="e.g. Google, Meta, AWS"
                    value={formData.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Position / Job Title</label>
                  <input
                    type="text"
                    name="position"
                    className="input-glass"
                    placeholder="e.g. Principal Staff Engineer"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Hourly Session Rate ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="hourly_rate"
                    className="input-glass"
                    placeholder="50.00"
                    value={formData.hourly_rate}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Key Expertise (comma separated)</label>
                  <input
                    type="text"
                    name="expertise_input"
                    className="input-glass"
                    placeholder="Python, Django, React, Cloud Architecture"
                    value={formData.expertise_input}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Professional Bio & Background</label>
                <textarea
                  name="bio"
                  rows={3}
                  className="input-glass"
                  placeholder="Describe mentor's technical domain expertise, years of experience, and mentorship focus area..."
                  value={formData.bio}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ padding: '12px 28px', marginTop: '8px', justifyContent: 'center' }}
              >
                <Plus size={18} /> {submitting ? 'Creating Mentor Account...' : 'Create & Approve Mentor Account'}
              </button>
            </div>
          </form>

          {/* Newly Created Credentials Display Card */}
          <div>
            {createdCredentials ? (
              <div className="glass-panel animate-fade-in" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Key size={24} color="#10b981" />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>Credentials Generated!</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Share these login credentials with <strong>{createdCredentials.name}</strong> so they can log in to their mentor dashboard.
                </p>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><strong>Email:</strong> {createdCredentials.email}</div>
                  <div><strong>Password:</strong> {createdCredentials.password}</div>
                  <div><strong>Role:</strong> Industry Mentor</div>
                  {createdCredentials.company && <div><strong>Company:</strong> {createdCredentials.company}</div>}
                </div>

                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  ✓ Status: Approved & Verified for Mentorship
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', color: 'var(--text-muted)' }}>
                <UserCheck size={32} color="var(--accent-violet)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Admin Onboarding Policy</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                  Public student registration does not allow mentor registration. As an Administrator, you create mentor credentials here and share them with verified industry experts.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: All Active & Verified Mentors */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {allMentors.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No mentor accounts created yet. Use the "Onboard New Mentor" tab to register mentors!
            </div>
          ) : (
            allMentors.map((m) => (
              <div key={m.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    background: 'var(--primary-gradient)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', color: '#fff'
                  }}>
                    {m.user?.first_name ? m.user.first_name[0] : 'M'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                      {m.user?.first_name} {m.user?.last_name} ({m.user?.email})
                    </h3>
                    <p style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem', marginTop: '2px' }}>
                      {m.position || 'Industry Mentor'} {m.company ? `at ${m.company}` : ''}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                      {m.expertise?.map((exp) => (
                        <span key={exp} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{exp}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`badge ${m.is_approved ? 'badge-emerald' : 'badge-amber'}`}>
                    {m.is_approved ? 'Active & Approved' : 'Pending Verification'}
                  </span>
                  <button
                    onClick={() => handleDeleteMentor(m.id, `${m.user?.first_name} ${m.user?.last_name}`)}
                    className="btn-secondary"
                    style={{ color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 14px' }}
                  >
                    <Trash2 size={16} /> Delete Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Pending Mentor Approvals */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pending.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-xl)' }}>
              <UserCheck size={40} color="var(--accent-emerald)" style={{ marginBottom: '12px' }} />
              <h3>No Pending Approvals</h3>
              <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>All mentor applications have been reviewed!</p>
            </div>
          ) : (
            pending.map((m) => (
              <div key={m.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{m.user?.first_name} {m.user?.last_name} ({m.user?.email})</h3>
                  <div style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginTop: '2px' }}>{m.position} at {m.company}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>{m.years_experience} Years Experience</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => handleApprovalAction(m.id, true)} className="btn-primary" style={{ background: 'var(--accent-emerald)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                    <Check size={18} /> Approve
                  </button>
                  <button onClick={() => handleApprovalAction(m.id, false)} className="btn-secondary" style={{ color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <X size={18} /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
