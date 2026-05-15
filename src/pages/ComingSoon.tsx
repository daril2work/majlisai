import React from 'react';
import { Hammer } from 'lucide-react';

interface ComingSoonProps {
  feature?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ feature = 'Fitur ini' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-32 text-center space-y-4 text-neutral-500">
      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
        <Hammer size={36} className="text-neutral-600" />
      </div>
      <h3 className="text-2xl font-bold text-neutral-300">{feature}</h3>
      <p className="max-w-xs text-neutral-500">Fitur ini sedang dalam pengembangan dan akan segera hadir.</p>
    </div>
  );
};
