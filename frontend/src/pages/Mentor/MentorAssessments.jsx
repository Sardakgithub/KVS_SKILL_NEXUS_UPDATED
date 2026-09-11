import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import {
  CheckSquare, Plus, Users, Calendar, Clock, Code, HelpCircle,
  Edit2, Trash2, Send, Eye, Award, CheckCircle, XCircle, ChevronDown, Search
} from 'lucide-react'

export const MentorAssessments = () => {
  const [assessments, setAssessments] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false)

  // Active Selected State
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [students, setStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')

  // Assessment Builder Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    skill_id: '',
    difficulty_level: 'intermediate',
    time_limit_minutes: 30,
    passing_score: 70,
    assignment_type: 'all',
    questions: [],
  })

  // Assign Form State
  const [assignData, setAssignData] = useState({
    target_type: 'all',
    student_ids: [],
    due_date: '',
  })

  // Grading State
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradeInputs, setGradeInputs] = useState({})

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [assRes, skillRes] = await Promise.all([
        api.get('/assessments/mentor/my-assessments/'),
        api.get('/careers/skills/'),
      ])
      if (assRes.success) setAssessments(assRes.data)
      if (skillRes.success) setSkills(skillRes.data.results || skillRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreateModal = (assessment = null) => {
    if (assessment) {
      setFormData({
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        instructions: assessment.instructions || '',
        skill_id: assessment.skill?.id || skills[0]?.id || '',
        difficulty_level: assessment.difficulty_level,
        time_limit_minutes: assessment.time_limit_minutes,
        passing_score: assessment.passing_score,
        assignment_type: assessment.assignment_type || 'all',
        questions: assessment.questions || [],
      })
    } else {
      setFormData({
        title: '',
        description: '',
        instructions: '',
        skill_id: skills[0]?.id || '',
        difficulty_level: 'intermediate',
        time_limit_minutes: 30,
        passing_score: 70,
        assignment_type: 'all',
        questions: [
          {
            text: '',
            question_type: 'mcq',
            points: 1,
            explanation: '',
            starter_code: '',
            programming_language: 'python',
            test_cases: [{ input: '', expected_output: '', is_hidden: false }],
            options: [
              { text: '', is_correct: true },
              { text: '', is_correct: false },
            ],
          },
        ],
      })
    }
    setShowCreateModal(true)
  }

  const handleAddQuestion = (type = 'mcq') => {
    const newQ = {
      text: '',
      question_type: type,
      points: type === 'coding' ? 5 : 1,
      explanation: '',
      starter_code: type === 'coding' ? 'import sys\n\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()' : '',
      programming_language: 'python',
      test_cases: type === 'coding' ? [{ input: '', expected_output: '', is_hidden: false }] : [],
      options: type !== 'coding' && type !== 'text' ? [
        { text: 'Option 1', is_correct: true },
        { text: 'Option 2', is_correct: false },
      ] : [],
    }
    setFormData({ ...formData, questions: [...formData.questions, newQ] })
  }

  const handleSaveAssessment = async () => {
    if (!formData.title || !formData.skill_id) {
      alert('Please fill in title and select a skill.')
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description || 'Skill domain evaluation assessment.',
      instructions: formData.instructions || '',
      skill_id: parseInt(formData.skill_id),
      difficulty_level: formData.difficulty_level || 'intermediate',
      time_limit_minutes: parseInt(formData.time_limit_minutes) || 30,
      passing_score: parseInt(formData.passing_score) || 70,
      assignment_type: formData.assignment_type || 'all',
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      questions: (formData.questions || []).map((q, idx) => ({
        text: q.text || 'Question Prompt',
        question_type: q.question_type || 'mcq',
        points: parseInt(q.points) || 1,
        explanation: q.explanation || '',
        order: idx + 1,
        starter_code: q.starter_code || '',
        programming_language: q.programming_language || 'python',
        test_cases: q.test_cases || [],
        options: (q.options || []).map((o, oIdx) => ({
          text: o.text || `Option ${oIdx + 1}`,
          is_correct: !!o.is_correct,
          order: oIdx + 1,
        })),
      })),
    }

    try {
      let res
      if (formData.id) {
        res = await api.put(`/assessments/mentor/${formData.id}/`, payload)
      } else {
        res = await api.post('/assessments/mentor/my-assessments/', payload)
      }
      if (res.success) {
        alert(formData.id ? 'Assessment updated successfully!' : 'Assessment created successfully!')
        setShowCreateModal(false)
        fetchInitialData()
      } else {
        alert(res.message || 'Failed to save assessment')
      }
    } catch (err) {
      let msg = err.message || 'Failed to save assessment'
      if (err.errors) {
        msg = Object.entries(err.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
      }
      alert(`Validation error:\n${msg}`)
    }
  }




  const handleDeleteAssessment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return
    try {
      const res = await api.delete(`/assessments/mentor/${id}/`)
      if (res.success) {
        setAssessments(assessments.filter((a) => a.id !== id))
      }
    } catch (err) {
      alert(err.message || 'Failed to delete assessment')
    }
  }

  // Assign Assessment Flow
  const handleOpenAssignModal = async (assessment) => {
    setSelectedAssessment(assessment)
    setAssignData({ target_type: 'all', student_ids: [], due_date: '' })
    try {
      const res = await api.get('/assessments/mentor/students-list/')
      if (res.success) setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
    setShowAssignModal(true)
  }

  const handleSearchStudents = async (e) => {
    const val = e.target.value
    setStudentSearch(val)
    try {
      const res = await api.get(`/assessments/mentor/students-list/?search=${encodeURIComponent(val)}`)
      if (res.success) setStudents(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStudentSelection = (stId) => {
    const ids = assignData.student_ids.includes(stId)
      ? assignData.student_ids.filter((id) => id !== stId)
      : [...assignData.student_ids, stId]
    setAssignData({ ...assignData, student_ids: ids })
  }

  const handleConfirmAssign = async () => {
    const payload = {
      target_type: assignData.target_type || 'all',
      student_ids: assignData.student_ids || [],
      due_date: assignData.due_date ? new Date(assignData.due_date).toISOString() : null,
    }
    try {
      const res = await api.post(`/assessments/mentor/${selectedAssessment.id}/assign/`, payload)
      if (res.success) {
        alert(res.message || 'Assessment assigned successfully!')
        setShowAssignModal(false)
        fetchInitialData()
      } else {
        alert(res.message || 'Failed to assign assessment')
      }
    } catch (err) {
      let msg = err.message || 'Failed to assign assessment'
      if (err.errors) {
        msg = Object.entries(err.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
      }
      alert(`Assignment failed:\n${msg}`)
    }
  }


  // View Submissions Flow
  const handleOpenSubmissionsModal = async (assessment) => {
    setSelectedAssessment(assessment)
    setSelectedSubmission(null)
    try {
      const res = await api.get(`/assessments/mentor/${assessment.id}/submissions/`)
      if (res.success) setSubmissions(res.data)
    } catch (err) {
      console.error(err)
    }
    setShowSubmissionsModal(true)
  }

  const handleSubmitGrade = async (attemptId) => {
    const gradesPayload = Object.entries(gradeInputs).map(([ansId, val]) => ({
      answer_id: parseInt(ansId),
      points_awarded: parseFloat(val.points || 0),
      feedback: val.feedback || '',
    }))

    try {
      const res = await api.post(`/assessments/mentor/attempts/${attemptId}/grade/`, { grades: gradesPayload })
      if (res.success) {
        alert('Grading updated successfully!')
        handleOpenSubmissionsModal(selectedAssessment)
      }
    } catch (err) {
      alert(err.message || 'Failed to grade submission')
    }
  }

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading Mentor Assessments Hub...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="header-row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Mentor Assessment Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Build custom MCQs and Coding tests, assign them to individual students or platform-wide, and review code submissions.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="btn-primary"
          style={{ gap: '8px', padding: '12px 20px', borderRadius: 'var(--radius-md)' }}
        >
          <Plus size={18} /> Create New Assessment
        </button>
      </div>

      {/* Assessments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {assessments.map((a) => (
          <div
            key={a.id}
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge badge-purple">{a.skill?.name || 'General Skill'}</span>
                <span className="badge badge-amber"><Clock size={12} /> {a.time_limit_minutes} Mins</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{a.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', minHeight: '40px' }}>
                {a.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: 'var(--text-bright)', marginBottom: '20px' }}>
                <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                  Questions: {a.total_questions || a.questions?.length || 0}
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', textTransform: 'capitalize' }}>
                  Target: {a.assignment_type || 'All'}
                </span>
                <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '4px 10px', borderRadius: 'var(--radius-sm)' }}>
                  Pass Score: {a.passing_score}%
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => handleOpenAssignModal(a)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Assign Test
                </button>
                <button
                  onClick={() => handleOpenSubmissionsModal(a)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', justifyContent: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> Submissions
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => handleOpenCreateModal(a)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '4px' }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteAssessment(a.id)}
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT ASSESSMENT MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px' }}>
              {formData.id ? 'Edit Assessment' : 'Create New Assessment'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python Data Structures & Algorithmic Test"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Skill Category</label>
                  <select
                    value={formData.skill_id}
                    onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: '#0f172a', border: '1px solid var(--border-glass)', color: '#fff' }}
                  >
                    {skills.map((s) => (
                      <option key={s.id} value={s.id} style={{ background: '#0f172a', color: '#fff' }}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Difficulty Level</label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: '#0f172a', border: '1px solid var(--border-glass)', color: '#fff' }}
                  >
                    <option value="beginner" style={{ background: '#0f172a', color: '#fff' }}>Beginner</option>
                    <option value="intermediate" style={{ background: '#0f172a', color: '#fff' }}>Intermediate</option>
                    <option value="advanced" style={{ background: '#0f172a', color: '#fff' }}>Advanced</option>
                  </select>
                </div>

              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Short description of what skills are tested..."
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                />
              </div>

              {/* Question Bank Builder */}
              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                <div className="header-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Question Bank ({formData.questions.length})</h4>
                  <div className="btn-row" style={{ gap: '8px' }}>
                    <button onClick={() => handleAddQuestion('mcq')} className="btn-secondary" style={{ fontSize: '0.8rem' }}>+ MCQ</button>
                    <button onClick={() => handleAddQuestion('multi_select')} className="btn-secondary" style={{ fontSize: '0.8rem' }}>+ Multi-Select</button>
                    <button onClick={() => handleAddQuestion('coding')} className="btn-secondary" style={{ fontSize: '0.8rem' }}>+ Coding Test</button>
                  </div>
                </div>

                {formData.questions.map((q, qIdx) => (
                  <div key={qIdx} style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge badge-cyan">Question #{qIdx + 1} ({q.question_type})</span>
                      <button
                        onClick={() => {
                          const qs = [...formData.questions]
                          qs.splice(qIdx, 1)
                          setFormData({ ...formData, questions: qs })
                        }}
                        style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </div>

                    <input
                      type="text"
                      value={q.text}
                      onChange={(e) => {
                        const qs = [...formData.questions]
                        qs[qIdx].text = e.target.value
                        setFormData({ ...formData, questions: qs })
                      }}
                      placeholder="Enter question prompt..."
                      style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff', marginBottom: '12px' }}
                    />

                    {/* MCQ / Multi-select Options */}
                    {(q.question_type === 'mcq' || q.question_type === 'multi_select') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Options (Check correct answers):</span>
                        {q.options?.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                              type={q.question_type === 'mcq' ? 'radio' : 'checkbox'}
                              name={`correct_${qIdx}`}
                              checked={opt.is_correct}
                              onChange={(e) => {
                                const qs = [...formData.questions]
                                if (q.question_type === 'mcq') {
                                  qs[qIdx].options.forEach((o) => (o.is_correct = false))
                                }
                                qs[qIdx].options[oIdx].is_correct = e.target.checked
                                setFormData({ ...formData, questions: qs })
                              }}
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const qs = [...formData.questions]
                                qs[qIdx].options[oIdx].text = e.target.value
                                setFormData({ ...formData, questions: qs })
                              }}
                              placeholder={`Option ${oIdx + 1}`}
                              style={{ flex: 1, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Coding Test Builder */}
                    {q.question_type === 'coding' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Starter Code Template:</label>
                          <textarea
                            value={q.starter_code}
                            onChange={(e) => {
                              const qs = [...formData.questions]
                              qs[qIdx].starter_code = e.target.value
                              setFormData({ ...formData, questions: qs })
                            }}
                            rows={4}
                            style={{ width: '100%', fontFamily: 'monospace', padding: '10px', borderRadius: 'var(--radius-md)', background: '#0d1117', color: '#e6edf3' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Test Cases (Input & Expected Output):</label>
                          {q.test_cases?.map((tc, tcIdx) => (
                            <div key={tcIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                              <input
                                type="text"
                                value={tc.input}
                                onChange={(e) => {
                                  const qs = [...formData.questions]
                                  qs[qIdx].test_cases[tcIdx].input = e.target.value
                                  setFormData({ ...formData, questions: qs })
                                }}
                                placeholder="Input stdin (e.g. 5 10)"
                                style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                              />
                              <input
                                type="text"
                                value={tc.expected_output}
                                onChange={(e) => {
                                  const qs = [...formData.questions]
                                  qs[qIdx].test_cases[tcIdx].expected_output = e.target.value
                                  setFormData({ ...formData, questions: qs })
                                }}
                                placeholder="Expected stdout (e.g. 15)"
                                style={{ padding: '6px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' }}
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const qs = [...formData.questions]
                              qs[qIdx].test_cases.push({ input: '', expected_output: '', is_hidden: false })
                              setFormData({ ...formData, questions: qs })
                            }}
                            className="btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            + Add Test Case
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveAssessment} className="btn-primary">Save Assessment</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN ASSESSMENT MODAL */}
      {showAssignModal && selectedAssessment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '32px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>Assign Assessment</h3>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '20px' }}>
              {selectedAssessment.title}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Assignment Target:</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="target_type"
                      checked={assignData.target_type === 'all'}
                      onChange={() => setAssignData({ ...assignData, target_type: 'all' })}
                    />
                    <span>All Platform Students</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="target_type"
                      checked={assignData.target_type === 'individual'}
                      onChange={() => setAssignData({ ...assignData, target_type: 'individual' })}
                    />
                    <span>Individual Students</span>
                  </label>
                </div>
              </div>

              {assignData.target_type === 'individual' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                    Select Students ({assignData.student_ids.length} selected):
                  </label>
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={handleSearchStudents}
                      placeholder="Search by student name or email..."
                      style={{ width: '100%', padding: '8px 8px 8px 36px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', padding: '8px' }}>
                    {students.map((st) => (
                      <label
                        key={st.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: 'var(--radius-sm)',
                          background: assignData.student_ids.includes(st.id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          cursor: 'pointer', marginBottom: '4px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={assignData.student_ids.includes(st.id)}
                          onChange={() => handleToggleStudentSelection(st.id)}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{st.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{st.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleConfirmAssign} className="btn-primary">Confirm Assignment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSIONS & GRADING MODAL */}
      {showSubmissionsModal && selectedAssessment && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>Submissions & Grading Review</h3>
            <p style={{ color: 'var(--accent-cyan)', fontSize: '0.9rem', marginBottom: '20px' }}>{selectedAssessment.title}</p>

            {submissions.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No student submissions recorded for this assessment yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {submissions.map((sub) => (
                  <div key={sub.id} style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{sub.student_name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.student_email}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${sub.passed ? 'badge-emerald' : 'badge-amber'}`}>
                          Score: {sub.score_percentage}% ({sub.passed ? 'Passed' : 'Needs Review'})
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Submitted: {new Date(sub.completed_at || sub.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Answers Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                      {sub.answers?.map((ans, aIdx) => (
                        <div key={ans.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                            <span>Q{aIdx + 1}. {ans.question_text} [{ans.question_type}]</span>
                            <span style={{ color: ans.is_correct ? 'var(--accent-emerald)' : '#f87171' }}>
                              Points: {ans.points_awarded}
                            </span>
                          </div>

                          {ans.code_submission ? (
                            <div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted Code:</span>
                              <pre style={{ background: '#0d1117', padding: '10px', borderRadius: '4px', color: '#e6edf3', fontSize: '0.8rem', overflowX: 'auto' }}>
                                {ans.code_submission}
                              </pre>
                              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '4px' }}>
                                Test Cases Passed: {ans.test_cases_passed} / {ans.test_cases_total}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-bright)' }}>
                              Answer: {ans.selected_option_text || ans.text_response || 'No answer'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button onClick={() => setShowSubmissionsModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
