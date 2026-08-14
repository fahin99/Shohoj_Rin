import { useState, type FormEvent } from 'react';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import { TextInput, PasswordInput, Checkbox } from '../components/Input';
import { Alert } from '../components/Alert';
import type { PageName } from '../types';
import { apiRequest } from '../lib/api';
import { storeUser } from '../lib/session';

type AuthMode = 'login' | 'register' | 'forgot';

interface AuthPageProps {
  onNavigate: (page: PageName) => void;
}

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '', remember: false
  });

  const update = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode === 'login' && !form.email) errs.email = 'Email, phone, or admin ID is required';
    if (mode === 'register' && !form.email) errs.email = 'Email address is required';
    if (mode !== 'forgot' && !form.password) errs.password = 'Password is required';
    if (mode === 'register') {
      if (!form.name) errs.name = 'Full name is required';
      if (form.password && form.password.length < 8) errs.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    }
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError('');

    try {
      if (mode === 'forgot') {
        setSuccess(true);
        return;
      }

      const payload = mode === 'register'
        ? {
            fullName: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            password: form.password,
          }
        : {
            identifier: form.email.trim(),
            password: form.password,
          };

      const data = await apiRequest<{ user: unknown; accessToken: string; refreshToken: string }>(
        mode === 'register' ? '/auth/register' : '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );

      storeUser(data.user as never);

      onNavigate(mode === 'register' ? 'onboarding' : 'borrower-dashboard');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Left: branding panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy flex-col justify-between p-10">
        <Logo variant="white" size="lg" onClick={() => onNavigate('landing')} />
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Your financial journey starts here.
          </h2>
          <p className="text-stone-400 leading-relaxed mb-8">
            Simple, transparent, and designed for first-time borrowers. Understand exactly what you borrow and what you repay.
          </p>
          <div className="space-y-3">
            {[
              'Compare loans from multiple providers',
              'Understand every term in plain language',
              'Track repayments in one clear dashboard',
            ].map((pt) => (
              <div key={pt} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 3L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-stone-300">{pt}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-stone-600">© 2025 Shohoj_Rin Technologies Ltd. BFIU Registered.</p>
      </div>

      {/* Right: form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo onClick={() => onNavigate('landing')} />
          </div>

          {/* Mode switcher (login/register only) */}
          {mode !== 'forgot' && (
            <div className="flex gap-0 mb-7 bg-stone-100 border border-stone-200 rounded-[6px] p-1">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setErrors({}); setSuccess(false); }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-[4px] transition-all ${
                    mode === m ? 'bg-white text-navy shadow-nb-xs border border-stone-200' : 'text-stone-500 hover:text-navy'
                  }`}
                >
                  {m === 'login' ? 'Log in' : 'Register'}
                </button>
              ))}
            </div>
          )}

          <div className="mb-6">
            <h1 className="font-display text-2xl text-navy">
              {mode === 'login' ? 'Welcome back' : mode === 'register' ? 'Create your account' : 'Reset your password'}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {mode === 'login' ? 'Log in to manage your loans and repayments.' : mode === 'register' ? 'Get started — it only takes a few minutes.' : 'Enter your email and we will send a reset link.'}
            </p>
          </div>

          {success && mode === 'forgot' && (
            <Alert variant="success" title="Reset link sent" dismissible>
              Check your inbox — we sent a password reset link to your email address.
            </Alert>
          )}

          {apiError && (
            <Alert variant="error" title="Authentication failed" dismissible>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'register' && (
              <TextInput
                label="Full name"
                placeholder="Rahim Uddin"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                error={errors.name}
                required
                autoComplete="name"
              />
            )}

            <TextInput
              label={mode === 'login' ? 'Email, phone, or admin ID' : 'Email address'}
              type={mode === 'login' ? 'text' : 'email'}
              placeholder={mode === 'login' ? 'admin' : 'you@example.com'}
              value={form.email}
              onChange={e => update('email', e.target.value)}
              error={errors.email}
              required
              autoComplete={mode === 'login' ? 'username' : 'email'}
            />

            {mode === 'register' && (
              <TextInput
                label="Phone number"
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                hint="We will send verification codes to this number."
              />
            )}

            {mode !== 'forgot' && (
              <PasswordInput
                label="Password"
                placeholder={mode === 'register' ? 'At least 8 characters' : '••••••••'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                error={errors.password}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            )}

            {mode === 'register' && (
              <PasswordInput
                label="Confirm password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={e => update('confirm', e.target.value)}
                error={errors.confirm}
                required
                autoComplete="new-password"
              />
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={form.remember}
                  onChange={v => update('remember', v)}
                />
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setErrors({}); setSuccess(false); }}
                  className="text-sm text-teal hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {mode === 'register' && (
              <Checkbox
                label={<span>I agree to the <a href="#" className="text-teal hover:underline">Terms of Service</a> and <a href="#" className="text-teal hover:underline">Privacy Policy</a></span>}
                checked={form.remember}
                onChange={v => update('remember', v)}
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {mode === 'login' ? 'Log in' : mode === 'register' ? 'Create account' : 'Send reset link'}
            </Button>

            {mode !== 'forgot' && (
              <>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-stone-200" />
                  <span className="text-xs text-stone-400">or continue with</span>
                  <div className="flex-1 h-px bg-stone-200" />
                </div>
                <Button type="button" variant="secondary" size="md" fullWidth>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}
          </form>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setErrors({}); setSuccess(false); }}
              className="mt-4 w-full text-sm text-stone-500 hover:text-navy flex items-center justify-center gap-1"
            >
              ← Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
