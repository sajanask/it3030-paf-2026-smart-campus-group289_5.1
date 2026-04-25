import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import { getResources } from '../api/resourceApi'
import { createBooking } from '../api/bookingApi'
import { removeToken } from '../utils/token'

function CreateBookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    resourceId: '',
    startDateTime: '',
    endDateTime: '',
    purpose: '',
    expectedAttendees: '',
  })
  const [selectedResource, setSelectedResource] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        const res = await getResources({ status: 'ACTIVE' })
        setResources(res)

        const preselected = searchParams.get('resourceId')
        if (preselected) {
          setForm((prev) => ({ ...prev, resourceId: preselected }))
          const found = res.find(r => r.id === preselected)
          setSelectedResource(found)
        }
      } catch {
        removeToken()
        navigate('/', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate, searchParams])

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    
    if (name === 'resourceId') {
      const found = resources.find(r => r.id === value)
      setSelectedResource(found)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (!form.resourceId) {
      setError('Please select a resource to book.')
      return
    }

    try {
      await createBooking({
        ...form,
        expectedAttendees: form.expectedAttendees
          ? Number(form.expectedAttendees)
          : null,
      })
      setNotice('🎉 Booking request submitted successfully! Awaiting approval.')
      setForm({
        resourceId: form.resourceId,
        startDateTime: '',
        endDateTime: '',
        purpose: '',
        expectedAttendees: '',
      })
      setTimeout(() => {
        navigate('/bookings/my')
      }, 2000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to submit the booking right now.'
      )
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
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
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  New Booking Request
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                  Reserve a Resource
                </h2>
                <p className="mt-2 text-slate-600">Book rooms, labs, and equipment for your activities</p>
              </div>
              <div className="hidden sm:block">
                <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
                  <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notice && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-4 text-emerald-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Success!</p>
              <p className="text-sm">{notice}</p>
            </div>
          </div>
        )}
        {error && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative rounded-2xl bg-white p-6 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Selection */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Select Resource
                </label>
                <select
                  name="resourceId"
                  value={form.resourceId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md cursor-pointer"
                  required
                >
                  <option value="">Choose a resource...</option>
                  {resources.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} • {res.location} • {res.type.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                {loading && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                    Loading resources...
                  </div>
                )}
              </div>

              {/* Selected Resource Info */}
              {selectedResource && (
                <div className="animate-in slide-in-from-top-2 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 p-4 border border-teal-100">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-teal-900">{selectedResource.name}</p>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-teal-700">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {selectedResource.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Capacity: {selectedResource.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Date & Time Selection */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startDateTime"
                    value={form.startDateTime}
                    onChange={handleChange}
                    min={getMinDateTime()}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endDateTime"
                    value={form.endDateTime}
                    onChange={handleChange}
                    min={form.startDateTime || getMinDateTime()}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Purpose of Booking
                </label>
                <textarea
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md resize-none"
                  placeholder="Describe the purpose of your booking (e.g., Team meeting, Lab session, Equipment testing...)"
                />
                <p className="mt-1 text-xs text-slate-400">Be specific about your requirements</p>
              </div>

              {/* Expected Attendees */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Expected Attendees
                  <span className="text-xs font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="number"
                  name="expectedAttendees"
                  min="1"
                  value={form.expectedAttendees}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                  placeholder="Number of people attending"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="submit"
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Booking Request
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/bookings/my')}
                  className="rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md hover:scale-105"
                >
                  View My Bookings
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips Section */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.5 5.5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Booking Tips</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                  Book in advance to secure your preferred time slots
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                  All bookings require admin approval before confirmation
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                  You can track your booking status in "My Bookings"
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                  Cancellations should be made at least 24 hours in advance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default CreateBookingPage