import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/client'
import {
  Users,
  Activity,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Bell,
  BookOpen,
  Compass,
  Briefcase,
  Search,
  Plus,
  Trash2,
  RefreshCw,
  UserCheck,
  UserX,
  Server,
  Database,
  Send,
  Award,
} from 'lucide-react'

export const AdminHub = () => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users' | 'mentors' | 'broadcast'

  // Data states
  const [metrics, setMetrics] = useState(null)
  const [health, setHealth] = useState(null)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [pendingMentors, setPendingMentors] = useState([])
  const [allMentors, setAllMentors] = useState([])
  const [loading, setLoading] = useState(true)

  // Action states
  const [approvalNotes, setApprovalNotes] = useState({})
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', target_role: 'all' })
  const [broadcastStatus, setBroadcastStatus] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  // Create Mentor Modal state
  const [showCreateMentor, setShowCreateMentor] = useState(false)
  const [newMentorForm, setNewMentorForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    company: '',
    position: '',
    hourly_rate: 50,
  })

  const silentRefresh = async () => {
    try {
      const [mRes, hRes, uRes, pmRes, amRes] = await Promise.all([
        adminApi.getDashboard().catch(() => null),
        adminApi.getHealth().catch(() => null),
        adminApi.getUsers(userSearch || userRoleFilter ? { search: userSearch, role: userRoleFilter } : {}).catch(() => null),
        adminApi.getPendingMentors().catch(() => null),
        adminApi.getAllMentors().catch(() => null),
      ])

      if (mRes?.success) setMetrics(mRes.data)
      if (hRes?.success) setHealth(hRes.data)
      if (uRes?.success) setUsers(uRes.data || [])
      if (pmRes?.success) setPendingMentors(pmRes.data || [])
      if (amRes?.success) setAllMentors(amRes.data || [])
    } catch (err) {
      // silent background refresh catch
    }
  }

  useEffect(() => {
    loadAllData()
    const interval = setInterval(() => {
      silentRefresh()
    }, 3000)
    return () => clearInterval(interval)
  }, [userSearch, userRoleFilter])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [mRes, hRes, uRes, pmRes, amRes] = await Promise.all([
        adminApi.getDashboard().catch(() => null),
        adminApi.getHealth().catch(() => null),
        adminApi.getUsers().catch(() => null),
        adminApi.getPendingMentors().catch(() => null),
        adminApi.getAllMentors().catch(() => null),
      ])

      if (mRes?.success) setMetrics(mRes.data)
      if (hRes?.success) setHealth(hRes.data)
      if (uRes?.success) setUsers(uRes.data || [])
      if (pmRes?.success) setPendingMentors(pmRes.data || [])
      if (amRes?.success) setAllMentors(amRes.data || [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter users dynamically
  const fetchFilteredUsers = async () => {
    try {
      const params = {}
      if (userSearch) params.search = userSearch
      if (userRoleFilter) params.role = userRoleFilter
      const res = await adminApi.getUsers(params)
      if (res?.success) setUsers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFilteredUsers()
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, userRoleFilter])

  // User status toggle
  const handleToggleUser = async (userId, currentActive) => {
    try {
      const res = await adminApi.toggleUserStatus(userId, { is_active: !currentActive })
      if (res?.success) {
        setActionMessage(`User status updated to ${!currentActive ? 'Active' : 'Inactive'}`)
        fetchFilteredUsers()
      }
    } catch (err) {
      alert('Failed to update user status')
    }
  }

  // Mentor Approval
  const handleMentorApproval = async (mentorId, approve) => {
    try {
      const notes = approvalNotes[mentorId] || ''
      const res = await adminApi.approveMentor(mentorId, approve, notes)
      if (res?.success) {
        setActionMessage(`Mentor application ${approve ? 'Approved' : 'Rejected'}`)
        loadAllData()
      }
    } catch (err) {
      alert('Failed to process mentor approval')
    }
  }

  // Delete Mentor
  const handleDeleteMentor = async (mentorId) => {
    if (!window.confirm('Are you sure you want to delete this mentor account?')) return
    try {
      const res = await adminApi.deleteMentor(mentorId)
      if (res?.success) {
        setActionMessage('Mentor account deleted successfully')
        loadAllData()
      }
    } catch (err) {
      alert('Failed to delete mentor')
    }
  }

  // Create Mentor
  const handleCreateMentor = async (e) => {
    e.preventDefault()
    try {
      const res = await adminApi.createMentor(newMentorForm)
      if (res?.success) {
        setActionMessage('New mentor created successfully')
        setShowCreateMentor(false)
        setNewMentorForm({ email: '', first_name: '', last_name: '', password: '', company: '', position: '', hourly_rate: 50 })
        loadAllData()
      }
    } catch (err) {
      alert(err.message || 'Failed to create mentor')
    }
  }

  // Send Broadcast
  const handleSendBroadcast = async (e) => {
    e.preventDefault()
    if (!broadcastForm.title || !broadcastForm.message) return
    try {
      const res = await adminApi.sendBroadcast(broadcastForm)
      if (res?.success) {
        setBroadcastStatus({ type: 'success', text: res.message || 'Broadcast notification sent successfully!' })
        setBroadcastForm({ title: '', message: '', target_role: 'all' })
      }
    } catch (err) {
      setBroadcastStatus({ type: 'error', text: err.message || 'Failed to send broadcast' })
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Command Hub
            </h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} /> REAL-TIME STREAM ACTIVE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '4px' }}>
            Platform health monitoring, user moderation, mentor clearance, and system announcements
          </p>
        </div>
        <button
          onClick={loadAllData}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Status
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div style={{ padding: '12px 18px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: 'var(--radius-md)', color: 'var(--accent-blue)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', overflowX: 'auto' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Activity size={16} /> System Health & Metrics
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={16} /> User Directory ({users?.length || 0})
        </button>
        <button
          className={`btn ${activeTab === 'mentors' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('mentors')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={16} /> Mentor Clearance {pendingMentors?.length > 0 && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>{pendingMentors.length}</span>}
        </button>
        <button
          className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('broadcast')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Bell size={16} /> Broadcast Center
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM HEALTH */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Health Status Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: health?.db_status === 'healthy' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: health?.db_status === 'healthy' ? '#22c55e' : '#ef4444' }}>
                <Database size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Database Health</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: health?.db_status === 'healthy' ? '#22c55e' : '#ef4444', textTransform: 'capitalize' }}>
                  {health?.db_status || 'Checking...'}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: health?.cache_status === 'healthy' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: health?.cache_status === 'healthy' ? '#22c55e' : '#f59e0b' }}>
                <Server size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Redis Cache</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: health?.cache_status === 'healthy' ? '#22c55e' : '#f59e0b', textTransform: 'capitalize' }}>
                  {health?.cache_status || 'Checking...'}
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
                <Users size={28} />
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Platform Users</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{health?.active_users || metrics?.total_users || 0} / {metrics?.total_users || 0}</div>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Students</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-blue)' }}>{metrics?.total_students || 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mentors</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-violet)' }}>{metrics?.total_mentors || 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Approvals</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: metrics?.pending_mentor_approvals > 0 ? '#ef4444' : 'var(--text-muted)' }}>{metrics?.pending_mentor_approvals || 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Courses</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-emerald)' }}>{metrics?.total_courses || 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Booked Sessions</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-pink)' }}>{metrics?.total_bookings || 0}</div>
            </div>
            <div className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Applications</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#3b82f6' }}>{metrics?.total_applications || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & MODERATION */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '40px', width: '100%' }}
              />
            </div>
            <select
              className="input-field"
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{ width: '180px' }}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* User Table */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 700 }}>User Details</th>
                  <th style={{ padding: '16px 20px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '16px 20px', fontWeight: 700 }}>Email Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 700 }}>Account Status</th>
                  <th style={{ padding: '16px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700 }}>{u.first_name} {u.last_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-purple' : u.role === 'mentor' ? 'badge-indigo' : 'badge-blue'}`} style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.is_email_verified ? (
                        <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><CheckCircle size={14} /> Verified</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}><XCircle size={14} /> Unverified</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {u.is_active ? (
                        <span className="badge badge-emerald">Active</span>
                      ) : (
                        <span className="badge badge-rose">Inactive / Banned</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUser(u.id, u.is_active)}
                          className={`btn ${u.is_active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                        >
                          {u.is_active ? <UserX size={14} style={{ marginRight: '4px' }} /> : <UserCheck size={14} style={{ marginRight: '4px' }} />}
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MENTOR APPROVALS & ROSTER */}
      {activeTab === 'mentors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mentor Clearance Queue</h3>
            <button onClick={() => setShowCreateMentor(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Create Mentor Account
            </button>
          </div>

          {/* Pending Mentor Applications */}
          {pendingMentors.length === 0 ? (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
              <CheckCircle size={36} color="#22c55e" style={{ marginBottom: '8px' }} />
              <div>All mentor applications have been processed! No pending approvals.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {pendingMentors.map((pm) => (
                <div key={pm.id} className="glass-panel" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{pm.user?.first_name} {pm.user?.last_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{pm.user?.email} • {pm.company} ({pm.job_title})</div>
                    <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>Hourly Rate: <strong>${pm.hourly_rate}</strong></div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Approval / Rejection notes..."
                      className="input-field"
                      style={{ width: '220px', fontSize: '0.85rem' }}
                      value={approvalNotes[pm.id] || ''}
                      onChange={(e) => setApprovalNotes({ ...approvalNotes, [pm.id]: e.target.value })}
                    />
                    <button onClick={() => handleMentorApproval(pm.id, true)} className="btn btn-primary" style={{ background: '#22c55e', borderColor: '#22c55e' }}>
                      Approve
                    </button>
                    <button onClick={() => handleMentorApproval(pm.id, false)} className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Roster of Approved Mentors */}
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px' }}>Approved Mentor Directory</h3>
            <div className="glass-panel" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Mentor Name</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Company & Title</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700 }}>Rate</th>
                    <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allMentors.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '14px 20px', fontWeight: 700 }}>{m.user?.first_name} {m.user?.last_name}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>{m.company || 'N/A'} - {m.job_title || 'Mentor'}</td>
                      <td style={{ padding: '14px 20px' }}>${m.hourly_rate}/hr</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button onClick={() => handleDeleteMentor(m.id)} className="btn btn-secondary" style={{ color: '#ef4444', padding: '6px 12px' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST ANNOUNCEMENT CENTER */}
      {activeTab === 'broadcast' && (
        <div style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell color="var(--accent-purple)" /> Send Broadcast Announcement
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Send an instant system-wide notification to all users or specific roles.
            </p>

            {broadcastStatus && (
              <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', background: broadcastStatus.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: broadcastStatus.type === 'success' ? '#22c55e' : '#ef4444' }}>
                {broadcastStatus.text}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Target Audience</label>
                <select
                  className="input-field"
                  value={broadcastForm.target_role}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="all">All Users (Students, Mentors, Admins)</option>
                  <option value="student">Students Only</option>
                  <option value="mentor">Mentors Only</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Announcement Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Scheduled System Maintenance"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>Notification Message</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Type full announcement message..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  required
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                <Send size={16} /> Dispatch Broadcast
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Mentor Modal */}
      {showCreateMentor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-xl)', maxWidth: '500px', width: '100%' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px' }}>Create New Mentor Account</h3>
            <form onSubmit={handleCreateMentor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="email" placeholder="Email Address" required className="input-field" value={newMentorForm.email} onChange={(e) => setNewMentorForm({ ...newMentorForm, email: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="First Name" required className="input-field" value={newMentorForm.first_name} onChange={(e) => setNewMentorForm({ ...newMentorForm, first_name: e.target.value })} />
                <input type="text" placeholder="Last Name" required className="input-field" value={newMentorForm.last_name} onChange={(e) => setNewMentorForm({ ...newMentorForm, last_name: e.target.value })} />
              </div>
              <input type="password" placeholder="Password" required className="input-field" value={newMentorForm.password} onChange={(e) => setNewMentorForm({ ...newMentorForm, password: e.target.value })} />
              <input type="text" placeholder="Company Name" className="input-field" value={newMentorForm.company} onChange={(e) => setNewMentorForm({ ...newMentorForm, company: e.target.value })} />
              <input type="text" placeholder="Job Position" className="input-field" value={newMentorForm.position} onChange={(e) => setNewMentorForm({ ...newMentorForm, position: e.target.value })} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Mentor</button>
                <button type="button" onClick={() => setShowCreateMentor(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
