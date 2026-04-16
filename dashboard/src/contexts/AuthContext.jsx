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
        setToken(newToken);
        localStorage.setItem('anchor_token', newToken);
        
        try {
            const res = await fetch(endpoints.me, {
                headers: { Authorization: `Bearer ${newToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                return data.role;
            }
        } catch (err) {
            console.error("Failed to establish session:", err);
        }
        return null;
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
