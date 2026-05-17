import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import AuthPortal from './AuthPortal';
import PrivateDashboard from './PrivateDashboard';
import Profile from './pages/Profile';
import TeamManagement from './pages/TeamManagement';
import ProjectInventory from './pages/ProjectInventory';
import ViolationFeed from './pages/ViolationFeed';
import ForensicQueue from './pages/ForensicQueue';
import PolicyViewer from './pages/PolicyViewer';
import ReportsExport from './pages/ReportsExport';
import EnterpriseLayout from './components/EnterpriseLayout';

// Placeholder components for MVP routes
const Placeholder = ({ title }) => (
  <div style={{ padding: 28 }}>
    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>This module is currently being provisioned.</div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default to Auth/Login */}
          <Route path="/" element={<AuthPortal />} />
          <Route path="/auth" element={<AuthPortal />} />
          <Route path="/invite/:token" element={<AuthPortal isInvite={true} />} />

          {/* Protected Enterprise Routes */}
          <Route path="/dashboard" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><PrivateDashboard /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><ProjectInventory /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/mesh" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><Placeholder title="Lattice Mesh Visualization" /></EnterpriseLayout></PrivateRoute>} />
          
          <Route path="/violations" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><ViolationFeed /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/forensic" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><ForensicQueue /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/policy" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><PolicyViewer /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><ReportsExport /></EnterpriseLayout></PrivateRoute>} />
          
          <Route path="/team" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><TeamManagement /></EnterpriseLayout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute requiredRole={["owner", "enterprise", "root", "lead", "admin"]}><EnterpriseLayout><Profile /></EnterpriseLayout></PrivateRoute>} />

          {/* Fallback to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}