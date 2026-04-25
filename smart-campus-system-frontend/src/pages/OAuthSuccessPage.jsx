import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { setToken } from '../utils/token'

function OAuthSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('authenticating')

  const params = useMemo(() => new URLSearchParams(location.search), [location.search])
  const token = params.get('token')
  const profileCompleted = params.get('profileCompleted')

  useEffect(() => {
    // Animated progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 120)

    if (token) {
      setStatus('storing')
      setTimeout(() => setStatus('redirecting'), 400)
      setToken(token)
      const destination = profileCompleted === 'true' ? '/dashboard' : '/dashboard?setup=pending'
      const timeout = setTimeout(() => navigate(destination, { replace: true }), 1200)
      return () => {
        clearTimeout(timeout)
        clearInterval(progressInterval)
      }
    }

    setStatus('error')
    const timeout = setTimeout(() => navigate('/', { replace: true }), 2000)
    return () => {
      clearTimeout(timeout)
      clearInterval(progressInterval)
    }
  }, [navigate, profileCompleted, token])

  const getStatusIcon = () => {
    switch(status) {
      case 'authenticating':
        return (
          <div className="relative">
            <div className="w-16 h-16 border-4 border-teal-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-teal-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
        )
      case 'storing':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
          </div>
        )
      case 'redirecting':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
          </div>
        )
      case 'error':
        return (
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch(status) {
      case 'authenticating':
        return 'Authenticating with Google'
      case 'storing':
        return 'Storing your credentials'
      case 'redirecting':
        return 'Redirecting to dashboard'
      case 'error':
        return 'Authentication failed'
      default:
        return 'Processing'
    }
  }

  const getStatusMessage = () => {
    if (token) {
      if (profileCompleted === 'true') {
        return "Your profile is complete and ready to use. You'll be redirected to your dashboard momentarily."
      }
      return "Your account is set up successfully. Please complete your profile after logging in to access all features."
    }
    return "We couldn't find a valid authentication token. This might be due to an expired link or session. Please try logging in again."
  }

  return (
    <AuthLayout
      title="Completing Sign-In"
      subtitle="We are securing your Google session and preparing your campus workspace."
      sideTitle="Google access connected successfully."
      sideText="Your account is being synchronized with campus identity services so you can continue into the dashboard."
    >
      <div className="space-y-6">
        {/* Main Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-8 shadow-xl border border-slate-200">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-transparent"></div>
          
          <div className="relative">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>

            {/* Status Text */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {getStatusText()}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {getStatusMessage()}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Authentication</span>
                <span>Profile Sync</span>
                <span>Redirect</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="h-full w-full bg-gradient-to-r from-teal-500 to-cyan-500 animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-center text-slate-400 mt-2">
                {progress}% complete
              </p>
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Security Info */}
          <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 p-4 border border-teal-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Secure Connection</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Your data is encrypted and transmitted securely using industry-standard protocols.
                </p>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L9.172 14.828a4 4 0 01-5.656 0L3.05 14.35m11.314-5.656l-1.414 1.414m2.828-2.828l-1.414 1.414M17 3v4m-4-4v4m5-2h-6" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Need Help?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Contact our support team at{' '}
                  <a href="mailto:support@smartcampus.com" className="text-teal-600 hover:text-teal-700">
                    support@smartcampus.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading tips */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Did you know?</p>
              <p className="text-xs text-slate-500 mt-1">
                Smart Campus integrates with Google Workspace for seamless authentication and calendar synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Redirect notice */}
        {!token && (
          <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-800">
                Redirecting you back to login page in a moment...
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default OAuthSuccessPage