import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/profile/')
      .then((res) => {
        if (res.success) {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password })
    if (res.success) {
      const { access, refresh, user: userData } = res.data
      if (access) localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)
      if (userData) localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    }
    throw new Error(res.message || 'Login failed')
  }

  const register = async (data) => {
    const res = await api.post('/auth/register/', data)
    return res
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try {
      await api.post('/auth/logout/', { refresh })
    } catch (e) {
      // Silent catch
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
