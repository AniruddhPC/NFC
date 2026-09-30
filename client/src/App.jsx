import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TagPage from './pages/TagPage';
import { useAuth } from './context/AuthContext';

// Protected Route Guard (Authenticated Normal Users)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Default Route: Opens the Tag Input Form / Interface directly! */}
          <Route path="/" element={<TagPage />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Normal User Dashboard (Context, Document Uploads & Records) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Permanent NFC Tag URL (Authoritative dynamic resolver) */}
          <Route path="/tag/:tagId" element={<TagPage />} />

          {/* Helper routes */}
          <Route
            path="/tag/:tagId/configure"
            element={<TagPage />}
          />
          <Route path="/tag/:tagId/active" element={<TagPage />} />
          <Route path="/tag/:tagId/vehicle" element={<TagPage />} />
          <Route path="/tag/:tagId/medical" element={<TagPage />} />
          <Route path="/tag/:tagId/emergency" element={<TagPage />} />

          {/* Fallback to Tag Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
