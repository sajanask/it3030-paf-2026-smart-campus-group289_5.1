import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getCurrentUser } from '../api/authApi'
import {
  createResource,
  getResources,
  updateResource,
} from '../api/resourceApi'
import { removeToken } from '../utils/token'

const resourceTypes = ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT']
const resourceStatuses = ['ACTIVE', 'OUT_OF_SERVICE']
const days = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

function ResourcesPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [resources, setResources] = useState([])
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    location: '',
    minCapacity: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 30,
    location: '',
    description: '',
    status: 'ACTIVE',
    availability: [
      { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' },
    ],
  })

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
        await fetchResources()
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getResources({
        type: filters.type || undefined,
        status: filters.status || undefined,
        location: filters.location || undefined,
        minCapacity: filters.minCapacity || undefined,
      })
      setResources(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to load resources right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredSummary = useMemo(
    () => ({
      total: resources.length,
      active: resources.filter((r) => r.status === 'ACTIVE').length,
      out: resources.filter((r) => r.status === 'OUT_OF_SERVICE').length,
    }),
    [resources]
  )

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddAvailability = () => {
    setForm((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { dayOfWeek: 'TUESDAY', startTime: '08:00', endTime: '18:00' },
      ],
    }))
  }

  const handleAvailabilityChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.availability]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, availability: next }
    })
  }

  const handleRemoveAvailability = (index) => {
    setForm((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, idx) => idx !== index),
    }))
  }

  const handleCreateResource = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await createResource({
        ...form,
        capacity: Number(form.capacity),
        availability: form.availability.map((row) => ({
          dayOfWeek: row.dayOfWeek,
          startTime: row.startTime,
          endTime: row.endTime,
        })),
      })
      setNotice('✨ Resource added to catalogue successfully.')
      setForm({
        name: '',
        type: 'LECTURE_HALL',
        capacity: 30,
        location: '',
        description: '',
        status: 'ACTIVE',
        availability: [
          { dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '18:00' },
        ],
      })
      await fetchResources()
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to create the resource right now.'
      )
    }
  }

  const handleToggleStatus = async (resource) => {
    try {
      await updateResource(resource.id, {
        status: resource.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE',
      })
      await fetchResources()
      setNotice(`✓ Resource status updated to ${resource.status === 'ACTIVE' ? 'Out of Service' : 'Active'}`)
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.')
      setTimeout(() => setError(''), 3000)
    }
  }

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
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
          <div className="relative flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-lg backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Facilities Catalogue
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Manage Resources
              </h2>
              <p className="mt-2 text-slate-600">Browse, search, and book available facilities</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="group relative overflow-hidden rounded-full bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 shadow-sm transition-all hover:shadow-md">
                <div className="relative z-10 flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Total {filteredSummary.total}</span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 px-4 py-2 shadow-sm transition-all hover:shadow-md">
                <div className="relative z-10 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-semibold text-emerald-700">Active {filteredSummary.active}</span>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-full bg-gradient-to-r from-amber-100 to-amber-200 px-4 py-2 shadow-sm transition-all hover:shadow-md">
                <div className="relative z-10 flex items-center gap-2">
                  <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-700">Out {filteredSummary.out}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notice && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-4 text-emerald-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{notice}</span>
          </div>
        )}
        {error && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Filters Section */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900">Filter Resources</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Search by location
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="e.g., Engineering building"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Resource Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                >
                  <option value="">All Types</option>
                  {resourceTypes.map((t) => (
                    <option key={t} value={t}>
                      {t.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                >
                  <option value="">Any Status</option>
                  {resourceStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s === 'ACTIVE' ? '🟢 Active' : '🔴 Out of Service'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Min Capacity
                </label>
                <input
                  type="number"
                  name="minCapacity"
                  value={filters.minCapacity}
                  onChange={handleFilterChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                  min="1"
                  placeholder="Any"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={fetchResources}
                className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setFilters({ type: '', status: '', location: '', minCapacity: '' })
                  fetchResources()
                }}
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Admin Create Resource Section */}
        {user.role === 'ADMIN' && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v2H4V5zm0 4h12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
                    </svg>
                    Admin Control
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Add New Resource</h3>
                  <p className="text-sm text-slate-600">Create and manage facility resources</p>
                </div>
              </div>

              <form onSubmit={handleCreateResource} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Resource Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Main Lecture Hall"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Resource Type</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    >
                      {resourceTypes.map((t) => (
                        <option key={t} value={t}>
                          {t.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
                  <input
                    name="location"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Building and room number"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Optional description about the resource"
                    rows="3"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Availability Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Availability Windows</label>
                      <p className="text-xs text-slate-500">Define when this resource can be booked</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAvailability}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:shadow-md"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Window
                    </button>
                  </div>
                  <div className="space-y-3">
                    {form.availability.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100/50 p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                      >
                        <select
                          value={row.dayOfWeek}
                          onChange={(e) => handleAvailabilityChange(idx, 'dayOfWeek', e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        >
                          {days.map((day) => (
                            <option key={day} value={day}>
                              {day.charAt(0) + day.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </select>
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => handleAvailabilityChange(idx, 'startTime', e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        />
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => handleAvailabilityChange(idx, 'endTime', e.target.value)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAvailability(idx)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 hover:border-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    {resourceStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s === 'ACTIVE' ? '🟢 Active' : '🔴 Out of Service'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  >
                    + Create Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resources Grid */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900">Available Resources</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading &&
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="h-80 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100"></div>
                </div>
              ))}

            {!loading && resources.length === 0 && (
              <div className="col-span-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="mt-4 text-slate-500">No resources found</p>
                <p className="text-sm text-slate-400">Try adjusting your filters or add a new resource</p>
              </div>
            )}

            {!loading &&
              resources.map((res) => (
                <div
                  key={res.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                            {res.type.split('_').join(' ')}
                          </span>
                          <span className={`inline-flex h-2 w-2 rounded-full ${res.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          {res.name}
                        </h4>
                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {res.location}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          res.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {res.status === 'ACTIVE' ? 'Active' : 'Out of Service'}
                      </span>
                    </div>

                    <p className="mb-4 text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                      {res.description || 'No description provided.'}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {res.capacity} people
                      </div>
                      {res.availability.slice(0, 2).map((slot, idx) => (
                        <div key={idx} className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()} {slot.startTime}-{slot.endTime}
                        </div>
                      ))}
                      {res.availability.length > 2 && (
                        <div className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          +{res.availability.length - 2} more
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => navigate(`/bookings/create?resourceId=${res.id}`)}
                        disabled={res.status !== 'ACTIVE'}
                        className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                          res.status === 'ACTIVE'
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {res.status === 'ACTIVE' ? 'Book Now' : 'Unavailable'}
                      </button>
                      {user.role === 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(res)}
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                        >
                          {res.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default ResourcesPage