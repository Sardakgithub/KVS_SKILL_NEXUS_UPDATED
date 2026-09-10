import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { BookOpen, Clock, PlayCircle, CheckCircle } from 'lucide-react'

export const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/')
      if (res.success) setCourses(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (courseId) => {
    try {
      const res = await api.post(`/courses/${courseId}/enroll/`)
      if (res.success) alert('Enrolled in course successfully!')
    } catch (err) {
      alert(err.message || 'Already enrolled in this course.')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Courses...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Explore Courses</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Master industry-relevant skills through curated video lessons and quizzes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
        {courses.map((course) => (
          <div
            key={course.id}
            className="glass-panel"
            style={{
              padding: '24px',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              height: '100%',
              minHeight: '340px',
              boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px' }}>
                <span className="badge badge-indigo" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                  {course.category?.name || 'General'}
                </span>
                <span className="badge badge-purple" style={{ flexShrink: 0 }}>
                  <Clock size={12} /> {course.duration_hours}h
                </span>
              </div>

              <h3 style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                marginBottom: '10px',
                color: '#0f172a',
                lineHeight: 1.35,
                minHeight: '3.1rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {course.title}
              </h3>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: 1.55, marginBottom: '20px', flex: 1 }}>
                {course.description}
              </p>
            </div>

            <button
              onClick={() => handleEnroll(course.id)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 'auto', padding: '12px 20px' }}
            >
              <PlayCircle size={18} /> Enroll Now
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
