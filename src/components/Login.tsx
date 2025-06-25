import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../providers/AuthProvider'
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react'

interface LoginProps {
  type: 'client' | 'admin'
}

export default function Login({ type }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { session, loading: authLoading } = useAuth()

  console.log(`🔍 Login ${type} - Session:`, session?.user?.email || 'Aucune', 'AuthLoading:', authLoading)

  // IMPORTANT: Redirection si déjà connecté
  useEffect(() => {
    if (!authLoading && session) {
      console.log(`👤 Utilisateur déjà connecté: ${session.user.email}`)
      
      if (type === 'admin') {
        // Vérifier si c'est bien un admin
        const isAdmin = session.user.email === 'contact@infinityagency.be'
        if (isAdmin) {
          console.log('🔄 Redirection admin vers /admin')
          navigate('/admin', { replace: true })
        } else {
          console.log('🔄 Non-admin redirigé vers /client')
          navigate('/client', { replace: true })
        }
      } else {
        console.log('🔄 Redirection client vers /client')
        navigate('/client', { replace: true })
      }
    }
  }, [session, authLoading, navigate, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log(`🔑 Tentative de connexion ${type}:`, email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Erreur Supabase:', error.message)
        setError('Email ou mot de passe incorrect')
        return
      }

      if (!data.user) {
        console.error('❌ Pas d\'utilisateur retourné')
        setError('Erreur de connexion')
        return
      }

      console.log('✅ Connexion réussie:', data.user.email)

      // Vérifier les droits d'accès pour admin
      if (type === 'admin' && data.user.email !== 'contact@infinityagency.be') {
        console.log('❌ Accès admin refusé pour:', data.user.email)
        setError('Accès admin non autorisé')
        await supabase.auth.signOut()
        return
      }

      // Redirection selon le type
      const redirectPath = type === 'admin' ? '/admin' : '/client'
      console.log(`🔄 Redirection ${type} vers ${redirectPath}`)
      navigate(redirectPath, { replace: true })

    } catch (err) {
      console.error('❌ Erreur:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Afficher un spinner pendant le chargement de l'auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="mt-4 text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {type === 'admin' ? 'Admin Dashboard' : 'Portail Client'}
            </h1>
            <p className="text-gray-600 mt-2">Infinity Agency</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          {/* Liens de navigation */}
          <div className="mt-6 text-center space-y-2">
            {type === 'client' ? (
              <p className="text-sm text-gray-600">
                Administrateur ?{' '}
                <button
                  onClick={() => navigate('/admin/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Connexion admin
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                Client ?{' '}
                <button
                  onClick={() => navigate('/client/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={loading}
                >
                  Connexion client
                </button>
              </p>
            )}
          </div>

          {/* Informations de test en développement */}
          {import.meta.env.DEV && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Comptes de test :</p>
              <div className="space-y-1 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">Admin:</p>
                  <p className="text-gray-600">contact@infinityagency.be</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="font-medium">Client:</p>
                  <p className="text-gray-600">Tout autre email valide</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}