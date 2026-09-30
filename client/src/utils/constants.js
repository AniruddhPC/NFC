export const FUNCTION_OPTIONS = [
  {
    id: 'vehicle_details',
    label: 'Vehicle Details',
    description: 'Registration, owner, insurance status, and vehicle telemetry',
    icon: 'Car',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  {
    id: 'medical_information',
    label: 'Medical Information',
    description: 'Emergency medical alerts, blood group, allergies & medications',
    icon: 'Activity',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  {
    id: 'emergency',
    label: 'Emergency Protocol',
    description: 'Evacuation instructions, emergency dispatch, and primary SOS contacts',
    icon: 'AlertTriangle',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  {
    id: 'contact',
    label: 'Contact Information',
    description: 'Professional vCard, phone, email, and corporate affiliation',
    icon: 'PhoneCall',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  {
    id: 'personal_information',
    label: 'Personal Information',
    description: 'Identity profile, biography, and social links',
    icon: 'UserCheck',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

export const ACCESS_LEVELS = [
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone who taps or scans the tag can view the details.',
    icon: 'Globe',
  },
  {
    id: 'authorized',
    label: 'Authorized Users',
    description: 'Requires an authenticated user session in the system.',
    icon: 'ShieldCheck',
  },
  {
    id: 'owner_only',
    label: 'Owner Only',
    description: 'Strictly restricted to the registered owner of this NFC tag.',
    icon: 'Lock',
  },
];

export const PRESET_DURATIONS = [
  { label: '30 Seconds', value: 30 },
  { label: '1 Minute', value: 60 },
  { label: '5 Minutes', value: 300 },
  { label: '10 Minutes', value: 600 },
  { label: '30 Minutes', value: 1800 },
  { label: 'Custom', value: 'custom' },
];
