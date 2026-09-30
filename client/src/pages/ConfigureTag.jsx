import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tagApi } from '../api/tagApi';
import DynamicContextForm from '../components/DynamicContextForm';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { Radio, ArrowLeft } from 'lucide-react';

export const ConfigureTag = ({ propTagId, onActivated }) => {
  const params = useParams();
  const tagId = (propTagId || params.tagId || 'TAG001').toUpperCase();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tagConfig, setTagConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tag's dynamic configuration from backend
  useEffect(() => {
    const fetchConfig = async () => {
      setLoadingConfig(true);
      try {
        const res = await tagApi.getTagConfig(tagId);
        setTagConfig(res.configuration);
      } catch (err) {
        console.error('Failed to load tag configuration:', err);
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, [tagId]);

  const handleActivate = async (payload) => {
    setError('');
    setLoading(true);
    try {
      const res = await tagApi.activateTag(tagId, payload);
      if (onActivated) {
        onActivated(res.state);
      } else {
        navigate(`/tag/${tagId}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to activate tag. Please verify your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingConfig) {
    return <Loading message={`Loading dynamic context schema for ${tagId}...`} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-mono text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md">
          STATE: CONTEXT INPUT
        </span>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-sky-500/20">
            <Radio className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Provide Context for {tagId}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete the required context fields below. The NFC tag URL will remain unchanged.
          </p>
        </div>

        {error && <ErrorMessage message={error} />}

        <DynamicContextForm
          tagId={tagId}
          tagConfig={tagConfig}
          onActivate={handleActivate}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ConfigureTag;
