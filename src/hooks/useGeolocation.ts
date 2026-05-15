import { useState, useEffect } from 'react';

export interface Coordinates {
  lat: number;
  lon: number;
}

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseGeolocationResult {
  coords: Coordinates | undefined;
  status: GeolocationStatus;
  error: string | undefined;
}

/**
 * Retrieves the user's current geolocation once on mount.
 * Does NOT re-request on re-render.
 */
export function useGeolocation(): UseGeolocationResult {
  const [coords, setCoords] = useState<Coordinates | undefined>(undefined);
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Geolocation tidak didukung oleh browser ini.');
      return;
    }

    setStatus('loading');

    const watchId = navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setStatus('success');
      },
      (err) => {
        setStatus('error');
        setError(err.message);
      },
      { timeout: 10000, maximumAge: 60000 }
    );

    // Cleanup: not needed for getCurrentPosition but kept for future watchPosition
    return () => {
      if (typeof watchId === 'number') {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { coords, status, error };
}
