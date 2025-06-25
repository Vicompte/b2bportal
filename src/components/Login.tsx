import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, testSupabaseConnection } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (user) {
      console.log('Utilisateur déjà connecté, redirection...');
      if (user.email === 'contact@infinityagency.be') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/client', { replace: true });
      }
    }
  }, [user, navigate]);

  // Tester la connexion Supabase au chargement
  useEffect(() => {
    const checkConnection = async () => {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'error');
    };
    
    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Tentative de connexion admin pour:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Résultat connexion admin:', { data, error });

      if (error) {
        console.error('Erreur de connexion admin:', error);
        
        // Messages d'erreur plus explicites
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Veuillez confirmer votre email avant de vous connecter';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
        }
        
        setError(errorMessage);
      } else if (data.user) {
        console.log('Connexion admin réussie pour:', data.user.email);
        
        // Vérifier que c'est bien l'admin
        if (data.user.email !== 'contact@infinityagency.be') {
          setError('Accès non autorisé - Compte admin requis');
          await supabase.auth.signOut();
        } else {
          // Redirection immédiate pour l'admin
          console.log('Redirection vers /admin');
          navigate('/admin', { replace: true });
        }
      }
    } catch (err) {
      console.error('Erreur générale admin:', err);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/IMG_0214.PNG" 
              alt="Infinity Agency Logo" 
              className="h-20 w-auto object-contain"
              onError={(e) => {
                console.error('Erreur de chargement du logo');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portail Admin</h1>
          <p className="text-gray-600">Infinity Agency</p>
        </div>

        {/* Status de connexion Supabase */}
        {connectionStatus === 'checking' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Vérification de la connexion...</span>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Problème de connexion au serveur</span>
            </div>
          </div>
        )}

        {connectionStatus === 'connected' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Connexion au serveur établie</span>
            </div>
          </div>
        )}

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="contact@infinityagency.be"
                  required
                  disabled={isLoading || connectionStatus !== 'connected'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={isLoading || connectionStatus !== 'connected'}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || connectionStatus !== 'connected'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien vers le portail client */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">Vous êtes un client ?</p>
            <button
              onClick={() => navigate('/client/login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Accéder au portail client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;