import axios from 'axios'

// Resolve backend URL: check env variables first, fallback to Render backend in prod or localhost in dev
const RAW_BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://kvs-backend-os33.onrender.com'
    : 'http://127.0.0.1:8000')

// Strip any trailing slash if present
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, '')
const API_BASE = `${BACKEND_URL}/api/v1`

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        return Promise.reject(error.response?.data || error.message)
      }

      try {
        const res = await axios.post(
          `${API_BASE}/auth/token/refresh/`,
          { refresh: refreshToken },
          { withCredentials: true }
        )
        const newAccess = res.data?.data?.access || res.data?.access
        if (newAccess) {
          localStorage.setItem('access_token', newAccess)
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
        }
        return api(originalRequest)
      } catch (refreshErr) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error.response?.data || error.message)
  }
)

// Helper API calls
export const studentProfileApi = {
  getProfile: () => api.get('/students/profile/'),
  updateProfile: (data) => api.patch('/students/profile/', data),
  uploadProfileWithFile: (formData) =>
    api.patch('/students/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteResumeFile: () => api.delete('/students/profile/resume/'),
  getDashboard: () => api.get('/students/dashboard/'),
  getSettings: () => api.get('/students/settings/'),
  updateSettings: (data) => api.patch('/students/settings/', data),
}

export const resumeApi = {
  getResume: () => api.get('/resumes/detail/'),
  updateSummary: (data) => api.patch('/resumes/detail/', data),
  addEducation: (data) => api.post('/resumes/education/', data),
  deleteEducation: (id) => api.delete(`/resumes/education/${id}/`),
  addExperience: (data) => api.post('/resumes/experience/', data),
  deleteExperience: (id) => api.delete(`/resumes/experience/${id}/`),
  addProject: (data) => api.post('/resumes/projects/', data),
  deleteProject: (id) => api.delete(`/resumes/projects/${id}/`),
  addSkill: (data) => api.post('/resumes/skills/', data),
  deleteSkill: (id) => api.delete(`/resumes/skills/${id}/`),
}

export const adminApi = {
  getDashboard: () => api.get('/admin-panel/dashboard/'),
  getHealth: () => api.get('/admin-panel/health/'),
  getUsers: (params) => api.get('/admin-panel/users/', { params }),
  toggleUserStatus: (userId, data) =>
    api.patch(`/admin-panel/users/${userId}/status/`, data),
  sendBroadcast: (data) => api.post('/admin-panel/broadcast/', data),
  getPendingMentors: () => api.get('/admin-panel/mentors/pending/'),
  getAllMentors: () => api.get('/admin-panel/mentors/all/'),
  createMentor: (data) => api.post('/admin-panel/mentors/create/', data),
  deleteMentor: (id) => api.delete(`/admin-panel/mentors/${id}/delete/`),
  approveMentor: (id, approve, notes = '') =>
    api.post(`/admin-panel/mentors/${id}/approval/`, { approve, notes }),
}

export const getMediaUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BACKEND_URL}${cleanPath}`
}