import React from 'react';
import { FileText, Download, ExternalLink, Calendar, HardDrive, ShieldCheck } from 'lucide-react';

export const CustomDocumentViewer = ({ data }) => {
  if (!data) return null;

  const docs = data.documents || (data.primaryDocument ? [data.primaryDocument] : []);
  const primaryDoc = data.primaryDocument || docs[0];

  const backendOrigin = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5001';

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = (mime) => mime && mime.startsWith('image/');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-semibold block mb-0.5">
                Verified Custom Context
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">
                {primaryDoc?.title || data.category || 'Uploaded Document'}
              </h2>
            </div>
          </div>

          {primaryDoc && (
            <a
              href={`${backendOrigin}${primaryDoc.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-md shadow-teal-500/20 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download / Open File</span>
            </a>
          )}
        </div>
      </div>

      {/* Primary Document Card */}
      {primaryDoc && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Category: <span className="capitalize text-teal-300">{primaryDoc.category}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <HardDrive className="w-3.5 h-3.5" />
              <span>{formatFileSize(primaryDoc.fileSize)}</span>
            </div>
          </div>

          {primaryDoc.description && (
            <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              {primaryDoc.description}
            </p>
          )}

          {/* If file is an image, display an inline preview! */}
          {isImage(primaryDoc.mimeType) && (
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-96 flex items-center justify-center p-2">
              <img
                src={`${backendOrigin}${primaryDoc.fileUrl}`}
                alt={primaryDoc.title}
                className="max-h-80 max-w-full rounded-lg object-contain"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="truncate text-slate-400 font-mono">{primaryDoc.fileName}</span>
            <a
              href={`${backendOrigin}${primaryDoc.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-400 hover:underline shrink-0"
            >
              <span>View Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Other Documents in this category if multiple */}
      {docs.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Documents in this Context ({docs.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {docs.map((doc) => (
              <a
                key={doc._id}
                href={`${backendOrigin}${doc.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="overflow-hidden">
                  <h5 className="text-xs font-bold text-slate-200 group-hover:text-teal-300 truncate">
                    {doc.title}
                  </h5>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {formatFileSize(doc.fileSize)}
                  </p>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-400 shrink-0 ml-2" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDocumentViewer;
