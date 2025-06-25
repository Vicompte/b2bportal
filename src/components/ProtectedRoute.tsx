import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../providers/AuthProvider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  adminOnly = false, 
  redirectTo = '/client/login' 
}: ProtectedRouteProps) {
  const { session, loading } = useAuth()

  console.log('🔍 ProtectedRoute - Session:', session?.user?.email || 'Aucune', 'Loading:', loading, 'AdminOnly:', adminOnly)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    console.log('Pas de session, redirection vers', redirectTo)
    return <Navigate to={redirectTo} replace />
  }

  if (adminOnly) {
    const isAdmin = session.user.email === 'contact@infinityagency.be'
    if (!isAdmin) {
      console.log('Accès admin refusé pour:', session.user.email)
      return <Navigate to="/client" replace />
    }
    console.log('✅ Accès admin autorisé pour:', session.user.email)
  } else {
    console.log('✅ Accès client autorisé pour:', session.user.email)
  }

  return <>{children}</>
}