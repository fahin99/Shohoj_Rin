import type { ReactNode } from 'react';
export type CardVariant = 'plain' | 'raised' | 'accent' | 'muted';
interface CardProps {
  variant?: CardVariant;
  as?: 'div' | 'article' | 'section' | 'li';
  className?: string;
  children: ReactNode;
}
const variantClasses: Record<CardVariant, string> = {
  plain: 'bg-white border-[1.5px] border-stone-200',
  raised: 'bg-white border-[1.5px] border-navy shadow-nb',
  accent: 'bg-teal-light border-[1.5px] border-teal/30',
  muted: 'bg-stone-50 border border-stone-200',
};
export function Card({ variant = 'plain', as: Tag = 'div', className = '', children }: CardProps) {
  return (
    <Tag className={`min-w-0 rounded-[8px] ${variantClasses[variant]} ${className}`}>{children}</Tag>
  );
}
export function CardHeader({
  title,
  description,
  action,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-stone-200 px-4 py-3.5 sm:px-5 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="text-[0.9375rem] font-semibold text-navy">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
export function CardBody({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`min-w-0 p-4 sm:p-5 ${className}`}>{children}</div>;
}
/** Label/value row used across every financial breakdown. */
export function DataRow({
  label,
  value,
  emphasis = false,
  hint,
}: {
  label: ReactNode;
  value: ReactNode;
  emphasis?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-1.5">
      <span className={`min-w-0 text-sm ${emphasis ? 'font-medium text-navy' : 'text-stone-500'}`}>
        {label}
        {hint && <span className="mt-0.5 block text-xs text-stone-400">{hint}</span>}
      </span>
      <span
        className={`tabular-nums shrink-0 text-right ${
          emphasis ? 'text-base font-semibold text-navy' : 'text-sm font-medium text-navy'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
