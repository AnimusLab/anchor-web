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

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);

        const res = await fetch(endpoints.login, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Authentication Failed');
        }

        const data = await res.json();
        
        // Fetch user profile immediately to ensure state is ready before navigation
        const profileRes = await fetch(endpoints.me, {
            headers: { Authorization: `Bearer ${data.access_token}` }
        });
        
        if (profileRes.ok) {
            const profileData = await profileRes.json();
            setUser(profileData);
        }

        localStorage.setItem('anchor_token', data.access_token);
        setToken(data.access_token);

        // Return the role so the UI knows where to route
        return data.role;
    };

    const logout = () => {
        localStorage.removeItem('anchor_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
