import React from 'react';
import { Link } from 'react-router-dom';
import { formatFunctionName, formatDuration, formatTimestamp } from '../utils/formatters';
import { Radio, ExternalLink, PowerOff, Settings, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const TagCard = ({ tag, onDeactivate }) => {
  const [copied, setCopied] = useState(false);
  const state = tag.state || {};
  const isActive = state.status === 'active';

  const copyUrl = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(tag.permanentUrl || `${window.location.origin}/tag/${tag.tagId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Radio className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <span>{tag.tagId}</span>
              {isActive ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-400 border border-slate-700">
                  Config Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-medium">{tag.name}</p>
          </div>
        </div>

        <button
          onClick={copyUrl}
          title="Copy Permanent NFC URL"
          className="p-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Middle State Information */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Current Function:</span>
          <span className="font-semibold text-slate-200">
            {isActive ? formatFunctionName(state.function) : 'None (Configuration)'}
          </span>
        </div>

        {isActive && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Access Level:</span>
              <span className="font-medium text-sky-400 capitalize">{state.accessLevel}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Remaining Time:</span>
              <span className="font-mono font-bold text-amber-300">
                {formatDuration(state.remainingSeconds)}
              </span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Expires:</span>
              <span className="text-slate-400 font-mono">{formatTimestamp(state.expiresAt)}</span>
            </div>
          </>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Link
          to={`/tag/${tag.tagId}`}
          className="flex-1 py-2 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-sky-500/20"
        >
          <span>Tap / Open Tag</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {isActive ? (
          <button
            onClick={() => onDeactivate(tag.tagId)}
            className="py-2 px-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
            title="Deactivate Context"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        ) : (
          <Link
            to={`/tag/${tag.tagId}/configure`}
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Config</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TagCard;
