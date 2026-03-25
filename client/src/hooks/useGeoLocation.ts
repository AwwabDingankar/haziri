import { useState, useEffect, useCallback } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeoLocation() {
  const [state, setState] = useState<GeoState>({ lat: null, lng: null, error: null, loading: false });

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.' }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ lat: pos.coords.latitude, lng: pos.coords.longitude, error: null, loading: false });
      },
      (err) => {
        setState({ lat: null, lng: null, error: err.message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { request(); }, [request]);

  return { ...state, request };
}
