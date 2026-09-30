import React, { useState, useEffect } from 'react';
import { documentApi } from '../api/documentApi';
import {
  Upload,
  FileText,
  FileCheck,
  File,
  Trash2,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Car,
  Activity,
  AlertTriangle,
  UserCheck,
  Download,
} from 'lucide-react';
import Loading from './Loading';

export const DocumentUpload = ({ tagId = 'TAG001', onDocumentChange }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('vehicle');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await documentApi.getUserDocuments();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Pre-fill title without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setUploading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('tagId', tagId);

      const res = await documentApi.uploadDocument(formData);
      setMessage(res.message);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      // Reset file input
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';

      fetchDocs();
      if (onDocumentChange) onDocumentChange();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentApi.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d._id !== id));
      setMessage('Document deleted successfully.');
      if (onDocumentChange) onDocumentChange();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'vehicle':
        return <Car className="w-4 h-4 text-emerald-400" />;
      case 'medical':
        return <Activity className="w-4 h-4 text-rose-400" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'identity':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-sky-400" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const backendOrigin = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5001';

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Upload New Document / File</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Attach vehicle insurance, medical reports, ID cards, certificates, or emergency files to your tag ({tagId}).
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File input */}
          <div className="border-2 border-dashed border-slate-700/80 hover:border-sky-500/60 rounded-2xl p-6 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              id="file-upload-input"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx"
            />
            <label
              htmlFor="file-upload-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-sky-400" />
              <div className="text-sm font-semibold text-slate-200">
                {selectedFile ? (
                  <span className="text-sky-300 font-mono">{selectedFile.name}</span>
                ) : (
                  <span>Click to select file or drag & drop</span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Supported: PDF, PNG, JPG, WEBP, DOCX, TXT (Max 10MB)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Motor Insurance Certificate 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="vehicle">Vehicle (Insurance / Registration / Inspection)</option>
                <option value="medical">Medical (Prescriptions / Blood Test / Allergies)</option>
                <option value="emergency">Emergency (Evacuation / Incident Contacts)</option>
                <option value="identity">Identity (ID Card / Passport / License)</option>
                <option value="general">General Document</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="Brief summary of document contents..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading File...' : 'Upload Document'}</span>
          </button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-sky-400" />
          <span>Uploaded Documents ({documents.length})</span>
        </h3>

        {loading ? (
          <Loading message="Fetching uploaded documents..." />
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-6 text-slate-500 text-xs">
            No documents uploaded yet. Use the upload box above to add your first document.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => {
              const fullFileUrl = `${backendOrigin}${doc.fileUrl}`;
              return (
                <div
                  key={doc._id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-start justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl shrink-0 mt-0.5">
                      {getCategoryIcon(doc.category)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-slate-100 truncate">{doc.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 font-medium">
                          {doc.category}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{formatFileSize(doc.fileSize)}</span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{doc.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={fullFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs transition-colors"
                      title="View / Download File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(doc._id)}
                      className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
