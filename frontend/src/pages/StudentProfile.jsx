import React, { useState, useEffect } from 'react'
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Plus,
  Trash2,
  Linkedin,
  Github,
  Globe,
  DollarSign,
  Clock,
  Award,
  Save,
  AlertCircle,
  FolderGit2,
  Trophy,
  Layers,
  ArrowLeft
} from 'lucide-react'
import { studentProfileApi, getMediaUrl } from '../api/client'

export default function StudentProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState('overview')

  // Form states
  const [formData, setFormData] = useState({
    headline: '',
    phone: '',
    location: '',
    bio: '',
    date_of_birth: '',
    education_level: 'undergraduate',
    major_or_stream: '',
    institution: '',
    graduation_year: '',
    academic_score: '',
    job_hunt_status: 'actively_looking',
    notice_period: 'Immediate',
    expected_salary: '',
    preferred_locations: [],
    skills: [],
    career_goals: [],
    interests: [],
    languages_spoken: [],
    certifications: [],
    achievements: '',
    projects: [],
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    twitter_url: ''
  })

  const [newSkill, setNewSkill] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newCert, setNewCert] = useState('')

  // New Project State
  const [newProj, setNewProj] = useState({
    title: '',
    technologies: '',
    description: '',
    link: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await studentProfileApi.getProfile()
      if (res.success && res.data) {
        setProfile(res.data)
        setFormData({
          headline: res.data.headline || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          bio: res.data.bio || '',
          date_of_birth: res.data.date_of_birth || '',
          education_level: res.data.education_level || 'undergraduate',
          major_or_stream: res.data.major_or_stream || '',
          institution: res.data.institution || '',
          graduation_year: res.data.graduation_year || '',
          academic_score: res.data.academic_score || '',
          job_hunt_status: res.data.job_hunt_status || 'actively_looking',
          notice_period: res.data.notice_period || 'Immediate',
          expected_salary: res.data.expected_salary || '',
          preferred_locations: res.data.preferred_locations || [],
          skills: res.data.skills || [],
          career_goals: res.data.career_goals || [],
          interests: res.data.interests || [],
          languages_spoken: res.data.languages_spoken || [],
          certifications: res.data.certifications || [],
          achievements: res.data.achievements || res.data.projects_highlights || '',
          projects: res.data.projects || [],
          linkedin_url: res.data.linkedin_url || '',
          github_url: res.data.github_url || '',
          portfolio_url: res.data.portfolio_url || '',
          twitter_url: res.data.twitter_url || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setMessage({ type: 'error', text: 'Failed to load profile data.' })
    } finally {
      setLoading(false)
    }
  }

  // Calculate LinkedIn/Naukri profile strength score (0 - 100%)
  const calculateProfileStrength = () => {
    let score = 0
    if (formData.headline) score += 15
    if (formData.phone) score += 10
    if (formData.location) score += 10
    if (formData.bio) score += 15
    if (formData.institution) score += 15
    if (formData.skills && formData.skills.length > 0) score += 15
    if (formData.linkedin_url || formData.github_url) score += 10
    if (profile?.resume_file) score += 10
    return Math.min(score, 100)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    if (!formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
    }
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }))
  }

  const handleAddLocation = (e) => {
    e.preventDefault()
    if (!newLocation.trim()) return
    if (!formData.preferred_locations.includes(newLocation.trim())) {
      setFormData((prev) => ({
        ...prev,
        preferred_locations: [...prev.preferred_locations, newLocation.trim()]
      }))
    }
    setNewLocation('')
  }

  const handleRemoveLocation = (locToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferred_locations: prev.preferred_locations.filter((l) => l !== locToRemove)
    }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      const payload = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year, 10) : null
      }

      const res = await studentProfileApi.updateProfile(payload)
      if (res.success) {
        setProfile(res.data)
        setMessage({ type: 'success', text: 'Profile details saved successfully!' })
      }
    } catch (err) {
      console.error('Update profile error:', err)
      const errText = typeof err === 'string'
        ? err
        : (err?.message || err?.detail || (err?.errors ? Object.values(err.errors).flat().join(', ') : 'Failed to update profile.'))
      setMessage({ type: 'error', text: errText })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      const data = new FormData()
      data.append('resume_file', file)

      const res = await studentProfileApi.uploadProfileWithFile(data)
      if (res.success) {
        setProfile(res.data)
        setMessage({ type: 'success', text: 'Resume file uploaded successfully!' })
      }
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: 'Failed to upload resume file.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume file?')) return

    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      const res = await studentProfileApi.deleteResumeFile()
      if (res.success) {
        setProfile(res.data)
        setMessage({ type: 'success', text: 'Uploaded resume file deleted successfully!' })
      }
    } catch (err) {
      console.error('Delete resume error:', err)
      setMessage({ type: 'error', text: 'Failed to delete resume file.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddProject = (e) => {
    e.preventDefault()
    if (!newProj.title.trim()) return
    setFormData((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), { ...newProj, id: Date.now() }]
    }))
    setNewProj({ title: '', technologies: '', description: '', link: '' })
  }

  const handleRemoveProject = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, idx) => idx !== indexToRemove)
    }))
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Trophy style={{ width: '32px', height: '32px', animation: 'spin 2s linear infinite' }} />
        <p style={{ marginTop: '16px' }}>Loading LinkedIn/Naukri profile...</p>
      </div>
    )
  }

  const strength = calculateProfileStrength()

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => window.history.back()}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      {/* Top Banner Card */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
          background: 'var(--primary-gradient)'
        }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--primary-gradient)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 'bold', color: '#fff',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}>
              {profile?.user?.first_name ? profile.user.first_name[0] : 'S'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '4px' }}>
                {profile?.user?.first_name} {profile?.user?.last_name}
              </h1>
              <p style={{ color: 'var(--accent-cyan)', fontWeight: '600', fontSize: '1.05rem', marginBottom: '8px' }}>
                {formData.headline || 'Full Stack Software Engineer | Career Builder'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {formData.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--accent-pink)" /> {formData.location}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={14} color="var(--accent-blue)" /> {profile?.user?.email}
                </span>
                {formData.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={14} color="var(--accent-emerald)" /> {formData.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            {/* Interactive Quick Status Selector Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                name="job_hunt_status"
                value={formData.job_hunt_status}
                onChange={async (e) => {
                  const newStatus = e.target.value
                  setFormData((prev) => ({ ...prev, job_hunt_status: newStatus }))
                  try {
                    await studentProfileApi.updateProfile({ job_hunt_status: newStatus })
                    setMessage({ type: 'success', text: 'Profile status updated!' })
                  } catch (err) {
                    console.error('Failed to update status:', err)
                  }
                }}
                className={`badge ${
                  formData.job_hunt_status === 'actively_looking'
                    ? 'badge-emerald'
                    : formData.job_hunt_status === 'hiring'
                    ? 'badge-purple'
                    : formData.job_hunt_status === 'working'
                    ? 'badge-indigo'
                    : formData.job_hunt_status === 'open_to_offers'
                    ? 'badge-cyan'
                    : 'badge-amber'
                }`}
                style={{
                  cursor: 'pointer',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  outline: 'none',
                  border: '1px solid transparent',
                  borderRadius: '9999px',
                }}
              >
                <option value="actively_looking">🟢 ACTIVELY LOOKING</option>
                <option value="hiring">💼 HIRING (RECRUITER / HR)</option>
                <option value="working">🏢 WORKING / EMPLOYED</option>
                <option value="open_to_offers">🔵 OPEN TO OFFERS</option>
                <option value="not_looking">🟡 NOT LOOKING</option>
              </select>
            </div>

            {/* Quick Resume Upload Button */}
            <label className="btn-primary" style={{ cursor: 'pointer', padding: '10px 18px', fontSize: '0.85rem' }}>
              <Upload size={16} />
              {saving ? 'Uploading...' : 'Upload Resume File'}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Profile Strength Meter */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: strength >= 80 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
              {strength}% Complete
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(226, 232, 240, 0.6)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${strength}%`, height: '100%',
              background: strength >= 80 ? 'linear-gradient(90deg, #10b981, #06b6d4)' : 'linear-gradient(90deg, #f59e0b, #ec4899)',
              transition: 'width 0.5s ease-in-out'
            }} />
          </div>
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

      {/* Profile Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveTab('overview')}
          style={{
            borderColor: activeTab === 'overview' ? 'var(--accent-violet)' : 'var(--border-glass)',
            background: activeTab === 'overview' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
          }}
        >
          <User size={16} /> Personal & Preferences
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveTab('skills')}
          style={{
            borderColor: activeTab === 'skills' ? 'var(--accent-violet)' : 'var(--border-glass)',
            background: activeTab === 'skills' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
          }}
        >
          <Award size={16} /> Skills & Expertise
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveTab('academics')}
          style={{
            borderColor: activeTab === 'academics' ? 'var(--accent-violet)' : 'var(--border-glass)',
            background: activeTab === 'academics' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
          }}
        >
          <GraduationCap size={16} /> Education & Degree
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveTab('projects')}
          style={{
            borderColor: activeTab === 'projects' ? 'var(--accent-violet)' : 'var(--border-glass)',
            background: activeTab === 'projects' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
          }}
        >
          <FolderGit2 size={16} /> Projects Portfolio
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setActiveTab('resume')}
          style={{
            borderColor: activeTab === 'resume' ? 'var(--accent-violet)' : 'var(--border-glass)',
            background: activeTab === 'resume' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
          }}
        >
          <FileText size={16} /> Resume Document
        </button>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSaveProfile}>
        {/* TAB 1: Personal & Preferences */}
        {activeTab === 'overview' && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Professional Headline & Pitch
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Professional Headline (e.g., Full Stack Developer | React & Python Specialist)
              </label>
              <input
                type="text"
                name="headline"
                className="input-glass"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer | UI/UX Designer"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Professional Summary / Bio
              </label>
              <textarea
                name="bio"
                className="input-glass"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a brief professional overview summarizing your technical background, career goals, and key achievements..."
              />
            </div>

            <h3 style={{ fontSize: '1.2rem', marginTop: '12px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Job Search Preferences
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Job Hunt Status
                </label>
                <select
                  name="job_hunt_status"
                  className="input-glass"
                  value={formData.job_hunt_status}
                  onChange={handleChange}
                >
                  <option value="actively_looking">Actively Looking for Jobs / Internships</option>
                  <option value="hiring">Hiring (Recruiter / HR)</option>
                  <option value="working">Working / Employed</option>
                  <option value="open_to_offers">Open to Offers & Roles</option>
                  <option value="not_looking">Not Looking Currently</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Notice Period
                </label>
                <input
                  type="text"
                  name="notice_period"
                  className="input-glass"
                  value={formData.notice_period}
                  onChange={handleChange}
                  placeholder="e.g. Immediate, 15 Days, 30 Days"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Expected Salary / Stipend
                </label>
                <input
                  type="text"
                  name="expected_salary"
                  className="input-glass"
                  value={formData.expected_salary}
                  onChange={handleChange}
                  placeholder="e.g. $90,000 / yr or 12 LPA"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Preferred Work Locations
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="e.g. San Francisco, New York, Remote"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <button type="button" onClick={handleAddLocation} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.preferred_locations.map((loc, idx) => (
                  <span key={idx} className="badge badge-indigo" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    {loc}
                    <Trash2 size={12} style={{ marginLeft: '6px', cursor: 'pointer' }} onClick={() => handleRemoveLocation(loc)} />
                  </span>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginTop: '12px', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Contact & Social Profiles
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="input-glass"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Current City / Country
                </label>
                <input
                  type="text"
                  name="location"
                  className="input-glass"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedin_url"
                  className="input-glass"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  name="github_url"
                  className="input-glass"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  name="portfolio_url"
                  className="input-glass"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Key Skills & Technical Competencies */}
        {activeTab === 'skills' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Verified Key Skills & Technologies
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Add key skills and technical proficiencies that recruiters and hiring managers look for.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                className="input-glass"
                placeholder="Type a skill (e.g., Python, React, AWS, Docker, Machine Learning)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="button" onClick={handleAddSkill} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <Plus size={16} /> Add Skill
              </button>
            </div>

            {/* Selected Skills Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge badge-purple"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {skill}
                  <Trash2
                    size={14}
                    style={{ cursor: 'pointer', color: '#ec4899' }}
                    onClick={() => handleRemoveSkill(skill)}
                  />
                </span>
              ))}
            </div>

            {/* Quick Suggestions */}
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Recommended In-Demand Skills:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Python', 'JavaScript', 'React.js', 'Django', 'SQL', 'Docker', 'AWS', 'Machine Learning', 'Figma', 'TypeScript', 'Node.js', 'Kubernetes'].map(
                (rec) => (
                  <button
                    key={rec}
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    onClick={() => {
                      if (!formData.skills.includes(rec)) {
                        setFormData((prev) => ({ ...prev, skills: [...prev.skills, rec] }))
                      }
                    }}
                  >
                    + {rec}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Education & Academics */}
        {activeTab === 'academics' && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Education & Academic Background
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Highest Education Level
                </label>
                <select
                  name="education_level"
                  className="input-glass"
                  value={formData.education_level}
                  onChange={handleChange}
                >
                  <option value="high_school">High School</option>
                  <option value="undergraduate">Undergraduate (B.Tech / B.E / B.Sc / BCA)</option>
                  <option value="graduate">Graduate (M.Tech / M.Sc / MCA)</option>
                  <option value="postgraduate">Postgraduate / MBA</option>
                  <option value="phd">PhD / Doctorate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Major / Field of Study
                </label>
                <input
                  type="text"
                  name="major_or_stream"
                  className="input-glass"
                  value={formData.major_or_stream}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science, Artificial Intelligence, ECE"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Institution / College / University
                </label>
                <input
                  type="text"
                  name="institution"
                  className="input-glass"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. Stanford University / IIT Delhi"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduation_year"
                  className="input-glass"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  placeholder="e.g. 2026"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Academic Score / CGPA
                </label>
                <input
                  type="text"
                  name="academic_score"
                  className="input-glass"
                  value={formData.academic_score}
                  onChange={handleChange}
                  placeholder="e.g. 8.8 CGPA / 85%"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
                Key Achievements, Honors & Awards
              </label>
              <textarea
                name="achievements"
                className="input-glass"
                rows={3}
                value={formData.achievements}
                onChange={handleChange}
                placeholder="Detail any hackathons won, academic awards, honors, research papers, or competitive achievements..."
              />
            </div>
          </div>
        )}

        {/* TAB 4: Projects Portfolio */}
        {activeTab === 'projects' && (
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderGit2 size={20} color="var(--accent-cyan)" /> Technical Projects & Portfolio
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Add your technical projects and live project links. Any link clicked in your softcopy resume by recruiters or bots will direct to the project URL.
              </p>
            </div>

            {/* Add Project Form */}
            <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} color="#0284c7" /> Add New Project Entry
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="e.g. AI Automated Resume Engine"
                    value={newProj.title}
                    onChange={(e) => setNewProj({ ...newProj, title: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="e.g. React, Python, Django, PostgreSQL"
                    value={newProj.technologies}
                    onChange={(e) => setNewProj({ ...newProj, technologies: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                    Project URL / Repository Link
                  </label>
                  <input
                    type="url"
                    className="input-glass"
                    placeholder="https://github.com/username/project"
                    value={newProj.link}
                    onChange={(e) => setNewProj({ ...newProj, link: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                  Project Description
                </label>
                <textarea
                  className="input-glass"
                  rows={2}
                  placeholder="Summarize key features, architecture, and technical achievements..."
                  value={newProj.description}
                  onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                />
              </div>

              <button type="button" onClick={handleAddProject} className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.88rem' }}>
                <Plus size={16} /> Save Project Entry
              </button>
            </div>

            {/* List of Portfolio Projects */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px' }}>
                Your Portfolio Projects ({formData.projects?.length || 0})
              </h4>
              {(!formData.projects || formData.projects.length === 0) ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-lg)', background: '#ffffff' }}>
                  <FolderGit2 size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>No projects added yet</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>Use the form above to add your technical projects!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="glass-panel" style={{ padding: '20px 22px', borderRadius: 'var(--radius-lg)', background: '#ffffff', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                          {proj.link ? (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            >
                              {proj.title} <ExternalLink size={14} color="#0284c7" />
                            </a>
                          ) : (
                            <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{proj.title}</h5>
                          )}

                          {proj.technologies && (
                            <span className="badge badge-indigo" style={{ fontSize: '0.74rem' }}>
                              {proj.technologies}
                            </span>
                          )}
                        </div>

                        {proj.description && (
                          <p style={{ fontSize: '0.86rem', color: '#475569', marginBottom: '8px', lineHeight: 1.5 }}>
                            {proj.description}
                          </p>
                        )}

                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> {proj.link}
                          </a>
                        )}
                      </div>

                      <button type="button" onClick={() => handleRemoveProject(idx)} className="btn-secondary" style={{ padding: '6px 10px', color: '#dc2626', borderColor: '#fca5a5' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: Resume Document File Upload */}
        {activeTab === 'resume' && (
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
              Manual Resume Document Upload
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Upload your latest resume PDF or Word document. Recruiters will be able to download and review your resume directly.
            </p>

            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 'var(--radius-lg)',
              padding: '40px 20px',
              textAlign: 'center',
              background: '#ffffff',
              marginBottom: '20px'
            }}>
              <Upload size={40} color="var(--accent-violet)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.05rem', marginBottom: '6px' }}>Select Resume File (PDF / DOCX)</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Maximum file size: 10MB
              </p>
              <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                Browse File
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {profile?.resume_file && (
              <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={24} color="var(--accent-emerald)" />
                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: '600' }}>Uploaded Resume Document</h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attached to your student profile</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={getMediaUrl(profile.resume_file)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', gap: '6px' }}
                  >
                    <ExternalLink size={14} /> Download File
                  </a>
                  <button
                    type="button"
                    onClick={handleDeleteResume}
                    disabled={saving}
                    className="btn-secondary"
                    style={{ fontSize: '0.85rem', gap: '6px', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                  >
                    <Trash2 size={14} /> Delete Resume
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating Save Button */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '14px 32px', fontSize: '1rem' }}>
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
