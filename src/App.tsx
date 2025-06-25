import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ClientLogin from './components/ClientLogin';
import AdminDashboard from './components/AdminDashboard';
import ClientPortal from './components/ClientPortal';
import { Loader2 } from 'lucide-react';

// Composant pour protéger les routes admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('🔍 AdminRoute - User:', user?.email || 'Aucun', 'Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté et est admin
  if (!user) {
    console.log('🔄 AdminRoute - Pas d\'utilisateur, redirection vers /admin/login');
    return <Navigate to="/admin/login" replace />;
  }

  if (user.email !== 'contact@infinityagency.be') {
    console.log('🔄 AdminRoute - Utilisateur non admin, redirection vers /client/login');
    return <Navigate to="/client/login" replace />;
  }

  console.log('✅ AdminRoute - Accès autorisé pour admin');
  return <>{children}</>;
};

// Composant pour protéger les routes client
const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  console.log('🔍 ClientRoute - User:', user?.email || 'Aucun', 'Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    console.log('🔄 ClientRoute - Pas d\'utilisateur, redirection vers /client/login');
    return <Navigate to="/client/login" replace />;
  }

  // Vérifier que ce n'est pas l'admin
  if (user.email === 'contact@infinityagency.be') {
    console.log('🔄 ClientRoute - Admin détecté, redirection vers /admin');
    return <Navigate to="/admin" replace />;
  }

  console.log('✅ ClientRoute - Accès autorisé pour client');
  return <>{children}</>;
};

function App() {
  console.log('🔍 App render');

  return (
    <Routes>
      {/* Routes Admin */}
      <Route path="/admin/login" element={<Login />} />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      {/* Routes Client */}
      <Route path="/client/login" element={<ClientLogin />} />
      <Route 
        path="/client" 
        element={
          <ClientRoute>
            <ClientPortal />
          </ClientRoute>
        } 
      />
      
      {/* Redirections par défaut */}
      <Route path="/" element={<Navigate to="/client/login" replace />} />
      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  );
}

export default App;