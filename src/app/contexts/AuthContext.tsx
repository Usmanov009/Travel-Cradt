import React, { createContext, useContext, useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

type User = { id: number; name: string; phone: string; role: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async (_phone: string, _password: string) => {},
  register: async (_name: string, _phone: string, _password: string) => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('user_token'));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('user_data');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('user_token', token);
    else localStorage.removeItem('user_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('user_data', JSON.stringify(user));
    else localStorage.removeItem('user_data');
  }, [user]);

  // Bot orqali "Web Ilovani ochish" bosilib kirilganda, foydalanuvchi bot orqali
  // avval telefon/ismini bergan bo'lsa, qaytadan ro'yxatdan o'tkazmasdan avtomatik kiritamiz.
  useEffect(() => {
    if (token || user) return;
    const initData = WebApp?.initData;
    if (!initData) return;

    fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setToken(data.token);
        setUser(data.user);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (phone: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login xatosi');
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, phone: string, password: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ro'yxatdan o'tish xatosi");
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
