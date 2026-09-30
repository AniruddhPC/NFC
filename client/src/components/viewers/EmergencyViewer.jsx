import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, Navigation, Info } from 'lucide-react';

export const EmergencyViewer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* High Alert Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-red-950 to-slate-900 border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 bg-red-500/20 text-red-400 rounded-xl animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </span>
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-red-400 font-bold block">
              Active Emergency Mode
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">{data.emergencyTitle}</h2>
          </div>
        </div>
      </div>

      {/* Direct Call Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary Contact */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold block mb-1">
              Primary SOS Contact
            </span>
            <h3 className="text-lg font-bold text-slate-100">{data.primaryContactName}</h3>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{data.primaryContactPhone}</p>
          </div>
          <a
            href={`tel:${data.primaryContactPhone}`}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all active:scale-[0.98]"
          >
            <PhoneCall className="w-4 h-4" />
            <span>CALL PRIMARY SOS</span>
          </a>
        </div>

        {/* Secondary Contact */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider font-semibold block mb-1">
              Secondary / Security Dispatch
            </span>
            <h3 className="text-lg font-bold text-slate-100">{data.secondaryContactName || 'Security'}</h3>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{data.secondaryContactPhone}</p>
          </div>
          <a
            href={`tel:${data.secondaryContactPhone}`}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <PhoneCall className="w-4 h-4 text-sky-400" />
            <span>CALL DISPATCH</span>
          </a>
        </div>
      </div>

      {/* Evacuation Point */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
        <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 mt-0.5">
          <Navigation className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold block mb-1">
            Designated Evacuation Point
          </span>
          <p className="text-base font-bold text-white leading-snug">{data.evacuationPoint}</p>
        </div>
      </div>

      {/* Emergency Action Steps */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
        <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Immediate Action Steps</span>
        </h4>
        <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
          {data.instructions && data.instructions.map((step, idx) => (
            <li key={idx} className="leading-relaxed pl-1">{step}</li>
          ))}
        </ol>
      </div>

      {/* Medical Alert Notice */}
      {data.medicalAlerts && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-200 block mb-0.5">Critical Responder Note:</span>
            <p className="leading-relaxed">{data.medicalAlerts}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyViewer;
