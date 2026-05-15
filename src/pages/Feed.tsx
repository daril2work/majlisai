import React, { useEffect } from 'react';
import { Navigation, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useGeolocation } from '../hooks/useGeolocation';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';

export const Feed: React.FC = () => {
  const navigate = useNavigate();
  const { coords, status: geoStatus, error: geoError } = useGeolocation();
  
  // Beritahu hook useEvents untuk menunggu selama status lokasi masih 'loading' atau 'idle'
  const { events, loading, error, refetch } = useEvents(
    coords?.lat, 
    coords?.lon, 
    100, 
    geoStatus === 'loading' || geoStatus === 'idle'
  );

  // Show toast on geolocation state change
  useEffect(() => {
    if (geoStatus === 'success') {
      toast.success('Lokasi ditemukan! Menampilkan kajian terdekat.');
    } else if (geoStatus === 'error') {
      toast.error(`Lokasi tidak tersedia: ${geoError ?? 'izin ditolak'}. Menampilkan semua kajian.`);
    }
  }, [geoStatus, geoError]);

  const handleDetail = (event: { id: string }) => {
    navigate(`/event/${event.id}`);
  };


  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-400 gap-4">
        <p className="text-sm">Error: {error}</p>
        <button className="btn-primary px-6" onClick={refetch}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight">
            Kajian <span className="text-emerald-500">Terdekat</span>
          </h2>
          <div className="flex items-center gap-2 mt-2 text-neutral-400">
            <MapPin size={16} />
            <p>
              {loading
                ? 'Mencari kajian...'
                : `${events.length} majlis ilmu ditemukan`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex items-center gap-2 text-sm font-bold">
            <Navigation size={16} />
            Radius 100km
          </span>
        </div>
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="animate-pulse">Sedang mencari majlis ilmu...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} onDetail={handleDetail} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Kajian"
          description="Tidak ditemukan kajian aktif dalam radius ini. Coba perlebar radius atau cari di kota lain."
          action={
            <button className="btn-primary px-6" onClick={refetch}>
              Muat Ulang
            </button>
          }
        />
      )}

    </div>
  );
};
