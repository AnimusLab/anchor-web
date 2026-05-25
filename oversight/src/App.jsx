import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage           from './pages/LoginPage'
import Dashboard           from './pages/Dashboard'
import DecisionLedger      from './pages/DecisionLedger'
import ChainVerifier       from './pages/ChainVerifier'
import LiveTicker          from './pages/LiveTicker'
import IssueNotice         from './pages/IssueNotice'
import MyProfile           from './pages/MyProfile'
import ComplianceTrend     from './pages/ComplianceTrend'
import GlobalSearch        from './pages/GlobalSearch'
import JurisdictionSummary from './pages/JurisdictionSummary'
import AuditTrail          from './pages/AuditTrail'
import ForensicHeatmap     from './pages/ForensicHeatmap'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/dashboard"       element={<P><Dashboard /></P>} />
        <Route path="/ledger"          element={<P><DecisionLedger /></P>} />
        <Route path="/chain"           element={<P><ChainVerifier /></P>} />
        <Route path="/live-ticker"     element={<P><LiveTicker /></P>} />
        <Route path="/trend"           element={<P><ComplianceTrend /></P>} />
        <Route path="/search"          element={<P><GlobalSearch /></P>} />
        <Route path="/jurisdiction"    element={<P><JurisdictionSummary /></P>} />
        <Route path="/heatmap"         element={<P><ForensicHeatmap /></P>} />
        <Route path="/enforce"         element={<P><IssueNotice /></P>} />
        <Route path="/audit-trail"     element={<P><AuditTrail /></P>} />
        <Route path="/profile"         element={<P><MyProfile /></P>} />
        <Route path="*"                element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
