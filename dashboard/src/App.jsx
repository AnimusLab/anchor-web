import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import AuthPortal from './AuthPortal';
import PrivateDashboard from './PrivateDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default to Auth/Login */}
          <Route path="/" element={<AuthPortal />} />
          <Route path="/auth" element={<AuthPortal />} />
          <Route path="/invite/:token" element={<AuthPortal isInvite={true} />} />

          {/* Protected Enterprise Route */}
          <Route path="/dashboard" element={
            <PrivateRoute requiredRole="enterprise">
              <PrivateDashboard />
            </PrivateRoute>
          } />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}