"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthPage from "../../views/AuthPage";
import { useAppNavigate } from "../../lib/navigation";
export default function AuthPageClient() {
  return (
    <Suspense fallback={null}>
      <AuthContent />
    </Suspense>
  );
}
function AuthContent() {
  const navigate = useAppNavigate();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const initialMode: "login" | "register" = mode === "login" ? "login" : "register";
  return <AuthPage onNavigate={navigate} initialMode={initialMode} />;
}
