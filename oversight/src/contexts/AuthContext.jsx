import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../lib/api';
import { AvatarVault } from '../lib/AvatarVault';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('oversight_token'));
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
      .then(async (data) => {
        const avatar = await AvatarVault.getAvatar(data.id || data.sub);
        setUser({ ...data, avatar });
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('oversight_token');
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = useCallback(async (newToken) => {
    setToken(newToken);
    localStorage.setItem('oversight_token', newToken);

    try {
      // Fast Handshake: Decode JWT and set user IMMEDIATELY
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const fingerprint = payload.uid || payload.sub;
      const localAvatar = await AvatarVault.getAvatar(fingerprint);

      const immediateUser = {
        id: payload.uid,
        sub: payload.sub,
        role: payload.role || 'regulator',
        avatar: localAvatar,
        
        // v6.1 Institutional Identity
        subtype: payload.subtype || null,
        entityScope: payload.entity_scope || null,
        jurisdiction: payload.jurisdiction || 'GLO',
        clearance: payload.clearance || 1
      };
      setUser(immediateUser);

      // Background enrichment
      fetch(endpoints.me, { headers: { Authorization: `Bearer ${newToken}` } })
        .then(res => res.ok ? res.json() : null)
        .then(async data => {
          if (data) {
            const avatar = await AvatarVault.getAvatar(data.id || data.sub);
            setUser(prev => ({ ...prev, ...data, avatar }));
          }
        });
    } catch (err) {
      console.error("Forensic Handshake Failed:", err);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('oversight_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
