export type NavIconName =
  | "overview"
  | "performance"
  | "local"
  | "opportunities"
  | "pages"
  | "manager"
  | "approvals"
  | "health"
  | "authority"
  | "connections"
  | "execution"
  | "history"
  | "settings";

export type NavItem = {
  path: string;
  label: string;
  icon: NavIconName;
  match?: string[];
};

export const primaryNav: NavItem[] = [
  { path: "overview", label: "Overview", icon: "overview" },
  { path: "performance", label: "Performance", icon: "performance" },
  { path: "local-visibility", label: "Local Visibility", icon: "local" },
  { path: "opportunities", label: "Opportunities", icon: "opportunities" },
  { path: "pages", label: "Pages", icon: "pages" },
  { path: "manager", label: "SEO Manager", icon: "manager" },
  { path: "approvals", label: "Approvals", icon: "approvals" },
  { path: "site-health", label: "Site Health", icon: "health" },
];

export const secondaryNav: NavItem[] = [
  { path: "authority", label: "Authority", icon: "authority" },
  { path: "connections", label: "Connections", icon: "connections" },
  { path: "work", label: "Execution", icon: "execution" },
  { path: "history", label: "History", icon: "history" },
  { path: "settings", label: "Settings", icon: "settings" },
];

const titles: Record<string, string> = {
  overview: "Overview",
  performance: "Performance",
  "local-visibility": "Local Visibility",
  opportunities: "Opportunities",
  pages: "Content & pages",
  manager: "SEO Manager",
  approvals: "Approvals",
  "site-health": "Site Health",
  authority: "Authority & competitors",
  connections: "Connections & measurement",
  work: "Execution",
  history: "History",
  settings: "Settings",
};

export function navTitle(section: string) {
  return titles[section] || "Overview";
}

export function sectionFromPathname(pathname: string) {
  const match = pathname.match(/\/businesses\/[^/]+\/([^/]+)/);
  return match?.[1] ?? "overview";
}
