import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { 
  Calendar, Clock, MapPin, User, Share2, 
  ChevronLeft, Navigation, Download, ShieldCheck
} from 'lucide-react';
import { formatEventDate, formatEventTime } from '../lib/formatters';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, loading } = useEvents(); 
  
  const event = events.find(e => e.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--text-secondary)]">Kajian tidak ditemukan</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-emerald-500 flex items-center gap-2 mx-auto font-bold">
          <ChevronLeft size={20} /> Kembali
        </button>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--border-color)] rounded-full transition-all border border-[var(--border-color)]"
        >
          <ChevronLeft size={24} />
        </button>
        <button className="p-2 bg-[var(--bg-surface)] hover:bg-[var(--border-color)] rounded-full transition-all border border-[var(--border-color)]">
          <Share2 size={20} className="text-emerald-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Poster View */}
        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-[var(--bg-surface)]">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-full object-contain md:object-cover"
              />
              <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                {event.source_platform}
              </div>
            </div>
          </div>
          <button 
            className="w-full py-3 bg-[var(--bg-surface)] hover:bg-[var(--border-color)] rounded-xl border border-[var(--border-color)] transition-all flex items-center justify-center gap-2 text-sm font-medium text-[var(--text-primary)]"
            onClick={() => window.open(event.image_url, '_blank')}
          >
            <Download size={18} /> Simpan Poster
          </button>
        </div>

        {/* Right: Info View */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} />
              <span>Kajian Terverifikasi Sunnah</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
              {event.title || 'Kajian Sunnah'}
            </h1>
            <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)]">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <User className="text-emerald-500" size={24} />
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Pemateri / Ustadz</p>
                <p className="font-bold text-lg text-[var(--text-primary)]">{event.speaker || 'Pemateri Belum Diketahui'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)]">
              <Calendar className="text-emerald-500 mb-2" size={20} />
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Tanggal</p>
              <p className="font-bold text-sm text-[var(--text-primary)]">{formatEventDate(event.starts_at)}</p>
            </div>
            <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)]">
              <Clock className="text-emerald-500 mb-2" size={20} />
              <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Waktu</p>
              <p className="font-bold text-sm text-[var(--text-primary)]">{formatEventTime(event.starts_at)} WIB</p>
            </div>
          </div>

          <div className="p-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-emerald-500 mt-1 shrink-0" size={20} />
              <div>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase">Lokasi Majlis</p>
                <p className="font-bold text-sm leading-relaxed text-[var(--text-primary)]">{event.location_name}</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(googleMapsUrl, '_blank')}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Navigation size={20} fill="currentColor" />
              NAVIGASI KE LOKASI
            </button>
          </div>

          <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 italic text-sm text-[var(--text-secondary)]">
            "Barangsiapa menempuh suatu jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga." (HR. Muslim)
          </div>
        </div>

      </div>
    </div>
  );
};
