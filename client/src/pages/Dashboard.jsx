import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tagApi } from '../api/tagApi';
import { userApi } from '../api/userApi';
import DynamicContextForm from '../components/DynamicContextForm';
import DocumentUpload from '../components/DocumentUpload';
import TagCard from '../components/TagCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Radio,
  Layers,
  UploadCloud,
  FileText,
  User as UserIcon,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Save,
  Activity,
  AlertTriangle,
  PhoneCall,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('context'); // 'context' | 'upload' | 'documents' | 'profile'

  const [tag, setTag] = useState(null);
  const [loadingTag, setLoadingTag] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [error, setError] = useState('');

  // Domain information form state
  const [docType, setDocType] = useState('medical_information');
  const [docData, setDocData] = useState({});
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileOrg, setProfileOrg] = useState(user?.organization || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const fetchPrimaryTag = async () => {
    setLoadingTag(true);
    setError('');
    try {
      // User uses single primary tag TAG001
      const tagDetails = await tagApi.getTagById('TAG001');
      setTag(tagDetails);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tag details.');
    } finally {
      setLoadingTag(false);
    }
  };

  useEffect(() => {
    fetchPrimaryTag();
  }, []);

  // Fetch functional documents
  const fetchDomainRecords = async () => {
    setLoadingDoc(true);
    try {
      const res = await userApi.getTagDocuments('TAG001');
      setDocData(res);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDoc(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDomainRecords();
    }
  }, [activeTab]);

  const handleDeactivate = async () => {
    try {
      await tagApi.deactivateTag('TAG001');
      setActionSuccess('Tag TAG001 has been reset to Configuration state.');
      setTimeout(() => setActionSuccess(''), 4000);
      fetchPrimaryTag();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate tag.');
    }
  };

  const handleActivateTag = async (payload) => {
    setError('');
    try {
      const res = await tagApi.activateTag('TAG001', payload);
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(''), 5000);
      fetchPrimaryTag();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate tag.');
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    setSavingDoc(true);
    setError('');
    try {
      const payload = docData[docType] || {};
      const res = await userApi.saveTagDocument('TAG001', docType, payload);
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save document details.');
    } finally {
      setSavingDoc(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setError('');
    try {
      const res = await userApi.updateUserProfile({
        name: profileName,
        phone: profilePhone,
        organization: profileOrg,
        bio: profileBio,
      });
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/15 border border-sky-500/30 rounded-full text-sky-300 text-xs font-semibold mb-3">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Normal User & NFC Tag Manager</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure your primary NFC tag (<span className="font-mono text-sky-400 font-bold">TAG001</span>), upload files and documents, and manage your active context.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tag/TAG001"
              target="_blank"
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-sky-500/25"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tap / Test NFC Tag</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('context')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'context'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tag Context Form</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Documents & Files</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'documents'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Information Details</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-300 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* TAB 1: TAG CONTEXT FORM & LIVE STATUS */}
      {activeTab === 'context' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tag Live Status Card */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold mb-2">
              Primary NFC Tag Status
            </h3>
            {loadingTag ? (
              <Loading message="Loading tag..." />
            ) : tag ? (
              <TagCard tag={tag} onDeactivate={handleDeactivate} />
            ) : null}
          </div>

          {/* Context Form */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold block">
                NFC Tag: TAG001
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Context Configuration Form
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select or detect context parameters. Submitting activates the temporary functionality on TAG001.
              </p>
            </div>

            <DynamicContextForm
              tagId="TAG001"
              tagConfig={tag?.configuration}
              onActivate={handleActivateTag}
              loading={false}
            />
          </div>
        </div>
      )}

      {/* TAB 2: DOCUMENT UPLOAD */}
      {activeTab === 'upload' && (
        <DocumentUpload tagId="TAG001" onDocumentChange={fetchDomainRecords} />
      )}

      {/* TAB 3: INFORMATION DETAILS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Domain Information Records</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize the details shown when TAG001 is activated for each specific function.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'medical_information', label: 'Medical Information', icon: Activity },
              { id: 'emergency', label: 'Emergency Protocol', icon: AlertTriangle },
              { id: 'contact', label: 'Contact vCard', icon: PhoneCall },
              { id: 'personal_information', label: 'Personal Information', icon: UserCheck },
            ].map((d) => {
              const Icon = d.icon;
              return (
                <button
                  key={d.id}
                  onClick={() => setDocType(d.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    docType === d.id
                      ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {loadingDoc ? (
            <Loading message="Loading records..." />
          ) : (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-3xl">
              <form onSubmit={handleSaveDocument} className="space-y-4">
                {/* MEDICAL INFORMATION */}
                {docType === 'medical_information' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-white">Emergency Medical Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={docData.medical?.fullName || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              medical: { ...prev.medical, fullName: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Blood Group</label>
                        <input
                          type="text"
                          value={docData.medical?.bloodGroup || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              medical: { ...prev.medical, bloodGroup: e.target.value },
                            }))
                          }
                          placeholder="O+, A-, B+"
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Emergency Contact Name</label>
                        <input
                          type="text"
                          value={docData.medical?.emergencyContactName || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              medical: { ...prev.medical, emergencyContactName: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Emergency Contact Phone</label>
                        <input
                          type="text"
                          value={docData.medical?.emergencyContactPhone || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              medical: { ...prev.medical, emergencyContactPhone: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* EMERGENCY */}
                {docType === 'emergency' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-white">Emergency Protocol & Evacuation</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">Protocol Title</label>
                        <input
                          type="text"
                          value={docData.emergency?.emergencyTitle || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              emergency: { ...prev.emergency, emergencyTitle: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Primary SOS Contact Name</label>
                        <input
                          type="text"
                          value={docData.emergency?.primaryContactName || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              emergency: { ...prev.emergency, primaryContactName: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Primary SOS Phone</label>
                        <input
                          type="text"
                          value={docData.emergency?.primaryContactPhone || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              emergency: { ...prev.emergency, primaryContactPhone: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTACT */}
                {docType === 'contact' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-white">Contact vCard</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={docData.contact?.fullName || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, fullName: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={docData.contact?.title || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, title: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Phone</label>
                        <input
                          type="text"
                          value={docData.contact?.phone || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, phone: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={docData.contact?.email || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, email: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PERSONAL INFORMATION */}
                {docType === 'personal_information' && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-base text-white">Personal Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={docData.personal?.fullName || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              personal: { ...prev.personal, fullName: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Identity Reference</label>
                        <input
                          type="text"
                          value={docData.personal?.identityReference || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              personal: { ...prev.personal, identityReference: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm font-mono focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-slate-400 mb-1">Bio</label>
                        <textarea
                          rows={3}
                          value={docData.personal?.bio || ''}
                          onChange={(e) =>
                            setDocData((prev) => ({
                              ...prev,
                              personal: { ...prev.personal, bio: e.target.value },
                            }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-sm focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingDoc}
                  className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingDoc ? 'Saving Record...' : 'Save Record to MongoDB'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">Profile Details</h3>
            <p className="text-xs text-slate-400 mt-1">
              Update your account details and contact information.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded-xl px-4 py-2.5 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 123-4567"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
              <input
                type="text"
                placeholder="Company / Department"
                value={profileOrg}
                onChange={(e) => setProfileOrg(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Notes</label>
              <textarea
                rows={3}
                placeholder="Brief information..."
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Updating Profile...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
