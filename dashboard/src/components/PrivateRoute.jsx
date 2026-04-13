import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ requiredRole, children }) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#08080D] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    {/* Pulsing security indicator */}
                    <div className="w-12 h-12 border border-cyan-500/30 bg-[#0D0D14] flex items-center justify-center">
                        <div className="w-4 h-4 bg-cyan-500 animate-pulse" />
                    </div>
                    <div className="text-cyan-400 text-xs animate-pulse font-mono tracking-[0.25em] uppercase">
                        Verifying Cryptographic Clearance
                    </div>
                    {/* Animated progress bar */}
                    <div className="w-64 h-px bg-[#1E293B] overflow-hidden">
                        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-[barGrow_1.5s_ease-in-out_infinite]" />
                    </div>
                </div>
            </div>
        );
    }

    // No user = not authenticated → redirect to auth portal
    if (!user) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    // Root admin can access everything. Otherwise, roles must match.
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}
