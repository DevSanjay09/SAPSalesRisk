import React from 'react';

const config = {
  High:   { base: 'badge-high',   dot: 'bg-red-500' },
  Medium: { base: 'badge-medium', dot: 'bg-amber-500' },
  Low:    { base: 'badge-low',    dot: 'bg-green-500' },
};

export default function RiskBadge({ level, showDot = true, size = 'sm' }) {
  const cfg = config[level] || config.Low;
  const sizeClass = size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${cfg.base} ${sizeClass}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />}
      {level}
    </span>
  );
}
