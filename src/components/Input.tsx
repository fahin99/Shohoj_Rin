import { useState } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface InputWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function InputWrapper({ label, error, hint, required, children }: InputWrapperProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-navy">
          {label}
          {required && <span className="text-coral ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-coral flex items-center gap-1"><span>⚠</span>{error}</p>}
      {!error && hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
}

const inputBase =
  'w-full bg-white text-navy text-sm rounded-[6px] border-[1.5px] border-stone-300 px-3 py-2.5 placeholder-stone-400 transition-colors duration-100 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20 disabled:opacity-50 disabled:cursor-not-allowed';

const inputError = 'border-coral focus:border-coral focus:ring-coral/20';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export function TextInput({ label, error, hint, required, prefix, suffix, className = '', ...props }: TextInputProps) {
  if (prefix || suffix) {
    return (
      <InputWrapper label={label} error={error} hint={hint} required={required}>
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-stone-500 text-sm pointer-events-none">{prefix}</span>
          )}
          <input
            className={`${inputBase} ${error ? inputError : ''} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${className}`}
            required={required}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-stone-500 text-sm pointer-events-none">{suffix}</span>
          )}
        </div>
      </InputWrapper>
    );
  }

  return (
    <InputWrapper label={label} error={error} hint={hint} required={required}>
      <input
        className={`${inputBase} ${error ? inputError : ''} ${className}`}
        required={required}
        {...props}
      />
    </InputWrapper>
  );
}

export function CurrencyInput({ label, error, hint, required, className = '', ...props }: Omit<TextInputProps, 'prefix'>) {
  return (
    <TextInput
      label={label}
      error={error}
      hint={hint}
      required={required}
      prefix="৳"
      type="number"
      min={0}
      step={100}
      className={`font-mono-sr ${className}`}
      {...props}
    />
  );
}

export function PasswordInput({ label, error, hint, required, className = '', ...props }: Omit<TextInputProps, 'type' | 'suffix' | 'prefix'>) {
  const [show, setShow] = useState(false);
  return (
    <InputWrapper label={label} error={error} hint={hint} required={required}>
      <div className="relative flex items-center">
        <input
          type={show ? 'text' : 'password'}
          className={`${inputBase} ${error ? inputError : ''} pr-10 ${className}`}
          required={required}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 text-stone-400 hover:text-stone-600 transition-colors text-xs"
          tabIndex={-1}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </InputWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, hint, required, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <InputWrapper label={label} error={error} hint={hint} required={required}>
      <div className="relative">
        <select
          className={`${inputBase} ${error ? inputError : ''} appearance-none pr-8 ${className}`}
          required={required}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400 text-xs">▼</span>
      </div>
    </InputWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, required, className = '', ...props }: TextareaProps) {
  return (
    <InputWrapper label={label} error={error} hint={hint} required={required}>
      <textarea
        className={`${inputBase} ${error ? inputError : ''} resize-y min-h-[100px] ${className}`}
        required={required}
        {...props}
      />
    </InputWrapper>
  );
}

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
}

export function SearchInput({ className = '', value, onClear, ...props }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-stone-400 text-sm pointer-events-none">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        type="search"
        value={value}
        className={`${inputBase} pl-9 pr-8 ${className}`}
        {...props}
      />
      {value && onClear && (
        <button type="button" onClick={onClear} className="absolute right-3 text-stone-400 hover:text-stone-600 text-sm">×</button>
      )}
    </div>
  );
}

interface CheckboxProps {
  label: ReactNode;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
  indeterminate?: boolean;
}

export function Checkbox({ label, checked, onChange, disabled, error, hint }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`flex items-start gap-2.5 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span
          className={`w-4 h-4 shrink-0 mt-0.5 rounded-[3px] border-[1.5px] flex items-center justify-center transition-colors ${
            checked ? 'bg-teal border-teal' : 'bg-white border-stone-300 group-hover:border-teal'
          } ${error ? 'border-coral' : ''}`}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        <span className="text-sm text-navy">{label}</span>
      </label>
      {error && <p className="text-xs text-coral ml-6.5">{error}</p>}
      {hint && <p className="text-xs text-stone-500 ml-6.5">{hint}</p>}
    </div>
  );
}

interface RadioProps {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (v: string) => void;
  disabled?: boolean;
}

export function Radio({ label, name, value, checked, onChange, disabled }: RadioProps) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <span
        className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
          checked ? 'border-teal' : 'border-stone-300 group-hover:border-teal'
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-teal" />}
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.(value)}
        className="sr-only"
      />
      <span className="text-sm text-navy">{label}</span>
    </label>
  );
}

interface ToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label className={`flex items-center gap-2.5 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`w-10 h-5.5 rounded-full border-[1.5px] relative transition-colors duration-200 ${
          checked ? 'bg-teal border-teal' : 'bg-stone-200 border-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-stone-300 shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-4.5 border-teal/30' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && <span className="text-sm text-navy">{label}</span>}
    </label>
  );
}

interface FileUploadProps {
  label?: string;
  hint?: string;
  error?: string;
  accept?: string;
  onChange?: (files: FileList | null) => void;
}

export function FileUpload({ label, hint, error, accept, onChange }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileName(files && files.length > 0 ? files[0].name : null);
    onChange?.(files);
  };

  return (
    <InputWrapper label={label} error={error} hint={hint ?? 'PDF, JPG, PNG up to 5MB'}>
      <label
        className={`flex flex-col items-center justify-center gap-2 p-6 rounded-[6px] border-[1.5px] border-dashed cursor-pointer transition-colors ${
          error ? 'border-coral bg-coral-light/30' : 'border-stone-300 bg-white hover:border-teal hover:bg-teal-light/30'
        }`}
      >
        <input type="file" accept={accept} onChange={handleChange} className="sr-only" />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-stone-400">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {fileName ? (
          <span className="text-sm text-teal font-medium">{fileName}</span>
        ) : (
          <span className="text-sm text-stone-500">
            <span className="text-teal font-medium">Browse file</span> or drag and drop
          </span>
        )}
      </label>
    </InputWrapper>
  );
}
