import React, { useState } from 'react';
import { createTicket } from '../../services/api';
import './TicketForm.css';

const CATEGORIES = [
  { value: 'HARDWARE',    label: '🖥️  Hardware Issues' },
  { value: 'PLUMBING',    label: '🔧  Plumbing Issues' },
  { value: 'ELECTRICAL',  label: '⚡  Electrical Issues' },
  { value: 'CLEANING',    label: '🧹  Cleaning & Maintenance' },
  { value: 'SECURITY',    label: '🔒  Security Issues' },
  { value: 'INTERNET',    label: '🌐  Internet / Network' },
  { value: 'FURNITURE',   label: '🪑  Furniture & Fixtures' },
  { value: 'OTHER',       label: '📦  Other' },
];

const PRIORITIES = [
  { value: 'LOW',      label: '🟢  Low',      desc: 'Minor inconvenience, no urgency' },
  { value: 'MEDIUM',   label: '🟡  Medium',   desc: 'Moderate impact, fix soon' },
  { value: 'HIGH',     label: '🟠  High',     desc: 'Significant impact, fix urgently' },
  { value: 'CRITICAL', label: '🔴  Critical', desc: 'Severe / safety issue, fix immediately' },
];

const TicketForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'HARDWARE',
    priority: 'MEDIUM', reportedBy: '', images: [],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleFiles = (fileList) => {
    const allowed = Array.from(fileList)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, 3); // Enforces max 3 images [cite: 871]
    set('images', allowed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('priority', form.priority);
      fd.append('reportedBy', form.reportedBy);
      form.images.forEach(img => fd.append('images', img));

      const result = await createTicket(fd);
      setSuccess(`✓ Ticket #${result.id} submitted successfully!`);
      setForm({ title:'', description:'', category:'HARDWARE', priority:'MEDIUM', reportedBy:'', images:[] });
      document.getElementById('imgInput').value = '';
      setTimeout(() => onSuccess?.(), 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tf-container">
      <div className="tf-card">
        <div className="tf-header">
          <h2>📋 Report an Incident</h2>
          <p className="tf-subtitle">Provide details for the maintenance team.</p>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="tf-body">
          <div className="form-group">
            <label className="form-label required">Issue Title</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. Broken projector in Lab 3B"
              required
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label required">Category</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label required">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)} required>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Photo Evidence (Max 3)</label>
            <div 
              className={`dropzone ${dragOver ? 'drag-active' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById('imgInput').click()}
            >
              <input id="imgInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
              <p>Click or drag images here</p>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Submitting...' : '✓ Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;