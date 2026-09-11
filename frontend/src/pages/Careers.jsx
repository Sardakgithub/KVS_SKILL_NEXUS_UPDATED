import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Compass, CheckCircle2, ChevronRight, Star, Clock, Layers, Download, Award, PlayCircle, ArrowLeft } from 'lucide-react'

export const Careers = () => {
  const [careers, setCareers] = useState([])
  const [selectedCareer, setSelectedCareer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCareers()
  }, [])

  const fetchCareers = async () => {
    try {
      const res = await api.get('/careers/')
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        setCareers(list)
        if (list.length > 0) {
          fetchCareerDetail(list[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCareerDetail = async (id) => {
    try {
      const res = await api.get(`/careers/${id}/`)
      if (res.success) setSelectedCareer(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleEnroll = async (id) => {
    try {
      const res = await api.post(`/careers/${id}/enroll/`)
      if (res.success) alert('Enrolled in career path successfully!')
    } catch (err) {
      alert(err.message || 'Already enrolled')
    }
  }

  const handleDownloadPdfRoadmap = (career) => {
    const printWindow = window.open('', '_blank')
    const stagesHtml = career.stages?.map((stage, idx) => `
      <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 20px; border-radius: 12px; margin-bottom: 16px; page-break-inside: avoid;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="background: #4f46e5; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px;">${idx + 1}</span>
          <h3 style="margin: 0; font-size: 16px; color: #0f172a;">${stage.title}</h3>
        </div>
        <p style="color: #475569; font-size: 14px; margin-top: 4px; margin-bottom: 12px; line-height: 1.5;">${stage.description}</p>
        ${stage.milestones?.length ? `
          <div style="display: flex; flex-direction: column; gap: 6px; padding-left: 10px;">
            ${stage.milestones.map(m => `
              <div style="font-size: 13px; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <span style="color: #10b981; font-weight: bold;">✓</span> ${m.title}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `).join('') || ''

    const highlightsHtml = career.skill_growth_highlights?.map(h => `
      <li style="margin-bottom: 8px; color: #334155; font-size: 14px; line-height: 1.55;">
        <strong style="color: #4f46e5;">•</strong> ${h}
      </li>
    `).join('') || ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${career.title} - Official Career Roadmap Document</title>
          <style>
            @page { size: portrait; margin: 18mm; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 24px;
              color: #0f172a;
              background: #f8fafc;
            }
            .header-bar {
              border-bottom: 3px solid #4f46e5;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .logo { font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: 1px; }
            .title { font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 6px; }
            .badge { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4338ca; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .summary-box { background: #ffffff; border: 1px solid #cbd5e1; border-left: 5px solid #4f46e5; padding: 20px; border-radius: 10px; margin-bottom: 24px; }
            @media print {
              body { background: white; padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
            <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
              🖨️ Print / Save Roadmap as PDF
            </button>
          </div>

          <div class="header-bar">
            <div>
              <div class="logo">KVS NEXUS</div>
              <div class="title">${career.title} Roadmap</div>
            </div>
            <div>
              <span class="badge">${career.difficulty_level || 'Intermediate'}</span>
              <span class="badge" style="background: #f3e8ff; color: #6d28d9;">⏱️ ${career.estimated_duration || '8 Months'}</span>
            </div>
          </div>

          <div class="summary-box">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Career Review Summary & Industry Analysis</h3>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">${career.overview_summary || career.description}</p>

            ${highlightsHtml ? `
              <h4 style="margin-bottom: 10px; font-size: 14px; color: #0f172a;">How This Particular Career Path Grows Your Skills & Market Value:</h4>
              <ul style="padding-left: 16px; margin: 0;">${highlightsHtml}</ul>
            ` : ''}
          </div>

          <h3 style="font-size: 18px; color: #0f172a; margin-bottom: 16px;">Step-by-Step Learning Roadmap Stages</h3>
          <div>${stagesHtml}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Career Paths...</div>

  return (
    <div className="responsive-grid-2col">
      {/* Career Paths List Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Career Paths ({careers.length})</h3>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
        {careers.map((c) => (
          <div
            key={c.id}
            onClick={() => fetchCareerDetail(c.id)}
            className="glass-panel"
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              borderLeft: selectedCareer?.id === c.id ? '4px solid var(--accent-violet)' : '1px solid var(--border-glass)',
              background: selectedCareer?.id === c.id ? 'rgba(139, 92, 246, 0.12)' : '#ffffff',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#0f172a' }}>{c.title}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <span className="badge badge-indigo">{c.difficulty_level}</span>
              <span className="badge badge-purple"><Clock size={10} /> {c.estimated_duration}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Career Roadmap Detail */}
      {selectedCareer ? (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', background: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)' }}>
          {/* Top Banner Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '10px' }}>{selectedCareer.category?.name || 'Technology'}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{selectedCareer.title}</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '650px', fontSize: '0.95rem', lineHeight: 1.55 }}>
                {selectedCareer.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => handleDownloadPdfRoadmap(selectedCareer)} className="btn-secondary" style={{ padding: '10px 18px', gap: '8px', color: '#0284c7', borderColor: '#bae6fd' }}>
                <Download size={16} /> Download PDF Roadmap
              </button>
              <button onClick={() => handleEnroll(selectedCareer.id)} className="btn-primary" style={{ padding: '10px 22px' }}>
                <PlayCircle size={16} /> Enroll
              </button>
            </div>
          </div>

          {/* Comprehensive Career Guidance & Skill Growth Review Panel */}
          {selectedCareer.overview_summary && (
            <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #cbd5e1', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={18} color="#7c3aed" /> Career Analysis & Why Choose This Path
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '18px' }}>
                {selectedCareer.overview_summary}
              </p>

              {selectedCareer.skill_growth_highlights && selectedCareer.skill_growth_highlights.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    How This Career Path Helps Grow Your Skills & Market Value:
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                    {selectedCareer.skill_growth_highlights.map((highlight, hIdx) => (
                      <div key={hIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.86rem', color: '#334155', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCareer.required_skills && selectedCareer.required_skills.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Core Skill Competencies:</span>
                  {selectedCareer.required_skills.map((sk) => (
                    <span key={sk.id} className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>
                      {sk.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
            <Layers color="var(--accent-violet)" size={20} /> Step-by-Step Learning Roadmap Stages
          </h3>

          {/* Timeline Stages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {selectedCareer.stages?.map((stage, idx) => (
              <div
                key={stage.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: 'var(--primary-gradient)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.88rem'
                    }}>
                      {idx + 1}
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{stage.title}</h4>
                  </div>
                  {stage.estimated_duration && (
                    <span className="badge badge-purple"><Clock size={11} /> {stage.estimated_duration}</span>
                  )}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '14px', lineHeight: 1.5 }}>{stage.description}</p>

                {/* Milestones */}
                {stage.milestones && stage.milestones.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    {stage.milestones.map((m) => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: '#1e293b' }}>
                        <CheckCircle2 size={16} color="#10b981" />
                        <span>{m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Select a career path to view roadmap</div>
      )}
    </div>
  )
}
