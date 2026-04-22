import React, { useState, useEffect, useCallback } from 'react'
import { fetchTickets, fetchStats, deleteTicket } from '../../services/api'import './TicketList.css';import './TicketList.css'

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }

function statusBadgeClass(s) {
  return `badge badge-${s?.toLowerCase().replace('_', '')}`
}

function priorityBadgeClass(p) {
  return `badge badge-${p?.toLowerCase()}`
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const TicketList = ({ onViewTicket, onCreateNew }) => {
  const [tickets, setTickets]       = useState([])
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatus]   = useState('')
  const [search, setSearch]         = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy]         = useState('latest')
  const [error, setError]           = useState('')
  const [deleting, setDeleting]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [t, s] = await Promise.all([
        fetchTickets({ status: statusFilter || undefined, search: search || undefined }),
        fetchStats(),
      ])
      setTickets(t)
      setStats(s)
    } catch (e) {
      setError('Could not load tickets. Is the Spring Boot server running on port 8080?')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => { load() }, [load])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const sorted = [...tickets].sort((a, b) => {
    if (sortBy === 'latest')   return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest')   return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'priority') return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    return 0
  })

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete ticket #${id}? This cannot be undone.`)) return
    setDeleting(id)
    try { await deleteTicket(id); await load() }
    catch (err) { alert('Delete failed: ' + err.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className="tl-page">

      {/* ── Header ── */}
      <div className="tl-header">
        <div className="tl-header-inner">
          <div>
            <h1>🎟️ Incident Tickets</h1>
            <p>Track, manage and resolve campus maintenance issues</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onCreateNew}>
            ＋ Report Issue
          </button>
        </div>
      </div>

      <div className="tl-body">

        {/* ── Stats bar ── */}
        {stats && (
          <div className="stats-bar">
            <StatCard label="Total"       value={stats.total}      color="primary" />
            <StatCard label="Open"        value={stats.open}       color="warning" />
            <StatCard label="In Progress" value={stats.inProgress} color="info"    />
            <StatCard label="Resolved"    value={stats.resolved}   color="success" />
            <StatCard label="Critical"    value={stats.critical}   color="danger"  />
          </div>
        )}

        {/* ── Controls ── */}
        <div className="tl-controls">
          <div className="tl-search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="tl-search"
              type="text"
              placeholder="Search by title, description, or ID…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="search-clear" onClick={() => { setSearchInput(''); setSearch('') }}>✕</button>
            )}
          </div>
          <select
            className="tl-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Highest priority</option>
          </select>
          <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh">↻ Refresh</button>
        </div>

        {/* ── Status filter tabs ── */}
        <div className="tl-filters">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={`filter-chip ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 24 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Ticket grid ── */}
        {loading ? (
          <div className="tl-loading">
            <div className="spinner" />
            <p>Loading tickets…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="tl-empty">
            <span>📭</span>
            <h3>No tickets found</h3>
            <p>{search || statusFilter ? 'Try adjusting your filters.' : 'No tickets yet — be the first to report an issue!'}</p>
            <button className="btn btn-primary" onClick={onCreateNew}>Report an Issue</button>
          </div>
        ) : (
          <div className="tl-grid">
            {sorted.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onView={() => onViewTicket(ticket.id)}
                onDelete={handleDelete}
                deleting={deleting === ticket.id}
              />
            ))}
          </div>
        )}

        <p className="tl-count">
          Showing {sorted.length} of {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <span className="stat-value">{value ?? '—'}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* ── Ticket Card ── */
function TicketCard({ ticket, onView, onDelete, deleting }) {
  return (
    <div className="ticket-card" onClick={onView} role="button" tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && onView()}>

      <div className="tc-top">
        <div className="tc-id-row">
          <span className="tc-id">#{ticket.id}</span>
          <span className={priorityBadgeClass(ticket.priority)}>{ticket.priority}</span>
        </div>
        <button
          className="tc-delete"
          title="Delete ticket"
          onClick={e => onDelete(ticket.id, e)}
          disabled={deleting}
        >{deleting ? '…' : '🗑'}</button>
      </div>

      <h3 className="tc-title">{ticket.title}</h3>
      <p  className="tc-desc">{ticket.description}</p>

      <div className="tc-meta">
        <span className={statusBadgeClass(ticket.status)}>
          {ticket.status?.replace('_', ' ')}
        </span>
        <span className="tc-cat">{ticket.category}</span>
      </div>

      <div className="tc-footer">
        <div className="tc-info">
          <span>👤 {ticket.reportedBy}</span>
          {ticket.assignedTo && <span>🔧 {ticket.assignedTo}</span>}
        </div>
        <span className="tc-date">{formatDate(ticket.createdAt)}</span>
      </div>

      {ticket.assignedTo && (
        <div className="tc-assigned">
          <span>Assigned to:</span>
          <strong>{ticket.assignedTo}</strong>
        </div>
      )}

      {ticket.resolutionNotes && (
        <div className="tc-resolution">
          <strong>Resolution:</strong> {ticket.resolutionNotes}
        </div>
      )}

      <div className="tc-actions">
        <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); onView() }}>
          View Details →
        </button>
      </div>
    </div>
  )
}

export default TicketList
