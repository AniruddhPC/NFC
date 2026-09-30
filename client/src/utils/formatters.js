/**
 * Format remaining seconds into MM:SS or HH:MM:SS
 */
export const formatDuration = (totalSeconds) => {
  if (totalSeconds <= 0 || isNaN(totalSeconds)) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format ISO Date string to human readable format
 */
export const formatTimestamp = (isoDate) => {
  if (!isoDate) return 'N/A';
  const d = new Date(isoDate);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
};

/**
 * Formats function key to readable title
 */
export const formatFunctionName = (funcKey) => {
  switch (funcKey) {
    case 'vehicle_details':
      return 'Vehicle Details';
    case 'medical_information':
      return 'Medical Information';
    case 'emergency':
      return 'Emergency Protocol';
    case 'contact':
      return 'Contact Information';
    case 'personal_information':
      return 'Personal Information';
    default:
      return funcKey || 'Configuration';
  }
};
