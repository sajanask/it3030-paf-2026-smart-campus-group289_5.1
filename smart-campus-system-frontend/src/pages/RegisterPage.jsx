import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { registerUser } from '../api/authApi'
import { setToken } from '../utils/token'

function getRegisterErrorMessage(err) {
  const validationMessages = err?.response?.data?.messages

  if (validationMessages && typeof validationMessages === 'object') {
    return Object.values(validationMessages).join(' ')
  }

  return (
    err?.response?.data?.message ||
    'Registration failed. Please review your details and try again.'
  )
}

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registrationType: 'STUDENT',
    phoneNumber: '',
    department: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [touched, setTouched] = useState({})
  const oauthNotice = new URLSearchParams(location.search).get('oauth')

  // Password strength checker
  useEffect(() => {
    let strength = 0
    if (formData.password.length >= 8) strength++
    if (formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/)) strength++
    if (formData.password.match(/[0-9]/)) strength++
    if (formData.password.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }, [formData.password])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return 'bg-slate-200'
      case 1: return 'bg-red-500'
      case 2: return 'bg-orange-500'
      case 3: return 'bg-yellow-500'
      case 4: return 'bg-emerald-500'
      default: return 'bg-slate-200'
    }
  }

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return 'No password'
      case 1: return 'Weak'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Strong'
      default: return ''
    }
  }

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirm password do not match.')
      return false
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return false
    }

    if (formData.name.trim().length < 2) {
      setError('Please enter your full name.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        department: formData.department.trim(),
      }

      const data = await registerUser(payload)

      if (data.token) {
        setToken(data.token)
        navigate('/dashboard')
        return
      }

      navigate('/', {
        replace: true,
        state: {
          notice:
            data.approvalStatus === 'PENDING'
              ? 'Registration submitted. Your account is waiting for admin approval.'
              : 'Account created successfully. You can log in now.',
        },
      })
    } catch (err) {
      setError(getRegisterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    document.cookie = `google_registration_type=${formData.registrationType}; Max-Age=600; path=/; SameSite=Lax`
    window.location.href = '/oauth2/authorization/google'
  }

  const isPasswordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const isGoogleOnlyRegistration = formData.registrationType === 'TECHNICIAN'
  const isFormValid = !isGoogleOnlyRegistration && formData.name && formData.email && formData.password && isPasswordMatch && passwordStrength >= 2

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Set up your campus access profile for bookings, support, and notifications."
      sideTitle="Create a trusted smart campus identity."
      sideText="Register once, then move between local sign-in, Google access, protected dashboards, and role-based campus services."
    >
      {oauthNotice === 'registration-required' && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-4 text-amber-700 shadow-sm flex items-center gap-3">
          <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10A8 8 0 112 10a8 8 0 0116 0zm-8-4a1 1 0 00-1 1v3a1 1 0 002 0V7a1 1 0 00-1-1zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Choose an account type here, then use Continue with Google to register before signing in.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder="John Doe"
              className={`w-full rounded-xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:shadow-md ${
                touched.name && !formData.name
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-teal-400 focus:ring-teal-100'
              }`}
              required
            />
            {touched.name && formData.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Email */}
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
              onBlur={() => handleBlur('email')}
              placeholder="name@university.edu"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
              required
            />
          </div>
        </div>

        {/* Phone & Department */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
            />
          </div>
          <div>
            <label htmlFor="department" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Department
            </label>
            <input
              id="department"
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Computer Science"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:shadow-md"
            />
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="Min. 8 characters"
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
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`} style={{ width: `${(passwordStrength / 4) * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600">{getPasswordStrengthText()}</span>
                </div>
                <p className="text-xs text-slate-500">Password must contain uppercase, lowercase, number, and special character</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm password"
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-2 focus:shadow-md ${
                  touched.confirmPassword && !isPasswordMatch && formData.confirmPassword
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : touched.confirmPassword && isPasswordMatch
                    ? 'border-emerald-300 focus:border-emerald-400 focus:ring-emerald-100'
                    : 'border-slate-200 focus:border-teal-400 focus:ring-teal-100'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
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
            {touched.confirmPassword && formData.confirmPassword && (
              <div className="mt-1">
                {isPasswordMatch ? (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </p>
                ) : (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Account Type */}
        <div>
          <label htmlFor="registrationType" className="mb-2 block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Account Type
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, registrationType: 'STUDENT' }))}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition-all ${
                formData.registrationType === 'STUDENT'
                  ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              <span className="text-lg">🎓</span>
              <span className="font-semibold">Student</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, registrationType: 'LECTURER' }))}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition-all ${
                formData.registrationType === 'LECTURER'
                  ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              <span className="text-lg">👨‍🏫</span>
              <span className="font-semibold">Lecturer</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, registrationType: 'TECHNICIAN' }))}
              className={`flex items-center justify-center gap-2 rounded-xl border py-3 transition-all ${
                formData.registrationType === 'TECHNICIAN'
                  ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              <span className="text-lg">🔧</span>
              <span className="font-semibold">Technician</span>
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500 flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Student, lecturer, and technician accounts require admin approval
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="animate-in slide-in-from-top-2 rounded-2xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100/50 px-5 py-4 text-red-700 shadow-sm flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Creating account...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {isGoogleOnlyRegistration ? 'Use Google Registration' : 'Create Account'}
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-teal-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>

      {isGoogleOnlyRegistration && (
        <p className="mt-3 text-center text-sm font-medium text-amber-700">
          Technician accounts must be registered with Google before admin approval.
        </p>
      )}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-slate-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign Up Button */}
      <button
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3.5 font-semibold text-slate-700 transition-all hover:border-teal-300 hover:bg-teal-50 hover:shadow-md group"
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
        <span>Register with Google</span>
      </button>

      {/* Sign In Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1 group">
            Sign in
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default RegisterPage
