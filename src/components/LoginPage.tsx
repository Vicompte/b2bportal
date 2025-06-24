import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resetAuthData } from '../utils/authManager';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  
  const { currentUser, login } = useAuth();
  const location = useLocation();

  // Si déjà connecté, rediriger vers la page appropriée
  if (currentUser) {
    const from = location.state?.from?.pathname || (currentUser.role === 'admin' ? '/admin' : '/client');
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
        setShowReset(true);
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion');
      setShowReset(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetAuthData();
    setError('');
    setShowReset(false);
    setUsername('');
    setPassword('');
    alert('Données réinitialisées. Utilisez les identifiants : contact@infinityagency.be / InfinityAgency1812**');
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
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portail Client</h1>
          <p className="text-gray-600">Infinity Agency</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="contact@infinityagency.be"
                  required
                  disabled={isLoading}
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
                  placeholder="InfinityAgency1812**"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {showReset && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 mb-2">
                  Problème de connexion ? Cliquez pour réinitialiser les données :
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center space-x-1 text-sm text-yellow-700 hover:text-yellow-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Identifiants de démonstration */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">Identifiants Admin :</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-700">Administrateur</p>
              <p className="text-gray-600 text-sm">contact@infinityagency.be</p>
              <p className="text-gray-600 text-sm">InfinityAgency1812**</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;