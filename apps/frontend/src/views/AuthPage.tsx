import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { TextInput, PasswordInput, Checkbox } from "../components/Input";
import { Alert } from "../components/Alert";
import type { PageName } from "../types";
import { apiRequest } from "../lib/api";
type AuthMode = "login" | "register" | "forgot";
interface AuthPageProps {
  onNavigate: (page: PageName) => void;
}
export default function AuthPage({ onNavigate }: AuthPageProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [role, setRole] = useState<"borrower" | "lender">("borrower");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    remember: false,
  });
  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (mode !== "forgot" && !form.password) errs.password = "Password is required";
    if ((mode === "login" || mode === "forgot") && !form.email)
      errs.email = "Email, phone, or username is required";
    if (mode === "register") {
      if (!form.name.trim()) errs.name = "Username is required";
      else if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(form.name.trim()))
        errs.name = "Use 3-50 letters, numbers, dots, underscores, or hyphens";
      if (!form.email) errs.email = "Email address is required";
      if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
      if (form.password !== form.confirm) errs.confirm = "Passwords do not match";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setApiError("");
    try {
      if (mode === "forgot") {
        setSuccess(true);
        return;
      }
      if (mode === "register") {
        const result = await apiRequest<{ user: { role: "borrower" | "lender" } }>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({
              username: form.name.trim(),
              email: form.email.trim(),
              phone: form.phone.trim() || undefined,
              password: form.password,
              role,
            }),
          },
        );
        onNavigate(result.user.role === "lender" ? "investor-onboarding" : "onboarding");
      } else {
        const result = await apiRequest<{ user: { role: "borrower" | "lender" | "admin" } }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ identifier: form.email.trim(), password: form.password }),
        });
        if (result.user.role === "admin") {
          onNavigate("admin");
        } else if (result.user.role === "lender") {
          onNavigate("lender-dashboard");
        } else {
          onNavigate("borrower-dashboard");
        }
      }
      router.refresh();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-offwhite flex">
      <div className="hidden lg:flex lg:w-[45%] bg-navy flex-col justify-between p-10">
        <Logo variant="white" size="lg" onClick={() => onNavigate("landing")} />
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            Your financial journey starts here.
          </h2>
          <p className="text-stone-400 leading-relaxed">
            Simple, transparent, and designed for first-time borrowers.
          </p>
        </div>
        <p className="text-xs text-stone-600">
          © 2025 Shohoj Rin Technologies Ltd. BFIU Registered.
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo onClick={() => onNavigate("landing")} />
          </div>
          {mode !== "forgot" && (
            <div className="flex mb-7 bg-stone-100 border border-stone-200 rounded-[6px] p-1">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setErrors({});
                    setSuccess(false);
                  }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-[4px] ${mode === m ? "bg-white text-navy shadow-nb-xs" : "text-stone-500"}`}
                >
                  {m === "login" ? "Log in" : "Register"}
                </button>
              ))}
            </div>
          )}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-navy">
              {mode === "login"
                ? "Welcome back"
                : mode === "register"
                  ? "Create your account"
                  : "Reset your password"}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {mode === "login"
                ? "Log in to manage your loans and repayments."
                : mode === "register"
                  ? "Get started — it only takes a few minutes."
                  : "Enter your email and we will send a reset link."}
            </p>
          </div>
          {success && mode === "forgot" && (
            <Alert variant="success" title="Reset link sent" dismissible>
              Check your inbox — we sent a password reset link.
            </Alert>
          )}
          {apiError && (
            <Alert variant="error" title="Authentication failed" dismissible>
              {apiError}
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <TextInput
                label="Username"
                placeholder="rahim_uddin"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                error={errors.name}
                hint="This is your account username, not your full name."
                required
                autoComplete="username"
              />
            )}
            <TextInput
              label={mode === "login" ? "Email, phone, or username" : "Email address"}
              type={mode === "login" ? "text" : "email"}
              placeholder={mode === "login" ? "you@example.com" : "you@example.com"}
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              required
              autoComplete={mode === "login" ? "username" : "email"}
            />
            {mode === "register" && (
              <TextInput
                label="Phone number"
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                hint="We will send verification codes to this number."
              />
            )}
            {mode === "register" && (
              <div>
                <p className="text-sm font-medium text-navy mb-3">I want to join as</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("borrower")}
                    className={`text-left p-4 border-[1.5px] rounded-[6px] ${role === "borrower" ? "border-teal bg-teal-light text-teal" : "border-stone-200 bg-white text-stone-600"}`}
                  >
                    <p className="font-medium">Customer / Borrower</p>
                    <p className="text-xs mt-1">I want to apply for loans.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("lender")}
                    className={`text-left p-4 border-[1.5px] rounded-[6px] ${role === "lender" ? "border-teal bg-teal-light text-teal" : "border-stone-200 bg-white text-stone-600"}`}
                  >
                    <p className="font-medium">Sponsor / Investor</p>
                    <p className="text-xs mt-1">I want to fund borrowers.</p>
                  </button>
                </div>
              </div>
            )}
            {mode !== "forgot" && (
              <PasswordInput
                label="Password"
                placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                required
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            )}{" "}
            {mode === "register" && (
              <PasswordInput
                label="Confirm password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                error={errors.confirm}
                required
                autoComplete="new-password"
              />
            )}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Remember me"
                  checked={form.remember}
                  onChange={(v) => update("remember", v)}
                />
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setErrors({});
                    setSuccess(false);
                  }}
                  className="text-sm text-teal hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}
            {mode === "register" && (
              <Checkbox
                label={<span>I agree to the Terms of Service and Privacy Policy.</span>}
                checked={form.remember}
                onChange={(v) => update("remember", v)}
              />
            )}
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {mode === "login"
                ? "Log in"
                : mode === "register"
                  ? "Create account"
                  : "Send reset link"}
            </Button>
          </form>
          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrors({});
                setSuccess(false);
              }}
              className="mt-4 w-full text-sm text-stone-500 hover:text-navy"
            >
              ← Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
