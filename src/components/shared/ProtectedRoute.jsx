import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

/**
 * Centralized Route Guard adhering to ARCHITECTURE.md §6.7 & REQUIREMENTS.md FR1.6
 */
export function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 1. Loading state during session restoration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 bg-[#141414] border border-[#262626] rounded-2xl px-8 py-6 shadow-xl">
          <div className="h-9 w-9 border-2 border-[#262626] border-t-[#FFC600] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[#9AA69B]">
            Verifying Session...
          </span>
        </div>
      </div>
    )
  }

  // 2. Unauthenticated check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Role authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const defaultPath =
      role === 'super_admin'
        ? '/admin'
        : role === 'manager'
        ? '/manager'
        : role === 'referee'
        ? '/referee'
        : '/public'

    return (
      <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-[#FF1E27]/15 border border-[#FF1E27]/40 flex items-center justify-center text-[#FF414D] mx-auto mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-[#F4F7F2]">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-[#9AA69B] leading-relaxed">
              Your account role (<span className="text-[#FFC600] font-bold">{role}</span>) does not have permission to access this management area.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate(defaultPath, { replace: true })}
            >
              Return to Your Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return children
}


