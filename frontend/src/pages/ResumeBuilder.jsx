import React, { useEffect, useState } from 'react'
import { api, studentProfileApi, resumeApi, getMediaUrl } from '../api/client'
import {
  FileText,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  Code,
  Award,
  Upload,
  ExternalLink,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'

export const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'builder'
  const [resume, setResume] = useState(null)
  const [studentProfile, setStudentProfile] = useState(null)
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  // Section Form Inputs
  const [eduInput, setEduInput] = useState({ institution: '', degree: '', field_of_study: '', start_date: '2020-09-01' })
  const [expInput, setExpInput] = useState({ company: '', position: '', start_date: '2022-01-01', description: '' })
  const [projInput, setProjInput] = useState({ title: '', description: '', technologies: '', project_url: '' })
  const [skillInput, setSkillInput] = useState({ skill_name: '', proficiency_level: 'intermediate' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [resResume, resProfile] = await Promise.allSettled([
        resumeApi.getResume(),
        studentProfileApi.getProfile()
      ])

      if (resResume.status === 'fulfilled' && resResume.value.success) {
        setResume(resResume.value.data)
        setSummary(resResume.value.data.summary || '')
      }

      if (resProfile.status === 'fulfilled' && resProfile.value.success) {
        setStudentProfile(resProfile.value.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      setMsg('')
      const formData = new FormData()
      formData.append('resume_file', file)

      const res = await studentProfileApi.uploadProfileWithFile(formData)
      if (res.success) {
        setStudentProfile(res.data)
        setMsg('Resume uploaded successfully!')
      }
    } catch (err) {
      console.error(err)
      setMsg('Failed to upload file.')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your uploaded resume file?')) return
    try {
      setUploading(true)
      setMsg('')
      const res = await studentProfileApi.deleteResumeFile()
      if (res.success) {
        setStudentProfile(res.data)
        setMsg('Uploaded resume file deleted successfully!')
      }
    } catch (err) {
      console.error(err)
      setMsg('Failed to delete resume file.')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdateSummary = async () => {
    try {
      const res = await resumeApi.updateSummary({ summary })
      if (res.success) setMsg('Resume summary saved!')
    } catch (err) {
      setMsg(err.message || 'Failed to update summary')
    }
  }

  const handleAddEducation = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/resumes/education/', eduInput)
      if (res.success) {
        fetchData()
        setEduInput({ institution: '', degree: '', field_of_study: '', start_date: '2020-09-01' })
      }
    } catch (err) {
      alert(err.message || 'Failed to add education')
    }
  }

  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/resumes/education/${id}/`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to delete entry')
    }
  }

  const handleAddExperience = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/resumes/experience/', expInput)
      if (res.success) {
        fetchData()
        setExpInput({ company: '', position: '', start_date: '2022-01-01', description: '' })
      }
    } catch (err) {
      alert(err.message || 'Failed to add experience')
    }
  }

  const handleDeleteExperience = async (id) => {
    try {
      await api.delete(`/resumes/experience/${id}/`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to delete entry')
    }
  }

  const handleAddProject = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/resumes/projects/', projInput)
      if (res.success) {
        fetchData()
        setProjInput({ title: '', description: '', technologies: '', project_url: '' })
      }
    } catch (err) {
      alert(err.message || 'Failed to add project')
    }
  }

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/resumes/projects/${id}/`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to delete entry')
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/resumes/skills/', skillInput)
      if (res.success) {
        fetchData()
        setSkillInput({ skill_name: '', proficiency_level: 'intermediate' })
      }
    } catch (err) {
      alert(err.message || 'Failed to add skill')
    }
  }

  const handleDeleteSkill = async (id) => {
    try {
      await api.delete(`/resumes/skills/${id}/`)
      fetchData()
    } catch (err) {
      alert(err.message || 'Failed to delete entry')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading Resume Suite...</div>

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }} className="animate-fade-in">
      {/* Title & Mode Switcher */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Resume & Portfolio Manager</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Upload your pre-made resume file or build a custom resume interactively
          </p>
        </div>

        <div className="btn-row" style={{ alignItems: 'center' }}>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            className={`btn-secondary ${activeTab === 'upload' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('upload')}
            style={{
              borderColor: activeTab === 'upload' ? 'var(--accent-cyan)' : 'var(--border-glass)',
              background: activeTab === 'upload' ? 'rgba(6, 182, 212, 0.15)' : 'transparent'
            }}
          >
            <Upload size={16} /> Manual File Upload
          </button>
          <button
            className={`btn-secondary ${activeTab === 'builder' ? 'active-tab' : ''}`}
            onClick={() => setActiveTab('builder')}
            style={{
              borderColor: activeTab === 'builder' ? 'var(--accent-violet)' : 'var(--border-glass)',
              background: activeTab === 'builder' ? 'rgba(139, 92, 246, 0.15)' : 'transparent'
            }}
          >
            <FileText size={16} /> Interactive Builder
          </button>
        </div>
      </div>

      {msg && (
        <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', borderColor: 'rgba(16,185,129,0.3)' }}>
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* TAB 1: Manual Resume File Upload */}
      {activeTab === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--accent-cyan)' }}>
              Upload Pre-formatted Resume
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Already have a formatted PDF or Word resume? Upload it directly to your profile for mentors and recruiters.
            </p>

            <div style={{
              border: '2px dashed var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: '48px 24px',
              textAlign: 'center',
              background: 'rgba(15, 23, 42, 0.4)',
              marginBottom: '20px'
            }}>
              <Upload size={44} color="var(--accent-cyan)" style={{ marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Drag & Drop or Choose Resume File</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Supports PDF, DOC, DOCX up to 10MB
              </p>
              <label className="btn-primary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                {uploading ? 'Uploading...' : 'Browse Computer'}
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--accent-emerald)' }}>
              Active Resume Status
            </h3>

            {studentProfile?.resume_file ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <FileText size={28} color="#10b981" />
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Resume Attached</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready for job and internship applications</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a
                      href={getMediaUrl(studentProfile.resume_file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                    >
                      <ExternalLink size={16} /> View Attached Resume
                    </a>
                    <button
                      onClick={handleDeleteResume}
                      disabled={uploading}
                      className="btn-secondary"
                      style={{ padding: '10px 16px', gap: '6px', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                    >
                      <Trash2 size={16} /> Delete Resume
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <FileText size={48} opacity={0.4} style={{ marginBottom: '12px' }} />
                <p>No manual resume file attached yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Interactive Resume Builder */}
      {activeTab === 'builder' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Resume Editor Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Summary Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Professional Summary</h3>
              <textarea
                className="input-glass"
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a brief professional summary..."
                style={{ resize: 'vertical' }}
              />
              <button onClick={handleUpdateSummary} className="btn-secondary" style={{ marginTop: '10px' }}>Save Summary</button>
            </div>

            {/* Education Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap color="var(--accent-cyan)" /> Add Education
              </h3>
              <form onSubmit={handleAddEducation} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input className="input-glass" placeholder="Institution Name" value={eduInput.institution} onChange={(e) => setEduInput({ ...eduInput, institution: e.target.value })} required />
                <input className="input-glass" placeholder="Degree (e.g. B.S. Computer Science)" value={eduInput.degree} onChange={(e) => setEduInput({ ...eduInput, degree: e.target.value })} required />
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><Plus size={16} /> Add Entry</button>
              </form>
            </div>

            {/* Experience Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase color="var(--accent-purple)" /> Add Experience
              </h3>
              <form onSubmit={handleAddExperience} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input className="input-glass" placeholder="Company Name" value={expInput.company} onChange={(e) => setExpInput({ ...expInput, company: e.target.value })} required />
                <input className="input-glass" placeholder="Position / Role Title" value={expInput.position} onChange={(e) => setExpInput({ ...expInput, position: e.target.value })} required />
                <textarea className="input-glass" rows={2} placeholder="Key Responsibilities / Impact" value={expInput.description} onChange={(e) => setExpInput({ ...expInput, description: e.target.value })} />
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><Plus size={16} /> Add Entry</button>
              </form>
            </div>

            {/* Projects Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="var(--accent-emerald)" /> Add Project
              </h3>
              <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input className="input-glass" placeholder="Project Title" value={projInput.title} onChange={(e) => setProjInput({ ...projInput, title: e.target.value })} required />
                <input className="input-glass" placeholder="Technologies Used (e.g. React, Django)" value={projInput.technologies} onChange={(e) => setProjInput({ ...projInput, technologies: e.target.value })} />
                <textarea className="input-glass" rows={2} placeholder="Project Description & Results" value={projInput.description} onChange={(e) => setProjInput({ ...projInput, description: e.target.value })} required />
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}><Plus size={16} /> Add Project</button>
              </form>
            </div>

            {/* Skills Section */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code color="var(--accent-pink)" /> Add Technical Skill
              </h3>
              <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px' }}>
                <input className="input-glass" placeholder="Skill Name (e.g. Python, React)" value={skillInput.skill_name} onChange={(e) => setSkillInput({ ...skillInput, skill_name: e.target.value })} required />
                <button type="submit" className="btn-primary"><Plus size={16} /> Add</button>
              </form>
            </div>
          </div>

          {/* Live Resume Preview */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ borderBottom: '2px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>{resume?.title || 'Structured Resume'}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', fontStyle: 'italic' }}>
                {summary || 'No summary entered yet.'}
              </p>
            </div>

            {/* Education Preview */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0284c7', marginBottom: '10px' }}>Education</h4>
              {resume?.educations?.map((edu) => (
                <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <div style={{ color: 'var(--text-main)' }}>
                    <strong style={{ color: '#0f172a' }}>{edu.degree}</strong> — <span style={{ color: '#475569' }}>{edu.institution}</span>
                  </div>
                  <button onClick={() => handleDeleteEducation(edu.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* Experience Preview */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7c3aed', marginBottom: '10px' }}>Experience</h4>
              {resume?.experiences?.map((exp) => (
                <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0', padding: '6px 0', borderBottom: '1px dashed #e2e8f0' }}>
                  <div style={{ color: 'var(--text-main)' }}>
                    <strong style={{ color: '#0f172a' }}>{exp.position}</strong> at <span style={{ color: '#475569' }}>{exp.company}</span>
                  </div>
                  <button onClick={() => handleDeleteExperience(exp.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            {/* Projects Preview */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669', marginBottom: '10px' }}>Projects & Code Repositories</h4>
              {resume?.projects?.map((proj) => {
                const targetLink = proj.project_url || proj.link || proj.url
                return (
                  <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '8px 0', padding: '8px 0', borderBottom: '1px dashed #e2e8f0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {targetLink ? (
                          <a
                            href={targetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#0284c7', textDecoration: 'underline', fontWeight: 700, fontSize: '0.98rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {proj.title} <ExternalLink size={13} color="#0284c7" />
                          </a>
                        ) : (
                          <strong style={{ color: '#0f172a', fontSize: '0.98rem' }}>{proj.title}</strong>
                        )}
                        {proj.technologies && (
                          <span style={{ fontSize: '0.78rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {proj.technologies}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '4px', lineHeight: 1.45 }}>
                          {proj.description}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteProject(proj.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', marginLeft: '12px' }}><Trash2 size={16} /></button>
                  </div>
                )
              })}
            </div>

            {/* Skills Preview */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#db2777', marginBottom: '10px' }}>Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {resume?.skills?.map((sk) => (
                  <span key={sk.id} className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {sk.skill_name}
                    <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => handleDeleteSkill(sk.id)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
