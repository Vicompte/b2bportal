import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ClientLogin from './components/ClientLogin';
import AdminDashboard from './components/AdminDashboard';
import ClientPortal from './components/ClientPortal';

// Composant pour protéger les routes admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est admin (email spécifique)
  if (!user || user.email !== 'contact@infinityagency.be') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

// Composant pour protéger les routes client
const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est connecté et n'est pas admin
  if (!user || user.email === 'contact@infinityagency.be') {
    return <Navigate to="/client/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
}

export default App;