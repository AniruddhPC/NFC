import { useState, useCallback } from 'react';

export const useLocation = () => {
  const [coordinates, setCoordinates] = useState({ latitude: '', longitude: '' });
  const [status, setStatus] = useState('idle'); // 'idle' | 'detecting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [isManual, setIsManual] = useState(false);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Browser does not support Geolocation API.');
      setIsManual(true);
      return;
    }

    setStatus('detecting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        setCoordinates({
          latitude: lat,
          longitude: lng,
        });
        setStatus('success');
        setIsManual(false);
      },
      (error) => {
        setStatus('error');
        setIsManual(true);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Unable to obtain your location: Permission was denied.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Unable to obtain your location: GPS position unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Unable to obtain your location: Geolocation request timed out.');
            break;
          default:
            setErrorMessage('Unable to obtain your location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  const setManualCoordinate = (field, value) => {
    setIsManual(true);
    setCoordinates((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCoordinates = () => {
    if (coordinates.latitude === '' && coordinates.longitude === '') {
      return { isValid: true, error: null }; // Optional location
    }

    const lat = Number(coordinates.latitude);
    const lng = Number(coordinates.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      return { isValid: false, error: 'Latitude must be a valid number between -90 and 90.' };
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return { isValid: false, error: 'Longitude must be a valid number between -180 and 180.' };
    }

    return { isValid: true, error: null };
  };

  return {
    coordinates,
    status,
    errorMessage,
    isManual,
    detectLocation,
    setManualCoordinate,
    validateCoordinates,
    setCoordinates,
  };
};
