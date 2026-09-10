import React, { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Award, ShieldCheck, Download, ExternalLink } from 'lucide-react'

export const Certificates = () => {
  const [certificates, setCertificates] = useState([])
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyResult, setVerifyResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates/my-certificates/')
      if (res.success) setCertificates(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (!verifyCode) return
    try {
      const res = await api.get(`/certificates/verify/${verifyCode}/`)
      if (res.success) setVerifyResult(res.data)
    } catch (err) {
      alert(err.message || 'Invalid verification code')
    }
  }

  const handleDownloadCertificate = (cert) => {
    const studentName = cert.student_name || 'Verified Scholar'
    const issueDate = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString()

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.title}</title>
          <style>
            @page { size: landscape; margin: 0; }
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px;
              background: #f8fafc;
              color: #0f172a;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              box-sizing: border-box;
            }
            .certificate-container {
              width: 900px;
              height: 600px;
              background: #ffffff;
              padding: 50px;
              border: 12px solid #0f172a;
              outline: 3px solid #cbd5e1;
              outline-offset: -18px;
              position: relative;
              box-sizing: border-box;
              text-align: center;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .logo-title {
              font-size: 28px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .cert-subtitle {
              font-size: 13px;
              letter-spacing: 4px;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 5px;
            }
            .header-title {
              font-size: 36px;
              font-weight: 800;
              color: #0f172a;
              margin-top: 35px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .certify-text {
              font-size: 16px;
              color: #475569;
              font-style: italic;
              margin-bottom: 12px;
            }
            .student-name {
              font-size: 34px;
              font-weight: 800;
              color: #4f46e5;
              border-bottom: 2px solid #cbd5e1;
              display: inline-block;
              padding-bottom: 6px;
              margin-bottom: 20px;
            }
            .reason-text {
              font-size: 16px;
              color: #334155;
              max-width: 700px;
              margin: 0 auto 25px auto;
              line-height: 1.6;
            }
            .course-title {
              font-size: 23px;
              font-weight: 700;
              color: #0f172a;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 45px;
              padding: 0 20px;
            }
            .field-box {
              text-align: center;
            }
            .field-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              margin-top: 4px;
              letter-spacing: 1px;
            }
            .field-val {
              font-weight: 700;
              font-size: 14px;
              color: #0f172a;
            }
            .seal-badge {
              width: 74px;
              height: 74px;
              border-radius: 50%;
              background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
              box-shadow: 0 4px 12px rgba(79,70,229,0.3);
              line-height: 1.2;
            }
            @media print {
              body { padding: 0; background: #fff; }
              .certificate-container { box-shadow: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 9999;">
            <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(79,70,229,0.3);">
              🖨️ Print / Save as PDF Certificate
            </button>
          </div>

          <div class="certificate-container">
            <div class="logo-title">KVS NEXUS</div>
            <div class="cert-subtitle">Official Public Skill & Career Ecosystem</div>

            <div class="header-title">Certificate of Accomplishment</div>
            <div class="certify-text">This is proudly awarded to</div>
            <div class="student-name">${studentName}</div>

            <div class="reason-text">
              for successfully demonstrating technical excellence and completing all requirements for
              <div class="course-title" style="margin-top: 6px;">"${cert.title}"</div>
            </div>

            <div class="footer-row">
              <div class="field-box">
                <div class="field-val">${issueDate}</div>
                <div class="field-label">Date Issued</div>
              </div>

              <div class="seal-badge">
                Verified<br/>Credential
              </div>

              <div class="field-box">
                <div class="field-val">${cert.verification_code}</div>
                <div class="field-label">Verification Code</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading Certificates...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Certificates</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Verified credentials for completed courses, assessments, and career paths</p>
      </div>

      {/* Public Verification Widget */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-xl)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck color="var(--accent-cyan)" /> Certificate Verification Portal
        </h3>
        <form onSubmit={handleVerify} style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
          <input
            type="text"
            className="input-glass"
            placeholder="Enter 10-character code (e.g. AB12CD34EF)"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Verify</button>
        </form>

        {verifyResult && (
          <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontWeight: 700, color: '#059669' }}>✓ Verified Authentic Certificate</div>
            <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Issued to <strong>{verifyResult.student_name}</strong> for "{verifyResult.title}"</div>
          </div>
        )}
      </div>

      {/* Certificates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
        {certificates.map((cert) => (
          <div key={cert.id} className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(217, 119, 6, 0.3)', background: 'linear-gradient(135deg, #ffffff 0%, #fffbebf5 100%)', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Award size={36} color="var(--accent-amber)" />
                <span className="badge badge-amber">{cert.verification_code}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>{cert.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: 1.5 }}>{cert.description}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '20px' }}>Issued on {new Date(cert.issued_at).toLocaleDateString()}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
              <button
                onClick={() => handleDownloadCertificate(cert)}
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', gap: '6px', fontSize: '0.85rem' }}
              >
                <Download size={16} /> Download Certificate
              </button>
              <button
                onClick={() => {
                  setVerifyCode(cert.verification_code)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="btn-secondary"
                style={{ padding: '10px 14px', gap: '4px', fontSize: '0.85rem' }}
              >
                <ShieldCheck size={16} /> Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
