import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import LandingPage from './LandingPage';
import WorldMonitor from './WorldMonitor';
import AuthPortal from './AuthPortal';
import PrivateDashboard from './PrivateDashboard';
import RegulatorPortal from './RegulatorPortal';
import AdminDashboard from './AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/network" element={<WorldMonitor />} />
          <Route path="/auth" element={<AuthPortal />} />
          <Route path="/invite/:token" element={<AuthPortal isInvite={true} />} />

          {/* Protected Routes — Guarded by PrivateRoute */}
          <Route path="/dashboard" element={
            <PrivateRoute requiredRole="enterprise">
              <PrivateDashboard />
            </PrivateRoute>
          } />
          <Route path="/regulator" element={
            <PrivateRoute requiredRole="regulator">
              <RegulatorPortal />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}