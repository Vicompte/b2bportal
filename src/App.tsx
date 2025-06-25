import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import ClientPortal from './components/ClientPortal'
import AdminDashboard from './components/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  console.log('🔍 App render')

  return (
    <Routes>
      {/* Redirection racine */}
      <Route path="/" element={<Navigate to="/client/login" replace />} />
      
      {/* Routes de connexion */}
      <Route path="/client/login" element={<Login type="client" />} />
      <Route path="/admin/login" element={<Login type="admin" />} />
      
      {/* Routes protégées */}
      <Route 
        path="/client" 
        element={
          <ProtectedRoute redirectTo="/client/login">
            <ClientPortal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly redirectTo="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/client/login" replace />} />
    </Routes>
  )
}

export default App