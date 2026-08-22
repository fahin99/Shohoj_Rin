interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'teal' | 'emerald' | 'coral' | 'sky' | 'yellow';
  className?: string;
}
const barColors = {
  teal: 'bg-teal',
  emerald: 'bg-emerald',
  coral: 'bg-coral',
  sky: 'bg-sky',
  yellow: 'bg-yellow',
};
const trackColors = {
  teal: 'bg-teal-light',
  emerald: 'bg-emerald-light',
  coral: 'bg-coral-light',
  sky: 'bg-sky-light',
  yellow: 'bg-yellow-light',
};
const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  color = 'teal',
  className = '',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-stone-600">{label}</span>}
          {showValue && (
            <span className="text-xs tabular-nums font-medium text-navy">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${heights[size]} rounded-full ${trackColors[color]} border border-stone-200 overflow-hidden`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
      >
        <div
          className={`h-full rounded-full ${barColors[color]} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
interface StepperStep {
  label: string;
  sublabel?: string;
}
interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
}
export function Stepper({ steps, currentStep, className = '' }: StepperProps) {
  return (
    <div className={`flex items-start gap-0 ${className}`}>
      {steps.map((step, i) => {
        const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming';
        const isLast = i === steps.length - 1;
        return (
          <div key={i} className={`flex flex-col items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex items-center w-full">
              <div
                className={`w-8 h-8 rounded-full border-[1.5px] flex items-center justify-center shrink-0 text-xs font-semibold transition-colors ${
                  state === 'done'
                    ? 'bg-teal border-teal text-white'
                    : state === 'active'
                    ? 'bg-white border-navy text-navy shadow-nb-xs'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}
              >
                {state === 'done' ? (
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-[1.5px] mx-1 ${state === 'done' ? 'bg-teal' : 'bg-stone-200'}`}
                />
              )}
            </div>
            <div className="mt-2 text-center max-w-[80px]">
              <p
                className={`text-xs font-medium leading-tight ${
                  state === 'active' ? 'text-navy' : state === 'done' ? 'text-teal' : 'text-stone-400'
                }`}
              >
                {step.label}
              </p>
              {step.sublabel && (
                <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">{step.sublabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
interface MiniStepperProps {
  total: number;
  current: number;
  label?: string;
}
export function MiniStepper({ total, current, label }: MiniStepperProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-teal' : i < current ? 'w-1.5 bg-teal/40' : 'w-1.5 bg-stone-300'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-stone-500">
        {label ?? `Step ${current + 1} of ${total}`}
      </span>
    </div>
  );
}
