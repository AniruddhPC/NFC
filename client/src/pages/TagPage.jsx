import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tagApi } from '../api/tagApi';
import { documentApi } from '../api/documentApi';
import { useAuth } from '../context/AuthContext';
import DynamicContextForm from '../components/DynamicContextForm';
import ActiveTag from './ActiveTag';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Radio,
  ShieldCheck,
  FileText,
  Download,
  LogIn,
  UserPlus,
  LayoutDashboard,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export const TagPage = () => {
  const { tagId: routeTagId } = useParams();
  const tagId = (routeTagId || 'TAG001').toUpperCase();
  const { isAuthenticated, user } = useAuth();

  const [tagState, setTagState] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  // Authoritative State Fetcher
  const fetchAuthoritativeState = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [state, docs] = await Promise.all([
        tagApi.getTagState(tagId),
        documentApi.getTagDocuments(tagId).catch(() => []),
      ]);
      setTagState(state);
      setDocuments(docs);
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Tag '${tagId}' is not registered in the system.`);
      } else {
        setError(err.response?.data?.message || 'Unable to communicate with the tag backend.');
      }
    } finally {
      setLoading(false);
    }
  }, [tagId]);

  useEffect(() => {
    fetchAuthoritativeState();
  }, [fetchAuthoritativeState]);

  // Handle context submission
  const handleActivate = async (payload) => {
    setActivating(true);
    setError('');
    try {
      const res = await tagApi.activateTag(tagId, payload);
      setTagState(res.state);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit context.');
    } finally {
      setActivating(false);
    }
  };

  const backendOrigin = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5001';

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <Loading message={`Loading context for ${tagId}...`} />
          <p className="text-xs text-slate-500 font-mono mt-2">NFC Dynamic Context Hub</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <ErrorMessage
          title="Tag Lookup Failed"
          message={error}
          onRetry={fetchAuthoritativeState}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* OWNER ACTION & AUTHENTICATION BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              <span>NFC Tag: {tagId}</span>
              <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400 font-mono">
                {tagState?.status === 'active' ? 'Active' : 'Input Mode'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {isAuthenticated
                ? `Logged in as ${user?.name}. Need to upload documents or change tag settings?`
                : 'Need to add another document or manage details? Sign in or register.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-sky-500/20"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard & Uploads</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-sky-500/20"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* CORE DYNAMIC DISPATCH */}
      {tagState?.status === 'active' ? (
        <div className="space-y-6">
          <ActiveTag
            state={tagState}
            tagId={tagId}
            onStateChange={fetchAuthoritativeState}
          />

          {/* ATTACHED DOCUMENTS SECTION */}
          {documents.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Attached Verified Documents ({documents.length})</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={`${backendOrigin}${doc.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 transition-colors group"
                  >
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 capitalize">{doc.category} Document</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-sky-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* INPUT FORM (Opens directly when visitor/user taps the tag!) */
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full text-sky-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NFC Tap Detected • {tagId}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Provide Context for {tagId}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select or detect your current context parameters below. The URL in the physical tag will remain permanent.
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          <DynamicContextForm
            tagId={tagId}
            tagConfig={tagState?.configuration}
            onActivate={handleActivate}
            loading={activating}
          />

          {/* If there are uploaded documents attached to this tag */}
          {documents.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Uploaded Documents on File</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documents.map((doc) => (
                  <a
                    key={doc._id}
                    href={`${backendOrigin}${doc.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 transition-colors"
                  >
                    <span className="truncate">{doc.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagPage;
