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
    let mounted = true;

    console.log('🔍 AuthProvider - Initialisation...');

    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        console.log('🔍 Vérification de la session existante...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Erreur lors de la récupération de la session:', error);
          setUser(null);
        } else if (session?.user) {
          console.log('✅ Session existante trouvée pour:', session.user.email);
          setUser(session.user);
          
          // Redirection automatique si sur une page de login
          const isOnLoginPage = location.pathname.includes('/login') || location.pathname === '/';
          if (isOnLoginPage) {
            console.log('🔄 Redirection automatique depuis session existante...');
            if (session.user.email === 'contact@infinityagency.be') {
              console.log('🔄 Redirection admin vers /admin');
              navigate('/admin', { replace: true });
            } else {
              console.log('🔄 Redirection client vers /client');
              navigate('/client', { replace: true });
            }
          }
        } else {
          console.log('ℹ️ Aucune session existante');
          setUser(null);
        }
      } catch (err) {
        console.error('❌ Erreur générale getSession:', err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) {
          console.log('✅ AuthProvider - Chargement terminé');
          setIsLoading(false);
        }
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state change:', event, 'User:', session?.user?.email || 'Aucun utilisateur');
        
        setUser(session?.user ?? null);
        
        // Gérer les redirections selon l'événement
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ SIGNED_IN détecté pour:', session.user.email);
          
          // Attendre un court délai pour s'assurer que l'état est mis à jour
          setTimeout(() => {
            if (session.user.email === 'contact@infinityagency.be') {
              console.log('🔄 Redirection admin vers /admin');
              navigate('/admin', { replace: true });
            } else {
              console.log('🔄 Redirection client vers /client');
              navigate('/client', { replace: true });
            }
          }, 100);
          
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 SIGNED_OUT détecté, redirection vers login...');
          navigate('/client/login', { replace: true });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi pour:', session?.user?.email);
        }
        
        // Toujours arrêter le loading après un événement d'auth
        setIsLoading(false);
      }
    );

    return () => {
      console.log('🧹 AuthProvider - Nettoyage...');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  const signOut = async () => {
    try {
      console.log('🚪 Déconnexion en cours...');
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erreur lors de la déconnexion:', error);
      } else {
        console.log('✅ Déconnexion réussie');
        // La redirection sera gérée par onAuthStateChange
      }
    } catch (err) {
      console.error('❌ Erreur générale signOut:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    signOut
  };

  console.log('🔍 AuthProvider render - User:', user?.email || 'Aucun', 'Loading:', isLoading);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};