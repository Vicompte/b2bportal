import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import ClientPortal from './components/ClientPortal';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique de connexion */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes protégées pour les clients */}
          <Route 
            path="/client" 
            element={
              <ProtectedRoute requiredRole="client">
                <ClientPortal />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes protégées pour les admins */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Route catch-all pour les URLs non trouvées */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;