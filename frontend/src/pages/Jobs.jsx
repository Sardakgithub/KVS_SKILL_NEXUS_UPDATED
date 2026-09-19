import React, { useEffect, useState } from 'react'
import { api, studentProfileApi, resumeApi, getMediaUrl } from '../api/client'
import {
  Briefcase,
  MapPin,
  Building,
  Send,
  CheckCircle2,
  X,
  FileText,
  Upload,
  Sparkles,
  User,
  Mail,
  Phone,
  AlertCircle,
} from 'lucide-react'

export const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [internships, setInternships] = useState([])
  const [appliedIds, setAppliedIds] = useState(new Set())
  const [activeTab, setActiveTab] = useState('jobs')
  const [loading, setLoading] = useState(true)

  // Student Profile & Resume state
  const [studentProfile, setStudentProfile] = useState(null)
  const [builtResume, setBuiltResume] = useState(null)

  // Modal State
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [oppType, setOppType] = useState('job')
  const [showModal, setShowModal] = useState(false)

  // Form State inside Modal
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeOption, setResumeOption] = useState('built_in') // 'built_in' | 'device'
  const [selectedDeviceFile, setSelectedDeviceFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  useEffect(() => {
    fetchOpportunities()
    fetchStudentDetails()
  }, [])

  const fetchOpportunities = async () => {
    try {
      const [jobsRes, internRes, appsRes] = await Promise.all([
        api.get('/jobs/postings/'),
        api.get('/jobs/internships/'),
        api.get('/jobs/my-applications/').catch(() => ({ success: false })),
      ])
      if (jobsRes.success) setJobs(jobsRes.data)
      if (internRes.success) setInternships(internRes.data)

      if (appsRes.success && Array.isArray(appsRes.data)) {
        const ids = new Set()
        appsRes.data.forEach((app) => {
          if (app.job?.id) ids.add(app.job.id)
          if (app.internship?.id) ids.add(app.internship.id)
        })
        setAppliedIds(ids)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDetails = async () => {
    try {
      const [profRes, resRes] = await Promise.all([
        studentProfileApi.getProfile().catch(() => null),
        resumeApi.getResume().catch(() => null),
      ])
      if (profRes?.success) setStudentProfile(profRes.data)
      if (resRes?.success) setBuiltResume(resRes.data)
    } catch (err) {
      console.error('Error loading student profile/resume:', err)
    }
  }

  const openApplyModal = (opp, type) => {
    setSelectedOpp(opp)
    setOppType(type)
    setCoverLetter(`I am excited to apply for the ${opp.title} position at ${opp.company?.name || 'your company'}. My background aligns well with the requirements for this role.`)
    setResumeOption('built_in')
    setSelectedDeviceFile(null)
    setModalError('')
    setModalSuccess('')
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedDeviceFile(e.target.files[0])
    }
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')
    setSubmitting(true)

    try {
      let finalResumeUrl = ''

      if (resumeOption === 'device') {
        if (!selectedDeviceFile && !studentProfile?.resume_file) {
          setModalError('Please select a resume file from your device.')
          setSubmitting(false)
          return
        }

        if (selectedDeviceFile) {
          const formData = new FormData()
          formData.append('resume_file', selectedDeviceFile)
          const uploadRes = await studentProfileApi.uploadProfileWithFile(formData)
          if (uploadRes.success && uploadRes.data?.resume_file) {
            finalResumeUrl = getMediaUrl(uploadRes.data.resume_file)
          }
        } else if (studentProfile?.resume_file) {
          finalResumeUrl = getMediaUrl(studentProfile.resume_file)
        }
      } else {
        // Option 1: Use Built-in App Resume
        finalResumeUrl = getMediaUrl(studentProfile?.resume_file || '') || 'App Built Resume'
      }

      const res = await api.post('/jobs/apply/', {
        opportunity_type: oppType,
        opportunity_id: selectedOpp.id,
        cover_letter: coverLetter,
        resume_url: finalResumeUrl,
      })

      if (res.success) {
        setModalSuccess('Application submitted successfully!')
        setAppliedIds((prev) => new Set(prev).add(selectedOpp.id))
        setTimeout(() => {
          setShowModal(false)
        }, 1800)
      }
    } catch (err) {
      setModalError(err.message || err.errors || 'Already applied or application error.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Opportunities...</div>

  const currentList = activeTab === 'jobs' ? jobs : internships

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="header-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Jobs & Internships</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Discover active career opportunities matched to your skill profile</p>
        </div>

        {/* Tab Switcher */}
        <div className="tab-row" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {currentList.map((opp) => {
          const isApplied = appliedIds.has(opp.id)
          return (
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
                  {opp.description?.substring(0, 120)}...
                </p>
              </div>

              {isApplied ? (
                <button disabled className="btn-secondary" style={{ width: '100%', justifyContent: 'center', opacity: 0.8, color: '#10b981' }}>
                  <CheckCircle2 size={16} /> Applied
                </button>
              ) : (
                <button
                  onClick={() => openApplyModal(opp, activeTab === 'jobs' ? 'job' : 'internship')}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Send size={16} /> Apply Now
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Application Form Modal */}
      {showModal && selectedOpp && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              position: 'relative',
              background: 'var(--surface-color, #131722)',
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>
                <Building size={12} /> {selectedOpp.company?.name || 'Company'}
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Apply for {selectedOpp.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Submit your application details and select your preferred resume
              </p>
            </div>

            {modalError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}>
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                marginBottom: '16px',
              }}>
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitApplication} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Candidate Quick Details */}
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>Candidate Details</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Name:</strong> {studentProfile?.user?.full_name || studentProfile?.user?.first_name || 'Applicant'}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-muted)' }}>Email:</strong> {studentProfile?.user?.email || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Resume Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>
                  Select Resume Source
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Option 1: Use Resume Built in App */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-lg)',
                      border: resumeOption === 'built_in' ? '2px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: resumeOption === 'built_in' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="resumeOption"
                      value="built_in"
                      checked={resumeOption === 'built_in'}
                      onChange={() => setResumeOption('built_in')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} color="var(--accent-violet)" /> Use Resume Built in App
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {builtResume?.skills?.length || builtResume?.projects?.length
                          ? `Auto-attaches your app-built resume profile (${builtResume?.skills?.length || 0} skills & ${builtResume?.projects?.length || 0} projects).`
                          : 'Attaches your KVS Skill Nexus interactive profile and resume builder details.'}
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Choose Resume from Device */}
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px',
                      borderRadius: 'var(--radius-lg)',
                      border: resumeOption === 'device' ? '2px solid var(--accent-violet)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: resumeOption === 'device' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="resumeOption"
                      value="device"
                      checked={resumeOption === 'device'}
                      onChange={() => setResumeOption('device')}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ width: '100%' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Upload size={16} color="var(--accent-cyan)" /> Choose Resume from Device
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Upload a custom PDF or DOC file directly from your device
                      </p>

                      {resumeOption === 'device' && (
                        <div style={{ marginTop: '10px' }}>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="input-glass"
                            style={{ fontSize: '0.82rem', padding: '8px' }}
                          />
                          {selectedDeviceFile && (
                            <p style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px' }}>
                              Selected: {selectedDeviceFile.name}
                            </p>
                          )}
                          {!selectedDeviceFile && studentProfile?.resume_file && (
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Existing file on profile: {studentProfile.resume_file.split('/').pop()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Cover Letter / Note
                </label>
                <textarea
                  rows={4}
                  className="input-glass"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Introduce yourself and share why you are a great fit..."
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {submitting ? 'Submitting...' : <>Submit Application <Send size={16} /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

