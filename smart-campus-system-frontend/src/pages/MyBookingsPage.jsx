import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import { cancelBooking, getMyBookings } from '../api/bookingApi'
import { removeToken } from '../utils/token'

const statusConfig = {
  PENDING: {
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: '⏳',
    label: 'Pending Approval',
    badgeClass: 'bg-amber-100 text-amber-700'
  },
  APPROVED: {
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '✓',
    label: 'Approved',
    badgeClass: 'bg-emerald-100 text-emerald-700'
  },
  REJECTED: {
    tone: 'bg-red-50 text-red-700 border-red-200',
    icon: '✗',
    label: 'Rejected',
    badgeClass: 'bg-red-100 text-red-700'
  },
  CANCELLED: {
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '○',
    label: 'Cancelled',
    badgeClass: 'bg-slate-100 text-slate-700'
  }
}

function MyBookingsPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        await fetchBookings()
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const fetchBookings = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMyBookings()
      setBookings(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load your bookings right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId)
    try {
      await cancelBooking(bookingId, { reason: 'Cancelled by user' })
      setNotice('✓ Booking cancelled successfully.')
      await fetchBookings()
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to cancel this booking right now.'
      )
      setTimeout(() => setError(''), 3000)
    } finally {
      setCancellingId(null)
    }
  }

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      approved: bookings.filter(b => b.status === 'APPROVED').length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      rejected: bookings.filter(b => b.status === 'REJECTED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length
    }
    return stats
  }

  const stats = getBookingStats()

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A'
    const date = new Date(dateTimeStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <AppShell
      user={user}
      onLogout={onLogout}
      onProfileClick={() => navigate('/dashboard')}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
          <div className="relative rounded-3xl bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  My Bookings Dashboard
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Your Reservations
                </h2>
                <p className="mt-2 text-slate-600">Track and manage all your booking requests</p>
              </div>
              <button
                onClick={() => navigate('/bookings/create')}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Booking
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {!loading && bookings.length > 0 && (
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{stats.approved}</p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending</p>
                    <p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p>
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
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rejected</p>
                    <p className="mt-2 text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <div className="rounded-xl bg-red-100 p-2 text-red-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-4 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cancelled</p>
                    <p className="mt-2 text-2xl font-bold text-slate-600">{stats.cancelled}</p>
                  </div>
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {notice && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-4 text-emerald-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{notice}</span>
          </div>
        )}
        {error && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="h-32 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative rounded-2xl bg-white p-12 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                  <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900">No bookings yet</h3>
                <p className="mt-2 text-slate-500">You haven't made any reservations</p>
                <button
                  onClick={() => navigate('/bookings/create')}
                  className="mt-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Create Your First Booking
                </button>
              </div>
            </div>
          )}

          {!loading &&
            bookings.map((booking) => {
              const statusInfo = statusConfig[booking.status] || statusConfig.PENDING
              const isCancellable = booking.status === 'APPROVED' || booking.status === 'PENDING'
              
              return (
                <div
                  key={booking.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Booking Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {booking.resourceName || 'Resource'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {booking.resourceLocation || 'Location'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(booking.startDateTime)}</span>
                          </div>
                          <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          <div className="flex items-center gap-2 text-slate-600">
                            <svg className="h-4 w-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDate(booking.endDateTime)}</span>
                          </div>
                        </div>

                        <div className="rounded-lg bg-slate-50 px-3 py-2">
                          <p className="text-sm text-slate-700">
                            <span className="font-semibold">Purpose:</span> {booking.purpose}
                          </p>
                          {booking.expectedAttendees && (
                            <p className="mt-1 text-xs text-slate-500">
                              👥 Expected attendees: {booking.expectedAttendees}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${statusInfo.tone}`}>
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </div>
                        
                        {isCancellable && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>

        {/* Info Section */}
        {!loading && bookings.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Booking Information</h4>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    Approved bookings are confirmed and ready for use
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Pending requests are awaiting admin review
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                    Cancelled or rejected bookings can be resubmitted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default MyBookingsPage