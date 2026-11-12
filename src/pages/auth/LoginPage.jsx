import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, role } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, redirect immediately to assigned dashboard
  useEffect(() => {
    if (isAuthenticated && role) {
      const from = location.state?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else if (role === 'super_admin') {
        navigate('/admin', { replace: true })
      } else if (role === 'manager') {
        navigate('/manager', { replace: true })
      } else if (role === 'referee') {
        navigate('/referee', { replace: true })
      }
    }
  }, [isAuthenticated, role, navigate, location])

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.')
      setIsSubmitting(false)
      return
    }

    const result = await login(cleanEmail, password)
    setIsSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Invalid email or password.')
      return
    }

    // Role-based redirection
    if (result.role === 'super_admin') {
      navigate('/admin')
    } else if (result.role === 'manager') {
      navigate('/manager')
    } else if (result.role === 'referee') {
      navigate('/referee')
    } else {
      navigate('/admin')
    }
  }

  // Quick preset helper for development verification
  const selectPreset = (presetEmail) => {
    setEmail(presetEmail)
    setPassword('demopassword')
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-[#9AA69B] hover:text-[#B8F34A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Landing Page</span>
        </button>

        <Card className="p-6 sm:p-8 border-[#303030]">
          <CardHeader className="text-center pb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#202020] border border-[#303030] flex items-center justify-center text-[#B8F34A] mx-auto mb-3">
              <Shield className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Management Access</CardTitle>
            <CardDescription className="text-xs text-[#9AA69B]">
              Sign in to Super Admin, Manager, or Referee workspace
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. admin@supercup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444] space-y-1">
                  <div className="font-semibold">{error}</div>
                  {error.toLowerCase().includes('invalid') && (
                    <div className="text-[11px] text-[#9AA69B] leading-relaxed">
                      Make sure the user exists in your Supabase project. If you haven't created the demo accounts yet, run <code className="text-[#B8F34A]">create_auth_users.sql</code> in your Supabase Dashboard SQL Editor.
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-bold mt-2"
                size="md"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Testing Presets */}
            <div className="mt-8 pt-6 border-t border-[#202020] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#9AA69B] uppercase tracking-wider">
                  Development Role Presets
                </span>
                <span className="text-[10px] text-[#71717A]">
                  Password: <span className="text-[#B8F34A]">demopassword</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => selectPreset('admin@supercup.com')}
                  className="px-2 py-1.5 rounded-lg bg-[#202020] border border-[#303030] text-[11px] text-[#F4F7F2] hover:border-[#B8F34A] transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('manager1@supercup.com')}
                  className="px-2 py-1.5 rounded-lg bg-[#202020] border border-[#303030] text-[11px] text-[#F4F7F2] hover:border-[#B8F34A] transition-colors"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => selectPreset('referee@supercup.com')}
                  className="px-2 py-1.5 rounded-lg bg-[#202020] border border-[#303030] text-[11px] text-[#F4F7F2] hover:border-[#B8F34A] transition-colors"
                >
                  Referee
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
