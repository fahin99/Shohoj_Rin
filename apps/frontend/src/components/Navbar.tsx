"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { Button } from "./Button";
import type { PageName } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import { apiRequest } from "../lib/api";
interface NavbarProps {
  onNavigate: (page: PageName) => void;
  transparent?: boolean;
  user?: StoredUserProfile | null;
}
const navLinks: { label: string; href?: string; page?: PageName }[] = [
  { label: "Loans", page: "loan-marketplace" },
  { label: "How it works", href: "#how" },
  { label: "Learn", page: "education" },
  { label: "For lenders", page: "lender-dashboard" },
];
export function Navbar({ onNavigate, transparent = false, user = null }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const isAuthenticated = Boolean(user);
  const userName = getDisplayName(user, "Account");
  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
    } finally {
      router.replace("/");
      router.refresh();
    }
  };
  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        transparent
          ? "bg-transparent border-transparent"
          : "bg-offwhite/95 backdrop-blur-sm border-stone-200"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo onClick={() => onNavigate("landing")} />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.page ? (
              <button
                key={link.label}
                type="button"
                onClick={() => onNavigate(link.page!)}
                className="rounded-[6px] px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-navy"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="rounded-[6px] px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-navy"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("borrower-dashboard")}>
                Dashboard
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void handleLogout();
                }}
              >
                Log out {userName !== "Account" ? `(${userName})` : ""}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("auth")}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={() => onNavigate("auth")}>
                Get Started
              </Button>
            </>
          )}
        </div>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-[6px] hover:bg-stone-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M3 3l12 12M15 3L3 15"
                stroke="#0D1B2A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 4.5h14M2 9h14M2 13.5h14"
                stroke="#0D1B2A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>
      {menuOpen && (
        <nav
          aria-label="Mobile"
          className="flex flex-col gap-1 border-t border-stone-200 bg-offwhite px-4 py-4 md:hidden"
        >
          {navLinks.map((link) =>
            link.page ? (
              <button
                key={link.label}
                type="button"
                className="rounded-[6px] px-3 py-3 text-left text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-navy"
                onClick={() => {
                  setMenuOpen(false);
                  onNavigate(link.page!);
                }}
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="rounded-[6px] px-3 py-3 text-sm font-medium text-stone-600 hover:bg-stone-100 hover:text-navy"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ),
          )}
          <div className="mt-3 flex gap-2 border-t border-stone-200 pt-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate("borrower-dashboard");
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMenuOpen(false);
                    void handleLogout();
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate("auth");
                  }}
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate("auth");
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
