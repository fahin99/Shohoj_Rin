import type { ReactNode, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost' | 'navy';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    'inline-flex items-center justify-center gap-2 text-center font-medium leading-tight transition-all duration-100 select-none';

  const widthClass = fullWidth ? 'w-full' : '';

  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'min-h-7 px-2.5 py-1.5 text-xs rounded-[4px]',
    sm: 'min-h-9 px-3 py-2 text-sm rounded-[6px]',
    md: 'min-h-11 px-4 py-2.5 text-sm rounded-[6px]',
    lg: 'min-h-12 px-5 py-3 text-base rounded-[6px]',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-teal text-white border-[1.5px] border-navy shadow-nb-sm hover:opacity-90 active:shadow-nb-xs active:translate-y-px',
    secondary:
      'bg-white text-navy border-[1.5px] border-navy shadow-nb-sm hover:bg-stone-50 active:shadow-nb-xs active:translate-y-px',
    tertiary:
      'bg-teal-light text-teal-dark border-[1.5px] border-teal/50 hover:bg-teal/10 active:opacity-80',
    destructive:
      'bg-coral text-white border-[1.5px] border-navy shadow-nb-sm hover:opacity-90 active:shadow-nb-xs active:translate-y-px',
    ghost:
      'bg-transparent text-navy hover:bg-stone-100 active:bg-stone-200',
    navy:
      'bg-navy text-white border-[1.5px] border-navy shadow-nb-sm hover:bg-navy-mid active:shadow-nb-xs active:translate-y-px',
  };

  const disabledClass = isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      disabled={isDisabled}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${disabledClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0">{icon}</span>
      )}
    </button>
  );
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  children: ReactNode;
}

export function IconButton({
  variant = 'secondary',
  size = 'md',
  label,
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses: Record<ButtonSize, string> = {
    xs: 'w-7 h-7 rounded-[4px]',
    sm: 'w-9 h-9 rounded-[6px]',
    md: 'w-11 h-11 rounded-[6px]',
    lg: 'w-12 h-12 rounded-[6px]',
  };

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-teal text-white border-[1.5px] border-navy hover:opacity-90',
    secondary: 'bg-white text-navy border-[1.5px] border-stone-300 hover:border-navy hover:bg-stone-50',
    tertiary: 'bg-teal-light text-teal border-[1.5px] border-teal hover:bg-teal/10',
    destructive: 'bg-coral text-white border-[1.5px] border-navy hover:opacity-90',
    ghost: 'bg-transparent text-navy hover:bg-stone-100',
    navy: 'bg-navy text-white border-[1.5px] border-navy hover:bg-navy-mid',
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center shrink-0 transition-all duration-100 cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
