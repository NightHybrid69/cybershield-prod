'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/admin/login', form);
      localStorage.setItem('cs_admin_token', res.data.token);
      toast.success('Welcome back, Admin!');
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#f5f4f0]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">CyberShield Dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="card space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5">Username</label>
            <input
              className="input-field"
              placeholder="admin"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? '⏳ Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Default: <code className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">admin</code> / <code className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200">admin123</code>
        </p>
        <div className="text-center mt-4">
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to site</a>
        </div>
      </div>
    </div>
  );
}
