import React, { createContext, useState, useEffect } from 'react';

type User = { id: string; email: string; name?: string; role?: string } | null;

export const AdminAuthContext = createContext({
  user: null as User | null,
  token: null as string | null,
  login: async (email: string, password: string) => {},
  logout: () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem('admin_token', token); else localStorage.removeItem('admin_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('admin_user', JSON.stringify(user)); else localStorage.removeItem('admin_user');
  }, [user]);

  const login = async (email: string, password: string) => {
    const res = await fetch(`/api/admin/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(errData.error || `Login error: ${res.status}`);
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => { setToken(null); setUser(null); };

  return (
    <AdminAuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
