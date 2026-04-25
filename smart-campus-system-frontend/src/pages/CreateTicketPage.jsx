import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createTicket } from '../api/ticketApi'
import { getCurrentUser } from '../api/authApi'
import { removeToken } from '../utils/token'

const categories = [
  { value: 'ELECTRICAL', label: '⚡ Electrical', icon: '⚡', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'NETWORK', label: '🌐 Network', icon: '🌐', color: 'bg-blue-100 text-blue-700' },
  { value: 'FACILITY', label: '🏢 Facility', icon: '🏢', color: 'bg-green-100 text-green-700' },
  { value: 'SOFTWARE', label: '💻 Software', icon: '💻', color: 'bg-purple-100 text-purple-700' },
  { value: 'OTHER', label: '📝 Other', icon: '📝', color: 'bg-slate-100 text-slate-700' }
]

const priorities = [
  { value: 'LOW', label: 'Low', icon: '🔽', color: 'bg-emerald-100 text-emerald-700', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'MEDIUM', label: 'Medium', icon: '▶️', color: 'bg-amber-100 text-amber-700', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'HIGH', label: 'High', icon: '🔴', color: 'bg-red-100 text-red-700', tone: 'bg-red-50 text-red-700 border-red-200' }
]

function CreateTicketPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({
    resource: '',
    category: 'ELECTRICAL',
    description: '',
    priority: 'MEDIUM',
    preferredContact: '',
    attachments: [],
  })
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
      } catch {
        removeToken()
        navigate('/', { replace: true })
      }
    }
    load()
  }, [navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 3) {
      setError('You can upload up to 3 images only.')
      return
    }
    setError('')
    setForm((prev) => ({ ...prev, attachments: files }))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 3) {
      setError('You can upload up to 3 images only.')
      return
    }
    setError('')
    setForm((prev) => ({ ...prev, attachments: imageFiles }))
  }

  const removeAttachment = (index) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    if (form.attachments.length > 3) {
      setError('You can upload up to 3 images only.')
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append('resource', form.resource)
      data.append('category', form.category)
      data.append('description', form.description)
      data.append('priority', form.priority)
      data.append('preferredContact', form.preferredContact)
      form.attachments.forEach((file) => data.append('attachments', file))

      await createTicket(data)
      setNotice('✓ Ticket created successfully!')
      setForm({
        resource: '',
        category: 'ELECTRICAL',
        description: '',
        priority: 'MEDIUM',
        preferredContact: '',
        attachments: [],
      })
      setTimeout(() => {
        navigate('/tickets/my')
      }, 2000)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to create the ticket right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const onLogout = () => {
    removeToken()
    navigate('/', { replace: true })
  }

  const currentPriority = priorities.find(p => p.value === form.priority) || priorities[1]
  const currentCategory = categories.find(c => c.value === form.category) || categories[0]

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
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
                      <path d="M2 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 4v8h12V8H4z" />
                    </svg>
                    Support Ticket System
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Create Support Ticket
                  </h2>
                  <p className="mt-2 text-slate-600">Report an issue and get help from our support team</p>
                </div>
                <div className="flex gap-2">
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${currentPriority.tone}`}>
                    <span>{currentPriority.icon}</span>
                    <span>{currentPriority.label} Priority</span>
                  </div>
                  <button
                    onClick={() => navigate('/tickets/my')}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                  >
                    My Tickets
                  </button>
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

          {/* Form Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative rounded-2xl bg-white p-6 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resource/Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Resource / Location
                  </label>
                  <input
                    name="resource"
                    value={form.resource}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                    placeholder="e.g., Lab 2 - Projector, Library - 2nd floor router"
                  />
                  <p className="mt-1 text-xs text-slate-400">Specify the exact location or equipment</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 01.586 1.414V19a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      </svg>
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {priorities.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, priority: p.value }))}
                          className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                            form.priority === p.value
                              ? `${p.color} ring-2 ring-offset-2 ring-teal-500`
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{p.icon}</span>
                          <span>{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md resize-none"
                    placeholder="Briefly describe the issue and any steps already taken to resolve it..."
                  />
                  <p className="mt-1 text-xs text-slate-400">Be as detailed as possible to help us resolve faster</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Preferred Contact */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Preferred Contact
                    </label>
                    <input
                      name="preferredContact"
                      value={form.preferredContact}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                      placeholder="Email or phone number"
                    />
                    <p className="mt-1 text-xs text-slate-400">We'll use this to reach you with updates</p>
                  </div>

                  {/* Tips Box */}
                  <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 p-4 border border-slate-200">
                    <div className="flex items-start gap-2">
                      <svg className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Submission Tips</p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          <li className="flex items-center gap-1">✓ Provide clear, specific details</li>
                          <li className="flex items-center gap-1">✓ Upload photos if helpful</li>
                          <li className="flex items-center gap-1">✓ High priority for urgent issues</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Attach Images (max 3)
                  </label>
                  <div
                    className={`relative rounded-xl border-2 border-dashed transition-all ${
                      dragActive 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-slate-300 bg-slate-50 hover:border-teal-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-8 text-center">
                      <svg className="mx-auto h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-slate-600">
                        {dragActive ? 'Drop images here' : 'Drag & drop images here or click to browse'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        PNG, JPG, GIF up to 5MB each (max 3 images)
                      </p>
                    </div>
                  </div>
                  
                  {form.attachments.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Selected files:</p>
                      <div className="flex flex-wrap gap-2">
                        {form.attachments.map((file, index) => (
                          <div key={index} className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1.5 text-xs">
                            <span className="text-teal-600">📎</span>
                            <span className="text-teal-700">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Ticket
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl border-2 border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Help Section */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-5 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L9.172 14.828a4 4 0 01-5.656 0L3.05 14.35m11.314-5.656l-1.414 1.414m2.828-2.828l-1.414 1.414M17 3v4m-4-4v4m5-2h-6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Need Immediate Help?</h4>
                <p className="mt-1 text-sm text-slate-600">
                  For urgent issues requiring immediate attention, please mark your ticket as <strong className="text-red-600">HIGH priority</strong> 
                  and call our support hotline at <strong className="text-teal-600">+1 (555) 123-4567</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTicketPage