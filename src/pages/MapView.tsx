import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEvents } from '../hooks/useEvents';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Calendar, User, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Import Cluster Styles
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ThemeTileLayer() {
  const isDark = document.documentElement.classList.contains('dark');
  const url = isDark 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url={url}
    />
  );
}

export const MapView: React.FC = () => {
  // MEMPERBAIKI DESTRUKTURISASI (Menambahkan error dan refetch)
  const { events, loading, error, refetch } = useEvents(undefined, undefined, 100, false); 
  // const [activeEvent, setActiveEvent] = useState<any>(null);

  const defaultCenter: [number, number] = [-7.5, 110]; 

  return (
    <div className="h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-[var(--border-color)] relative animate-in fade-in zoom-in duration-500">
      <MapContainer 
        center={defaultCenter} 
        zoom={7} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <ThemeTileLayer />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
        >
          {events.map((event) => (
            <Marker 
              key={event.id} 
              position={[event.latitude, event.longitude]}
              eventHandlers={{
                // click: () => setActiveEvent(event),
              }}
            >
              <Popup className="custom-popup">
                <div className="w-64 p-1">
                  <img 
                    src={event.image_url} 
                    alt={event.title} 
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-bold text-sm leading-tight mb-2 text-[var(--text-primary)]">
                    {event.title}
                  </h3>
                  <div className="space-y-1.5 mb-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <User size={12} />
                      <span className="truncate">{event.speaker}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>{format(new Date(event.starts_at), 'EEEE, d MMM', { locale: id })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={12} />
                      <span className="truncate">{event.location_name}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/event/${event.id}`}
                    className="block w-full py-2 bg-emerald-500 text-black text-center text-xs font-bold rounded-lg hover:bg-emerald-400 transition-colors"
                  >
                    LIHAT DETAIL
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-[1000] bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-color)] p-3 rounded-2xl shadow-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1 text-center">Data Map</p>
        <p className="text-xl font-black text-emerald-500">{events.length} <span className="text-xs font-normal text-[var(--text-primary)]">Kajian</span></p>
      </div>

      {loading && (
        <div className="absolute inset-0 z-[1001] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-color)] flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="font-bold text-sm">Memetakan Kajian...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-[1001] bg-black/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[var(--bg-surface)] p-8 rounded-3xl border border-red-500/20 flex flex-col items-center gap-4 shadow-2xl text-center max-w-xs">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
              <AlertCircle size={32} />
            </div>
            <h3 className="font-black text-lg">Oops! Error</h3>
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
            <button onClick={() => refetch()} className="w-full py-3 bg-white text-black font-black rounded-2xl">COBA LAGI</button>
          </div>
        </div>
      )}
    </div>
  );
};
