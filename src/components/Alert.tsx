import { useState } from 'react';
import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  className?: string;
  icon?: ReactNode;
}

const variantConfig: Record<AlertVariant, {
  bg: string; border: string; title: string; text: string; iconDefault: string;
}> = {
  info: {
    bg: 'bg-sky-light',
    border: 'border-sky/40',
    title: 'text-sky',
    text: 'text-navy-mid',
    iconDefault: 'ℹ',
  },
  success: {
    bg: 'bg-emerald-light',
    border: 'border-emerald/40',
    title: 'text-emerald',
    text: 'text-navy-mid',
    iconDefault: '✓',
  },
  warning: {
    bg: 'bg-yellow-light',
    border: 'border-yellow/50',
    title: 'text-stone-700',
    text: 'text-stone-600',
    iconDefault: '!',
  },
  error: {
    bg: 'bg-coral-light',
    border: 'border-coral/40',
    title: 'text-coral',
    text: 'text-navy-mid',
    iconDefault: '✕',
  },
};

export function Alert({ variant = 'info', title, children, dismissible = false, className = '', icon }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const cfg = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`flex gap-3 p-4 rounded-[6px] border ${cfg.bg} ${cfg.border} ${className}`}
    >
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${cfg.title}`}>
        {icon ?? cfg.iconDefault}
      </span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={`text-sm font-semibold mb-0.5 ${cfg.title}`}>{title}</p>
        )}
        <div className={`text-sm leading-relaxed ${cfg.text}`}>{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors text-lg leading-none mt-0.5"
          aria-label="Dismiss"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
}

interface NotificationProps {
  title: string;
  message: string;
  time?: string;
  unread?: boolean;
  variant?: AlertVariant;
}

export function Notification({ title, message, time, unread = false, variant = 'info' }: NotificationProps) {
  const dotColor: Record<AlertVariant, string> = {
    info: 'bg-sky',
    success: 'bg-emerald',
    warning: 'bg-yellow',
    error: 'bg-coral',
  };

  return (
    <div className={`flex gap-3 p-3.5 rounded-[6px] border transition-colors ${unread ? 'bg-teal-light border-teal/30' : 'bg-white border-stone-200'}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${unread ? dotColor[variant] : 'bg-stone-300'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-navy">{title}</p>
        <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{message}</p>
        {time && <p className="text-xs text-stone-400 mt-1">{time}</p>}
      </div>
    </div>
  );
}
