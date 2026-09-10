import React from 'react'

export const LogoSymbol = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Trunk and Branch Lines */}
    <path
      d="M50 85 V 55"
      stroke="#94a3b8"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d="M50 55 L 68 38"
      stroke="#cbd5e1"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M50 62 L 36 48"
      stroke="#cbd5e1"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M50 55 V 28"
      stroke="#1e3a8a"
      strokeWidth="5.5"
      strokeLinecap="round"
    />
    <path
      d="M50 42 L 34 26"
      stroke="#2563eb"
      strokeWidth="4.5"
      strokeLinecap="round"
    />

    {/* Nodes */}
    {/* Top Node */}
    <circle cx="50" cy="24" r="6" fill="#1e3a8a" stroke="#ffffff" strokeWidth="2" />
    {/* Top Left Node */}
    <circle cx="32" cy="24" r="5.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
    {/* Middle Left Node */}
    <circle cx="34" cy="46" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" />
    {/* Middle Right Node */}
    <circle cx="70" cy="36" r="4.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2.5" />
  </svg>
)

export const Logo = ({ size = 'medium', showText = true, layout = 'horizontal' }) => {
  const symbolSize = size === 'small' ? 32 : size === 'large' ? 52 : 40

  if (layout === 'vertical') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <LogoSymbol size={symbolSize} />
        {showText && (
          <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>KVS </span>
            <span style={{ fontSize: '1.4rem', fontWeight: 400, color: '#3b82f6', letterSpacing: '0.01em' }}>Nexus</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <LogoSymbol size={symbolSize} />
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ lineHeight: 1.1, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: size === 'small' ? '1.1rem' : '1.3rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.02em' }}>KVS</span>
            <span style={{ fontSize: size === 'small' ? '1.1rem' : '1.3rem', fontWeight: 400, color: '#3b82f6', letterSpacing: '0.01em' }}>Nexus</span>
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em' }}>PUBLIC SKILL PLATFORM</span>
        </div>
      )}
    </div>
  )
}

export default Logo
