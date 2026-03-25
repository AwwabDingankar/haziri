import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'student';
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: object) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('haziri_token'));
  const [loading, setLoading] = useState(!!localStorage.getItem('haziri_token'));

  useEffect(() => {
    if (token) {
      api.me()
        .then((u) => setUser(u as User))
        .catch(() => { localStorage.removeItem('haziri_token'); setToken(null); })
        .finally(() => setLoading(false));
    }
  }, [token]);

  async function login(email: string, password: string) {
    const data = await api.login({ email, password }) as { user: User; token: string };
    localStorage.setItem('haziri_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(body: object) {
    const data = await api.register(body) as { user: User; token: string };
    localStorage.setItem('haziri_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('haziri_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
