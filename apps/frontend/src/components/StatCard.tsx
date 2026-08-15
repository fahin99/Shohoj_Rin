import type { ReactNode } from 'react';

export type StatTone = 'default' | 'positive' | 'attention' | 'critical' | 'info';

const toneClasses: Record<StatTone, { border: string; value: string }> = {
  default: { border: 'border-stone-200', value: 'text-navy' },
  positive: { border: 'border-emerald/30', value: 'text-emerald' },
  attention: { border: 'border-yellow/50', value: 'text-yellow-dark' },
  critical: { border: 'border-coral/30', value: 'text-coral' },
  info: { border: 'border-sky/30', value: 'text-sky' },
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: StatTone;
  icon?: ReactNode;
  raised?: boolean;
}

/** Financial summary card. Value stays legible at any string length. */
export function StatCard({ label, value, hint, tone = 'default', icon, raised = false }: StatCardProps) {
  const t = toneClasses[tone];
  return (
    <div
      className={`flex min-w-0 flex-col gap-1 rounded-[8px] border-[1.5px] bg-white p-4 ${
        raised ? 'border-navy shadow-nb-sm' : t.border
      }`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="shrink-0 text-stone-400">{icon}</span>}
        <p className="min-w-0 text-xs font-medium uppercase tracking-wide text-stone-500">{label}</p>
      </div>
      <p className={`font-display tabular-nums text-xl font-semibold leading-tight sm:text-2xl ${t.value}`}>{value}</p>
      {hint && <p className="text-xs leading-snug text-stone-500">{hint}</p>}
    </div>
  );
}
