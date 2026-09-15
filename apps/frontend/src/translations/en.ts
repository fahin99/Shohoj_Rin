const en = {
  // Sidebar nav — borrower
  "nav.dashboard": "Dashboard",
  "nav.exploreLoans": "Explore Loans",
  "nav.myLoans": "My Loans",
  "nav.applications": "Applications",
  "nav.repayments": "Repayments",
  "nav.learn": "Learn",

  // Sidebar nav — lender
  "nav.portfolio": "Portfolio",
  "nav.opportunities": "Opportunities",

  // Sidebar nav — admin
  "nav.adminOverview": "Admin Overview",

  // Header / notifications
  "header.notifications": "Notifications",
  "header.markAllRead": "Mark all read",

  // Account menu
  "menu.profile": "Profile",
  "menu.settings": "Settings",
  "menu.logOut": "Log Out",

  // Logout dialog
  "logout.title": "Log Out?",
  "logout.description": "Are you sure you want to log out?",
  "logout.cancel": "Cancel",
  "logout.confirm": "Log Out",
  "logout.loading": "Logging out...",

  // Misc
  "app.name": "Shohoj Rin",
  "a11y.openMenu": "Open menu",
  "a11y.closeMenu": "Close menu",
  "a11y.skipToContent": "Skip to main content",
} as const;

export type TranslationKey = keyof typeof en;
export default en;
