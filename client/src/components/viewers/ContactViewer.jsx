import React from 'react';
import { Mail, Phone, Building2, MapPin, Globe, User, ExternalLink } from 'lucide-react';

export const ContactViewer = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Contact Profile Header */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
            {data.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.fullName}</h2>
            <p className="text-sky-300 font-medium text-sm">{data.title}</p>
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{data.organization}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href={`tel:${data.phone}`}
          className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl flex items-center gap-3.5 transition-all group"
        >
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Telephone</span>
            <span className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors font-mono">
              {data.phone}
            </span>
          </div>
        </a>

        <a
          href={`mailto:${data.email}`}
          className="p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 rounded-xl flex items-center gap-3.5 transition-all group"
        >
          <div className="p-3 bg-sky-500/20 text-sky-400 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-colors">
            <Mail className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs text-slate-400 block font-medium">Email Address</span>
            <span className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate block">
              {data.email}
            </span>
          </div>
        </a>
      </div>

      {/* Office & Online Presence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Location</span>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{data.address || 'Remote / Unspecified'}</p>
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-start gap-3.5">
          <div className="p-2.5 bg-slate-800 rounded-lg text-slate-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Corporate Site</span>
            {data.website ? (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline flex items-center gap-1 mt-0.5"
              >
                <span>{data.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-xs text-slate-500">Not provided</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio / Availability Note */}
      {data.notes && (
        <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-300">
          <span className="font-semibold text-slate-200 block mb-1">Availability & Notes:</span>
          <p className="leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ContactViewer;
