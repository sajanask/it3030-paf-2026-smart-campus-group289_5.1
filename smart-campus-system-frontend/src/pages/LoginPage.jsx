import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { loginUser } from '../api/authApi'
import { setToken } from '../utils/token'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const oauthNotice = new URLSearchParams(location.search).get('oauth')

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail')
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }))
      setRememberMe(true)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(formData)
      setToken(data.token)
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      navigate('/dashboard')
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Login failed. Please check your email and password.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    document.cookie = 'google_registration_type=; Max-Age=0; path=/; SameSite=Lax'
    window.location.href = '/oauth2/authorization/google'
  }

  // Demo credentials helper
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@smartcampus.edu',
      password: 'demo123'
    })
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage tickets, assignments, and campus operations."
    >
      {/* Success Notice */}
      {location.state?.notice && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100/50 px-5 py-4 text-emerald-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{location.state.notice}</span>
        </div>
      )}

      {oauthNotice === 'registered-pending' && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-4 text-amber-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Google registration submitted. Please wait for admin approval before signing in.</span>
        </div>
      )}

      {oauthNotice === 'pending' && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-4 text-amber-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Your Google account is registered and waiting for admin approval.</span>
        </div>
      )}

      {oauthNotice === 'rejected' && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">This Google account registration was rejected. Please contact an administrator.</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email Address
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@university.edu"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
              required
            />
            {formData.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          
          {/* Demo Credentials Helper (Hidden in production) */}
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs text-slate-400 hover:text-teal-600 transition-colors"
          >
            Demo credentials
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Logging in...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md group"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="font-semibold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1 group"
          >
            Create an account
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </p>
      </div>

      {/* Security Note */}
      <div className="mt-6 rounded-xl bg-slate-50 p-3 text-center">
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Your credentials are securely encrypted
        </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage
