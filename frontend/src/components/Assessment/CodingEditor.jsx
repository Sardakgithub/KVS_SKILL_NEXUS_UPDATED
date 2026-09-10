import React, { useState } from 'react'
import { Play, Code, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { api } from '../../api/client'

export const CodingEditor = ({
  initialCode = '',
  language = 'python',
  testCases = [],
  onChange,
  readOnly = false,
}) => {
  const [code, setCode] = useState(initialCode)
  const [selectedLang, setSelectedLang] = useState(language)
  const [isRunning, setIsRunning] = useState(false)
  const [evalResult, setEvalResult] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  const handleCodeChange = (e) => {
    const val = e.target.value
    setCode(val)
    if (onChange) onChange(val, selectedLang)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setEvalResult(null)
    try {
      const res = await api.post('/assessments/run-code/', {
        code,
        language: selectedLang,
        test_cases: testCases,
      })
      if (res.success) {
        setEvalResult(res.data)
      } else {
        alert(res.message || 'Execution error')
      }
    } catch (err) {
      alert(err.message || 'Failed to run code execution')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f1f5f9',
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #cbd5e1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code size={18} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>Live Code Playground</span>
          <select
            value={selectedLang}
            onChange={(e) => {
              setSelectedLang(e.target.value)
              if (onChange) onChange(code, e.target.value)
            }}
            disabled={readOnly}
            style={{
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.82rem',
            }}
          >
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="cpp">C++ 17</option>
            <option value="java">Java 17</option>
          </select>
        </div>

        {!readOnly && (
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
          >
            {isRunning ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
            {isRunning ? 'Executing...' : 'Run Test Cases'}
          </button>
        )}
      </div>

      {/* Code Textarea / Editor */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={code}
          onChange={handleCodeChange}
          readOnly={readOnly}
          rows={12}
          placeholder="// Write your solution here..."
          style={{
            width: '100%',
            fontFamily: 'Consolas, Monaco, "Fira Code", monospace',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #cbd5e1',
            resize: 'vertical',
            outline: 'none',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      {/* Execution Results Output Console */}
      {evalResult && (
        <div style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #cbd5e1',
          padding: '16px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-bright)' }}>
              Test Results: {evalResult.passed} / {evalResult.total} Passed
            </span>
            <span
              className={`badge ${evalResult.passed === evalResult.total ? 'badge-emerald' : 'badge-amber'}`}
              style={{ fontSize: '0.75rem' }}
            >
              {evalResult.passed === evalResult.total ? 'All Passed' : 'Partial Match'}
            </span>
          </div>

          {/* Test Case Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', pb: '8px', marginBottom: '12px' }}>
            {evalResult.results?.map((res, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  background: activeTab === idx ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  border: activeTab === idx ? '1px solid var(--accent-violet)' : '1px solid transparent',
                  color: activeTab === idx ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {res.passed ? (
                  <CheckCircle size={12} color="var(--accent-emerald)" />
                ) : (
                  <XCircle size={12} color="#f87171" />
                )}
                Test Case {idx + 1} {res.is_hidden && '(Hidden)'}
              </button>
            ))}
          </div>

          {/* Selected Test Case Detail */}
          {evalResult.results?.[activeTab] && (
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Input:</span>
                <pre style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px', margin: 0, color: '#a5d6ff' }}>
                  {evalResult.results[activeTab].input || '(No input)'}
                </pre>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Expected Output:</span>
                  <pre style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '4px', margin: 0, color: 'var(--accent-emerald)' }}>
                    {evalResult.results[activeTab].expected_output}
                  </pre>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Actual Output:</span>
                  <pre style={{
                    background: 'rgba(255,255,255,0.03)',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    margin: 0,
                    color: evalResult.results[activeTab].passed ? 'var(--accent-emerald)' : '#f87171'
                  }}>
                    {evalResult.results[activeTab].actual_output || '(Empty)'}
                  </pre>
                </div>
              </div>

              {evalResult.results[activeTab].error && (
                <div>
                  <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <AlertCircle size={14} /> Error Output:
                  </span>
                  <pre style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '4px', margin: 0, color: '#f87171' }}>
                    {evalResult.results[activeTab].error}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
