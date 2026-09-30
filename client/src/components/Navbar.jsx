import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Radio, LogOut, User as UserIcon, LayoutDashboard, LogIn, UserPlus, UploadCloud } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-white">
              NFC Context Hub
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Tap / My Tag */}
              <Link
                to="/tag/TAG001"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Radio className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">My NFC Tag</span>
              </Link>

              {/* Manage Documents & Context */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-800/80 text-sky-300 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-sky-400" />
                <span>Uploads & Dashboard</span>
              </Link>

              {/* User badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium text-slate-200">{user?.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all duration-200"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-4 h-4 text-sky-400" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
