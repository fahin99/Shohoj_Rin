interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white' | 'teal';
  onClick?: () => void;
}

export function Logo({ size = 'md', variant = 'default', onClick }: LogoProps) {
  const sizes = {
    sm: { mark: 22, text: 'text-base' },
    md: { mark: 28, text: 'text-lg' },
    lg: { mark: 36, text: 'text-2xl' },
  };

  const textColor = variant === 'white' ? '#FAFAF8' : '#0D1B2A';
  const accentColor = variant === 'white' ? '#1BB8A3' : '#0D7377';
  const s = sizes[size];

  return (
    <button
      onClick={onClick}
      className="inline-flex min-w-0 cursor-pointer select-none items-center gap-2.5"
      type="button"
      aria-label="Shohoj Rin home"
    >
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="28" height="28" rx="6" fill={accentColor} />
        <rect x="1.5" y="1.5" width="25" height="25" rx="5" stroke={textColor === '#FAFAF8' ? 'rgba(255,255,255,0.2)' : '#0D1B2A'} strokeWidth="1.5" />
        <path
          d="M7 10C7 8.9 7.9 8 9 8H13.5C15.4 8 17 9.6 17 11.5C17 13.4 15.4 15 13.5 15H9V20H7V10Z"
          fill="white"
        />
        <path
          d="M14.5 15H16L20 20H17.5L14.5 15Z"
          fill="rgba(255,255,255,0.6)"
        />
        <rect x="9" y="10" width="4" height="3" rx="1" fill={accentColor} />
      </svg>
      <span
        className={`font-semibold ${s.text} tracking-tight`}
        style={{ color: textColor }}
      >
        Shohoj <span style={{ color: accentColor }}>Rin</span>
      </span>
    </button>
  );
}
