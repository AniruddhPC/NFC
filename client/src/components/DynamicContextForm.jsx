import React, { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';
import { useAuth } from '../context/AuthContext';
import DurationSelector from './DurationSelector';
import { FUNCTION_OPTIONS, ACCESS_LEVELS } from '../utils/constants';
import {
  MapPin,
  Clock,
  User,
  Shield,
  Layers,
  Sparkles,
  Navigation,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Hash,
  Type,
  ChevronDown,
} from 'lucide-react';

export const DynamicContextForm = ({ tagId, tagConfig, onActivate, loading }) => {
  const { user } = useAuth();
  const {
    coordinates,
    status: locStatus,
    errorMessage: locError,
    detectLocation,
    setManualCoordinate,
    validateCoordinates,
  } = useLocation();

  // Extract config fields, functions, access levels
  const fields = tagConfig?.fields || [
    { name: 'location', label: 'Location', type: 'location', required: false },
    {
      name: 'intent',
      label: 'Intent / Purpose',
      type: 'dropdown',
      required: true,
      options: ['Emergency', 'Medical', 'Vehicle', 'Contact', 'Personal'],
    },
    {
      name: 'accessLevel',
      label: 'Access Level',
      type: 'dropdown',
      required: true,
      options: ['Public', 'Authorized Users', 'Owner Only'],
    },
  ];

  const allowedFunctions =
    tagConfig?.functions && tagConfig.functions.length > 0
      ? tagConfig.functions
      : ['vehicle_details', 'medical_information', 'emergency', 'contact', 'personal_information'];

  const allowedAccessLevels =
    tagConfig?.accessLevels && tagConfig.accessLevels.length > 0
      ? tagConfig.accessLevels
      : ['public', 'authorized', 'owner_only'];

  const defaultDuration = tagConfig?.defaultDuration || 300;

  // Dynamic form state dictionary
  const [formValues, setFormValues] = useState(() => {
    const initial = {};
    fields.forEach((f) => {
      if (f.type === 'location') {
        initial[f.name] = { latitude: '', longitude: '' };
      } else if (f.type === 'dropdown') {
        initial[f.name] = f.defaultValue || f.options?.[0] || '';
      } else {
        initial[f.name] = f.defaultValue || '';
      }
    });
    return initial;
  });

  // Function selection (if enabled on tag)
  const [selectedFunction, setSelectedFunction] = useState(() => allowedFunctions[0] || 'vehicle_details');
  // Access level selection
  const [selectedAccess, setSelectedAccess] = useState(() => allowedAccessLevels[0] || 'public');
  // Duration in seconds
  const [duration, setDuration] = useState(defaultDuration);
  const [currentTimeStr, setCurrentTimeStr] = useState(new Date().toISOString());
  const [formError, setFormError] = useState('');

  // Synchronize GPS coordinates into location field when location changes
  useEffect(() => {
    if (coordinates.latitude !== '' || coordinates.longitude !== '') {
      setFormValues((prev) => ({
        ...prev,
        location: {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      }));
    }
  }, [coordinates]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFieldChange = (fieldName, value) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    // Dynamic field validation
    for (const field of fields) {
      const val = formValues[field.name];

      if (field.required) {
        if (field.type === 'location') {
          const loc = val || coordinates;
          if (loc.latitude === '' || loc.latitude === undefined || loc.latitude === null) {
            setFormError(`Location coordinates are required by tag configuration.`);
            return;
          }
        } else if (val === '' || val === undefined || val === null) {
          setFormError(`Field '${field.label}' is required.`);
          return;
        }
      }

      // Number validation
      if (field.type === 'number' && val !== '' && val !== undefined) {
        if (isNaN(Number(val))) {
          setFormError(`Field '${field.label}' must be a valid number.`);
          return;
        }
      }
    }

    // Prepare context payload with dynamic fields
    const contextPayload = {
      ...formValues,
      time: new Date().toISOString(),
      personId: user?.personId || 'VISITOR',
      accessLevel: selectedAccess,
      intent: formValues.intent || selectedFunction,
    };

    // Ensure location object is properly formatted if present
    if (formValues.location || coordinates.latitude !== '') {
      contextPayload.location = {
        latitude: formValues.location?.latitude || (coordinates.latitude !== '' ? Number(coordinates.latitude) : null),
        longitude: formValues.location?.longitude || (coordinates.longitude !== '' ? Number(coordinates.longitude) : null),
      };
    }

    // Map intent to function if user selected an intent dropdown
    let targetFunction = selectedFunction;
    if (formValues.intent) {
      const intentLower = String(formValues.intent).toLowerCase();
      if (intentLower.includes('emergency')) targetFunction = 'emergency';
      else if (intentLower.includes('medic')) targetFunction = 'medical_information';
      else if (intentLower.includes('vehic')) targetFunction = 'vehicle_details';
      else if (intentLower.includes('contact')) targetFunction = 'contact';
      else if (intentLower.includes('person')) targetFunction = 'personal_information';
    }

    const payload = {
      function: targetFunction,
      duration: Number(duration),
      context: contextPayload,
    };

    onActivate(payload);
  };

  // Helper to render individual dynamic fields configured by admin
  const renderDynamicField = (field) => {
    const isRequired = field.required;

    switch (field.type) {
      case 'location':
        return (
          <div key={field.name} className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>{field.label} {isRequired && <span className="text-rose-400">*</span>}</span>
              </label>
              <button
                type="button"
                onClick={detectLocation}
                disabled={locStatus === 'detecting'}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-colors disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${locStatus === 'detecting' ? 'animate-spin' : ''}`} />
                <span>{locStatus === 'detecting' ? 'Detecting...' : 'Detect Current Location'}</span>
              </button>
            </div>

            {locError && (
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{locError} Please enter coordinates manually.</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 37.7749"
                  value={formValues.location?.latitude ?? coordinates.latitude}
                  onChange={(e) => {
                    const lat = e.target.value;
                    setManualCoordinate('latitude', lat);
                    handleFieldChange('location', {
                      ...formValues.location,
                      latitude: lat,
                    });
                  }}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. -122.4194"
                  value={formValues.location?.longitude ?? coordinates.longitude}
                  onChange={(e) => {
                    const lng = e.target.value;
                    setManualCoordinate('longitude', lng);
                    handleFieldChange('location', {
                      ...formValues.location,
                      longitude: lng,
                    });
                  }}
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <div key={field.name} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <ChevronDown className="w-4 h-4 text-sky-400" />
              <span>{field.label} {isRequired && <span className="text-rose-400">*</span>}</span>
            </label>
            <div className="relative">
              <select
                value={formValues[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sky-500 appearance-none font-medium"
              >
                {field.options && field.options.length > 0 ? (
                  field.options.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                      {opt}
                    </option>
                  ))
                ) : (
                  <option value="">No options configured</option>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
            </div>
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Hash className="w-4 h-4 text-sky-400" />
              <span>{field.label} {isRequired && <span className="text-rose-400">*</span>}</span>
            </label>
            <input
              type="number"
              value={formValues[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        );

      case 'datetime':
        return (
          <div key={field.name} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>{field.label} {isRequired && <span className="text-rose-400">*</span>}</span>
            </label>
            <input
              type="datetime-local"
              value={formValues[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.name} className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Type className="w-4 h-4 text-sky-400" />
              <span>{field.label} {isRequired && <span className="text-rose-400">*</span>}</span>
            </label>
            <input
              type="text"
              value={formValues[field.name] ?? ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}...`}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
        );
    }
  };

  // Filter FUNCTION_OPTIONS based on tagConfig.functions
  const displayFunctionOptions = FUNCTION_OPTIONS.filter((f) =>
    allowedFunctions.includes(f.id)
  );

  // Filter ACCESS_LEVELS based on tagConfig.accessLevels
  const displayAccessLevels = ACCESS_LEVELS.filter((a) =>
    allowedAccessLevels.map((lvl) => lvl.toLowerCase()).includes(a.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* Target Tag Header */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Target NFC Tag</span>
          <span className="text-lg font-mono font-bold text-sky-400">{tagId}</span>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Active User</span>
          <span className="text-sm font-medium text-slate-200">{user?.name || 'Visitor / Guest'}</span>
        </div>
      </div>

      {/* DYNAMIC FIELDS: Generated directly from tagConfig.fields */}
      <div className="space-y-4">
        <div className="text-xs uppercase font-mono tracking-wider text-slate-400 font-bold border-b border-slate-800 pb-2">
          Required / Configured Context Parameters
        </div>
        {fields.map((field) => renderDynamicField(field))}
      </div>

      {/* Function Selection (if multiple allowed on this tag) */}
      {displayFunctionOptions.length > 1 && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Target Function</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {displayFunctionOptions.map((func) => {
              const isSelected = selectedFunction === func.id;
              return (
                <button
                  type="button"
                  key={func.id}
                  onClick={() => setSelectedFunction(func.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-100">{func.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Access Level (if not already handled by a dropdown field) */}
      {!fields.some((f) => f.name === 'accessLevel') && displayAccessLevels.length > 0 && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Access Level</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {displayAccessLevels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedAccess(lvl.id)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  selectedAccess === lvl.id
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                    : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Duration Selector */}
      <DurationSelector value={duration} onChange={(val) => setDuration(val)} />

      {/* Context Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>UTC Time: </span>
          <span className="font-mono text-slate-300 truncate">{currentTimeStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <span>Person: </span>
          <span className="font-mono text-slate-300">{user?.personId || 'VISITOR'}</span>
        </div>
      </div>

      {/* Submit / Activate Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-300 hover:from-sky-300 hover:to-indigo-200 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60 text-base"
      >
        <Sparkles className="w-5 h-5 text-slate-950" />
        <span>{loading ? 'ACTIVATING CONTEXT...' : 'ACTIVATE CONTEXT'}</span>
      </button>
    </form>
  );
};

export default DynamicContextForm;
