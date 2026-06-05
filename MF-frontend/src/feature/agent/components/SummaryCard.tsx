// src/feature/agent/components/SummaryCard.tsx
import React from 'react';
import { cn } from '../../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  className?: string;
}

export const SummaryCard = React.memo(function SummaryCard({ 
  label, 
  value, 
  icon: Icon, 
  gradient = 'gradient-card-violet',
  className 
}: Props) {
  return (
    <div className={cn(
      "relative overflow-hidden p-4 rounded-3xl text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1",
      gradient,
      className
    )}>
      {/* Decorative background icon */}
      <div className="absolute -right-2 -bottom-2 opacity-10">
        <Icon size={80} />
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <div className="flex items-center gap-2 text-white/80">
          <Icon size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-extrabold tracking-tight">
          {value}
        </div>
      </div>
    </div>
  );
});
