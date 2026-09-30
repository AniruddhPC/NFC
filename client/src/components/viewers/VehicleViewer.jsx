import React from 'react';
import { Car, ShieldCheck, FileCheck, Hash, User, Phone, Info, Zap } from 'lucide-react';

export const VehicleViewer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Primary Plate Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 font-semibold block mb-1">
              Official Registration
            </span>
            <div className="inline-block bg-slate-950 border-2 border-emerald-400/80 rounded-xl px-5 py-2 font-mono text-2xl sm:text-3xl font-extrabold tracking-wider text-emerald-300 shadow-inner">
              {data.registrationNumber}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 font-semibold block mb-1">
              Vehicle Model
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center sm:justify-end gap-2">
              <Car className="w-6 h-6 text-emerald-400" />
              <span>{data.model}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Owner */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Registered Owner</span>
            <span className="text-base font-semibold text-slate-100">{data.owner}</span>
          </div>
        </div>

        {/* VIN */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">VIN (Vehicle Identification No.)</span>
            <span className="text-sm font-mono font-semibold text-slate-200">{data.vin || 'N/A'}</span>
          </div>
        </div>

        {/* Insurance Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Insurance Status</span>
            <span className="text-sm font-semibold text-emerald-300">{data.insuranceStatus}</span>
          </div>
        </div>

        {/* Registration Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Registration Status</span>
            <span className="text-sm font-semibold text-emerald-300">{data.registrationStatus}</span>
          </div>
        </div>

        {/* Powertrain / Specs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Powertrain & Finish</span>
            <span className="text-sm font-semibold text-slate-200">
              {data.fuelType || 'Electric'} • {data.color || 'Standard'}
            </span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Roadside / Driver Assistance</span>
            <a
              href={`tel:${data.emergencyContact}`}
              className="text-sm font-semibold text-sky-400 hover:underline"
            >
              {data.emergencyContact || 'Available on file'}
            </a>
          </div>
        </div>
      </div>

      {/* Driver Notes */}
      {data.notes && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200 block mb-0.5">Parking / Operational Notice:</span>
            <p className="leading-relaxed">{data.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleViewer;
