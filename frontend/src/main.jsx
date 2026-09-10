import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Auth & Context
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'

// Public Pages
import { Home } from './pages/Home'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'

// Student Pages
import { StudentDashboard } from './pages/Dashboard/StudentDashboard'
import StudentProfile from './pages/StudentProfile'
import { Careers } from './pages/Careers'
import { Courses } from './pages/Courses'
import { Assessments } from './pages/Assessments'
import { ResumeBuilder } from './pages/ResumeBuilder'
import { Jobs } from './pages/Jobs'
import { Mentors } from './pages/Mentors'
import { Certificates } from './pages/Certificates'
import { Notifications } from './pages/Notifications'

// Mentor Pages
import { MentorDashboard } from './pages/Mentor/MentorDashboard'
import { MentorBookings } from './pages/Mentor/MentorBookings'
import { MentorAvailability } from './pages/Mentor/MentorAvailability'
import { MentorAssessments } from './pages/Mentor/MentorAssessments'

// Admin Pages
import { MentorApprovals } from './pages/Admin/MentorApprovals'
import { AnalyticsDashboard } from './pages/Admin/AnalyticsDashboard'
import { AdminHub } from './pages/Admin/AdminHub'

// Smart dashboard that renders the correct view based on user role
const SmartDashboard = () => {
  // Read role directly from localStorage (safe since ProtectedRoute ensures user exists)
  const role = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}').role || 'student'
    } catch {
      return 'student'
    }
  }, [])

  if (role === 'admin') return <AdminHub />
  if (role === 'mentor') return <MentorDashboard />
  return <StudentDashboard />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <SmartDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Student Routes ── */}
          <Route
            path="/careers"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Careers />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/courses"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Courses />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Assessments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <ResumeBuilder />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Jobs />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentors"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Mentors />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <StudentProfile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificates"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Layout>
                  <Certificates />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Mentor Routes ── */}
          <Route
            path="/mentor-assessments"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <Layout>
                  <MentorAssessments />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-bookings"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <Layout>
                  <MentorBookings />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-availability"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <Layout>
                  <MentorAvailability />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mentor-reviews"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <Layout>
                  <MentorBookings />
                </Layout>
              </ProtectedRoute>
            }
          />


          {/* ── Admin Routes ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AdminHub />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <MentorApprovals />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout>
                  <AnalyticsDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
