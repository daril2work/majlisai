import React from 'react';
import { Calendar, Clock, MapPin, Share2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../types/event';
import { formatEventDate, formatEventTime, formatDistance } from '../lib/formatters';

interface EventCardProps {
  event: Event;
  onDetail?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onDetail }) => {
  const navigate = useNavigate();
  
  const handleDetail = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div 
      className="glass-panel group overflow-hidden transition-all duration-500 cursor-pointer hover:scale-[1.02]"
      onClick={handleDetail}
    >
      {/* Poster Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--bg-surface)]">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center text-[var(--text-secondary)] text-sm italic">
            Poster belum tersedia
          </div>
        )}

        {/* Source Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            {event.source_platform}
          </span>
        </div>

        {/* Distance Badge */}
        {event.distance !== undefined && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-emerald-500 text-black rounded-full text-xs font-bold">
              {formatDistance(event.distance)}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-emerald-500 transition-colors text-[var(--text-primary)]">
            {event.title || 'Kajian Sunnah'}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm mt-1 line-clamp-1">{event.speaker}</p>
        </div>

        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-emerald-500 shrink-0" />
            <span>{formatEventDate(event.starts_at)}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-emerald-500 shrink-0" />
            <span>{formatEventTime(event.starts_at)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-emerald-500 shrink-0" />
            <span className="line-clamp-1">{event.location_name}</span>
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <button
            className="flex-1 btn-primary py-2.5"
            onClick={() => onDetail?.(event)}
          >
            <ExternalLink size={18} />
            Detail
          </button>
          <button
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-neutral-400 hover:text-white"
            aria-label="Bagikan"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

    </div>
  );
};
