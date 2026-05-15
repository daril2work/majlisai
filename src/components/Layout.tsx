import React, { useState, useEffect } from 'react';
import { Home, Search, Map as MapIcon, Settings, LogOut, Sun, Moon, Info } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavRoute {
  icon: React.ElementType;
  label: string;
  path: string;
  isPrimary?: boolean;
}

const NAV_ROUTES: NavRoute[] = [
  { icon: Home,       label: 'Feed',    path: '/' },
  { icon: Search,     label: 'Cari',    path: '/search', isPrimary: true },
  { icon: MapIcon,    label: 'Map',     path: '/map' },
];

const MobileNavItem: React.FC<{ route: NavRoute; isActive: boolean }> = ({ route, isActive }) => {
  if (route.isPrimary) {
    return (
      <Link to={route.path} className="relative -top-7 flex flex-col items-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-4 border-[var(--bg-surface)] ${
          isActive ? 'bg-emerald-500 text-black shadow-emerald-500/40' : 'bg-emerald-600 text-white shadow-emerald-600/10'
        }`}>
          <route.icon size={32} strokeWidth={2.5} />
        </div>
        <span className={`text-[10px] font-bold mt-1 uppercase tracking-widest ${isActive ? 'text-emerald-500' : 'text-neutral-500'}`}>{route.label}</span>
      </Link>
    );
  }
  return (
    <Link to={route.path} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-500' : 'text-neutral-500'}`}>
      <route.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[10px] uppercase font-bold tracking-widest">{route.label}</span>
    </Link>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className={`flex h-[100dvh] bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans selection:bg-emerald-500/30`}>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex-col p-6 hidden md:flex">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="font-bold text-xl text-black">M</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">MajlisAI</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ROUTES.map((route) => (
            <Link key={route.path} to={route.path} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
              isActive(route.path) ? 'bg-emerald-500/10 text-emerald-500 font-medium' : 'text-[var(--text-secondary)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}>
              <route.icon size={20} /> {route.label}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-[var(--border-color)] space-y-2">
          <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-4 px-4 py-3 text-[var(--text-secondary)] hover:bg-[var(--border-color)] rounded-xl transition-all">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto bg-[var(--bg-primary)] scroll-smooth">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm text-black">M</span>
            </div>
            <span className="font-black tracking-tight text-lg">MajlisAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="p-2 rounded-full bg-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-500 transition-colors">
              <Info size={18} />
            </Link>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full bg-[var(--border-color)]">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-[var(--border-color)] overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fahmi" alt="avatar" />
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-6 pb-32 md:pb-6">
          {children}
        </div>
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-surface)]/90 backdrop-blur-2xl border-t border-[var(--border-color)] flex items-center justify-around md:hidden px-4 z-50">
        {NAV_ROUTES.map((route) => (
          <MobileNavItem key={route.path} route={route} isActive={isActive(route.path)} />
        ))}
      </nav>
    </div>
  );
};
