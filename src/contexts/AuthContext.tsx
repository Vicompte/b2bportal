import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        } else {
          console.log('Session récupérée:', session?.user?.email || 'Aucune session');
          setUser(session?.user ?? null);
          
          // Redirection automatique si utilisateur connecté et sur une page de login
          if (session?.user && (location.pathname.includes('/login') || location.pathname === '/')) {
            console.log('Redirection automatique depuis la session...');
            if (session.user.email === 'contact@infinityagency.be') {
              navigate('/admin', { replace: true });
            } else {
              navigate('/client', { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Erreur générale getSession:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'Aucun utilisateur');
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Redirection automatique lors des changements d'état
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('SIGNED_IN détecté, redirection...');
          if (session.user.email === 'contact@infinityagency.be') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/client', { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('SIGNED_OUT détecté, redirection vers login...');
          navigate('/client/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const signOut = async () => {
    try {
      console.log('Déconnexion en cours...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } else {
        console.log('Déconnexion réussie');
        // La redirection sera gérée par onAuthStateChange
      }
    } catch (err) {
      console.error('Erreur générale signOut:', err);
    }
  };

  const value = {
    user,
    isLoading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};