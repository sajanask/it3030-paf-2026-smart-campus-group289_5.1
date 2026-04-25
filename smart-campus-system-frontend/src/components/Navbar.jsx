import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notificationApi'

function Navbar({ user, onLogout, onProfileClick }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    refreshNotifications()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshNotifications, 30000)
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const refreshNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Unable to load notifications right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkRead = async (id) => {
    await markNotificationRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAll = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type) => {
    const icons = {
      BOOKING: '📅',
      TICKET: '🎫',
      RESOURCE: '📦',
      SYSTEM: '⚙️',
      APPROVAL: '✓',
      default: '📌'
    }
    return icons[type] || icons.default
  }

  const getNotificationColor = (type) => {
    const colors = {
      BOOKING: 'bg-blue-100 text-blue-700',
      TICKET: 'bg-amber-100 text-amber-700',
      RESOURCE: 'bg-emerald-100 text-emerald-700',
      SYSTEM: 'bg-purple-100 text-purple-700',
      APPROVAL: 'bg-teal-100 text-teal-700',
      default: 'bg-slate-100 text-slate-700'
    }
    return colors[type] || colors.default
  }

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="relative mb-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent"></div>
        
        <div className="relative px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Logo Section */}
            <Link to="/dashboard" className="group flex items-center gap-3 transition-transform hover:scale-105">
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 text-base font-bold uppercase text-white shadow-md">
                  {user?.name?.slice(0, 2) || 'SC'}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-600">
                  Smart Campus
                </p>
                <h1 className="text-lg font-bold text-slate-900">Operations Portal</h1>
              </div>
            </Link>

            {/* Actions Section */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Quick Actions Dropdown */}
              <div className="relative group">
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Dashboard Link */}
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </Link>

              {/* Profile Button */}
              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>

              {/* Notifications Button */}
              <button
                onClick={() => {
                  setOpen((p) => !p)
                  if (!open) {
                    refreshNotifications()
                  }
                }}
                className="relative rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Role Badge */}
              <div className="hidden lg:flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 border border-teal-200">
                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-teal-700">{user?.role || 'USER'}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {open && (
        <div 
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 z-50 w-full max-w-md animate-in slide-in-from-top-2 fade-in duration-200"
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-5 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Stay updated with your latest activities</p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAll}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-sm"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mt-3 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
              {loading && (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!loading && notifications.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700">No notifications</p>
                  <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
                </div>
              )}

              {notifications.map((note) => (
                <div
                  key={note.id}
                  className={`group relative px-5 py-4 transition-all hover:bg-slate-50 ${
                    !note.read ? 'bg-gradient-to-r from-teal-50/50 to-transparent' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${getNotificationColor(note.type)}`}>
                      <span className="text-lg">{getNotificationIcon(note.type)}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {note.title}
                          </p>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {note.message}
                          </p>
                        </div>
                        {!note.read && (
                          <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">
                          {formatTimeAgo(note.createdAt)}
                        </span>
                        {!note.read && (
                          <button
                            onClick={() => handleMarkRead(note.id)}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                <Link
                  to="/notifications"
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <span>View all notifications</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar