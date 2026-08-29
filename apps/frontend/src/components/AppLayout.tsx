import { useState } from "react";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Badge } from "./Badge";
import { IconButton } from "./Button";
import type { PageName } from "../types";
interface AppLayoutProps {
  children: ReactNode;
  onNavigate: (page: PageName) => void;
  currentPage: PageName;
  userType?: "borrower" | "lender" | "admin";
  userName?: string;
}
interface SidebarItem {
  label: string;
  page: PageName;
  icon: ReactNode;
  badge?: number;
  section?: string;
}
const borrowerNav: SidebarItem[] = [
  {
    label: "Dashboard",
    page: "borrower-dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Explore Loans",
    page: "loan-marketplace",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "My Loans",
    page: "active-loan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5 4V3a3 3 0 016 0v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Applications",
    page: "application-status",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: 2,
  },
  {
    label: "Repayments",
    page: "repayment",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Learn",
    page: "education",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M1 4l7-3 7 3-7 3-7-3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15 4v5M4 6.5v4a7 7 0 008 0v-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];
const lenderNav: SidebarItem[] = [
  {
    label: "Portfolio",
    page: "lender-dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Opportunities",
    page: "loan-marketplace",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];
const adminNav: SidebarItem[] = [
  {
    label: "Admin Overview",
    page: "admin",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: "Applications",
    page: "application-status",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    badge: 14,
  },
];
function NavItem({
  item,
  active,
  onClick,
}: {
  item: SidebarItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-[6px] transition-colors text-left ${
        active ? "bg-teal text-white" : "text-stone-600 hover:bg-stone-100 hover:text-navy"
      }`}
    >
      <span className={active ? "text-white" : "text-stone-500"}>{item.icon}</span>
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <Badge variant={active ? "neutral" : "teal"} size="sm">
          {item.badge}
        </Badge>
      )}
    </button>
  );
}
export function AppLayout({
  children,
  onNavigate,
  currentPage,
  userType = "borrower",
  userName = "",
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navItems =
    userType === "admin" ? adminNav : userType === "lender" ? lenderNav : borrowerNav;
  const sidebar = (
    <aside className="w-56 shrink-0 flex flex-col border-r border-stone-200 bg-offwhite h-full">
      <div className="px-4 py-4 border-b border-stone-200">
        <Logo size="sm" onClick={() => onNavigate("landing")} />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavItem
            key={item.page}
            item={item}
            active={currentPage === item.page}
            onClick={() => {
              onNavigate(item.page);
              setSidebarOpen(false);
            }}
          />
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-stone-200">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-xs font-semibold border border-teal/30">
            {userName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-navy truncate">{userName}</p>
            <p className="text-[10px] text-stone-500 capitalize">{userType}</p>
          </div>
        </div>
      </div>
    </aside>
  );
  return (
    <div className="flex h-dvh overflow-hidden bg-offwhite">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-full">{sidebar}</div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-navy/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="relative z-10 h-full w-[15rem] max-w-[85vw]"
            role="dialog"
            aria-label="Main navigation"
            onClick={() => setSidebarOpen(false)}
          >
            {sidebar}
          </div>
        </div>
      )}
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-offwhite/95 px-4 backdrop-blur-sm md:px-6">
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] hover:bg-stone-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M1.5 4h13M1.5 8h13M1.5 12h13"
                stroke="#0D1B2A"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-stone-500">
            {navItems.find((i) => i.page === currentPage)?.label ?? "Shohoj Rin"}
          </p>
          <div className="relative">
            <IconButton
              label="Notifications"
              size="sm"
              variant="ghost"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 14a1.5 1.5 0 003 0H5a1.5 1.5 0 003 0zM14 11c-1-1-2-2-2-5a4 4 0 10-8 0c0 3-1 4-2 5h12z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-coral rounded-full border border-white" />
            </IconButton>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border-[1.5px] border-navy shadow-nb rounded-[8px] overflow-hidden z-10">
                <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between">
                  <p className="text-sm font-semibold text-navy">Notifications</p>
                  <span className="text-xs text-teal cursor-pointer hover:underline">
                    Mark all read
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto flex flex-col gap-px p-2">
                  {([] as any[]).map((n, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2.5 rounded-[4px] ${n.unread ? "bg-teal-light" : "hover:bg-stone-50"}`}
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-navy">{n.title}</p>
                          <p className="text-xs text-stone-500 mt-0.5">{n.msg}</p>
                          <p className="text-[10px] text-stone-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-label={`Account menu for ${userName}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal text-xs font-semibold text-white"
          >
            {userName
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)}
          </button>
        </header>
        {}
        <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
}
