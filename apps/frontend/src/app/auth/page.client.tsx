"use client";
import AuthPage from "../../views/AuthPage";
import { useAppNavigate } from "../../lib/navigation";
export default function AuthPageClient() {
  const navigate = useAppNavigate();
  return <AuthPage onNavigate={navigate} />;
}
