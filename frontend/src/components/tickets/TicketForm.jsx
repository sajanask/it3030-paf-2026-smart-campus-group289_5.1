import React, { useState } from 'react'
import { createTicket } from '../../services/api'import './TicketForm.css';import './TicketForm.css'

const CATEGORIES = [
  { value: 'HARDWARE',    label: '🖥️  Hardware Issues' },
  { value: 'PLUMBING',    label: '🔧  Plumbing Issues' },
  { value: 'ELECTRICAL',  label: '⚡  Electrical Issues' },
  { value: 'CLEANING',    label: '🧹  Cleaning & Maintenance' },
  { value: 'SECURITY',    label: '🔒  Security Issues' },
  { value: 'INTERNET',    label: '🌐  Internet / Network' },
  { value: 'FURNITURE',   label: '🪑  Furniture & Fixtures' },
  { value: 'OTHER',       label: '📦  Other' },
]

const PRIORITIES = [
  { value: 'LOW',      label: '🟢  Low',      desc: 'Minor inconvenience, no urgency' },
  { value: 'MEDIUM',   label: '🟡  Medium',   desc: 'Moderate impact, fix soon' },
  { value: 'HIGH',     label: '🟠  High',     desc: 'Significant impact, fix urgently' },
  { value: 'CRITICAL', label: '🔴  Critical', desc: 'Severe / safety issue, fix immediately' },
]

const TicketForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'HARDWARE',
    priority: 'MEDIUM', reportedBy: '', images: [],
  })
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [dragOver, setDragOver]   = useState(false)

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const handleFiles = (fileList) => {
    const allowed = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 3)
    set('images', allowed)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')
    try {
      const fd = new FormData()
      fd.append('title',       form.title)
      fd.append('description', form.description)
      fd.append('category',    form.category)
      fd.append('priority',    form.priority)
      fd.append('reportedBy',  form.reportedBy)
      form.images.forEach(img => fd.append('images', img))

      const result = await createTicket(fd)
      setSuccess(`✓ Ticket #${result.id} submitted successfully! Our team will review it shortly.`)
      setForm({ title:'', description:'', category:'HARDWARE', priority:'MEDIUM', reportedBy:'', images:[] })
      document.getElementById('imgInput').value = ''
      setTimeout(() => onSuccess?.(), 1800)
    } catch (err) {
      setError(err.message || 'Failed to submit ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tf-container">
      <div className="tf-card">
        <div className="tf-header">
          <div>
            <h2>📋 Report an Incident</h2>
            <p className="tf-subtitle">Provide details so our maintenance team can act quickly.</p>
          </div>
          {onCancel && (
            <button className="btn btn-ghost btn-sm" onClick={onCancel}>← Back</button>
          )}
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error   && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="tf-body">
          <div className="tf-field">
            <label>Issue Title <span className="req">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Broken projector in Lab 3B"
              required maxLength={100}
            />
            <span className="char-hint">{form.title.length}/100</span>
          </div>

          <div className="tf-field">
            <label>Your Name / Student ID <span className="req">*</span></label>
            <input
              type="text"
              value={form.reportedBy}
              onChange={e => set('reportedBy', e.target.value)}
              placeholder="e.g. John Doe or IT21100000"
              required
            />
          </div>

          <div className="tf-field">
            <label>Detailed Description <span className="req">*</span></label>
            <textarea
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the issue clearly…"
              required maxLength={1000} rows={5}
            />
            <span className="char-hint">{form.description.length}/1000</span>
          </div>

          <div className="tf-row">
            <div className="tf-field">
              <label>Category <span className="req">*</span></label>
              <select value={form.category} onChange={e => set('category', e.target.value)} required>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="tf-field">
              <label>Priority <span className="req">*</span></label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} required>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              <span className="field-hint">
                {PRIORITIES.find(p => p.value === form.priority)?.desc}
              </span>
            </div>
          </div>

          <div className="tf-field">
            <label>Photo Evidence <span className="optional">(optional, max 3 images, 5 MB each)</span></label>
            <div
              className={`drop-zone ${dragOver ? 'drag-active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => document.getElementById('imgInput').click()}
            >
              <input
                id="imgInput" type="file"
                accept="image/*" multiple
                style={{ display: 'none' }}
                onChange={e => handleFiles(e.target.files)}
              />
              {form.images.length === 0 ? (
                <div className="drop-hint">
                  <span className="drop-icon">📷</span>
                  <p>Click or drag & drop images here</p>
                  <small>JPG, PNG, GIF, WEBP • Max 5 MB each</small>
                </div>
              ) : (
                <div className="img-preview-list">
                  {form.images.map((f, i) => (
                    <div key={i} className="img-preview-item">
                      <img src={URL.createObjectURL(f)} alt={f.name} />
                      <span>{f.name}</span>
                      <button
                        type="button"
                        className="remove-img"
                        onClick={ev => {
                          ev.stopPropagation()
                          set('images', form.images.filter((_, j) => j !== i))
                        }}
                      >✕</button>
                    </div>
                  ))}
                  {form.images.length < 3 && (
                    <div className="add-more">＋ Add more</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="tf-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Submitting…' : '✓ Submit Ticket'}
            </button>
            {onCancel && (
              <button type="button" className="btn btn-ghost btn-lg" onClick={onCancel}>Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketForm
