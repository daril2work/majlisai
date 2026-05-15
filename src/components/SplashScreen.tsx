import React, { useEffect, useState } from 'react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Mulai animasi fade-out setelah 2 detik
    const fadeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    // Hapus komponen dari DOM setelah animasi selesai (total 2.5 detik)
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      {/* Glow Effect */}
      <div className="absolute w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse"></div>
      
      <div className="relative flex flex-col items-center gap-6 animate-in zoom-in fade-in duration-1000">
        {/* Logo Container */}
        <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] rotate-12 hover:rotate-0 transition-transform">
          <span className="text-5xl font-black text-black">M</span>
        </div>
        
        {/* Text Area */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            Majlis<span className="text-emerald-500">AI</span>
          </h1>
          <div className="space-y-1">
            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] pl-1">
              Islamic Event Engine
            </p>
            <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.2em]">
              Berbasis Artificial Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      <div className="absolute bottom-20 w-32 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 w-full origin-left animate-loading-bar"></div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-10">
        <p className="text-[9px] text-neutral-600 font-medium tracking-widest uppercase">Version 3.1 Pro</p>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
