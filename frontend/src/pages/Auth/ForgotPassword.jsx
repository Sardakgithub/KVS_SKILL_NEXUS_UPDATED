import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/Logo'
import { api } from '../../api/client'
import { Mail, Lock, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react'

export const ForgotPassword = () => {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  // Flow State
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [timer, setTimer] = useState(0)

  // UI state
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // 1-minute (60 seconds) timer countdown effect
  useEffect(() => {
    let interval = null
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer])

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password/', { email })
      if (res.success) {
        setOtpSent(true)
        setTimer(60) // Start 1-minute countdown timer
        setMessage(res.message || 'OTP has been sent to your email address.')
      }
    } catch (err) {
      setError(err.message || err.errors || 'Failed to send OTP. Please check your email.')
    } finally {
      setLoading(false)
    }
  }



  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await api.post('/auth/verify-otp/', { email, otp })
      if (res.success) {
        setOtpVerified(true)
        setMessage('OTP verified successfully! Please enter your new password below.')
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== newPasswordConfirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const res = await api.post('/auth/reset-password/', {
        email,
        otp,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      })
      if (res.success) {
        setMessage('Password reset successful! Redirecting to sign in...')
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '40px 32px',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Logo size="large" layout="vertical" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reset Your Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
            Verify your email via OTP to reset password
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            marginBottom: '20px',
          }}>
            {message}
          </div>
        )}

        {/* STEP 1: Enter Email & Send OTP */}
        <form onSubmit={handleSendOtp} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
            1. Email Address
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="email"
                required
                disabled={otpVerified || timer > 0}
                className="input-glass"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button
              type="submit"
              disabled={loading || timer > 0 || otpVerified}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '0.85rem' }}
            >
              {timer > 0 ? `Resend in ${timer}s` : (otpSent ? 'Resend OTP' : 'Send OTP')}
            </button>
          </div>
        </form>

        {/* STEP 2: Enter OTP & Verify */}
        {otpSent && (
          <form onSubmit={handleVerifyOtp} style={{ marginBottom: '20px' }} className="animate-fade-in">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
              2. Enter 6-Digit OTP Code
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  required
                  maxLength={6}
                  disabled={otpVerified}
                  className="input-glass"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ paddingLeft: '44px', letterSpacing: '2px', fontWeight: 'bold' }}
                />
                <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <button
                type="submit"
                disabled={loading || otpVerified}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                {otpVerified ? 'Verified' : 'Verify OTP'}
              </button>
            </div>
            {timer > 0 && !otpVerified && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '6px' }}>
                Resend OTP available in {timer}s
              </p>
            )}


          </form>
        )}

        {/* STEP 3: Reset Password (DISABLED UNTIL OTP IS VERIFIED) */}
        <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              3. New Password {!otpVerified && <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>(Verify OTP first to enable)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                minLength={8}
                disabled={!otpVerified}
                className="input-glass"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ paddingLeft: '44px', opacity: otpVerified ? 1 : 0.6 }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                minLength={8}
                disabled={!otpVerified}
                className="input-glass"
                placeholder="Repeat new password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                style={{ paddingLeft: '44px', opacity: otpVerified ? 1 : 0.6 }}
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !otpVerified}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px', opacity: otpVerified ? 1 : 0.5 }}
          >
            {loading ? 'Resetting Password...' : <>Reset Password <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--accent-violet)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
