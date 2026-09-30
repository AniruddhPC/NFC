import React, { useState } from 'react';
import { PRESET_DURATIONS } from '../utils/constants';
import { Clock } from 'lucide-react';

export const DurationSelector = ({ value, onChange }) => {
  const [isCustom, setIsCustom] = useState(() => {
    return !PRESET_DURATIONS.slice(0, 5).some((p) => p.value === value);
  });
  const [customMinutes, setCustomMinutes] = useState(() => {
    return Math.max(1, Math.round((value || 300) / 60));
  });

  const handleSelectPreset = (presetValue) => {
    if (presetValue === 'custom') {
      setIsCustom(true);
      onChange(customMinutes * 60);
    } else {
      setIsCustom(false);
      onChange(presetValue);
    }
  };

  const handleCustomChange = (e) => {
    const mins = Math.max(1, Number(e.target.value));
    setCustomMinutes(mins);
    onChange(mins * 60);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Clock className="w-4 h-4 text-sky-400" />
        <span>Context Duration</span>
      </label>

      {/* Preset Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {PRESET_DURATIONS.map((preset) => {
          const isSelected =
            preset.value === 'custom'
              ? isCustom
              : !isCustom && value === preset.value;

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.value)}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm shadow-sky-500/30'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Duration Input */}
      {isCustom && (
        <div className="mt-3 p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center gap-3 animate-fadeIn">
          <label className="text-xs text-slate-400 whitespace-nowrap">Enter minutes:</label>
          <input
            type="number"
            min="1"
            max="1440"
            value={customMinutes}
            onChange={handleCustomChange}
            className="w-24 bg-slate-900 border border-slate-700 text-slate-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-sky-500"
          />
          <span className="text-xs text-slate-400 font-mono">
            = {customMinutes * 60} seconds
          </span>
        </div>
      )}
    </div>
  );
};

export default DurationSelector;
