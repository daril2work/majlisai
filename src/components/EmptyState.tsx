import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🕌',
  title,
  description,
  action,
}) => {
  return (
    <div className="glass-panel p-20 flex flex-col items-center justify-center text-center space-y-4">
      <div className="text-6xl">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-neutral-400 max-w-xs">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
