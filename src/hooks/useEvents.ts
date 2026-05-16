import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Event } from '../types/event';

interface UseEventsResult {
  events: Event[];
  loading: boolean;
  error: string | undefined;
  refetch: () => void;
}

export function useEvents(
  latitude?: number,
  longitude?: number,
  radiusKm: number = 100,
  shouldWaitLocation: boolean = true
): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchEvents = useCallback(async () => {
    // Jika diperintahkan menunggu tapi lokasi belum ada, jangan lanjut.
    if (shouldWaitLocation && latitude === undefined) {
      console.info('⏳ useEvents: Menunggu lokasi user...');
      return;
    }

    setLoading(true);
    setError(undefined);

    try {
      let data: Event[] | null = null;

      if (latitude !== undefined && longitude !== undefined) {
        console.info(`📡 useEvents: Mencari radius ${radiusKm}km...`);
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_events_v2', {
          user_lat: latitude,
          user_lon: longitude,
          radius_meters: radiusKm * 1000,
        });
        if (rpcError) throw rpcError;
        data = rpcData as Event[];
      } else {
        console.info('🌐 useEvents: Memuat data nasional (Global Mode)...');
        const { data: tableData, error: tableError } = await supabase
          .from('events')
          .select('*')
          .eq('status', 'active')
          .order('starts_at', { ascending: true })
          .limit(300); // Batasi 300 data biar peta tidak berat
        
        if (tableError) throw tableError;
        data = tableData as Event[];
      }

      setEvents(data ?? []);
      console.info(`✅ useEvents: Berhasil memuat ${data?.length || 0} event.`);
    } catch (err) {
      const error = err as Error;
      console.error('❌ useEvents Error:', error.message || error);
      setError(error.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm, shouldWaitLocation]);

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('schema-db-changes-events')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          console.info('🔄 useEvents: Ada perubahan data, me-refresh...');
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  const refetch = useCallback(() => fetchEvents(), [fetchEvents]);

  return { events, loading, error, refetch };
}
