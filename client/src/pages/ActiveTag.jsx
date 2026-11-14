import React, { useState, useEffect } from 'react';
import { tagApi } from '../api/tagApi';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatFunctionName } from '../utils/formatters';
import VehicleViewer from '../components/viewers/VehicleViewer';
import MedicalViewer from '../components/viewers/MedicalViewer';
import EmergencyViewer from '../components/viewers/EmergencyViewer';
import ContactViewer from '../components/viewers/ContactViewer';
import PersonalViewer from '../components/viewers/PersonalViewer';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Clock,
  Radio,
  MapPin,
  Shield,
  PowerOff,
  RefreshCw,
  Lock,
  LogIn,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActiveTag = ({ state, tagId, onStateChange }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState('');
  const [remainingSec, setRemainingSec] = useState(state.remainingSeconds || 0);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  // Synchronize and run countdown
  useEffect(() => {
    if (!state.expiresAt) return;

    const calculateRemaining = () => {
      const now = new Date().getTime();
      const expires = new Date(state.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setRemainingSec(diff);

      if (diff <= 0) {
        // Countdown reached zero -> Trigger authoritative state re-check with backend!
        if (onStateChange) onStateChange();
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [state.expiresAt, onStateChange]);

  // Fetch function payload
  const fetchFunctionData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      const res = await tagApi.getTagFunctionData(tagId, state.function);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setDataError(err.response.data.message || 'Access restricted.');
      } else if (err.response?.status === 410) {
        // Tag already expired on backend
        if (onStateChange) onStateChange();
      } else {
        setDataError(err.response?.data?.message || 'Failed to retrieve functional data.');
      }
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (state.function) {
      fetchFunctionData();
    }
  }, [tagId, state.function]);

  const handleDeactivate = async () => {
    setDeactivating(true);
    setDeactivateError('');
    try {
      await tagApi.deactivateTag(tagId);
      if (onStateChange) onStateChange();
    } catch (err) {
      setDeactivateError(err.response?.data?.message || 'Failed to deactivate tag.');
    } finally {
      setDeactivating(false);
    }
  };

  const renderViewer = () => {
    switch (state.function) {
      case 'vehicle_details':
        return <VehicleViewer data={data} />;
      case 'medical_information':
        return <MedicalViewer data={data} />;
      case 'emergency':
        return <EmergencyViewer data={data} />;
      case 'contact':
        return <ContactViewer data={data} />;
      case 'personal_information':
        return <PersonalViewer data={data} />;
      default:
        return (
          <div className="p-6 text-center text-slate-400">
            Unsupported active function: {state.function}
          </div>
        );
    }
  };

  const isLowTime = remainingSec > 0 && remainingSec <= 30;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Authoritative State Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Active Pulse Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-extrabold text-white">{tagId}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE CONTEXT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Role: <span className="text-emerald-300 font-semibold">{formatFunctionName(state.function)}</span>
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div
            className={`px-5 py-3 rounded-2xl border text-center transition-colors ${
              isLowTime
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-slate-950/80 border-slate-800 text-amber-300'
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 uppercase font-mono font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expires In</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider mt-0.5">
              {formatDuration(remainingSec)}
            </div>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/80 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span className="capitalize">{state.accessLevel || 'Public'} Access</span>
          </span>

          {state.context?.location?.latitude && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 text-slate-300 border border-slate-700/80 rounded-lg font-mono">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {state.context.location.latitude.toFixed(2)}, {state.context.location.longitude.toFixed(2)}
              </span>
            </span>
          )}

          <button
            onClick={onStateChange}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Refresh Authoritative State"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Sync</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={handleDeactivate}
              disabled={deactivating}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <PowerOff className="w-3 h-3" />
              <span>{deactivating ? 'Resetting...' : 'Reset Tag'}</span>
            </button>
          )}
        </div>

        {deactivateError && (
          <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{deactivateError}</span>
          </div>
        )}
      </div>

      {/* Main Data Section */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        {loadingData ? (
          <Loading message="Fetching dynamic context payload from MongoDB..." />
        ) : dataError ? (
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Restricted Context Data</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{dataError}</p>
            {!isAuthenticated && (
              <Link
                to={`/login?redirect=/tag/${tagId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md shadow-sky-500/25"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to View</span>
              </Link>
            )}
          </div>
        ) : (
          renderViewer()
        )}
      </div>
    </div>
  );
};

export default ActiveTag;
