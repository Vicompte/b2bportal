import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔍 AuthProvider - Initialisation...')
    
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session initiale:', session?.user?.email || 'Non connecté')
      setSession(session)
      setLoading(false)
    })

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email || 'Non connecté')
      setSession(session)
      setLoading(false)
    })

    return () => {
      console.log('🧹 AuthProvider - Nettoyage subscription')
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    console.log('🚪 Déconnexion en cours...')
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  }

  console.log('🔍 AuthProvider render - User:', value.user?.email || 'Aucun', 'Loading:', loading)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}