import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Settings, Plus, Trash2, CheckCircle2, 
  AlertCircle, Radio, Database, 
  RefreshCw, Calendar, MapPin, 
  User, ExternalLink, Search, CheckSquare, Square,
  ChevronLeft, ChevronRight, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

interface Target {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface EventRecord {
  id: string;
  title: string;
  speaker: string;
  location_name: string;
  starts_at: string;
  image_url: string;
  created_at: string;
}

export const Admin: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_events: 0, active_targets: 0 });
  const [activeTab, setActiveTab] = useState<'targets' | 'events'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [currentPage, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: targetsData } = await supabase.from('scraping_targets').select('*').order('created_at', { ascending: false });
      
      const start = currentPage * pageSize;
      const end = start + pageSize - 1;
      
      const { data: eventsData, count: totalCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (targetsData) setTargets(targetsData);
      if (eventsData) setEvents(eventsData);
      
      setStats({
        total_events: totalCount || 0,
        active_targets: targetsData?.length || 0
      });
    } catch (err) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  const addTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('scraping_targets').insert([{ title: newTitle.trim() }]);
    if (!error) {
      setNewTitle('');
      toast.success('Target baru ditambahkan');
      fetchData();
    } else {
      toast.error('Gagal menambah target');
    }
    setLoading(false);
  };

  const deleteTarget = async (id: string) => {
    if (!confirm('Hapus target ini?')) return;
    const { error } = await supabase.from('scraping_targets').delete().eq('id', id);
    if (!error) {
      toast.success('Target dihapus');
      fetchData();
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (!error) {
      toast.success('Event dihapus');
      fetchData();
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Hapus ${selectedIds.length} event?`)) return;
    setLoading(true);
    const { error } = await supabase.from('events').delete().in('id', selectedIds);
    if (!error) {
      toast.success('Event berhasil dihapus masal');
      fetchData();
    }
    setLoading(false);
  };

  const totalPages = Math.ceil(stats.total_events / pageSize);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] flex items-center gap-3">
            <Settings className="text-emerald-500" size={32} />
            Control Center
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">Kelola data dan target scraping MajlisAI</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black rounded-2xl text-sm font-black hover:bg-emerald-400 transition-all">
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)]">
          <Database className="text-emerald-500 mb-2" size={24} />
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Total Events</p>
          <p className="text-4xl font-black">{stats.total_events}</p>
        </div>
        <div className="p-6 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)]">
          <Radio className="text-blue-500 mb-2" size={24} />
          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Active Channels</p>
          <p className="text-4xl font-black">{stats.active_targets}</p>
        </div>
        <div className="p-6 bg-emerald-500 rounded-3xl">
          <CheckCircle2 className="text-black mb-2" size={24} />
          <p className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">System Status</p>
          <p className="text-4xl font-black text-black">ONLINE</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl w-fit">
        <button onClick={() => setActiveTab('events')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'events' ? 'bg-emerald-500 text-black' : 'text-[var(--text-secondary)]'}`}>Events Manager</button>
        <button onClick={() => setActiveTab('targets')} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'targets' ? 'bg-emerald-500 text-black' : 'text-[var(--text-secondary)]'}`}>Scraper Targets</button>
      </div>

      {activeTab === 'events' ? (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
              <input type="text" placeholder="Search events..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>
            {selectedIds.length > 0 && (
              <button onClick={bulkDelete} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-2xl text-sm font-black hover:bg-red-600 shadow-lg animate-in zoom-in">
                <Trash2 size={18} /> HAPUS {selectedIds.length}
              </button>
            )}
          </div>

          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-primary)]/50 text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-widest border-b border-[var(--border-color)]">
                  <th className="p-6 w-10"><button onClick={() => { if (selectedIds.length === events.length) setSelectedIds([]); else setSelectedIds(events.map(e => e.id)); }}>{selectedIds.length === events.length && events.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}</button></th>
                  <th className="p-6">Poster</th>
                  <th className="p-6">Info</th>
                  <th className="p-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {events
                  .filter(event => event.title.toLowerCase().includes(searchQuery.toLowerCase()) || event.location_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(event => (
                  <tr key={event.id} className={`hover:bg-[var(--bg-primary)]/30 transition-colors group ${selectedIds.includes(event.id) ? 'bg-emerald-500/5' : ''}`}>
                    <td className="p-6"><button onClick={() => setSelectedIds(prev => prev.includes(event.id) ? prev.filter(i => i !== event.id) : [...prev, event.id])} className={selectedIds.includes(event.id) ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}>{selectedIds.includes(event.id) ? <CheckSquare size={20} /> : <Square size={20} />}</button></td>
                    <td className="p-6 w-24"><img src={event.image_url} className="w-16 h-20 object-cover rounded-lg border border-[var(--border-color)]" /></td>
                    <td className="p-6">
                      <h4 className="font-bold leading-tight">{event.title}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-1">{format(new Date(event.starts_at), 'd MMM yyyy', { locale: id })} • {event.location_name}</p>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a href={event.image_url} target="_blank" className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg"><ExternalLink size={18} /></a>
                        <button onClick={() => deleteEvent(event.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-secondary)]">Showing {events.length} of {stats.total_events} events</p>
            <div className="flex items-center gap-2">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl disabled:opacity-30"><ChevronLeft size={18}/></button>
              <span className="text-sm font-bold">{currentPage + 1} / {totalPages || 1}</span>
              <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl disabled:opacity-30"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] space-y-4">
              <h3 className="font-bold flex items-center gap-2"><Plus className="text-emerald-500" size={20} /> Tambah Target</h3>
              <form onSubmit={addTarget} className="space-y-4">
                <input type="text" placeholder="Nama Grup/Channel..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-2xl focus:outline-none" />
                <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl hover:bg-emerald-400 transition-all">DAFTARKAN</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-color)] overflow-hidden divide-y divide-[var(--border-color)]">
              <div className="p-6 bg-[var(--bg-primary)]/30 flex items-center gap-2 font-bold text-sm"><Users size={18} className="text-emerald-500"/> Daftar Target Scraping</div>
              {targets.map(target => (
                <div key={target.id} className="p-6 flex items-center justify-between hover:bg-[var(--bg-primary)]/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">{target.title[0]}</div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{target.title}</p>
                      <p className="text-[10px] text-emerald-500 font-bold">ACTIVE MONITORING</p>
                    </div>
                  </div>
                  <button onClick={() => deleteTarget(target.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
