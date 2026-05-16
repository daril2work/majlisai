import React, { useState } from 'react';
import { Search as SearchIcon, MapPin, Loader2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { toast } from 'sonner';

export const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetCoords, setTargetCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [cityName, setCityName] = useState('');

  // Panggil useEvents hanya jika targetCoords sudah ada
  const { events, loading: eventsLoading } = useEvents(
    targetCoords?.lat, 
    targetCoords?.lon, 
    50, // Radius lebih kecil untuk pencarian kota agar lebih akurat (50km)
    targetCoords === null // Tunggu sampai ada koordinat
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setTargetCoords(null); // Reset hasil lama

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', Indonesia')}&format=json&limit=1`, {
        headers: { 'User-Agent': 'MajlisAI-App' }
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setTargetCoords({ lat, lon });
        setCityName(data[0].display_name.split(',')[0]);
        toast.success(`Menemukan lokasi: ${data[0].display_name.split(',')[0]}`);
      } else {
        toast.error('Lokasi tidak ditemukan. Coba nama kota lain.');
      }
    } catch {
      toast.error('Gagal mencari lokasi. Cek koneksi internet Anda.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      
      {/* Search Header */}
      <div className="bg-emerald-500 rounded-[3rem] p-8 md:p-12 text-black shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight leading-none">Cari Kajian <br/>di Mana Pun.</h1>
            <p className="font-medium text-black/60 max-w-sm">Ketik nama kota, kecamatan, atau provinsi untuk melihat majlis ilmu di sana.</p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-black/40 group-focus-within:text-black transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Contoh: Yogyakarta, Malang, Bekasi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/90 backdrop-blur-md border-2 border-transparent focus:border-black/10 py-5 pl-14 pr-6 rounded-3xl text-lg font-bold placeholder:text-black/20 focus:outline-none focus:bg-white transition-all shadow-xl"
            />
            <button 
              type="submit" 
              disabled={isSearching}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'CARI'}
            </button>
          </form>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/5 rounded-full blur-2xl"></div>
        <div className="absolute right-20 top-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {targetCoords ? (
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-2">
                <MapPin className="text-emerald-500" />
                Sekitar {cityName}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] font-medium">Menampilkan kajian dalam radius 50km</p>
            </div>
            <p className="text-sm font-black text-emerald-500">{events.length} DITEMUKAN</p>
          </div>
        ) : !isSearching && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-[var(--bg-surface)] rounded-full mx-auto flex items-center justify-center border border-[var(--border-color)]">
              <Navigation className="text-[var(--text-secondary)]" size={32} />
            </div>
            <p className="text-[var(--text-secondary)] font-medium">Masukkan lokasi untuk memulai pencarian</p>
          </div>
        )}

        {(isSearching || eventsLoading) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-[var(--bg-surface)] rounded-3xl animate-pulse border border-[var(--border-color)]"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onDetail={(e) => navigate(`/event/${e.id}`)} />
            ))}
          </div>
        ) : targetCoords && (
          <EmptyState 
            title="Tidak Ada Kajian" 
            description={`Belum ditemukan kajian aktif di sekitar ${cityName}. Coba cari kota besar terdekat.`}
          />
        )}
      </div>

    </div>
  );
};
