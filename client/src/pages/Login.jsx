import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert, UserCheck, Shield, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('sessionExpired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setEmail('admin@example.com');
    setPassword('password123');
    setError('');
  };

  const fillDemoUser = () => {
    setEmail('owner@example.com');
    setPassword('password123');
    setError('');
  };

  const fillDemoAuthorized = () => {
    setEmail('user@example.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 mb-4">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Login</h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Sign in as Administrator or Normal User / Tag Owner
          </p>
        </div>

        {sessionExpired && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-sky-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 hover:from-sky-300 hover:to-indigo-200 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60 text-sm mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-400 hover:underline font-semibold">
              Create Account
            </Link>
          </p>
        </div>

        {/* Quick Demo Pre-fills */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-3">
            Quick 1-Click Demo Login
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg text-xs font-semibold text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin (admin@...)</span>
            </button>
            <button
              type="button"
              onClick={fillDemoUser}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-sky-300 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Normal User (owner@...)</span>
            </button>
            <button
              type="button"
              onClick={fillDemoAuthorized}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-400 transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Authorized (user@...)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
