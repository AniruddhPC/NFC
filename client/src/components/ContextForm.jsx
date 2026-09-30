import React, { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import DurationSelector from './DurationSelector';
import { FUNCTION_OPTIONS, ACCESS_LEVELS } from '../utils/constants';
import {
  MapPin,
  Clock,
  User,
  Shield,
  Layers,
  Sparkles,
  Navigation,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ContextForm = ({ tagId, onActivate, loading }) => {
  const { user } = useAuth();
  const {
    coordinates,
    status: locStatus,
    errorMessage: locError,
    detectLocation,
    setManualCoordinate,
    validateCoordinates,
  } = useLocation();

  const [selectedFunction, setSelectedFunction] = useState('vehicle_details');
  const [selectedAccess, setSelectedAccess] = useState('public');
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toISOString());
  const [formError, setFormError] = useState('');

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Validate coordinates if entered
    const { isValid, error } = validateCoordinates();
    if (!isValid) {
      setFormError(error);
      return;
    }

    const payload = {
      function: selectedFunction,
      duration: Number(duration),
      context: {
        location: {
          latitude: coordinates.latitude !== '' ? Number(coordinates.latitude) : null,
          longitude: coordinates.longitude !== '' ? Number(coordinates.longitude) : null,
        },
        time: new Date().toISOString(),
        personId: user?.personId || 'USER001',
        intent: selectedFunction,
        accessLevel: selectedAccess,
      },
    };

    onActivate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* 1. Tag Identification Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Target Tag ID</span>
          <span className="text-lg font-mono font-bold text-sky-400">{tagId}</span>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Configured By</span>
          <span className="text-sm font-medium text-slate-200">{user?.name || 'Owner'}</span>
        </div>
      </div>

      {/* 2. Function Selection */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Layers className="w-4 h-4 text-sky-400" />
          <span>Active Context Function</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FUNCTION_OPTIONS.map((func) => {
            const isSelected = selectedFunction === func.id;
            return (
              <button
                type="button"
                key={func.id}
                onClick={() => setSelectedFunction(func.id)}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-sm text-slate-100">{func.label}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />}
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-snug">{func.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Access Level */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Access Level</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ACCESS_LEVELS.map((level) => {
            const isSelected = selectedAccess === level.id;
            return (
              <button
                type="button"
                key={level.id}
                onClick={() => setSelectedAccess(level.id)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="block font-semibold text-xs text-slate-200">{level.label}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400 leading-tight">
                  {level.id === 'public'
                    ? 'Anyone tapping tag'
                    : level.id === 'authorized'
                    ? 'Authenticated users'
                    : 'Owner only'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Duration Selector */}
      <DurationSelector value={duration} onChange={(val) => setDuration(val)} />

      {/* 5. Location Context Parameter (GPS / Manual fallback) */}
      <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Context Location (Optional)</span>
          </label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={locStatus === 'detecting'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 ${locStatus === 'detecting' ? 'animate-spin' : ''}`} />
            <span>{locStatus === 'detecting' ? 'Detecting...' : 'Use Current Location'}</span>
          </button>
        </div>

        {locError && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{locError} You may enter coordinates manually below.</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Latitude (-90 to 90)</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 37.7749"
              value={coordinates.latitude}
              onChange={(e) => setManualCoordinate('latitude', e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Longitude (-180 to 180)</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -122.4194"
              value={coordinates.longitude}
              onChange={(e) => setManualCoordinate('longitude', e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 6. Context Metadata (Read-only generated context) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Time (UTC): </span>
          <span className="font-mono text-slate-300 truncate">{currentTimeStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Person Identity: </span>
          <span className="font-mono text-slate-300">{user?.personId || 'USER001'}</span>
        </div>
      </div>

      {/* 7. Action Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 hover:from-sky-300 hover:to-indigo-200 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base"
      >
        <Sparkles className="w-5 h-5 text-slate-950" />
        <span>{loading ? 'ACTIVATING CONTEXT...' : 'ACTIVATE CONTEXT'}</span>
      </button>
    </form>
  );
};

export default ContextForm;
