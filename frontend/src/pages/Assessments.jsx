import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { CheckSquare, Clock, Award, Code, CheckCircle, Calendar, BookOpen, ArrowLeft, AlertTriangle } from 'lucide-react'
import { CodingEditor } from '../components/Assessment/CodingEditor'

export const Assessments = () => {
  const [activeTab, setActiveTab] = useState('assigned') // 'assigned' | 'catalog' | 'history'
  const [assignedAssessments, setAssignedAssessments] = useState([])
  const [catalogAssessments, setCatalogAssessments] = useState([])
  const [attemptHistory, setAttemptHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [assignmentId, setAssignmentId] = useState(null)
  const [answers, setAnswers] = useState({})
  const [codingSubmissions, setCodingSubmissions] = useState({})
  const [result, setResult] = useState(null)
  const [timeTaken, setTimeTaken] = useState(0)

  // Exit Modal State
  const [showExitModal, setShowExitModal] = useState(false)

  const handleBackClick = () => {
    if (activeQuiz && !result) {
      setShowExitModal(true)
    } else if (activeQuiz) {
      setActiveQuiz(null)
      setResult(null)
    } else {
      window.history.back()
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [assignedRes, catalogRes, historyRes] = await Promise.all([
        api.get('/assessments/assigned/'),
        api.get('/assessments/'),
        api.get('/assessments/my-attempts/'),
      ])
      if (assignedRes.success) setAssignedAssessments(assignedRes.data)
      if (catalogRes.success) setCatalogAssessments(catalogRes.data.results || catalogRes.data)
      if (historyRes.success) setAttemptHistory(historyRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = async (assessmentId, assignId = null) => {
    try {
      const detailRes = await api.get(`/assessments/${assessmentId}/`)
      const startRes = await api.post(`/assessments/${assessmentId}/start/`, { assignment_id: assignId })

      if (detailRes.success && startRes.success) {
        setActiveQuiz(detailRes.data)
        setAttemptId(startRes.data.attempt_id)
        setAssignmentId(assignId)
        setAnswers({})
        setCodingSubmissions({})
        setResult(null)
        setTimeTaken(0)
      }
    } catch (err) {
      alert(err.message || 'Failed to start assessment')
    }
  }

  const handleOptionSelect = (questionId, optionId, isMulti = false) => {
    if (isMulti) {
      const current = answers[questionId] || []
      const updated = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      setAnswers({ ...answers, [questionId]: updated })
    } else {
      setAnswers({ ...answers, [questionId]: optionId })
    }
  }

  const handleCodeChange = (questionId, code, language) => {
    setCodingSubmissions({
      ...codingSubmissions,
      [questionId]: { code, language },
    })
  }

  const submitQuiz = async () => {
    if (!activeQuiz) return

    const formattedAnswers = activeQuiz.questions?.map((q) => {
      if (q.question_type === 'coding') {
        const sub = codingSubmissions[q.id] || { code: q.starter_code || '', language: q.programming_language || 'python' }
        return {
          question_id: q.id,
          code_submission: sub.code,
          language: sub.language,
        }
      } else if (q.question_type === 'multi_select') {
        return {
          question_id: q.id,
          selected_option_ids: answers[q.id] || [],
        }
      } else {
        return {
          question_id: q.id,
          selected_option_id: answers[q.id] || null,
        }
      }
    })

    try {
      const res = await api.post(`/assessments/attempts/${attemptId}/submit/`, {
        time_taken_seconds: 180,
        answers: formattedAnswers,
      })
      if (res.success) {
        setResult(res.data)
        setActiveQuiz(null)
        fetchInitialData()
      }
    } catch (err) {
      alert(err.message || 'Failed to submit assessment')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Skill Assessments...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Skill & Coding Assessments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Validate your technical domain expertise with timed MCQs and live interactive coding tests.
          </p>
        </div>
        <button
          onClick={handleBackClick}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
        >
          <ArrowLeft size={16} /> {activeQuiz ? 'Exit & Cancel Test' : 'Back'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('assigned')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'assigned' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'assigned' ? '1px solid var(--accent-violet)' : '1px solid transparent',
            color: activeTab === 'assigned' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Calendar size={16} /> Assigned to Me ({assignedAssessments.length})
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'catalog' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'catalog' ? '1px solid var(--accent-violet)' : '1px solid transparent',
            color: activeTab === 'catalog' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <BookOpen size={16} /> Platform Skill Catalog ({catalogAssessments.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: activeTab === 'history' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            border: activeTab === 'history' ? '1px solid var(--accent-violet)' : '1px solid transparent',
            color: activeTab === 'history' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Award size={16} /> Attempt History ({attemptHistory.length})
        </button>
      </div>

      {/* Active Quiz Runner View */}
      {activeQuiz ? (
        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleBackClick}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{activeQuiz.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>{activeQuiz.instructions || activeQuiz.description}</p>
              </div>
            </div>
            <span className="badge badge-amber"><Clock size={14} /> {activeQuiz.time_limit_minutes} Mins</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {activeQuiz.questions?.map((q, idx) => (
              <div key={q.id} style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    Q{idx + 1}. {q.text}
                  </h4>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                    {q.question_type === 'coding' ? 'Coding Test' : (q.question_type === 'multi_select' ? 'Multi-Select' : 'MCQ')} ({q.points} pts)
                  </span>
                </div>

                {/* MCQ Question View */}
                {q.question_type === 'mcq' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options?.map((opt) => (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          background: answers[q.id] === opt.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                          border: answers[q.id] === opt.id ? '1px solid var(--accent-violet)' : '1px solid var(--border-glass)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${q.id}`}
                          checked={answers[q.id] === opt.id}
                          onChange={() => handleOptionSelect(q.id, opt.id, false)}
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Multi-Select MCQ View */}
                {q.question_type === 'multi_select' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {q.options?.map((opt) => {
                      const isChecked = (answers[q.id] || []).includes(opt.id)
                      return (
                        <label
                          key={opt.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-md)',
                            background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                            border: isChecked ? '1px solid var(--accent-violet)' : '1px solid var(--border-glass)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleOptionSelect(q.id, opt.id, true)}
                          />
                          <span>{opt.text}</span>
                        </label>
                      )
                    })}
                  </div>
                )}

                {/* Coding Test IDE View */}
                {q.question_type === 'coding' && (
                  <CodingEditor
                    initialCode={q.starter_code || ''}
                    language={q.programming_language || 'python'}
                    testCases={q.test_cases || []}
                    onChange={(code, lang) => handleCodeChange(q.id, code, lang)}
                  />
                )}
              </div>
            ))}

            <button onClick={submitQuiz} className="btn-primary" style={{ alignSelf: 'flex-end', padding: '12px 28px', fontSize: '1rem' }}>
              Submit Final Assessment
            </button>
          </div>
        </div>
      ) : result ? (
        /* Result Summary */
        <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: result.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}>
            <Award size={36} color={result.passed ? 'var(--accent-emerald)' : '#f87171'} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Assessment {result.passed ? 'Passed!' : 'Needs Review'}</h3>
          <p style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', fontWeight: 700, margin: '8px 0' }}>Final Score: {result.score_percentage}%</p>
          <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 28px auto', fontSize: '0.95rem' }}>
            {result.recommendation?.recommendation_text}
          </p>

          <button onClick={() => setResult(null)} className="btn-secondary">Back to Assessments</button>
        </div>
      ) : (
        /* Content Views based on Active Tab */
        <div>
          {/* TAB 1: ASSIGNED TO ME */}
          {activeTab === 'assigned' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {assignedAssessments.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending assigned assessments found. Check out the Platform Skill Catalog!
                </div>
              ) : (
                assignedAssessments.map((item) => {
                  const a = item.assessment
                  return (
                    <div key={item.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="badge badge-purple">{item.target_type === 'individual' ? 'Assigned to You' : 'Platform Target'}</span>
                          <span className="badge badge-amber"><Clock size={12} /> {a?.time_limit_minutes} Mins</span>
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{a?.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{a?.description}</p>
                        {item.due_date && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-pink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} /> Due: {new Date(item.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <button onClick={() => startQuiz(a?.id, item.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        <CheckSquare size={18} /> Start Assigned Test
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* TAB 2: PLATFORM SKILL CATALOG */}
          {activeTab === 'catalog' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {catalogAssessments.map((a) => (
                <div key={a.id} className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: '8px' }}>{a.difficulty_level}</span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{a.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{a.description}</p>
                  </div>
                  <button onClick={() => startQuiz(a.id)} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <CheckSquare size={18} /> Take Assessment
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ATTEMPT HISTORY */}
          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {attemptHistory.map((att) => (
                <div key={att.id} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{att.assessment_title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Completed on {new Date(att.completed_at || att.started_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${att.passed ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '0.85rem' }}>
                      {att.score_percentage}% ({att.passed ? 'Passed' : 'Needs Review'})
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                      {att.recommendation?.score_level || 'Evaluated'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Exit & Cancel Confirmation Modal */}
      {showExitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Exit Active Assessment?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Are you sure you want to exit? Your ongoing assessment process will be cancelled and progress may be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowExitModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowExitModal(false)
                  setActiveQuiz(null)
                  setResult(null)
                }}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center', background: '#ef4444', borderColor: '#ef4444' }}
              >
                Exit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
