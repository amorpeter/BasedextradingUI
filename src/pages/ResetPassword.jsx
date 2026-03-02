import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../utils/axios'
import { API_URL } from '../utils/apiUrl.js'
import { useSiteSettings } from '../context/SiteSettingsContext'
import ThemeToggle from '../components/ThemeToggle'
import PasswordInput from '../components/PasswordInput'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const { settings: siteSettings } = useSiteSettings()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email')
  const email = emailParam ? decodeURIComponent(emailParam) : ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [fieldTouched, setFieldTouched] = useState({ new: false, confirm: false })

  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required'
    if (pwd.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const validateConfirm = (confirm) => {
    if (!confirm) return 'Please confirm your password'
    if (confirm !== newPassword) return 'Passwords do not match'
    return ''
  }

  useEffect(() => {
    if (fieldTouched.confirm && confirmPassword) {
      setConfirmError(validateConfirm(confirmPassword))
    }
  }, [newPassword, confirmPassword, fieldTouched.confirm])

  const handleNewPasswordBlur = () => {
    setFieldTouched((p) => ({ ...p, new: true }))
    setPasswordError(validatePassword(newPassword))
  }

  const handleConfirmBlur = () => {
    setFieldTouched((p) => ({ ...p, confirm: true }))
    setConfirmError(validateConfirm(confirmPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldTouched({ new: true, confirm: true })

    const pwdErr = validatePassword(newPassword)
    const confErr = validateConfirm(confirmPassword)
    setPasswordError(pwdErr)
    setConfirmError(confErr)
    if (pwdErr || confErr) return

    setLoading(true)
    try {
      const response = await api.post('/api/auth/reset-password', {
        token,
        email: email.toLowerCase(),
        newPassword
      }, { timeout: 10000 })

      if (response.data.success) {
        setSuccess(true)
        toast.success('Password reset successfully. You can sign in now.')
        setTimeout(() => navigate('/signin', { state: { email } }), 1500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  const invalidLink = !token || !email

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            {siteSettings.site.logo ? (
              <img
                src={siteSettings.site.logo?.startsWith('http') ? siteSettings.site.logo : `${API_URL}${siteSettings.site.logo}`}
                alt={siteSettings.site.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-contain"
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {siteSettings.site.name?.charAt(0)?.toUpperCase() || 'X'}
                </span>
              </div>
            )}
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {siteSettings.site.name || 'XCrypto'}
            </span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Reset Password
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
            {invalidLink
              ? 'This link is invalid or incomplete.'
              : success
                ? 'Your password has been reset. Redirecting to sign in...'
                : 'Enter your new password below.'}
          </p>

          {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {invalidLink ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please request a new password reset link from the sign-in page.
              </p>
              <Link
                to="/forgot-password"
                className="block w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition text-sm sm:text-base"
              >
                Request new link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <Link
                to="/signin"
                className="inline-block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition text-center text-sm sm:text-base"
              >
                Go to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="newPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  New password
                </label>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError('')
                    if (fieldTouched.new) setPasswordError(validatePassword(e.target.value))
                  }}
                  onBlur={handleNewPasswordBlur}
                  placeholder="At least 8 characters"
                  required
                  error={!!passwordError}
                />
                {passwordError && fieldTouched.new && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordError}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                  Confirm password
                </label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError('')
                    if (fieldTouched.confirm) setConfirmError(validateConfirm(e.target.value))
                  }}
                  onBlur={handleConfirmBlur}
                  placeholder="Confirm new password"
                  required
                  error={!!confirmError}
                />
                {confirmError && fieldTouched.confirm && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{confirmError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !!passwordError || !!confirmError}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>
          )}

          <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/signin" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
