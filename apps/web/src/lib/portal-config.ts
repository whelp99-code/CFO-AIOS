export type NavItem = {
  title: string;
  href: string;
  icon: string;
  /** Roles allowed to see this item. Empty = all roles. */
  roles?: string[];
};

export const PORTAL_NAV: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { title: "Customers", href: "/customers", icon: "users" },
  { title: "Partners", href: "/partners", icon: "handshake" },
  { title: "Tasks", href: "/tasks", icon: "list-checks" },
  { title: "PoC", href: "/poc", icon: "flask" },
  { title: "Opportunities", href: "/opportunities", icon: "trending-up" },
  { title: "Proposals", href: "/proposals", icon: "file-text" },
  { title: "Knowledge", href: "/knowledge", icon: "book-open" },
  { title: "Command Center", href: "/commands", icon: "terminal" },
  { title: "Development", href: "/development", icon: "code" },
  { title: "Mail Candidates", href: "/development/mail-candidates", icon: "inbox" },
  { title: "Validation", href: "/validation", icon: "activity" },
  { title: "Portal MVP", href: "/portal", icon: "inbox" },
  {
    title: "Approvals",
    href: "/approvals",
    icon: "shield-check",
    roles: ["owner", "admin"],
  },
  { title: "Modules & Blocks", href: "/modules", icon: "blocks" },
  { title: "Registry Admin", href: "/registry", icon: "settings" },
];

export type MockProject = {
  id: string;
  slug: string;
  name: string;
};

export const MOCK_PROJECTS: MockProject[] = [
  { id: "demo", slug: "demo-project", name: "Demo Project" },
  { id: "ops", slug: "ops-portal", name: "Ops Portal" },
];

export const MOCK_USER = {
  name: "Portal Operator",
  email: "operator@ai-portal.local",
  role: "owner" as const,
};
