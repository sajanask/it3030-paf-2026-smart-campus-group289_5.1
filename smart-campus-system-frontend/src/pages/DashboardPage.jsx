import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import SectionCard from '../components/SectionCard'
import {
  createManagedUser,
  getAllUsers,
  getCurrentUser,
  submitAccessRequest,
  updateApprovalStatus,
  updateCurrentUserProfile,
  updateUserRole,
  updateUserStatus,
} from '../api/authApi'
import { removeToken } from '../utils/token'

function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [adminLoading, setAdminLoading] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [error, setError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminNotice, setAdminNotice] = useState('')
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [profileForm, setProfileForm] = useState({
    name: '',
    phoneNumber: '',
    department: '',
    requestedUserType: '',
  })
  const [managedUserForm, setManagedUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TECHNICIAN',
    phoneNumber: '',
    department: '',
  })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setProfileForm({
          name: currentUser.name || '',
          phoneNumber: currentUser.phoneNumber || '',
          department: currentUser.department || '',
          requestedUserType: currentUser.requestedUserType || '',
        })

        if (currentUser.role === 'ADMIN') {
          setAdminLoading(true)
          const allUsers = await getAllUsers()
          setUsers(allUsers)
        }
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          removeToken()
          navigate('/', { replace: true })
          return
        }

        setError(
          err?.response?.data?.message ||
            'Unable to load your dashboard right now.'
        )
      } finally {
        setLoading(false)
        setAdminLoading(false)
      }
    }

    load()
  }, [navigate])

  const isCommonUser = user?.role === 'USER' && !user?.userType
  const hasAcademicAccess = user?.role === 'USER' && Boolean(user?.userType)
  const hasPendingAcademicRequest = Boolean(user?.requestedUserType)

  const summaryCards = useMemo(
    () => [
      { label: 'Role', value: user?.role || 'USER' },
      { label: 'Approval', value: user?.approvalStatus || 'APPROVED' },
      {
        label: 'Access',
        value: user?.role !== 'USER' ? user?.role : user?.userType || 'COMMON',
      },
    ],
    [user]
  )

  const handleLogout = () => {
    removeToken()
    window.location.href = '/'
  }

  const refreshUsers = async () => {
    if (user?.role !== 'ADMIN') {
      return
    }

    setAdminLoading(true)
    try {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    } finally {
      setAdminLoading(false)
    }
  }

  const handleProfileFieldChange = (e) => {
    const { name, value } = e.target
    setProfileMessage({ type: '', text: '' })
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await updateCurrentUserProfile({
        name: profileForm.name,
        phoneNumber: profileForm.phoneNumber,
        department: profileForm.department,
        requestedUserType: profileForm.requestedUserType || null,
      })

      setUser(updatedUser)
      setProfileForm({
        name: updatedUser.name || '',
        phoneNumber: updatedUser.phoneNumber || '',
        department: updatedUser.department || '',
        requestedUserType: updatedUser.requestedUserType || '',
      })
      setProfileMessage({
        type: 'success',
        text:
          updatedUser.requestedUserType
            ? 'Profile saved. Your student or lecturer request is waiting for admin approval.'
            : 'Profile details updated successfully.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to update your profile right now.',
      })
    }
  }

  const handleQuickTypeRequest = async (requestedUserType) => {
    setProfileMessage({ type: '', text: '' })

    try {
      const updatedUser = await submitAccessRequest({ requestedUserType })
      setUser(updatedUser)
      setProfileForm((prev) => ({
        ...prev,
        requestedUserType: updatedUser.requestedUserType || '',
      }))
      setProfileMessage({
        type: 'success',
        text: 'Your request was sent to the admin for approval.',
      })
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          'Unable to submit your request right now.',
      })
    }
  }

  const handleManagedUserChange = (e) => {
    const { name, value } = e.target
    setManagedUserForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateManagedUser = async (e) => {
    e.preventDefault()
    setAdminError('')
    setAdminNotice('')

    try {
      await createManagedUser({
        ...managedUserForm,
        phoneNumber: managedUserForm.phoneNumber || null,
        department: managedUserForm.department || null,
      })
      await refreshUsers()
      setManagedUserForm({
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN',
        phoneNumber: '',
        department: '',
      })
      setAdminNotice('✨ Managed account created successfully.')
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to create the managed account.'
      )
    }
  }

  const handleApprovalUpdate = async (targetUserId, approvalStatus) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateApprovalStatus(targetUserId, { approvalStatus })
      await refreshUsers()
      setAdminNotice(`✓ User marked as ${approvalStatus.toLowerCase()}.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to update the approval status.'
      )
    }
  }

  const handleAcademicApproval = async (targetUserId, userType) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserRole(targetUserId, { role: 'USER', userType })
      await refreshUsers()
      setAdminNotice(`🎓 ${userType} access approved successfully.`)
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Unable to approve this academic access request.'
      )
    }
  }

  const handleStatusToggle = async (targetUserId, isActive) => {
    setAdminError('')
    setAdminNotice('')

    try {
      await updateUserStatus(targetUserId, { isActive: !isActive })
      await refreshUsers()
      setAdminNotice(
        isActive ? '🔒 User account deactivated.' : '🔓 User account activated.'
      )
    } catch (err) {
      setAdminError(
        err?.response?.data?.message || 'Unable to update the user status.'
      )
    }
  }

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      onProfileClick={() => setShowProfile((prev) => !prev)}
    >
      {/* Animated Error Display */}
      {error && (
        <div className="mb-6 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-sm text-red-700 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:gap-10 xl:gap-12">
        
        {/* Account Summary Section with Enhanced Cards */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
          <SectionCard
            title={loading ? "" : "Account Overview"}
            action={!loading && (
              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <span className="relative z-10">{showProfile ? 'Hide Profile' : 'Edit Profile'}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            )}
          >
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Email Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-teal-400/10 to-cyan-400/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email</p>
                    <p className="mt-2 text-sm font-medium text-slate-900 break-all">{user?.email}</p>
                  </div>
                </div>

                {/* Access Level Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Access Level</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {user?.role !== 'USER' ? user?.role : user?.userType || 'COMMON'}
                    </p>
                  </div>
                </div>

                {/* Role Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-orange-400/10 to-amber-400/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{user?.role}</p>
                  </div>
                </div>

                {/* Status Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="absolute top-0 right-0 h-20 w-20 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{user?.approvalStatus || 'APPROVED'}</p>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Profile Edit Section - Enhanced */}
        {showProfile && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-50"></div>
            <SectionCard title="Edit Profile Details">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-12 bg-slate-200 rounded-xl"></div>
                    <div className="h-12 bg-slate-200 rounded-xl"></div>
                    <div className="h-12 bg-slate-200 rounded-xl sm:col-span-2"></div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileFieldChange}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={profileForm.phoneNumber}
                        onChange={handleProfileFieldChange}
                        placeholder="Your phone number"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={profileForm.department}
                        onChange={handleProfileFieldChange}
                        placeholder="Your department"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                      />
                    </div>

                    {user?.role === 'USER' && (
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Request Academic Access
                        </label>
                        <select
                          name="requestedUserType"
                          value={profileForm.requestedUserType}
                          onChange={handleProfileFieldChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
                        >
                          <option value="">Keep current access</option>
                          <option value="STUDENT">🎓 Student</option>
                          <option value="LECTURER">👨‍🏫 Lecturer</option>
                        </select>
                        <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Any access request needs admin approval
                        </p>
                      </div>
                    )}

                    {profileMessage.text && (
                      <div className={`sm:col-span-2 rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
                        profileMessage.type === 'error'
                          ? 'border-l-4 border-red-500 bg-red-50 text-red-700'
                          : 'border-l-4 border-emerald-500 bg-emerald-50 text-emerald-700'
                      }`}>
                        <span>{profileMessage.type === 'error' ? '⚠️' : '✓'}</span>
                        <span>{profileMessage.text}</span>
                      </div>
                    )}

                    <div className="sm:col-span-2 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProfile(false)}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </SectionCard>
          </div>
        )}

        {/* Common User Access Section - Enhanced */}
        {isCommonUser && !showProfile && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-xl">
              <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
              ) : (
                <>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Common Access Level
                    </div>
                    <h3 className="mt-4 text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                      You're using basic access
                    </h3>
                    <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
                      Google users start here. To access academic features, request student or lecturer approval from the profile settings.
                    </p>

                    {hasPendingAcademicRequest && (
                      <div className="mt-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-5 py-4 text-amber-800 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200">
                          <span className="text-lg">⏳</span>
                        </div>
                        <div>
                          <p className="font-semibold">Request Pending Approval</p>
                          <p className="text-sm">Your {user?.requestedUserType} access request is being reviewed by an admin</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleQuickTypeRequest('STUDENT')}
                        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                      >
                        <span className="relative z-10">🎓 Request Student Access</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </button>
                      <button
                        onClick={() => handleQuickTypeRequest('LECTURER')}
                        className="group relative overflow-hidden rounded-full border-2 border-teal-200 bg-white px-6 py-3 text-sm font-semibold text-teal-700 transition-all hover:border-teal-400 hover:shadow-lg hover:scale-105"
                      >
                        <span className="relative z-10">👨‍🏫 Request Lecturer Access</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Admin Section - Enhanced */}
        {user?.role === 'ADMIN' && (
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-50"></div>
            <div className="relative rounded-3xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Admin Control Center</h3>
                  </div>
                  <p className="mt-2 text-slate-600">Manage users, approve access requests, and control system access</p>
                </div>
                {adminLoading && (
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-slate-600">Syncing...</span>
                  </div>
                )}
              </div>

              {adminError && (
                <div className="mb-6 rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{adminError}</span>
                </div>
              )}

              {adminNotice && (
                <div className="mb-6 rounded-xl border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-emerald-700 flex items-center gap-2 animate-in slide-in-from-top-2">
                  <span>✨</span>
                  <span>{adminNotice}</span>
                </div>
              )}

              {/* Create User Form */}
              <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
                <h4 className="mb-4 text-lg font-semibold text-slate-900">Create New Account</h4>
                <form onSubmit={handleCreateManagedUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    type="text"
                    name="name"
                    value={managedUserForm.name}
                    onChange={handleManagedUserChange}
                    placeholder="Full name"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={managedUserForm.email}
                    onChange={handleManagedUserChange}
                    placeholder="Email address"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <input
                    type="password"
                    name="password"
                    value={managedUserForm.password}
                    onChange={handleManagedUserChange}
                    placeholder="Temporary password"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <input
                    type="text"
                    name="department"
                    value={managedUserForm.department}
                    onChange={handleManagedUserChange}
                    placeholder="Department (optional)"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                  <select
                    name="role"
                    value={managedUserForm.role}
                    onChange={handleManagedUserChange}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    <option value="TECHNICIAN">🔧 Technician</option>
                    <option value="ADMIN">👑 Administrator</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  >
                    + Create Account
                  </button>
                </form>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-3 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span>User</span>
                    <span>Details</span>
                    <span>Role</span>
                    <span>Status</span>
                    <span>Request</span>
                    <span>Actions</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {users.map((entry) => (
                      <div
                        key={entry.id}
                        className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_1fr_1.2fr] gap-3 px-4 py-4 text-sm text-slate-600 transition-colors hover:bg-slate-50/80"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{entry.name || '—'}</p>
                          <p className="mt-1 text-xs text-slate-400">{entry.authProvider}</p>
                        </div>

                        <div>
                          <p className="text-xs">{entry.email}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {entry.role === 'USER' ? (entry.userType || 'Common') : 'Managed'}
                          </p>
                        </div>

                        <div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                            entry.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {entry.role}
                          </span>
                        </div>

                        <div>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                            entry.approvalStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {entry.approvalStatus}
                          </span>
                        </div>

                        <div className="text-xs">
                          {entry.requestedUserType ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
                              <span className="text-xs">📝</span>
                              {entry.requestedUserType}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {entry.requestedUserType && (
                            <button
                              onClick={() => handleAcademicApproval(entry.id, entry.requestedUserType)}
                              className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-md hover:scale-105"
                            >
                              Approve
                            </button>
                          )}

                          {entry.approvalStatus === 'PENDING'
                            && ((entry.role === 'USER' && entry.userType && !entry.requestedUserType) || entry.role === 'TECHNICIAN') && (
                            <button
                              onClick={() => handleApprovalUpdate(entry.id, 'APPROVED')}
                              className="rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 transition-all hover:border-teal-400 hover:shadow-md"
                            >
                              Approve
                            </button>
                          )}

                          <button
                            onClick={() => handleApprovalUpdate(entry.id, 'REJECTED')}
                            className="rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:border-red-400 hover:bg-red-50"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() => handleStatusToggle(entry.id, entry.isActive)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-md ${
                              entry.isActive 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {entry.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default DashboardPage
