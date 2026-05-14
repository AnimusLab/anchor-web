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
        // Step 1: Store the token immediately
        setToken(newToken);
        localStorage.setItem('anchor_token', newToken);
        
        // Step 2: Decode role directly from JWT payload (no extra network call needed)
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            // Step 3: Fetch full profile in background to populate user context
            fetch(endpoints.me, { headers: { Authorization: `Bearer ${newToken}` } })
                .then(res => res.ok ? res.json() : null)
                .then(data => { if (data) setUser(data); })
                .catch(() => {});
            // Return role immediately from JWT — don't wait for /me
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
