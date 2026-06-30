import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';

export default function AdminLogin() {
  const { login, token } = useContext(AdminAuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) navigate('/admin', { replace: true });
  }, [token, navigate]);

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-1">Admin Panel</h2>
        <p className="text-sm text-gray-500 mb-4">Super admin yoki tur firma loginingizni kiriting</p>
        {error && <div className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input 
            type="email"
            className="w-full p-3 border rounded" 
            value={email} 
            onChange={(e)=>setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded" 
            value={password} 
            onChange={(e)=>setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <button 
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
