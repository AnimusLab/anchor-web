import React, { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('anchor_token'));
    const [isLoading, setIsLoading] = useState(true);

    // On mount / token change: validate the JWT against the backend
    useEffect(() => {
        if (token) {
            fetch(endpoints.me, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(async (res) => {
                if (res.ok) return res.json();
                throw new Error('Session Expired');
            })
            .then((data) => setUser(data))
            .catch(() => {
                setToken(null);
                localStorage.removeItem('anchor_token');
            })
            .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [token]);


    const completeRelayLogin = async (newToken) => {
        // Step 1: Store token
        setToken(newToken);
        localStorage.setItem('anchor_token', newToken);
        
        try {
            // Step 2: Decode JWT and set user IMMEDIATELY so PrivateRoute doesn't kick back
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const immediateUser = {
                sub: payload.sub,
                email: payload.sub, // sub is email
                role: payload.role || 'member',
                org_id: payload.org_id || null,
                display_name: 'LOADING...',
                hub_id: 'PENDING',
            };
            setUser(immediateUser); // <-- Set NOW, before navigate() fires
            
            // Step 3: Enrich with full profile in background
            fetch(endpoints.me, { headers: { Authorization: `Bearer ${newToken}` } })
                .then(res => res.ok ? res.json() : null)
                .then(data => { if (data) setUser(data); })
                .catch(() => {});
            
            return payload.role || 'member';
        } catch (err) {
            console.error("JWT decode failed:", err);
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('anchor_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, completeRelayLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
