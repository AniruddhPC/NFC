import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  ShieldAlert,
  Radio,
  Users,
  Settings2,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Clock,
  Shield,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('tags'); // 'tags' | 'users' | 'create_tag'
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editable configuration draft for selected tag
  const [configDraft, setConfigDraft] = useState(null);

  // New tag registration form state
  const [newTagId, setNewTagId] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagOwner, setNewTagOwner] = useState('');

  // Fetch initial admin data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tagList, userList] = await Promise.all([
        adminApi.getAllAdminTags(),
        adminApi.getAllUsers(),
      ]);
      setTags(tagList);
      setUsers(userList);
      if (tagList.length > 0) {
        setSelectedTag(tagList[0]);
        setConfigDraft(JSON.parse(JSON.stringify(tagList[0].configuration || {})));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const handleSelectTag = (tag) => {
    setSelectedTag(tag);
    setConfigDraft(JSON.parse(JSON.stringify(tag.configuration || {})));
    setMessage('');
    setError('');
  };

  // Field Builder Actions
  const handleAddField = () => {
    const newField = {
      name: `field_${Date.now().toString().slice(-4)}`,
      label: 'New Context Field',
      type: 'text',
      required: false,
      options: [],
      defaultValue: '',
    };
    setConfigDraft((prev) => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));
  };

  const handleRemoveField = (index) => {
    setConfigDraft((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const handleFieldPropChange = (index, prop, value) => {
    setConfigDraft((prev) => {
      const updated = [...prev.fields];
      updated[index] = { ...updated[index], [prop]: value };
      return { ...prev, fields: updated };
    });
  };

  // Dropdown Option Tags handler
  const handleAddOption = (fieldIndex, optionText) => {
    if (!optionText || !optionText.trim()) return;
    setConfigDraft((prev) => {
      const updated = [...prev.fields];
      const existingOptions = updated[fieldIndex].options || [];
      if (!existingOptions.includes(optionText.trim())) {
        updated[fieldIndex].options = [...existingOptions, optionText.trim()];
      }
      return { ...prev, fields: updated };
    });
  };

  const handleRemoveOption = (fieldIndex, optionIndex) => {
    setConfigDraft((prev) => {
      const updated = [...prev.fields];
      updated[fieldIndex].options = updated[fieldIndex].options.filter((_, i) => i !== optionIndex);
      return { ...prev, fields: updated };
    });
  };

  // Toggle Function support
  const handleToggleFunction = (funcId) => {
    setConfigDraft((prev) => {
      const current = prev.functions || [];
      const updated = current.includes(funcId)
        ? current.filter((f) => f !== funcId)
        : [...current, funcId];
      return { ...prev, functions: updated };
    });
  };

  // Toggle Access Level support
  const handleToggleAccessLevel = (lvlId) => {
    setConfigDraft((prev) => {
      const current = prev.accessLevels || [];
      const updated = current.includes(lvlId)
        ? current.filter((l) => l !== lvlId)
        : [...current, lvlId];
      return { ...prev, accessLevels: updated };
    });
  };

  // Save Configuration to Backend
  const handleSaveConfig = async () => {
    if (!selectedTag) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await adminApi.updateTagConfig(selectedTag.tagId, configDraft);
      setMessage(`Configuration for '${selectedTag.tagId}' saved to MongoDB successfully!`);
      // Update local tags list
      setTags((prev) =>
        prev.map((t) =>
          t.tagId === selectedTag.tagId ? { ...t, configuration: configDraft } : t
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tag configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Create Tag Action
  const handleCreateTag = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await adminApi.createAdminTag({
        tagId: newTagId,
        name: newTagName,
        ownerEmail: newTagOwner,
      });
      setMessage(res.message);
      setNewTagId('');
      setNewTagName('');
      setNewTagOwner('');
      fetchData();
      setActiveTab('tags');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register tag.');
    } finally {
      setSaving(false);
    }
  };

  // User Role Update
  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setMessage('User role updated successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  if (loading) return <Loading message="Loading Admin Management Console..." />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Management Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Tag Configuration & Context Builder
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Define dynamic context schemas, required fields, dropdown options, and user access levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'tags'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Tag Fleet & Field Builder ({tags.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create_tag')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'create_tag'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New NFC Tag</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-sm flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* TAB 1: TAG FLEET & DYNAMIC FIELD BUILDER */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tag Selector List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>Select Tag to Configure</span>
            </h3>

            {tags.map((tag) => {
              const isSelected = selectedTag?.tagId === tag.tagId;
              const fieldCount = tag.configuration?.fields?.length || 0;
              return (
                <button
                  key={tag.tagId}
                  onClick={() => handleSelectTag(tag)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-white">{tag.tagId}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {fieldCount} fields
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">{tag.name}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/60">
                    <span>Owner: {tag.ownerId?.name || 'Assigned'}</span>
                    <Link
                      to={`/tag/${tag.tagId}`}
                      target="_blank"
                      className="text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Dynamic Context Field Builder for Selected Tag */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
            {selectedTag && configDraft ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold block">
                      Target Configuration
                    </span>
                    <h2 className="text-2xl font-black text-white mt-0.5">
                      {selectedTag.tagId} Context Schema
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Configure dynamic fields. When users access this tag, their form will automatically reflect these fields.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'SAVE CONFIGURATION'}</span>
                  </button>
                </div>

                {/* Section 1: Context Fields Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-sky-400" />
                        <span>Dynamic Context Fields</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Define which fields the visitor/user must provide when activating this tag.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddField}
                      className="px-3.5 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Context Field</span>
                    </button>
                  </div>

                  {/* Fields List */}
                  <div className="space-y-4">
                    {configDraft.fields?.length === 0 ? (
                      <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                        No fields defined. Click "Add Context Field" to add one.
                      </div>
                    ) : (
                      configDraft.fields?.map((field, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            {/* Field Name (Machine key) */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1 font-mono">
                                Field Name (key)
                              </label>
                              <input
                                type="text"
                                value={field.name}
                                onChange={(e) =>
                                  handleFieldPropChange(fIdx, 'name', e.target.value)
                                }
                                placeholder="e.g. vehicleType"
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 font-mono focus:border-sky-500 focus:outline-none"
                              />
                            </div>

                            {/* Field Label (Human readable) */}
                            <div className="sm:col-span-4">
                              <label className="block text-[11px] text-slate-400 mb-1">
                                Field Label
                              </label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  handleFieldPropChange(fIdx, 'label', e.target.value)
                                }
                                placeholder="e.g. Vehicle Type"
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:border-sky-500 focus:outline-none"
                              />
                            </div>

                            {/* Field Type */}
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] text-slate-400 mb-1">Type</label>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  handleFieldPropChange(fIdx, 'type', e.target.value)
                                }
                                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-2 focus:border-sky-500 focus:outline-none"
                              >
                                <option value="text">Text</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="location">Location</option>
                                <option value="number">Number</option>
                                <option value="datetime">Date / Time</option>
                              </select>
                            </div>

                            {/* Required Checkbox & Remove */}
                            <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-4 sm:pt-0">
                              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleFieldPropChange(fIdx, 'required', e.target.checked)
                                  }
                                  className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
                                />
                                <span>Req</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveField(fIdx)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                                title="Remove Field"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Dropdown Options Builder */}
                          {field.type === 'dropdown' && (
                            <div className="mt-2 pt-2 border-t border-slate-800/80 bg-slate-900/40 p-3 rounded-xl space-y-2">
                              <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                                Dropdown Options
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {field.options?.map((opt, optIdx) => (
                                  <span
                                    key={optIdx}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg"
                                  >
                                    <span>{opt}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(fIdx, optIdx)}
                                      className="text-slate-400 hover:text-rose-400"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>

                              {/* Add Option Input */}
                              <div className="flex items-center gap-2 mt-2">
                                <input
                                  type="text"
                                  id={`opt_input_${fIdx}`}
                                  placeholder="Type option name & press Add (e.g. High Priority)"
                                  className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-sky-500 focus:outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddOption(fIdx, e.target.value);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`opt_input_${fIdx}`);
                                    if (input) {
                                      handleAddOption(fIdx, input.value);
                                      input.value = '';
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium"
                                >
                                  + Add Option
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Section 2: Allowed Functions */}
                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-400" />
                    <span>Allowed Functions for this Tag</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'vehicle_details', label: 'Vehicle Details' },
                      { id: 'medical_information', label: 'Medical Information' },
                      { id: 'emergency', label: 'Emergency Protocol' },
                      { id: 'contact', label: 'Contact Information' },
                      { id: 'personal_information', label: 'Personal Information' },
                    ].map((fn) => {
                      const isAllowed = configDraft.functions?.includes(fn.id);
                      return (
                        <button
                          key={fn.id}
                          type="button"
                          onClick={() => handleToggleFunction(fn.id)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            isAllowed
                              ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold">{fn.label}</span>
                            {isAllowed && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Allowed Access Levels */}
                <div className="space-y-3 pt-6 border-t border-slate-800">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-sky-400" />
                    <span>Allowed Access Levels</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'public', label: 'Public' },
                      { id: 'authorized', label: 'Authorized Users' },
                      { id: 'owner_only', label: 'Owner Only' },
                    ].map((lvl) => {
                      const isAllowed = configDraft.accessLevels?.includes(lvl.id);
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handleToggleAccessLevel(lvl.id)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                            isAllowed
                              ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                              : 'bg-slate-950/60 border-slate-800 text-slate-500'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-500">
                Please select a tag from the left to configure its dynamic schema.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Registered Users & Role Permissions</h3>
              <p className="text-xs text-slate-400 mt-1">
                Manage roles (Admin, Normal User / Tag Owner, Authorized Personnel).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Person ID</th>
                  <th className="p-3.5">Tags Owned</th>
                  <th className="p-3.5">Current Role</th>
                  <th className="p-3.5 text-right">Assign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="p-3.5 text-white font-semibold">{u.name}</td>
                    <td className="p-3.5 text-slate-400 font-mono">{u.email}</td>
                    <td className="p-3.5 font-mono text-slate-300">{u.personId}</td>
                    <td className="p-3.5 font-mono text-sky-400">{u.tagCount || 0}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-sky-500"
                      >
                        <option value="user">Normal User</option>
                        <option value="admin">Administrator</option>
                        <option value="authorized">Authorized</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REGISTER NEW TAG */}
      {activeTab === 'create_tag' && (
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-xl font-bold text-white">Register New NFC Tag</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a physical NFC tag identifier and assign it to an owner.
            </p>
          </div>

          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tag ID (Permanent Hardware Identifier)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TAG003"
                value={newTagId}
                onChange={(e) => setNewTagId(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm font-mono focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tag Name / Friendly Description
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Warehouse Gate Tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner User Email (Optional - defaults to you)
              </label>
              <input
                type="email"
                placeholder="owner@example.com"
                value={newTagOwner}
                onChange={(e) => setNewTagOwner(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-sky-500/25"
            >
              {saving ? 'Creating...' : 'Register NFC Tag'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
