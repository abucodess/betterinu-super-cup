import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ShieldAlert } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

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
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-[#303030] border-t-[#B8F34A] rounded-full animate-spin" />
          <span className="text-xs uppercase tracking-wider text-[#9AA69B] font-semibold">
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
    // Determine proper destination based on current role
    const defaultPath =
      role === 'super_admin'
        ? '/admin'
        : role === 'manager'
        ? '/manager'
        : role === 'referee'
        ? '/referee'
        : '/'

    return (
      <div className="min-h-screen bg-[#090909] text-[#F4F7F2] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center border-[#303030]">
          <CardHeader>
            <div className="h-12 w-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mx-auto mb-3">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <CardTitle className="text-lg font-bold text-[#F4F7F2]">
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-[#9AA69B]">
              Your account role (<span className="text-[#B8F34A] font-semibold">{role}</span>) does not have permission to access this management area.
            </p>
            <Button
              className="w-full font-bold"
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

