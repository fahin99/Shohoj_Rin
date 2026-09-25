"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../lib/language-context";
import { Logo } from "../components/Logo";
import { Button } from "../components/Button";
import { TextInput, PasswordInput, Checkbox } from "../components/Input";
import { Alert } from "../components/Alert";
import type { PageName } from "../types";
import { apiRequest } from "../lib/api";

type AuthMode = "login" | "register" | "forgot";

interface AuthPageProps {
  onNavigate: (page: PageName) => void;
  initialMode?: "login" | "register";
}

export default function AuthPage({ onNavigate, initialMode = "register" }: AuthPageProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
    terms: false,
  });

  const clearForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirm: "",
      remember: false,
      terms: false,
    });
    setErrors({});
    setApiError("");
    setSuccess(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearForm();
  };

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    setMode(initialMode);
    clearForm();
  }, [initialMode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      if (!form.terms) errs.terms = "You must agree to the terms to continue";
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
        const result = await apiRequest<{ user: { role: "borrower" | "lender" | "admin" } }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ identifier: form.email.trim(), password: form.password }),
          },
        );
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
      console.error("Authentication failed", error);
      setApiError(t("common.requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-[45%] bg-navy flex-col justify-between p-10">
        <Logo variant="white" size="lg" onClick={() => onNavigate("landing")} />
        <div>
          <h2 className="font-display text-4xl text-white leading-tight mb-4">
            {t("landing.heroTitle1")}
          </h2>
          <p className="text-stone-400 leading-relaxed">{t("landing.heroBody")}</p>
        </div>
        <p className="text-xs text-stone-600">{t("app.copyright")}</p>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Logo onClick={() => onNavigate("landing")} />
          </div>

          {/* Mode Switcher */}
          {mode !== "forgot" && (
            <div className="flex mb-7 bg-stone-100 border border-stone-200 rounded-[6px] p-1">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    switchMode(m);
                  }}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-[4px] ${mode === m ? "bg-white text-navy shadow-nb-xs" : "text-stone-500"}`}
                >
                  {m === "login" ? t("auth.login") : t("auth.register")}
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-navy">
              {mode === "login"
                ? t("auth.welcomeBack")
                : mode === "register"
                  ? t("auth.createAccount")
                  : t("auth.resetPassword")}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              {mode === "login"
                ? t("auth.loginSubtitle")
                : mode === "register"
                  ? t("auth.registerSubtitle")
                  : t("auth.forgotSubtitle")}
            </p>
          </div>

          {/* Messages */}
          {success && mode === "forgot" && (
            <Alert variant="success" title={t("auth.resetSentTitle")} dismissible>
              {t("auth.resetSentBody")}
            </Alert>
          )}

          {apiError && (
            <Alert variant="error" title={t("auth.authFailedTitle")} dismissible>
              {apiError}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <TextInput
                label={t("auth.username")}
                placeholder="rahim_uddin"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                error={errors.name}
                hint={t("auth.usernameHint")}
                required
                autoComplete="username"
              />
            )}

            <TextInput
              label={mode === "login" ? t("auth.emailOrUsername") : t("auth.emailAddress")}
              type={mode === "login" ? "text" : "email"}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
              required
              autoComplete={mode === "login" ? "username" : "email"}
            />

            {mode === "register" && (
              <TextInput
                label={t("auth.phoneNumber")}
                type="tel"
                placeholder="+880 1XXXXXXXXX"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                hint={t("auth.phoneHint")}
              />
            )}

            {mode === "register" && (
              <div>
                <p className="text-sm font-medium text-navy mb-3">{t("auth.iWantToJoinAs")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("borrower")}
                    className={`text-left p-4 border-[1.5px] rounded-[6px] ${role === "borrower" ? "border-teal bg-teal-light text-teal" : "border-stone-200 bg-white text-stone-600"}`}
                  >
                    <p className="font-medium">{t("auth.roleBorrowerTitle")}</p>
                    <p className="text-xs mt-1">{t("auth.roleBorrowerBody")}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("lender")}
                    className={`text-left p-4 border-[1.5px] rounded-[6px] ${role === "lender" ? "border-teal bg-teal-light text-teal" : "border-stone-200 bg-white text-stone-600"}`}
                  >
                    <p className="font-medium">{t("auth.roleLenderTitle")}</p>
                    <p className="text-xs mt-1">{t("auth.roleLenderBody")}</p>
                  </button>
                </div>
              </div>
            )}

            {mode !== "forgot" && (
              <PasswordInput
                label={t("auth.password")}
                placeholder={mode === "register" ? t("auth.passwordHint") : "••••••••"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
                required
                autoComplete={mode === "register" ? "new-password" : "current-password"}
              />
            )}

            {mode === "register" && (
              <PasswordInput
                label={t("auth.confirmPassword")}
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
                  label={t("auth.rememberMe")}
                  checked={form.remember}
                  onChange={(v) => update("remember", v)}
                />
                <button
                  type="button"
                  onClick={() => {
                    switchMode("forgot");
                  }}
                  className="text-sm text-teal hover:underline"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
            )}

            {mode === "register" && (
              <Checkbox
                label={<span>{t("auth.agreeToTerms")}</span>}
                checked={form.terms}
                onChange={(v) => update("terms", v)}
                error={errors.terms}
              />
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {mode === "login"
                ? t("auth.login")
                : mode === "register"
                  ? t("auth.createAccount")
                  : t("auth.sendResetLink")}
            </Button>
          </form>

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                switchMode("login");
              }}
              className="mt-4 w-full text-sm text-stone-500 hover:text-navy"
            >
              {t("auth.backToLogin")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
