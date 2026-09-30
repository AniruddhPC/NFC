import React from 'react';
import { Activity, Heart, AlertOctagon, Pill, Phone, UserCheck, ShieldAlert } from 'lucide-react';

export const MedicalViewer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Medical Header */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/30 rounded-full text-rose-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> Emergency Medical Profile
            </div>
            <h2 className="text-2xl font-bold text-white">{data.fullName}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Physician: {data.physicianName || 'Dr. On Call'} ({data.physicianPhone})
            </p>
          </div>

          <div className="bg-rose-500/15 border-2 border-rose-500/40 rounded-xl px-5 py-3 text-center sm:text-right shrink-0">
            <span className="text-[11px] uppercase font-mono tracking-widest text-rose-300 block font-semibold">
              Blood Group
            </span>
            <span className="text-3xl font-extrabold font-mono text-rose-200">{data.bloodGroup}</span>
          </div>
        </div>
      </div>

      {/* Allergies & Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Severe Allergies */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm mb-3">
            <AlertOctagon className="w-4 h-4" />
            <span>Documented Allergies</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.allergies && data.allergies.length > 0 ? (
              data.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs rounded-lg font-medium"
                >
                  {allergy}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No known drug/food allergies</span>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-3">
            <Heart className="w-4 h-4" />
            <span>Chronic Conditions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.chronicConditions && data.chronicConditions.length > 0 ? (
              data.chronicConditions.map((condition, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs rounded-lg font-medium"
                >
                  {condition}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">None reported</span>
            )}
          </div>
        </div>
      </div>

      {/* Current Medications */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm mb-3">
          <Pill className="w-4 h-4" />
          <span>Active Medications & Dosages</span>
        </div>
        <ul className="space-y-2 text-xs text-slate-300">
          {data.medications && data.medications.length > 0 ? (
            data.medications.map((med, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{med}</span>
              </li>
            ))
          ) : (
            <li className="text-slate-500">No daily prescription medications</li>
          )}
        </ul>
      </div>

      {/* Emergency Contact & Organ Donor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Emergency Next-of-Kin</span>
            <span className="text-sm font-semibold text-slate-100">{data.emergencyContactName}</span>
          </div>
          <a
            href={`tel:${data.emergencyContactPhone}`}
            className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>Call</span>
          </a>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Organ Donor Status</span>
            <span className="text-sm font-semibold text-emerald-300">
              {data.organDonor ? 'Registered Organ Donor' : 'Not Registered'}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default MedicalViewer;
