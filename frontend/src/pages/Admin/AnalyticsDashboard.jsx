import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { BarChart2, TrendingUp, Users, BookOpen, Compass, Briefcase } from 'lucide-react'

export const AnalyticsDashboard = () => {
  const [growthData, setGrowthData] = useState([])
  const [courseStats, setCourseStats] = useState(null)
  const [careerStats, setCareerStats] = useState(null)
  const [jobStats, setJobStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [gRes, cRes, carRes, jRes] = await Promise.all([
        api.get('/analytics/user-growth/'),
        api.get('/analytics/courses/'),
        api.get('/analytics/careers/'),
        api.get('/analytics/jobs/'),
      ])
      if (gRes.success) setGrowthData(gRes.data)
      if (cRes.success) setCourseStats(cRes.data)
      if (carRes.success) setCareerStats(carRes.data)
      if (jRes.success) setJobStats(jRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Platform Analytics...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Platform Analytics & Reports</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Aggregated insights on user growth, course completions, career popularity, and job applications</p>
      </div>

      {/* Overview Stat Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Course Enrollments</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-blue)' }}>{courseStats?.total_enrollments || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Course Completions</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-emerald)' }}>{courseStats?.total_completions || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Career Path Enrollments</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-violet)' }}>{careerStats?.total_enrolled_careers || 0}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Job & Internship Applications</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '8px', color: 'var(--accent-pink)' }}>{jobStats?.total_applications || 0}</div>
        </div>
      </div>

      {/* Popular Courses & Careers Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen color="var(--accent-blue)" /> Top Enrolled Courses
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {courseStats?.popular_courses?.map((pc) => (
              <div key={pc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pc.title}</span>
                <span className="badge badge-indigo">{pc.total_enrollments} Enrolled</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass color="var(--accent-violet)" /> Popular Career Paths
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {careerStats?.popular_careers?.map((car) => (
              <div key={car.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{car.title}</span>
                <span className="badge badge-purple">{car.total_enrolled} Enrolled</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
