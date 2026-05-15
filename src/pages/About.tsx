import React from 'react';
import { 
  Bot, Cpu, Map as MapIcon, 
  MessageSquare, ShieldCheck, Zap, 
  Globe, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
          <span className="text-4xl font-black text-black">M</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">
          Tentang Majlis<span className="text-emerald-500">AI</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Platform navigasi kajian sunnah otomatis yang digerakkan oleh Artificial Intelligence untuk membantu santri menemukan ilmu dengan lebih mudah.
        </p>
      </div>

      {/* The Pipeline Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Connection Lines (Desktop only) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2 z-0"></div>

        <div className="relative z-10 bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] space-y-4 hover:border-emerald-500/50 transition-colors shadow-xl">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-xl text-[var(--text-primary)]">1. Ingestion</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Bot cerdas kami memantau ratusan channel dan grup Telegram secara real-time untuk mencari poster dan siaran kajian.
          </p>
        </div>

        <div className="relative z-10 bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] space-y-4 hover:border-emerald-500/50 transition-colors shadow-xl">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
            <Cpu size={24} />
          </div>
          <h3 className="font-bold text-xl text-[var(--text-primary)]">2. AI Analysis</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            AI (GPT-4o) membedah setiap data, menyaring hoax/nasihat umum, dan mengekstrak jadwal serta lokasi secara akurat.
          </p>
        </div>

        <div className="relative z-10 bg-[var(--bg-surface)] p-8 rounded-3xl border border-[var(--border-color)] space-y-4 hover:border-emerald-500/50 transition-colors shadow-xl">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center">
            <MapIcon size={24} />
          </div>
          <h3 className="font-bold text-xl text-[var(--text-primary)]">3. Navigation</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Data yang sudah bersih langsung disajikan dalam bentuk peta interaktif dan feed yang rapi untuk Anda gunakan.
          </p>
        </div>
      </div>

      {/* Vision Section */}
      <div className="bg-emerald-500 rounded-[3rem] p-10 md:p-16 text-black overflow-hidden relative group">
        <Zap className="absolute -right-10 -top-10 w-64 h-64 text-black/5 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-black tracking-tight italic">Misi Kami</h2>
          <p className="text-xl font-medium leading-relaxed opacity-90">
            "Menghubungkan santri dengan majelis ilmu sunnah melalui teknologi otomatisasi, sehingga tidak ada lagi kajian yang terlewatkan hanya karena informasi yang berantakan."
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-400 overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">Digerakkan oleh Komunitas</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Bot, label: 'Telegram Bot' },
          { icon: Cpu, label: 'OpenAI GPT-4o' },
          { icon: ShieldCheck, label: 'Supabase DB' },
          { icon: Globe, label: 'OpenStreetMap' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl flex flex-col items-center gap-3">
            <item.icon className="text-emerald-500" size={24} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="text-center pt-8">
        <p className="text-[var(--text-secondary)] mb-6">Punya masukan atau ingin berkontribusi?</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
        >
          KEMBALI KE FEED <ArrowRight size={18} />
        </Link>
      </div>

    </div>
  );
};
