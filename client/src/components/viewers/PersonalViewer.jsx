import React from 'react';
import { User, ShieldCheck, Globe2, FileBadge, ExternalLink, Languages } from 'lucide-react';

export const PersonalViewer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-purple-500/30">
            {data.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.fullName}</h2>
            <p className="text-purple-300 font-medium text-xs">
              Known as: <span className="text-slate-100 font-semibold">{data.preferredName || data.fullName}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">
                <ShieldCheck className="w-3 h-3 text-purple-400" />
                Verified Identity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {data.bio && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2">
            Biography
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">{data.bio}</p>
        </div>
      )}

      {/* Meta Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-purple-400 shrink-0">
            <FileBadge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Identity Reference</span>
            <span className="text-xs font-mono font-semibold text-slate-200">{data.identityReference || 'US-VERIFIED-99'}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-purple-400 shrink-0">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Spoken Languages & Nationality</span>
            <span className="text-xs font-semibold text-slate-200">
              {data.language || 'English'} • {data.nationality || 'Global'}
            </span>
          </div>
        </div>
      </div>

      {/* Social Links */}
      {data.socialLinks && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold mb-3">
            Online Profiles
          </h4>
          <div className="flex flex-wrap gap-3">
            {data.socialLinks.linkedin && (
              <a
                href={data.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {data.socialLinks.twitter && (
              <a
                href={data.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <span>Twitter / X</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            {data.socialLinks.github && (
              <a
                href={data.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalViewer;
