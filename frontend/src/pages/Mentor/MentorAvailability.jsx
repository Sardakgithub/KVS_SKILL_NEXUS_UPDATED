import React, { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { Settings, Plus, Trash2, Clock, CheckCircle, Sun } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const MentorAvailability = () => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newSlot, setNewSlot] = useState({ day_of_week: 0, start_time: '09:00', end_time: '10:00' })

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/mentors/availability/')
      if (res.success) {
        setSlots(res.data?.results || res.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.post('/mentors/availability/', newSlot)
      if (res.success) {
        setSlots((prev) => [...prev, res.data])
        setNewSlot({ day_of_week: 0, start_time: '09:00', end_time: '10:00' })
        flashSaved()
      }
    } catch (err) {
      console.error('Failed to add availability', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/mentors/availability/${id}/`)
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const flashSaved = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const groupedSlots = DAYS.reduce((acc, day, idx) => {
    acc[idx] = slots.filter((s) => s.day_of_week === idx)
    return acc
  }, {})

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading availability...</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings color="var(--accent-violet)" size={24} /> Manage Availability
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Define your weekly availability windows so students can book sessions during those times
        </p>
      </div>

      {/* Add New Slot Form */}
      <div className="glass-panel" style={{
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus color="var(--accent-cyan)" size={18} /> Add Availability Window
        </h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Day of Week</label>
            <select
              className="input-glass"
              value={newSlot.day_of_week}
              onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
              style={{ cursor: 'pointer' }}
            >
              {DAYS.map((day, idx) => (
                <option key={idx} value={idx} style={{ background: '#0f172a' }}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>Start Time</label>
            <input
              type="time"
              className="input-glass"
              value={newSlot.start_time}
              onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>End Time</label>
            <input
              type="time"
              className="input-glass"
              value={newSlot.end_time}
              onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}
          >
            <Plus size={16} /> {saving ? 'Adding...' : 'Add Slot'}
          </button>
        </form>

        {saved && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            color: '#34d399',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            <CheckCircle size={16} /> Availability slot saved!
          </div>
        )}
      </div>

      {/* Weekly Schedule Grid */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun color="var(--accent-amber)" size={18} /> Your Weekly Schedule
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {DAYS.map((day, idx) => {
            const daySlots = groupedSlots[idx] || []
            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                background: daySlots.length > 0 ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)',
                border: `1px solid ${daySlots.length > 0 ? 'rgba(99,102,241,0.2)' : 'var(--border-glass)'}`,
              }}>
                <div style={{
                  minWidth: '110px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: daySlots.length > 0 ? 'var(--text-main)' : 'var(--text-dim)',
                  paddingTop: '2px',
                }}>
                  {day}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                  {daySlots.length === 0 ? (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No slots — unavailable</span>
                  ) : (
                    daySlots.map((slot) => (
                      <div key={slot.id} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.3)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: '#a5b4fc',
                      }}>
                        <Clock size={12} />
                        {slot.start_time} – {slot.end_time}
                        <button
                          onClick={() => handleDelete(slot.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0', lineHeight: 1, display: 'flex', alignItems: 'center' }}
                          title="Remove slot"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
