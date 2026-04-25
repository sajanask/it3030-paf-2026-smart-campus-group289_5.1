import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getMyTickets } from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

const statusConfig = {
  OPEN: {
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: '🟢',
    label: 'Open',
    badgeClass: 'bg-blue-100 text-blue-700'
  },
  IN_PROGRESS: {
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '⚙️',
    label: 'In Progress',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  RESOLVED: {
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '✓',
    label: 'Resolved',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  CLOSED: {
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '🔒',
    label: 'Closed',
    badgeClass: 'bg-slate-100 text-slate-700'
  },
  REJECTED: {
    tone: 'bg-red-50 text-red-700 border-red-200',
    icon: '✗',
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700'
  }
}

const priorityConfig = {
  LOW: {
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '🔽',
    label: 'Low',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  MEDIUM: {
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '▶️',
    label: 'Medium',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  HIGH: {
    tone: 'bg-red-50 text-red-700 border-red-200',
    icon: '🔴',
    label: 'High',
    badgeClass: 'bg-red-100 text-red-700'
  }
}

function MyTicketsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const current = await getCurrentUser()
        setUser(current)
        const data = await getMyTickets()
        setTickets(data)
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }
        setError(
          err?.response?.data?.message || 'Unable to load your tickets now.'
        )
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      highPriority: tickets.filter(t => t.priority === 'HIGH').length
    }
    return stats
  }

  const stats = getTicketStats()

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Navbar
          user={user}
          onLogout={onLogout}
          onProfileClick={() => navigate('/dashboard')}
        />

        <div className="mt-8 space-y-8">
          {/* Header Section */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12zm0 3a1 1 0 00-1 1v3a1 1 0 102 0V8a1 1 0 00-1-1z" />
                    </svg>
                    Support Tickets
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    My Incident Tickets
                  </h2>
                  <p className="mt-2 text-slate-600">Track and manage your support requests</p>
                </div>
                <button
                  onClick={() => navigate('/tickets/create')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Ticket
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {!loading && tickets.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total</p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="rounded-xl bg-teal-100 p-2 text-teal-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Open</p>
                      <p className="mt-2 text-2xl font-bold text-blue-600">{stats.open}</p>
                    </div>
                    <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</p>
                      <p className="mt-2 text-2xl font-bold text-amber-600">{stats.inProgress}</p>
                    </div>
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved</p>
                      <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.resolved}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">High Priority</p>
                      <p className="mt-2 text-2xl font-bold text-red-600">{stats.highPriority}</p>
                    </div>
                    <div className="rounded-xl bg-red-100 p-2 text-red-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Tickets List */}
          <div className="space-y-4">
            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="animate-pulse">
                    <div className="h-40 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100"></div>
                  </div>
                ))}
              </div>
            )}

            {!loading && tickets.length === 0 && (
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative rounded-2xl bg-white p-12 text-center shadow-xl">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                    <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">No tickets yet</h3>
                  <p className="mt-2 text-slate-500">You haven't created any support tickets</p>
                  <button
                    onClick={() => navigate('/tickets/create')}
                    className="mt-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  >
                    Create Your First Ticket
                  </button>
                </div>
              </div>
            )}

            {!loading && tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status] || statusConfig.OPEN
              const priorityInfo = priorityConfig[ticket.priority] || priorityConfig.MEDIUM
              
              return (
                <div
                  key={ticket.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* Ticket Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.tone}`}>
                            <span>{statusInfo.icon}</span>
                            <span>{statusInfo.label}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${priorityInfo.tone}`}>
                            <span>{priorityInfo.icon}</span>
                            <span>{priorityInfo.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                            </svg>
                            {ticket.category}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                            {ticket.resource}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Created {formatDate(ticket.createdAt)}</span>
                          </div>
                          {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
                            <div className="flex items-center gap-1.5">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span>Updated {formatDate(ticket.updatedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-start">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/tickets/${ticket.id}`)
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                        >
                          <span>View Details</span>
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Info Section */}
          {!loading && tickets.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Ticket Lifecycle Information</h4>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                      <strong>Open:</strong> Ticket submitted and awaiting initial review
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      <strong>In Progress:</strong> Support team is actively working on your issue
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <strong>Resolved:</strong> Solution has been provided, waiting for confirmation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
                      <strong>Closed:</strong> Issue fully resolved and ticket is complete
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyTicketsPage